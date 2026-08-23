package com.venyx.tiktokshop.services.generation;

import java.util.UUID;

public record StudioJobContext(UUID userUuid, String prompt,
                               String avatarImageUrl, String productImageUrl) {
}
