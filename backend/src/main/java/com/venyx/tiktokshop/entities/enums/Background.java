package com.venyx.tiktokshop.entities.enums;

public enum Background {
    STUDIO("estúdio fotográfico"),
    NATURE("natureza"),
    URBAN("cenário urbano"),
    HOME("ambiente doméstico");

    private final String description;

    Background(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
