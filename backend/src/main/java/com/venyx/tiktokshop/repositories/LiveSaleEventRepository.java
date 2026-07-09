package com.venyx.tiktokshop.repositories;

import com.venyx.tiktokshop.entities.LiveSaleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface LiveSaleEventRepository extends JpaRepository<LiveSaleEvent, Long> {

    List<LiveSaleEvent> findTop10ByOrderByCreatedAtDesc();

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0)
            FROM LiveSaleEvent e
            WHERE e.createdAt >= :from AND e.createdAt < :to
            """)
    BigDecimal sumAmountBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            SELECT COALESCE(SUM(e.commission), 0)
            FROM LiveSaleEvent e
            WHERE e.createdAt >= :from AND e.createdAt < :to
            """)
    BigDecimal sumCommissionBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("""
            SELECT COUNT(e)
            FROM LiveSaleEvent e
            WHERE e.createdAt >= :from AND e.createdAt < :to
            """)
    long countBetween(@Param("from") Instant from, @Param("to") Instant to);
}
