package com.venyx.tiktokshop.controllers;

import com.venyx.tiktokshop.dtos.ChangePasswordDTO;
import com.venyx.tiktokshop.dtos.ProfileUpdateDTO;
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
import org.springframework.web.multipart.MultipartFile;
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
     * Busca paginada de usuários. Requer ADM (ROLE_ADMIN).
     */
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
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
     * Atualiza o perfil do próprio usuário autenticado (nome, telefone, CPF).
     * Recurso self: sem @PreAuthorize (o Resource Server já exige autenticação).
     * Não permite alterar status/roles/senha/e-mail.
     */
    @PutMapping(value = "/me")
    public ResponseEntity<UserDTO> updateMe(@RequestBody @Valid ProfileUpdateDTO dto) {
        return ResponseEntity.ok(userService.updateMe(dto));
    }

    /**
     * Troca a senha do próprio usuário autenticado. Exige a senha atual.
     */
    @PutMapping(value = "/me/password")
    public ResponseEntity<Void> changeMyPassword(@RequestBody @Valid ChangePasswordDTO dto) {
        userService.changeMyPassword(dto);
        return ResponseEntity.noContent().build();
    }

    /**
     * Envia/substitui a foto de perfil do próprio usuário autenticado.
     */
    @PostMapping(value = "/me/photo", consumes = "multipart/form-data")
    public ResponseEntity<UserDTO> updateMyPhoto(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updatePhoto(file));
    }

    /**
     * Remove a foto de perfil do próprio usuário autenticado.
     */
    @DeleteMapping(value = "/me/photo")
    public ResponseEntity<UserDTO> removeMyPhoto() {
        return ResponseEntity.ok(userService.removePhoto());
    }

    /**
     * Busca um usuário específico pelo seu UUID. Requer ADM (ROLE_ADMIN).
     */
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @GetMapping(value = "/{id}")
    public ResponseEntity<UserDTO> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    /**
     * Cria um novo usuário no sistema. Requer ADM (ROLE_ADMIN).
     */
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PostMapping
    public ResponseEntity<UserDTO> insert(@RequestBody @Valid UserInsertDTO dto) {
        UserDTO newDto = userService.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }

    /**
     * Atualiza os dados de um usuário existente. Requer ADM (ROLE_ADMIN).
     */
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @PutMapping(value = "/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable UUID id, @RequestBody @Valid UserUpdateDTO dto) {
        return ResponseEntity.ok(userService.update(id, dto));
    }

    /**
     * Remove um usuário do sistema (soft delete). Requer ADM (ROLE_ADMIN).
     */
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.ROLE_ADMIN + "', '" + RoleConstants.ROLE_AFFILIATE + "')")
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
