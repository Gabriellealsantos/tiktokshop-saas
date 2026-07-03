package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.AcademyModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademyModuleRepository extends JpaRepository<AcademyModule, Long> {
    List<AcademyModule> findAllByOrderByOrderIndexAsc();
}
