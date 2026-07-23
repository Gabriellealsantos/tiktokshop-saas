package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.enums.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StudioImageRequestDTO(
        Long productId,

        @Size(max = 255, message = "Nome do produto: máximo 255 caracteres")
        String customProductName,
        String customProductImageUrl,

        Long avatarId,
        Long galleryAvatarId,

        @NotNull(message = "Formato é obrigatório") CreationFormat format,
        @NotNull(message = "Local é obrigatório") SceneLocation location,
        @NotNull(message = "Hora do dia é obrigatória") TimeOfDay timeOfDay,
        @NotNull(message = "Iluminação é obrigatória") SceneLighting lighting,
        @NotNull(message = "Atmosfera é obrigatória") SceneAtmosphere atmosphere,
        @NotNull(message = "Ponto de vista é obrigatório") PointOfView pointOfView,

        @NotBlank(message = "A descrição da pose é obrigatória")
        @Size(max = 300, message = "Pose: máximo 300 caracteres")
        String pose
) {}
