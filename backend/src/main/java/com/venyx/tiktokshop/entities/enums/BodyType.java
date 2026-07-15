package com.venyx.tiktokshop.entities.enums;

public enum BodyType {
    SLIM("magro"),
    ATHLETIC("atlético"),
    CURVY("curvilíneo"),
    PLUS_SIZE("plus size");

    private final String description;

    BodyType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}