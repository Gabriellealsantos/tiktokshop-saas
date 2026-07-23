package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.*;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.generation.VideoTemplateImageService;
import com.venyx.tiktokshop.services.generation.VideoTemplatePromptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.venyx.tiktokshop.entities.enums.FlowType.VIDEO_TEMPLATE;

/**
 * Fluxo de extração de movimento (tela /templates/use): upload do frame → trocar pessoa →
 * trocar roupa → gerar prompt Veo3. Swaps de imagem consomem a cota VIDEO_TEMPLATE;
 * o prompt (texto) é gratuito.
 */
@RestController
@RequestMapping("/api/templates")
@PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
public class TemplateGenerationController {

    private final VideoTemplateImageService imageService;
    private final VideoTemplatePromptService promptService;
    private final GenerationLimitService limitService;

    public TemplateGenerationController(VideoTemplateImageService imageService,
                                        VideoTemplatePromptService promptService,
                                        GenerationLimitService limitService) {
        this.imageService = imageService;
        this.promptService = promptService;
        this.limitService = limitService;
    }

    /** Sobe o frame capturado no cliente (canvas) para servir de referência aos swaps. */
    @PostMapping(value = "/frame", consumes = "multipart/form-data")
    public ResponseEntity<UploadResponseDTO> uploadFrame(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new UploadResponseDTO(imageService.uploadFrame(file)));
    }

    @PostMapping("/swap-person")
    public ResponseEntity<ImageGenerationDTO> swapPerson(@Valid @RequestBody SwapPersonRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ImageGenerationDTO(imageService.swapPerson(dto)));
    }

    @PostMapping("/swap-clothes")
    public ResponseEntity<ImageGenerationDTO> swapClothes(@Valid @RequestBody SwapClothesRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ImageGenerationDTO(imageService.swapClothes(dto)));
    }

    @PostMapping("/prompt")
    public ResponseEntity<VideoPromptResponseDTO> prompt(@Valid @RequestBody VideoPromptRequestDTO dto) {
        return ResponseEntity.ok(promptService.generate(dto));
    }

    @GetMapping("/usage")
    public ResponseEntity<DailyUsageDTO> usage() {
        return ResponseEntity.ok(limitService.usageToday(VIDEO_TEMPLATE));
    }
}
