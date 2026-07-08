package com.venyx.tiktokshop.entities.enums;

import java.time.Instant;
import java.time.ZoneOffset;

/**
 * Janela de horário (UTC) em que o produto foi minerado. As abas do front são faixas
 * fixas de 6h; o valor é persistido como texto (nome do enum) na coluna mining_window.
 */
public enum MiningWindow {
    W_00_06(0, 6),
    W_06_12(6, 12),
    W_12_18(12, 18),
    W_18_24(18, 24);

    private final int startHour;
    private final int endHourExclusive;

    MiningWindow(int startHour, int endHourExclusive) {
        this.startHour = startHour;
        this.endHourExclusive = endHourExclusive;
    }

    public int getStartHour() {
        return startHour;
    }

    public int getEndHourExclusive() {
        return endHourExclusive;
    }

    /**
     * Deriva a janela a partir da hora UTC do instante (usado quando o produto entra sem janela).
     */
    public static MiningWindow fromInstant(Instant t) {
        int h = t.atZone(ZoneOffset.UTC).getHour();
        return h < 6 ? W_00_06 : h < 12 ? W_06_12 : h < 18 ? W_12_18 : W_18_24;
    }
}
