package com.venyx.tiktokshop.entities.enums;

public enum MouthShape {
    THIN_LIPS("lábios finos"),
    MEDIUM_LIPS("lábios médios"),
    FULL_LIPS("lábios carnudos"),
    DEFINED_CUPID("arco do cupido definido"),
    WIDE_MOUTH("boca larga"),
    SMALL_MOUTH("boca pequena");

    private final String description;
    MouthShape(String description) { this.description = description; }
    public String getDescription() { return description; }
}