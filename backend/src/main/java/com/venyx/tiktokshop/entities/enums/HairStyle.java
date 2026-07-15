package com.venyx.tiktokshop.entities.enums;

public enum HairStyle {
    SHORT("curto"),
    MEDIUM("médio"),
    LONG("longo"),
    BALD("careca"),
    AFRO("afro"),
    CURLY("cacheado");

    private final String description;

    HairStyle(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
