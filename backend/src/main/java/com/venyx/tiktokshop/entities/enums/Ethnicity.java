package com.venyx.tiktokshop.entities.enums;

public enum Ethnicity {
    LATINO("aparência latina"),
    CAUCASIAN("aparência caucasiana"),
    BLACK("aparência negra"),
    ASIAN("aparência asiática"),
    ARAB("aparência árabe"),
    INDIGENOUS("aparência indígena"),
    MIXED("aparência mestiça");

    private final String description;
    Ethnicity(String description) { this.description = description; }
    public String getDescription() { return description; }
}