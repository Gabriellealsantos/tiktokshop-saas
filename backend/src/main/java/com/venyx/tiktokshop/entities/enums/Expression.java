package com.venyx.tiktokshop.entities.enums;

public enum Expression {
    NEUTRAL("expressão neutra"),
    SMILING("sorrindo"),
    SERIOUS("expressão séria"),
    CONFIDENT("expressão confiante"),
    SENSUAL("expressão sensual");

    private final String description;
    Expression(String description) { this.description = description; }
    public String getDescription() { return description; }
}
