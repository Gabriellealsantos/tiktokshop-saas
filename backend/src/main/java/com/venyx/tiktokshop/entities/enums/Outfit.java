package com.venyx.tiktokshop.entities.enums;

public enum Outfit {
    CASUAL("casual"),
    LUXURY("luxo"),
    STREETWEAR("streetwear"),
    FITNESS("fitness"),
    CORPORATE("corporativo");

    private final String description;

    Outfit(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
