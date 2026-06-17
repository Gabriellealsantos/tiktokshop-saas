package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserDTO(
    UUID id,
    String name,
    String phoneNumber,
    String cpf,
    String email,
    UserStatus userStatus,
    Set<RoleDTO> roles
) {
    public UserDTO(User entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getPhone(),
            entity.getCpf(),
            entity.getEmail(),
            entity.getUserStatus(),
            entity.getRoles().stream().map(RoleDTO::new).collect(Collectors.toSet())
        );
    }
}
