package com.venyx.tiktokshop.entities.enums;

public enum NoseShape {
    STRAIGHT("nariz reto"),
    AQUILINE("nariz aquilino"),
    UPTURNED("nariz arrebitado"),
    WIDE("nariz largo"),
    REFINED("nariz afilado"),
    BUTTON("nariz de botão");

    private final String description;
    NoseShape(String description) { this.description = description; }
    public String getDescription() { return description; }
}