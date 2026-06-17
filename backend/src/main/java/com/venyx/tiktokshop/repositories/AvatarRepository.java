package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Avatar;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvatarRepository extends JpaRepository<Avatar, Long> {
}
