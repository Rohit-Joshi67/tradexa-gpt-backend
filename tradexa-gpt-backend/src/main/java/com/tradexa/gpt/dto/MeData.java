package com.tradexa.gpt.dto;

import java.time.Instant;

/** Everything the frontend needs to render plan-aware UI. */
public class MeData {

    private UserInfo user;
    private String plan;                 // FREE | PRO
    private boolean adsEnabled;
    private boolean trialActive;
    private Instant trialEndsAt;
    private SubscriptionInfo subscription; // null when never subscribed

    public MeData() {
    }

    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public boolean isAdsEnabled() { return adsEnabled; }
    public void setAdsEnabled(boolean adsEnabled) { this.adsEnabled = adsEnabled; }

    public boolean isTrialActive() { return trialActive; }
    public void setTrialActive(boolean trialActive) { this.trialActive = trialActive; }

    public Instant getTrialEndsAt() { return trialEndsAt; }
    public void setTrialEndsAt(Instant trialEndsAt) { this.trialEndsAt = trialEndsAt; }

    public SubscriptionInfo getSubscription() { return subscription; }
    public void setSubscription(SubscriptionInfo subscription) { this.subscription = subscription; }

    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class SubscriptionInfo {
        private String status;
        private Instant currentEnd;
        private boolean cancelAtPeriodEnd;
        private boolean launchPrice;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Instant getCurrentEnd() { return currentEnd; }
        public void setCurrentEnd(Instant currentEnd) { this.currentEnd = currentEnd; }

        public boolean isCancelAtPeriodEnd() { return cancelAtPeriodEnd; }
        public void setCancelAtPeriodEnd(boolean cancelAtPeriodEnd) {
            this.cancelAtPeriodEnd = cancelAtPeriodEnd;
        }

        public boolean isLaunchPrice() { return launchPrice; }
        public void setLaunchPrice(boolean launchPrice) { this.launchPrice = launchPrice; }
    }
}
