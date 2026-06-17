package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.services.validation.Password;
import jakarta.validation.constraints.NotBlank;

public record NewPasswordDTO(
	@NotBlank(message = "Campo requerido")
	String token,

	@NotBlank(message = "Campo obrigatório")
	@Password(message = "A senha deve ter no mínimo 8 caracteres")
	String password
) {}
