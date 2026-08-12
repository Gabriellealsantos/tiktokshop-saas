package com.venyx.tiktokshop.entities;

import com.venyx.tiktokshop.entities.enums.MiningWindow;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;

import java.time.Instant;
import java.util.Objects;

/**
 * Produto da vitrine de mineração, cadastrado pelo admin (métricas manuais).
 */
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    private Integer sales = 0;

    private Integer views = 0;

    @Column(name = "affiliate_link")
    private String affiliateLink;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "commission_pct", precision = 5, scale = 2)
    private BigDecimal commissionPct;

    @Column(name = "estimated_revenue", precision = 14, scale = 2)
    private BigDecimal estimatedRevenue;

    @Column(name = "conversion_rate", precision = 5, scale = 2)
    private BigDecimal conversionRate;

    @Column(name = "sales_per_day", precision = 8, scale = 2)
    private BigDecimal salesPerDay;

    @Column(name = "delta_7d", precision = 6, scale = 2)
    private BigDecimal delta7d;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "history_7d", columnDefinition = "jsonb")
    private List<Integer> history7d;

    @Enumerated(EnumType.STRING)
    @Column(name = "mining_window")
    private MiningWindow miningWindow;

    @Column(name = "trend_label")
    private String trendLabel;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> images;

    @Column(name = "created_by_admin")
    private boolean createdByAdmin = true;

    @Column(nullable = false)
    private boolean active = true;

    @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
    private Instant createdAt;

    public Product() {
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
        // createdAt já setado acima: se ninguém definiu a janela, deriva da hora de criação.
        if (this.miningWindow == null) {
            this.miningWindow = MiningWindow.fromInstant(this.createdAt);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Integer getSales() {
        return sales;
    }

    public void setSales(Integer sales) {
        this.sales = sales;
    }

    public Integer getViews() {
        return views;
    }

    public void setViews(Integer views) {
        this.views = views;
    }

    public String getAffiliateLink() {
        return affiliateLink;
    }

    public void setAffiliateLink(String affiliateLink) {
        this.affiliateLink = affiliateLink;
    }

    public boolean isCreatedByAdmin() {
        return createdByAdmin;
    }

    public void setCreatedByAdmin(boolean createdByAdmin) {
        this.createdByAdmin = createdByAdmin;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCommissionPct() {
        return commissionPct;
    }

    public void setCommissionPct(BigDecimal commissionPct) {
        this.commissionPct = commissionPct;
    }

    public BigDecimal getEstimatedRevenue() {
        return estimatedRevenue;
    }

    public void setEstimatedRevenue(BigDecimal estimatedRevenue) {
        this.estimatedRevenue = estimatedRevenue;
    }

    public BigDecimal getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(BigDecimal conversionRate) {
        this.conversionRate = conversionRate;
    }

    public BigDecimal getSalesPerDay() {
        return salesPerDay;
    }

    public void setSalesPerDay(BigDecimal salesPerDay) {
        this.salesPerDay = salesPerDay;
    }

    public BigDecimal getDelta7d() {
        return delta7d;
    }

    public void setDelta7d(BigDecimal delta7d) {
        this.delta7d = delta7d;
    }

    public List<Integer> getHistory7d() {
        return history7d;
    }

    public void setHistory7d(List<Integer> history7d) {
        this.history7d = history7d;
    }

    public MiningWindow getMiningWindow() {
        return miningWindow;
    }

    public void setMiningWindow(MiningWindow miningWindow) {
        this.miningWindow = miningWindow;
    }

    public String getTrendLabel() {
        return trendLabel;
    }

    public void setTrendLabel(String trendLabel) {
        this.trendLabel = trendLabel;
    }

    public Integer getRankPosition() {
        return rankPosition;
    }

    public void setRankPosition(Integer rankPosition) {
        this.rankPosition = rankPosition;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
