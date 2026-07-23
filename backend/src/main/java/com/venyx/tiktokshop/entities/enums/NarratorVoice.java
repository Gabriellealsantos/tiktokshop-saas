package com.venyx.tiktokshop.entities.enums;

public enum NarratorVoice {
    MALE_SALES("male Brazilian voice, natural sales tone"),
    MALE_DEEP("deep, full-bodied male Brazilian voice"),
    MALE_CASUAL("casual, relaxed male Brazilian voice"),
    FEMALE_YOUNG("young female Brazilian voice, conversational tone"),
    FEMALE_SOFT("soft, warm female Brazilian voice"),
    FEMALE_ENERGETIC("energetic, expressive female Brazilian voice");

    private final String description;
    NarratorVoice(String description) { this.description = description; }
    public String getDescription() { return description; }
}