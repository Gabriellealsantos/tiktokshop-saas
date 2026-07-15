package com.venyx.tiktokshop.entities.enums;

public enum ShotType {
    FACE("enquadramento fechado no rosto, retrato"),
    HALF_BODY("enquadramento de meio corpo, da cintura para cima"),
    FULL_BODY("enquadramento de corpo inteiro"),
    PROFILE("retrato de perfil, vista lateral do rosto"),
    BACK("pessoa vista de costas");

    private final String description;

    ShotType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
