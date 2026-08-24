package com.venyx.tiktokshop.services.generation;

import com.venyx.tiktokshop.dtos.PendingJobDTO;
import com.venyx.tiktokshop.dtos.SwapClothesRequestDTO;
import com.venyx.tiktokshop.dtos.SwapPersonRequestDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.ClothSwapMode;
import com.venyx.tiktokshop.repositories.ImageGenerationRepository;
import com.venyx.tiktokshop.services.AuthService;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.StorageService;
import com.venyx.tiktokshop.services.VideoTemplateCatalogService;
import com.venyx.tiktokshop.services.exceptions.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIDEO_TEMPLATE;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.FAILED;
import static com.venyx.tiktokshop.entities.enums.ImageGenerationStatus.PENDING;

/**
 * Swaps de imagem do fluxo de extração de movimento (tela /templates) — agora assíncrono.
 * <p>
 * Os métodos públicos resolvem User, cota e prompt sincronamente, persistem o job como PENDING,
 * e delegam a chamada ao Gemini/storage ao {@link VideoTemplateSwapWorker} via @Async.
 * </p>
 */
@Service
public class VideoTemplateImageService {

    private static final Logger logger = LoggerFactory.getLogger(VideoTemplateImageService.class);

    private static final String FRAME_FOLDER = "templates/frames";

    private final ImageGenerationRepository repository;
    private final GenerationLimitService limitService;
    private final AuthService authService;
    private final StorageService storageService;
    private final SwapPromptComposer promptComposer;
    private final VideoTemplateSwapWorker swapWorker;
    private final VideoTemplateCatalogService catalogService;

    public VideoTemplateImageService(ImageGenerationRepository repository,
                                     GenerationLimitService limitService,
                                     AuthService authService,
                                     StorageService storageService,
                                     SwapPromptComposer promptComposer,
                                     VideoTemplateSwapWorker swapWorker,
                                     VideoTemplateCatalogService catalogService) {
        this.repository = repository;
        this.limitService = limitService;
        this.authService = authService;
        this.storageService = storageService;
        this.promptComposer = promptComposer;
        this.swapWorker = swapWorker;
        this.catalogService = catalogService;
    }

    /** Sobe o frame capturado no cliente (canvas) para servir de referência aos swaps. */
    public String uploadFrame(MultipartFile file) {
        User user = authService.authenticated();
        return storageService.upload(file, FRAME_FOLDER + "/" + user.getUuid());
    }

    public PendingJobDTO swapPerson(SwapPersonRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        // A image 3 (avatar sem crop) é um REFORÇO opcional e chega como a URL já hospedada
        // que o banco guarda — não é reenviada. Se ela estiver fora do nosso storage, o
        // GeminiImageProvider a recusaria (anti-SSRF) e derrubaria a geração inteira; como é
        // acessória, aqui ela é simplesmente descartada e o prompt cai na variante de rosto-só.
        String bodyImageUrl = StringUtils.hasText(req.avatarBodyImageUrl())
                && req.avatarBodyImageUrl().startsWith(storageService.publicBaseUrl() + "/")
                ? req.avatarBodyImageUrl()
                : null;
        boolean hasBodyReference = bodyImageUrl != null;

        // O descarte era silencioso: nao havia como saber, olhando o log, se uma geracao rodou
        // com a referencia de corpo ou sem ela. Como a image 3 e a fonte primaria do tom de
        // braco e perna, a ausencia dela muda o resultado de forma visivel — e diagnosticar
        // isso as cegas ja custou uma investigacao inteira numa hipotese errada.
        if (hasBodyReference) {
            logger.info("[SWAP-PERSON] com image 3 (referencia de tom de membro)");
        } else if (StringUtils.hasText(req.avatarBodyImageUrl())) {
            logger.warn("[SWAP-PERSON] sem image 3: a URL do avatar de corpo inteiro esta fora"
                    + " do storage da plataforma e foi descartada. url={} esperado prefixo={}",
                    req.avatarBodyImageUrl(), storageService.publicBaseUrl() + "/");
        } else {
            logger.info("[SWAP-PERSON] sem image 3: o front nao enviou avatarBodyImageUrl");
        }

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-person");
        config.put("frameUrl", req.frameUrl());
        config.put("avatarImageUrl", req.avatarImageUrl());
        if (hasBodyReference) {
            config.put("avatarBodyImageUrl", bodyImageUrl);
        }

        // Token aleatório para decorrelacionar tentativas: frame+avatar+prompt idênticos entre
        // cliques em "trocar pessoa" fazem o modelo convergir para o mesmo resultado (bom ou
        // ruim). Isto força cada chamada a ser amostrada como uma geração nova e independente,
        // sem precisar de F5 (que só recria esse efeito por acaso, ao reconstruir o estado).
        //
        // Fica no TOPO, e não no fim. Os últimos tokens do prompt são os de maior peso — é por
        // isso que a trava final mora lá — e gastá-los com um identificador aleatório entrega
        // a posição mais influente do prompt a um texto sem conteúdo. A redação também deixou
        // de enumerar "text, number, watermark": nomear o que não se quer é o jeito mais
        // eficiente de pedir exatamente isso a um modelo de imagem.
        StringBuilder builder = new StringBuilder();
        builder.append("GENERATION ATTEMPT ID: ").append(UUID.randomUUID())
                .append(" — internal token, not part of the image. Treat this call as a")
                .append(" brand-new, independent generation, sampled fresh rather than")
                .append(" continuing or refining any previous attempt.\n\n");

        builder.append(SwapPromptComposer.buildPersonPrompt(hasBodyReference));
        if (StringUtils.hasText(req.templateSlug())) {
            var template = catalogService.requireVisible(req.templateSlug());
            builder.append(promptComposer.personSceneBlock(
                    template.getScenePrompt(), template.getImagePrompt()));
        }
        builder.append(promptComposer.avatarCustomBlock(req.customPrompt()));
        builder.append("\n").append(SwapPromptComposer.PERSON_FINAL_LOCK);

        String basePrompt = builder.toString();

        ImageGeneration job = createPendingJob(user, config, basePrompt);

        // Ordem das referências: image 1 = frame (cena/pose), image 2 = avatar (pessoa),
        // image 3 (opcional) = mesmo avatar sem crop, só para tom de pele/corpo.
        dispatch(job, () -> swapWorker.runSwapPerson(user, job.getId(), job.getPrompt(),
                req.frameUrl(), req.avatarImageUrl(), bodyImageUrl));

        return new PendingJobDTO(job.getId());
    }

    public PendingJobDTO swapClothes(SwapClothesRequestDTO req) {
        User user = authService.authenticated();
        limitService.assertCanGenerate(user.getUuid(), VIDEO_TEMPLATE);

        ClothSwapMode mode = ClothSwapMode.fromValue(req.mode());
        boolean hasAvatar = StringUtils.hasText(req.avatarImageUrl());

        Map<String, Object> config = new LinkedHashMap<>();
        config.put("op", "swap-clothes");
        config.put("mode", mode.name());
        config.put("baseImageUrl", req.baseImageUrl());
        config.put("productImageUrl", req.productImageUrl());
        if (StringUtils.hasText(req.productName())) {
            config.put("productName", req.productName());
        }
        if (StringUtils.hasText(req.productDescription())) {
            config.put("productDescription", req.productDescription());
        }
        if (hasAvatar) {
            config.put("avatarImageUrl", req.avatarImageUrl());
        }

        StringBuilder builder = new StringBuilder(promptComposer.buildClothesPrompt(
                mode, req.productName(), req.productDescription(), hasAvatar));
        // Aqui a image 2 é o PRODUTO: a pessoa está na image 1 e, quando enviada, na image 3.
        builder.append(promptComposer.avatarCustomBlock(req.customPrompt(),
                hasAvatar ? "image 1 and image 3" : "image 1"));
        builder.append("\n").append(SwapPromptComposer.CLOTHES_FINAL_LOCK);

        String prompt = builder.toString();

        ImageGeneration job = createPendingJob(user, config, prompt);

        // Ordem das referências: image 1 = pessoa (base), image 2 = produto. (Opcional image 3 = avatar)
        if (hasAvatar) {
            dispatch(job, () -> swapWorker.runSwapClothes(user, job.getId(), job.getPrompt(),
                    req.baseImageUrl(), req.productImageUrl(), req.avatarImageUrl()));
        } else {
            dispatch(job, () -> swapWorker.runSwapClothes(user, job.getId(), job.getPrompt(),
                    req.baseImageUrl(), req.productImageUrl()));
        }
        return new PendingJobDTO(job.getId());
    }

    private ImageGeneration createPendingJob(User user, Map<String, Object> config, String prompt) {
        ImageGeneration job = new ImageGeneration();
        job.setUser(user);
        job.setFlowType(VIDEO_TEMPLATE);
        job.getConfig().putAll(config);
        job.setPrompt(prompt);
        job.setStatus(PENDING);
        job.setCreatedAt(Instant.now());
        return repository.save(job);
    }

    private void dispatch(ImageGeneration job, Runnable task) {
        try {
            task.run();
        } catch (TaskRejectedException e) {
            job.setStatus(FAILED);
            job.setError("Sistema em capacidade máxima. Tente novamente em instantes.");
            repository.save(job);
            throw new BusinessException("Muitas gerações em andamento. Aguarde alguns segundos e tente de novo.");
        }
    }
}
