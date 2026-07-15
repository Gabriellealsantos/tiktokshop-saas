package com.venyx.tiktokshop.entities.enums;

public enum HairColor {
    BLACK("preto"),
    BROWN("castanho"),
    BLONDE("loiro"),
    RED("ruivo"),
    GRAY("grisalho"),
    PINK("rosa");

    private final String description;

    HairColor(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}