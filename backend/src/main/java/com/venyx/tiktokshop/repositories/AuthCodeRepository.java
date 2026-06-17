package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.AuthCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthCodeRepository extends JpaRepository<AuthCode, Long> {
    Optional<AuthCode> findByCode(String code);
}