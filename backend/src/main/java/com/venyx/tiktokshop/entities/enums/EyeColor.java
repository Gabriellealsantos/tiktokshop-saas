package com.venyx.tiktokshop.entities.enums;

public enum EyeColor {
    BROWN("olhos castanhos"),
    DARK_BROWN("olhos castanho-escuros"),
    BLUE("olhos azuis"),
    GREEN("olhos verdes"),
    HONEY("olhos cor de mel"),
    GRAY("olhos cinzas");

    private final String description;
    EyeColor(String description) { this.description = description; }
    public String getDescription() { return description; }
}