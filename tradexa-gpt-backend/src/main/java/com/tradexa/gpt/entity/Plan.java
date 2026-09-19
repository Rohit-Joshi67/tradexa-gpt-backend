package com.tradexa.gpt.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;          // FREE | PRO | PRO_YEARLY

    @Column(nullable = false)
    private String name;

    @Column(name = "price_paise", nullable = false)
    private int pricePaise;       // 199900 = Rs 1,999

    @Column(nullable = false)
    private String currency = "INR";

    @Column(name = "billing_interval", nullable = false)
    private String interval;      // month | year

    @Column(nullable = false)
    private String features = "{}";

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Plan() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getPricePaise() { return pricePaise; }
    public void setPricePaise(int pricePaise) { this.pricePaise = pricePaise; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getInterval() { return interval; }
    public void setInterval(String interval) { this.interval = interval; }

    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    /** Effective customer-facing plan: PRO_YEARLY counts as PRO everywhere. */
    public String effectivePlanCode() {
        return "PRO_YEARLY".equals(code) ? "PRO" : code;
    }
}
