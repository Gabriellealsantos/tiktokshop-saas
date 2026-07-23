package com.venyx.tiktokshop.entities.enums;

public enum TimeOfDay {
    MORNING("de manhã"),
    MIDDAY("ao meio-dia"),
    LATE_AFTERNOON("no fim de tarde"),
    NIGHT("à noite"),
    DAWN("de madrugada");

    private final String description;
    TimeOfDay(String description) { this.description = description; }
    public String getDescription() { return description; }
}
