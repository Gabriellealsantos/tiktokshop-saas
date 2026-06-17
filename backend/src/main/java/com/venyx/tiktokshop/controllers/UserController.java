package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.UserDTO;
import com.venyx.tiktokshop.dtos.UserInsertDTO;
import com.venyx.tiktokshop.dtos.UserUpdateDTO;
import com.venyx.tiktokshop.entities.RoleConstants;
import com.venyx.tiktokshop.services.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

/**
 * Controller responsável pelo gerenciamento de usuários.
 * Permite buscar, criar, atualizar e deletar usuários no sistema.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Busca paginada de usuários. Requer ADMIN ou SUPER_ADMIN.
     */
    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping
    public ResponseEntity<Page<UserDTO>> findAllPaged(
            @RequestParam(value = "search", defaultValue = "") String search,
            Pageable pageable) {
        return ResponseEntity.ok(userService.findAllPaged(search, pageable));
    }

    /**
     * Busca os dados do usuário atualmente autenticado.
     */
    @GetMapping(value = "/me")
    public ResponseEntity<UserDTO> findMe() {
        return ResponseEntity.ok(userService.findMe());
    }

    /**
     * Busca um usuário específico pelo seu UUID. Requer ADMIN ou SUPER_ADMIN.
     */
    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * Cria um novo usuário no sistema. Requer ADMIN ou SUPER_ADMIN.
     */
    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PostMapping
    public ResponseEntity<UserDTO> insert(@RequestBody @Valid UserInsertDTO dto) {
        UserDTO newDto = userService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    /**
     * Atualiza os dados de um usuário existente. Requer ADMIN ou SUPER_ADMIN.
     */
    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable UUID id, @RequestBody @Valid UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    /**
     * Remove um usuário do sistema (soft delete). Requer ADMIN ou SUPER_ADMIN.
     */
    @PreAuthorize("hasAnyRole('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_SUPER_ADMIN + "')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
