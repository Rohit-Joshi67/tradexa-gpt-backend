package com.tradexa.gpt.billing;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code razorpay.*} properties. All values come from environment
 * variables on Render (see application.properties). Empty until rj connects
 * his Razorpay account — the app boots fine and billing endpoints return
 * 503 until then.
 */
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties {

    private String keyId = "";
    private String keySecret = "";
    private String webhookSecret = "";
    private final PlanIds plan = new PlanIds();

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank()
                && keySecret != null && !keySecret.isBlank();
    }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public String getKeySecret() { return keySecret; }
    public void setKeySecret(String keySecret) { this.keySecret = keySecret; }

    public String getWebhookSecret() { return webhookSecret; }
    public void setWebhookSecret(String webhookSecret) { this.webhookSecret = webhookSecret; }

    public PlanIds getPlan() { return plan; }

    public static class PlanIds {
        private final Pro pro = new Pro();

        public Pro getPro() { return pro; }

        public static class Pro {
            private String monthly = "";
            private String monthlyLaunch = "";
            private String yearly = "";
            private String yearlyLaunch = "";

            public String getMonthly() { return monthly; }
            public void setMonthly(String monthly) { this.monthly = monthly; }

            public String getMonthlyLaunch() { return monthlyLaunch; }
            public void setMonthlyLaunch(String monthlyLaunch) { this.monthlyLaunch = monthlyLaunch; }

            public String getYearly() { return yearly; }
            public void setYearly(String yearly) { this.yearly = yearly; }

            public String getYearlyLaunch() { return yearlyLaunch; }
            public void setYearlyLaunch(String yearlyLaunch) { this.yearlyLaunch = yearlyLaunch; }
        }
    }
}
