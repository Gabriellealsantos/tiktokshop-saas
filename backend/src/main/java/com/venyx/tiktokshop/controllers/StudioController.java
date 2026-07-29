package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.*;
import com.venyx.tiktokshop.entities.CreationSession;
import com.venyx.tiktokshop.entities.enums.FlowType;
import com.venyx.tiktokshop.services.GenerationLimitService;
import com.venyx.tiktokshop.services.generation.PoseSuggestionService;
import com.venyx.tiktokshop.services.generation.ScenePoseImageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import static org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentContextPath;

import java.net.URI;

@RestController
@RequestMapping("/api/studio")
public class StudioController {

    private static final String USER_ROLES = "hasAnyRole('ADMIN', 'AFFILIATE', 'CLIENT')";

    private final ScenePoseImageService imageService;
    private final GenerationLimitService limitService;
    private final PoseSuggestionService suggestionService;

    public StudioController(ScenePoseImageService imageService,
                            GenerationLimitService limitService,
                            PoseSuggestionService suggestionService) {
        this.imageService = imageService;
        this.limitService = limitService;
        this.suggestionService = suggestionService;
    }

    @PostMapping("/image")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<CreationSessionDTO> generateImage(@Valid @RequestBody StudioImageRequestDTO dto) {
        CreationSession session = imageService.generateImage(dto);
        URI uri = fromCurrentContextPath()
                .path("/api/studio/{id}")
                .buildAndExpand(session.getId())
                .toUri();
        return ResponseEntity.created(uri).body(new CreationSessionDTO(session));
    }

    @GetMapping("/{id}")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<CreationSessionDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(new CreationSessionDTO(imageService.findById(id)));
    }

    @GetMapping("/usage")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<DailyUsageDTO> usage() {
        return ResponseEntity.ok(limitService.usageToday(FlowType.STUDIO));
    }

    @PostMapping("/video-prompt")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<CreationSessionDTO> generateVideoPrompt(@Valid @RequestBody StudioVideoRequestDTO dto) {
        return ResponseEntity.ok(new CreationSessionDTO(imageService.generateVideoPrompt(dto)));
    }

    @PostMapping("/pose-suggestions")
    @PreAuthorize(USER_ROLES)
    public ResponseEntity<PoseSuggestionResponseDTO> poseSuggestions(
            @RequestBody PoseSuggestionRequestDTO dto) {
        return ResponseEntity.ok(new PoseSuggestionResponseDTO(suggestionService.generate(dto)));
    }
}
