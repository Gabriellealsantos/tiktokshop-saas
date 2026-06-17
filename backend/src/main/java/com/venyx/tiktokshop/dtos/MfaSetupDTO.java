package com.venyx.tiktokshop.dtos;

public record MfaSetupDTO(
    String secret,
    String qrCodeUri
) {}