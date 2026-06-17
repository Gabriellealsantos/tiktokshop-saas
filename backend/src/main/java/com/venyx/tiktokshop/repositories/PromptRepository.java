package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromptRepository extends JpaRepository<Prompt, Long> {
}
