package com.venyx.tiktokshop.dtos;

import java.util.List;

public record MfaActivationDTO(
    List<String> recoveryCodes
) {}