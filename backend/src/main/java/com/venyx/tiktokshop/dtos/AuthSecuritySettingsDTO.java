package com.venyx.tiktokshop.dtos;

/** Switch global de sessão única (admin). */
public record AuthSecuritySettingsDTO(boolean singleSessionEnforced) {
}