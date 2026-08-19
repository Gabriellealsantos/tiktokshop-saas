package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<User> findByEmailWithRoles(@Param("email") String email);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.cpf = :cpf")
    Optional<User> findByCpfWithRoles(@Param("cpf") String cpf);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.phone = :phone")
    Optional<User> findByPhoneWithRoles(@Param("phone") String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByCpf(String cpf);

    Optional<User> findByPhone(String phone);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL " +
            "AND (:search IS NULL OR (LOWER(CAST(u.name AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))) " +
            "AND (:excludePrivileged = false OR NOT EXISTS (SELECT r FROM u.roles r WHERE r.authority IN ('ROLE_ADMIN', 'ROLE_AFFILIATE')))")
    Page<User> searchUsers(@Param("search") String search, @Param("excludePrivileged") boolean excludePrivileged, Pageable pageable);
}
