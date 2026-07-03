package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.CreditPackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditPackageRepository extends JpaRepository<CreditPackage, Long> {

    List<CreditPackage> findByActiveTrueOrderByOrderIndexAsc();
}
