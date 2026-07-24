package com.venyx.tiktokshop.entities.enums;

public enum ClothingPart {
    FULL_LOOK("o look completo"),
    TOP("a peça de cima"),
    BOTTOM("a peça de baixo");

    private final String description;
    ClothingPart(String description) { this.description = description; }
    public String getDescription() { return description; }
}