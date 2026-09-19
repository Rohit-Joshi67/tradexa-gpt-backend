package com.tradexa.gpt.dto;

import java.time.Instant;

public class BillingStatusData {

    private String plan;                 // FREE | PRO
    private boolean adsEnabled;
    private String status;               // latest subscription status, null when never subscribed
    private Instant currentEnd;
    private boolean cancelAtPeriodEnd;
    private boolean launchPrice;

    public BillingStatusData() {
    }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public boolean isAdsEnabled() { return adsEnabled; }
    public void setAdsEnabled(boolean adsEnabled) { this.adsEnabled = adsEnabled; }

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
