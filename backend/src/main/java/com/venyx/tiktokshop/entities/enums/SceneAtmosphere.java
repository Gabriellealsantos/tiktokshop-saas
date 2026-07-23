package com.venyx.tiktokshop.entities.enums;

public enum SceneAtmosphere {
    COZY("atmosfera aconchegante"),
    MODERATE("atmosfera moderada"),
    VIBRANT("atmosfera vibrante"),
    LUXURIOUS("atmosfera luxuosa");

    private final String description;
    SceneAtmosphere(String description) { this.description = description; }
    public String getDescription() { return description; }
}