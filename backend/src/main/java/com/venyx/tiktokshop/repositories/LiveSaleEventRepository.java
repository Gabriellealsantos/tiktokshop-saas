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
}
