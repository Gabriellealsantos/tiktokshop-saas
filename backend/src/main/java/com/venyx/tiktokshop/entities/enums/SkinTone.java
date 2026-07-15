package com.venyx.tiktokshop.entities.enums;

public enum SkinTone {
    LIGHT("clara"),
    BROWN("parda"),
    BLACK("negra"),
    ASIAN("asiática");

    private final String description;

    SkinTone(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
