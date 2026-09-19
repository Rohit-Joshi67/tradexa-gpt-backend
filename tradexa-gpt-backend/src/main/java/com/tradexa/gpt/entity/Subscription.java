package com.tradexa.gpt.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_sub_user_status", columnList = "user_id,status"),
    @Index(name = "idx_sub_provider_id", columnList = "provider_subscription_id")
})
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private String provider = "razorpay";

    @Column(name = "provider_subscription_id", unique = true)
    private String providerSubscriptionId;

    @Column(nullable = false)
    private String status;   // created|authenticated|active|pending|halted|cancelled|completed|expired

    @Column(name = "current_start")
    private Instant currentStart;

    @Column(name = "current_end")
    private Instant currentEnd;

    @Column(name = "cancel_at_period_end", nullable = false)
    private boolean cancelAtPeriodEnd = false;

    @Column(name = "launch_price", nullable = false)
    private boolean launchPrice = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Subscription() {
    }

    /**
     * A subscription grants access while it is live, or while a cancelled
     * subscription is still inside its paid-through period.
     */
    public boolean isCurrentlyActive() {
        boolean live = "active".equals(status) || "authenticated".equals(status);
        boolean gracePeriod = "cancelled".equals(status)
                && currentEnd != null && Instant.now().isBefore(currentEnd);
        if (!live && !gracePeriod) {
            return false;
        }
        return currentEnd == null || Instant.now().isBefore(currentEnd);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderSubscriptionId() { return providerSubscriptionId; }
    public void setProviderSubscriptionId(String providerSubscriptionId) {
        this.providerSubscriptionId = providerSubscriptionId;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCurrentStart() { return currentStart; }
    public void setCurrentStart(Instant currentStart) { this.currentStart = currentStart; }

    public Instant getCurrentEnd() { return currentEnd; }
    public void setCurrentEnd(Instant currentEnd) { this.currentEnd = currentEnd; }

    public boolean isCancelAtPeriodEnd() { return cancelAtPeriodEnd; }
    public void setCancelAtPeriodEnd(boolean cancelAtPeriodEnd) {
        this.cancelAtPeriodEnd = cancelAtPeriodEnd;
    }

    public boolean isLaunchPrice() { return launchPrice; }
    public void setLaunchPrice(boolean launchPrice) { this.launchPrice = launchPrice; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
