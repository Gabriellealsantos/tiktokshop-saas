package com.venyx.tiktokshop.entities.enums;

public enum AgeRange {
    YOUNG("18 a 24 anos"),
    ADULT("25 a 35 anos"),
    MATURE("36 a 50 anos");

    private final String description;

    AgeRange(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}