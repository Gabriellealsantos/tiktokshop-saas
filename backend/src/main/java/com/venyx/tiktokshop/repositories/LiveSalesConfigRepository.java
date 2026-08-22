package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.LiveSalesConfig;
import com.venyx.tiktokshop.entities.enums.LiveSalesMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LiveSalesConfigRepository extends JpaRepository<LiveSalesConfig, Long> {

    Optional<LiveSalesConfig> findTopByUserIdOrderByIdAsc(UUID userId);

    /** Configs em modo automático, com o usuário já carregado — evita N+1 no tick de 5s. */
    @Query("""
        SELECT c FROM LiveSalesConfig c
        LEFT JOIN FETCH c.user
        WHERE c.mode = :mode
        """)
    List<LiveSalesConfig> findByModeFetchingUser(@Param("mode") LiveSalesMode mode);
}
