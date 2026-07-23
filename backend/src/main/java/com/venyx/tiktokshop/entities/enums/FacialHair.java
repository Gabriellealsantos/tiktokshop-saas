package com.venyx.tiktokshop.entities.enums;

public enum FacialHair {
    NONE("sem pelos faciais"),
    SHORT_BEARD("barba curta"),
    FULL_BEARD("barba cheia"),
    MUSTACHE("bigode"),
    GOATEE("cavanhaque");

    private final String description;
    FacialHair(String description) { this.description = description; }
    public String getDescription() { return description; }
}
