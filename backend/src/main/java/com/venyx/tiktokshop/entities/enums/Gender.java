package com.venyx.tiktokshop.entities.enums;

public enum Gender {
    FEMALE("mulher"),
    MALE("homem");

    private final String description;

    Gender(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}