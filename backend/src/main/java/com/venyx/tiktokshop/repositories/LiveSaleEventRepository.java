package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.LiveSaleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface LiveSaleEventRepository extends JpaRepository<LiveSaleEvent, Long> {

    interface DailyBucket {
        int getBucket();
        BigDecimal getReceita();
        long getPedidos();
    }

    List<LiveSaleEvent> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM LiveSaleEvent e
            WHERE e.user.uuid = :userId AND e.createdAt >= :from AND e.createdAt < :to
            """)
    BigDecimal sumAmountBetween(@Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            SELECT COALESCE(SUM(e.commission), 0)
            FROM LiveSaleEvent e
            WHERE e.user.uuid = :userId AND e.createdAt >= :from AND e.createdAt < :to
            """)
    BigDecimal sumCommissionBetween(@Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            SELECT COUNT(e)
            FROM LiveSaleEvent e
            WHERE e.user.uuid = :userId AND e.createdAt >= :from AND e.createdAt < :to
            """)
    long countBetween(@Param("userId") UUID userId, @Param("from") Instant from, @Param("to") Instant to);

    @Modifying
    @Query("DELETE FROM LiveSaleEvent e WHERE e.user.uuid = :userId")
    void deleteByUserId(@Param("userId") UUID userId);

    /**
     * Agrega a serie inteira de uma vez, em janelas de 24h contadas a partir de :from —
     * o mesmo recorte que o laco em DashboardService fazia com 2 queries por dia.
     * Nativa porque date/interval do Postgres nao tem equivalente em JPQL, e usa o
     * indice (user_id, created_at) da V38.
     */
    @Query(value = """
            SELECT FLOOR(EXTRACT(EPOCH FROM (e.created_at - CAST(:from AS timestamp))) / 86400)::int AS bucket,
                   COALESCE(SUM(e.amount), 0) AS receita,
                   COUNT(*) AS pedidos
            FROM live_sale_events e
            WHERE e.user_id = :userId
              AND e.created_at >= :from
              AND e.created_at < :to
            GROUP BY bucket
            """, nativeQuery = true)
    List<DailyBucket> sumDailyBuckets(@Param("userId") UUID userId,
                                      @Param("from") Instant from,
                                      @Param("to") Instant to);
}
