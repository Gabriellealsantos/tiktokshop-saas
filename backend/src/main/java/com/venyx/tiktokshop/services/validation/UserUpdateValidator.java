package com.venyx.tiktokshop.services.validation;

import com.venyx.tiktokshop.dtos.UserUpdateDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserUpdateValidator implements ConstraintValidator<UserUpdateValid, UserUpdateDTO> {

    @Override
    public void initialize(UserUpdateValid ann) {
    }

    @Override
    public boolean isValid(UserUpdateDTO dto, ConstraintValidatorContext context) {
        // Validações adicionais no update podem ser adicionadas aqui
        return true;
    }
}
