package com.venyx.tiktokshop.entities.enums;

public enum Outfit {
    CASUAL("casual"),
    LUXURY("luxo"),
    STREETWEAR("streetwear"),
    FITNESS("fitness"),
    CORPORATE("corporativo"),
    AUTO("uma roupa adequada ao personagem, escolhida com bom senso de estilo");

    private final String description;

    Outfit(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
