package com.venyx.tiktokshop.services.validation;

import com.venyx.tiktokshop.dtos.UserInsertDTO;
import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.repositories.UserRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Optional;

public class UserInsertValidator implements ConstraintValidator<UserInsertValid, UserInsertDTO> {

    private final UserRepository userRepository;

    public UserInsertValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void initialize(UserInsertValid ann) {
    }

    @Override
    public boolean isValid(UserInsertDTO dto, ConstraintValidatorContext context) {
        boolean valid = true;

        // Verifica email duplicado
        if (dto.email() != null) {
            Optional<User> user = userRepository.findByEmail(dto.email());
            if (user.isPresent()) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("Email já existe")
                        .addPropertyNode("email")
                        .addConstraintViolation();
                valid = false;
            }
        }

        // Verifica CPF duplicado
        if (dto.cpf() != null) {
            String sanitizedCpf = dto.cpf().replaceAll("[^0-9]", "");
            Optional<User> user = userRepository.findByCpf(sanitizedCpf);
            if (user.isPresent()) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate("CPF já existe")
                        .addPropertyNode("cpf")
                        .addConstraintViolation();
                valid = false;
            }
        }

        return valid;
    }
}
