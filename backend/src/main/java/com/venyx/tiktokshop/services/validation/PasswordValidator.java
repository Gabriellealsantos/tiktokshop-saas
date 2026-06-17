package com.venyx.tiktokshop.services.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;

public class PasswordValidator implements ConstraintValidator<Password, String> {

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "12345678", "123456789", "password", "senha123",
            "qwerty123", "admin123", "abc12345", "11111111",
            "password1", "iloveyou", "letmein1"
    );

    @Override
    public void initialize(Password constraintAnnotation) {}

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            return true;
        }

        if (password.contains(" ")) {
            setMessage(context, "A senha não pode conter espaços");
            return false;
        }

        if (password.length() < 8) {
            setMessage(context, "A senha deve ter no mínimo 8 caracteres");
            return false;
        }

        if (password.length() > 72) {
            setMessage(context, "A senha deve ter no máximo 72 caracteres");
            return false;
        }

        if (COMMON_PASSWORDS.contains(password.toLowerCase())) {
            setMessage(context, "Senha muito comum. Escolha uma senha mais segura.");
            return false;
        }

        return true;
    }

    private void setMessage(ConstraintValidatorContext ctx, String message) {
        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}