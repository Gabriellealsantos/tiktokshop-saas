package com.venyx.tiktokshop.services.generation;

import java.util.List;
import java.util.UUID;

public record AvatarJobContext(UUID userUuid, String prompt, List<String> references) {
}
