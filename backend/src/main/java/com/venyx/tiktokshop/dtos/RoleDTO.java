package com.venyx.tiktokshop.dtos;

import com.venyx.tiktokshop.entities.Role;

public record RoleDTO(Long id, String authority) {

	public RoleDTO(Role role) {
		this(role.getId(), role.getAuthority());
	}
}
