package com.venyx.tiktokshop.entities.enums;

public enum HairStyle {
    BALD("careca"),
    BUZZ_CUT("cabelo raspado estilo militar"),
    SHORT("cabelo curto"),
    PIXIE("corte pixie"),
    UNDERCUT("cabelo com undercut"),
    QUIFF("cabelo com topete"),
    MEDIUM("cabelo médio"),
    LONG("cabelo longo"),
    BANGS("cabelo com franja"),
    CURLY("cabelo cacheado"),
    AFRO("cabelo afro"),
    DREADS("dreadlocks"),
    BRAIDS("cabelo trançado"),
    PONYTAIL("cabelo em rabo de cavalo"),
    BUN("cabelo em coque"),
    MAN_BUN("cabelo em man bun");

    private final String description;
    HairStyle(String description) { this.description = description; }
    public String getDescription() { return description; }
}
