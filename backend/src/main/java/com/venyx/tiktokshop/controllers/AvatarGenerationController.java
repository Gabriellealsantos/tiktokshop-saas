package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.AvatarGenerationRequestDTO;
import com.venyx.tiktokshop.dtos.AvatarRegenerationRequestDTO;
import com.venyx.tiktokshop.dtos.DailyUsageDTO;
import com.venyx.tiktokshop.dtos.ImageGenerationDTO;
import com.venyx.tiktokshop.entities.ImageGeneration;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.generation.AvatarGenerationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

import static com.venyx.tiktokshop.entities.enums.FlowType.AVATAR;
import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentContextPath;



@RestController
@RequestMapping("/api/avatars/generation")
public class AvatarGenerationController {

    private final AvatarGenerationService service;
    private final GenerationLimitService limitService;

    public AvatarGenerationController(AvatarGenerationService service,
                                      GenerationLimitService limitService) {
        this.service = service;
        this.limitService = limitService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ImageGenerationDTO> generate(@Valid @RequestBody AvatarGenerationRequestDTO dto) {
        ImageGeneration job = service.generate(dto.config(), dto.referenceImageUrl());
        return created(job);
    }

    @PostMapping("/{parentId}/regenerate")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ImageGenerationDTO> regenerate(@PathVariable Long parentId,
                                                         @Valid @RequestBody AvatarRegenerationRequestDTO dto) {
        ImageGeneration job = service.regenerate(parentId, dto.referenceImageUrl());
        return created(job);
    }

    private ResponseEntity<ImageGenerationDTO> created(ImageGeneration job) {
        URI uri = fromCurrentContextPath()
                .path("/api/avatars/generation/{id}")
                .buildAndExpand(job.getId())
                .toUri();
        return ResponseEntity.created(uri).body(new ImageGenerationDTO(job));
    }

    @GetMapping("/usage")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<DailyUsageDTO> usage() {
        return ResponseEntity.ok(limitService.usageToday(AVATAR));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')")
    public ResponseEntity<ImageGenerationDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new ImageGenerationDTO(service.findById(id)));
    }

}
