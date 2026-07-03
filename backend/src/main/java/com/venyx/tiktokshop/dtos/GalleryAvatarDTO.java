package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.GalleryAvatar;

public record GalleryAvatarDTO(
    Long id,
    String name,
    String gender,
    String type,
    String imageUrl,
    Integer orderIndex
) {
    public GalleryAvatarDTO(GalleryAvatar entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getGender(),
            entity.getType(),
            entity.getImageUrl(),
            entity.getOrderIndex()
        );
    }
}
