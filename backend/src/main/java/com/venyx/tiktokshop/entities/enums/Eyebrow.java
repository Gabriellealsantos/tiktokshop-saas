package com.venyx.tiktokshop.entities.enums;

public enum Eyebrow {
    STRAIGHT("sobrancelhas retas"),
    ARCHED("sobrancelhas arqueadas"),
    ANGULAR("sobrancelhas angulosas"),
    THICK("sobrancelhas grossas"),
    THIN("sobrancelhas finas"),
    SOFT_CURVED("sobrancelhas curvadas suaves");

    private final String description;
    Eyebrow(String description) { this.description = description; }
    public String getDescription() { return description; }
}
