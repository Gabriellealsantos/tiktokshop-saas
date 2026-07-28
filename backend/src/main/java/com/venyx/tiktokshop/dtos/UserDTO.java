package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.enums.UserStatus;

import java.time.Instant;
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
    Instant createdAt,
    Set<RoleDTO> roles,
    String planType,
    String photoUrl
) {
    public UserDTO(User entity) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getPhone(),
            entity.getCpf(),
            entity.getEmail(),
            entity.getUserStatus(),
            entity.getCreatedAt(),
            entity.getRoles().stream().map(RoleDTO::new).collect(Collectors.toSet()),
            null,
            entity.getPhotoUrl()
        );
    }

    public UserDTO(User entity, String planType) {
        this(
            entity.getId(),
            entity.getName(),
            entity.getPhone(),
            entity.getCpf(),
            entity.getEmail(),
            entity.getUserStatus(),
            entity.getCreatedAt(),
            entity.getRoles().stream().map(RoleDTO::new).collect(Collectors.toSet()),
            planType,
            entity.getPhotoUrl()
        );
    }
}
