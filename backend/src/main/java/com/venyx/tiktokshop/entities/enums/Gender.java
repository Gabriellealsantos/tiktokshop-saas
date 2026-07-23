package com.venyx.tiktokshop.entities.enums;

public enum Gender {
    FEMALE("mulher"),
    MALE("homem"),
    ANDROGYNOUS("pessoa de aparência andrógina"),
    NON_BINARY("pessoa não-binária");

    private final String description;
    Gender(String description) { this.description = description; }
    public String getDescription() { return description; }
}