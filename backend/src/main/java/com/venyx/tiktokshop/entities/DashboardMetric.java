package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.DashboardPeriodType;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * Métricas manuais do dashboard, editadas pelo usuário (admin/afiliado), por período.
 */
@Entity
@Table(name = "dashboard_metrics",
        uniqueConstraints = @UniqueConstraint(name = "uq_dashboard_user_period", columnNames = {"user_id", "period_type", "period_ref"}))
public class DashboardMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false)
    private DashboardPeriodType periodType;

    @Column(name = "period_ref", nullable = false)
    private String periodRef;

    @Column(precision = 14, scale = 2)
    private BigDecimal revenue;

    private Integer orders;

    @Column(precision = 14, scale = 2)
    private BigDecimal commission;

    @Column(name = "avg_ticket", precision = 14, scale = 2)
    private BigDecimal avgTicket;

    @Column(name = "items_sold")
    private Integer itemsSold;

    @Column(name = "commission_base", precision = 14, scale = 2)
    private BigDecimal commissionBase;

    @Column(name = "product_views")
    private Long productViews;

    @Column(name = "product_clicks")
    private Long productClicks;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant updatedAt;

    public DashboardMetric() {
    }

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public DashboardPeriodType getPeriodType() {
        return periodType;
    }

    public void setPeriodType(DashboardPeriodType periodType) {
        this.periodType = periodType;
    }

    public String getPeriodRef() {
        return periodRef;
    }

    public void setPeriodRef(String periodRef) {
        this.periodRef = periodRef;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }

    public Integer getOrders() {
        return orders;
    }

    public void setOrders(Integer orders) {
        this.orders = orders;
    }

    public BigDecimal getCommission() {
        return commission;
    }

    public void setCommission(BigDecimal commission) {
        this.commission = commission;
    }

    public BigDecimal getAvgTicket() {
        return avgTicket;
    }

    public void setAvgTicket(BigDecimal avgTicket) {
        this.avgTicket = avgTicket;
    }

    public Integer getItemsSold() {
        return itemsSold;
    }

    public void setItemsSold(Integer itemsSold) {
        this.itemsSold = itemsSold;
    }

    public BigDecimal getCommissionBase() {
        return commissionBase;
    }

    public void setCommissionBase(BigDecimal commissionBase) {
        this.commissionBase = commissionBase;
    }

    public Long getProductViews() {
        return productViews;
    }

    public void setProductViews(Long productViews) {
        this.productViews = productViews;
    }

    public Long getProductClicks() {
        return productClicks;
    }

    public void setProductClicks(Long productClicks) {
        this.productClicks = productClicks;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DashboardMetric that = (DashboardMetric) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
