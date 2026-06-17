package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.User;
import com.venyx.tiktokshop.entities.UserRecoveryCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRecoveryCodeRepository extends JpaRepository<UserRecoveryCode, Long> {

    Optional<UserRecoveryCode> findByHashedCode(String hashedCode);

    List<UserRecoveryCode> findByUser(User user);

    void deleteByUser(User user);
}