package com.venyx.tiktokshop.entities.enums;

public enum SkinTone {
    TONE_01("tom de pele muito claro"),
    TONE_02("tom de pele claro"),
    TONE_03("tom de pele claro quente"),
    TONE_04("tom de pele bege"),
    TONE_05("tom de pele médio"),
    TONE_06("tom de pele moreno"),
    TONE_07("tom de pele moreno escuro"),
    TONE_08("tom de pele castanho"),
    TONE_09("tom de pele castanho escuro"),
    TONE_10("tom de pele negro retinto");

    private final String description;
    SkinTone(String description) { this.description = description; }
    public String getDescription() { return description; }
}
