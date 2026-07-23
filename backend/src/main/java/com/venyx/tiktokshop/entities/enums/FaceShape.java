package com.venyx.tiktokshop.entities.enums;

public enum FaceShape {
    OVAL("rosto oval"),
    ROUND("rosto redondo"),
    SQUARE("rosto quadrado"),
    HEART("rosto formato coração"),
    OBLONG("rosto alongado");

    private final String description;
    FaceShape(String description) { this.description = description; }
    public String getDescription() { return description; }
}
