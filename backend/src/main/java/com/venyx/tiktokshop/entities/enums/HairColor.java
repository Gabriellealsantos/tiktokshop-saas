package com.venyx.tiktokshop.entities.enums;

public enum HairColor {
    BLACK("preto"),
    BROWN("castanho"),
    LIGHT_BROWN("castanho claro"),
    HONEY("mel"),
    LIGHT_BLONDE("loiro claro"),
    RED("ruivo"),
    SILVER("prateado"),
    BLUE("azul"),
    NEON_GREEN("verde neon"),
    PINK("rosa"),
    YELLOW("amarelo"),
    PURPLE("roxo");

    private final String description;
    HairColor(String description) { this.description = description; }
    public String getDescription() { return description; }
}