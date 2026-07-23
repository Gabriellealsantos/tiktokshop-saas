package com.venyx.tiktokshop.entities.enums;

public enum SceneLighting {
    NATURAL_SOFT("iluminação natural suave"),
    GOLDEN_STRONG("iluminação dourada forte"),
    NEON_COLORFUL("iluminação neon colorida"),
    CINEMATIC("iluminação cinematográfica"),
    RING_LIGHT("iluminação de ring light");

    private final String description;
    SceneLighting(String description) { this.description = description; }
    public String getDescription() { return description; }
}
