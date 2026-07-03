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
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

import java.net.URI;

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

    @Value("${aws.s3.access-key}")
    private String accessKey;

    @Value("${aws.s3.secret-key}")
    private String secretKey;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)));

        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
            builder.forcePathStyle(true);
        }

        S3Client client = builder.build();
        ensureBucketExists(client);
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
    }
}
