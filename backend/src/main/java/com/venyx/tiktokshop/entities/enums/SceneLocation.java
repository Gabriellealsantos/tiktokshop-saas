package com.venyx.tiktokshop.entities.enums;

public enum SceneLocation {
    BEDROOM("em um quarto"),
    LIVING_LOFT("em uma sala ampla estilo loft"),
    KITCHEN("em uma cozinha"),
    CLOSET("em um closet"),
    HOME_OFFICE("em um home office"),
    URBAN_STREET("em uma rua urbana"),
    CAFE("em um café"),
    RESTAURANT("em um restaurante"),
    NEUTRAL_STUDIO("em um estúdio neutro"),
    BEACH("em uma praia"),
    PARK("em um parque"),
    GYM("em uma academia");

    private final String description;
    SceneLocation(String description) { this.description = description; }
    public String getDescription() { return description; }
}