package com.venyx.tiktokshop.config.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.CORSConfiguration;
import software.amazon.awssdk.services.s3.model.CORSRule;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutBucketCorsRequest;
import software.amazon.awssdk.services.s3.model.PutBucketPolicyRequest;

import java.net.URI;
import java.util.Arrays;
import java.util.List;

/**
 * Cliente S3, compatível tanto com MinIO local (endpoint customizado +
 * path-style, ver docker-compose.minio.yml) quanto com AWS S3 real em
 * produção (sem endpoint customizado → SDK resolve pela região, virtual-hosted style).
 */
@Configuration
public class StorageConfig {

    private static final Logger log = LoggerFactory.getLogger(StorageConfig.class);

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.access-key:}")
    private String accessKey;

    @Value("${aws.s3.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${cors.origins}")
    private String corsOrigins;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder().region(Region.of(region));

        boolean hasStaticCreds = accessKey != null && !accessKey.isBlank()
                && secretKey != null && !secretKey.isBlank();
        if (hasStaticCreds) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)));
        }

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
            builder.forcePathStyle(true);
        }

        S3Client client = builder.build();
        // Preparação de bucket, policy e CORS só faz sentido no MinIO local. Em AWS S3
        // real isso é responsabilidade da infra, e a role da EC2 não tem (nem precisa de)
        // permissão para essas operações.
        if (endpoint != null && !endpoint.isBlank()) {
            ensureBucketExists(client);
        }
        return client;
    }

    /**
     * Best-effort: garante o bucket em dev/MinIO. Em prod, se a policy não
     * permitir criar bucket, só loga o aviso — não derruba a aplicação.
     * Chamado dentro da criação do próprio bean (recebendo o client por
     * parâmetro) para evitar ciclo de autorreferência de bean — não pode
     * chamar o método @Bean s3Client() de novo aqui.
     */
    private void ensureBucketExists(S3Client client) {
        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (NoSuchBucketException e) {
            try {
                client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
                log.info("Bucket '{}' criado no storage S3/MinIO.", bucket);
            } catch (Exception createEx) {
                log.warn("Não foi possível criar o bucket '{}': {}", bucket, createEx.getMessage());
            }
        } catch (Exception e) {
            log.warn("Não foi possível verificar o bucket '{}': {}", bucket, e.getMessage());
        }

        // As URLs salvas em banco apontam direto pro objeto (sem assinatura), então o bucket
        // precisa ser público para leitura, e o CORS precisa liberar a leitura de pixels via
        // <canvas> (sem ele a captura de frame em /templates/use falha por canvas "tainted").
        // Só configuramos isso contra o MinIO local (endpoint customizado) — em AWS S3 real,
        // policy e CORS são responsabilidade da infra e já estão aplicados no bucket.
        if (endpoint != null && !endpoint.isBlank()) {
            ensurePublicReadPolicy(client);
            ensureCorsConfigured(client);
        }
    }

    private void ensurePublicReadPolicy(S3Client client) {
        try {
            String policy = """
                    {
                      "Version": "2012-10-17",
                      "Statement": [
                        {
                          "Effect": "Allow",
                          "Principal": "*",
                          "Action": ["s3:GetObject"],
                          "Resource": ["arn:aws:s3:::%s/*"]
                        }
                      ]
                    }
                    """.formatted(bucket);
            client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucket)
                    .policy(policy)
                    .build());
            log.info("Policy de leitura pública aplicada ao bucket '{}' (MinIO local).", bucket);
        } catch (Exception e) {
            log.warn("Não foi possível aplicar policy pública ao bucket '{}': {}", bucket, e.getMessage());
        }
    }

    /**
     * Best-effort: sem essa configuração, capturas de frame via <canvas> (ex.: fluxo
     * /templates/use) ficam com o canvas "tainted" e toBlob()/toDataURL() falham, mesmo
     * com o bucket lendo publicamente. Se a credencial não tiver permissão s3:PutBucketCORS
     * (comum em prod, gerenciado pela infra), só loga o aviso — não derruba o boot.
     */
    private void ensureCorsConfigured(S3Client client) {
        try {
            List<String> allowedOrigins = Arrays.stream(corsOrigins.split(","))
                    .map(String::trim)
                    .filter(o -> !o.isBlank())
                    .toList();

            CORSRule rule = CORSRule.builder()
                    .allowedMethods("GET", "HEAD")
                    .allowedHeaders("*")
                    .allowedOrigins(allowedOrigins)
                    .exposeHeaders("ETag")
                    .build();

            client.putBucketCors(PutBucketCorsRequest.builder()
                    .bucket(bucket)
                    .corsConfiguration(CORSConfiguration.builder().corsRules(rule).build())
                    .build());
            log.info("CORS configurado no bucket '{}' para origens: {}", bucket, allowedOrigins);
        } catch (Exception e) {
            log.warn("Não foi possível configurar CORS no bucket '{}': {}", bucket, e.getMessage());
        }
    }
}
