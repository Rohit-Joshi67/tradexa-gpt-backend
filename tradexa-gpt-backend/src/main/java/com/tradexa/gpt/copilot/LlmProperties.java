package com.tradexa.gpt.copilot;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * LLM configuration — env-gated like Razorpay and email.
 * The app boots fine without a key; copilot endpoints return 503 until configured.
 */
@ConfigurationProperties(prefix = "llm")
public class LlmProperties {

    /** Gemini API key. Empty = copilot disabled (503 with a friendly message). */
    private String geminiApiKey = "";

    /** Free-tier Flash-class model. Overridable via LLM_MODEL. */
    private String model = "gemini-2.0-flash";

    /** Hard cap on tokens per LLM request — cost guardrail. */
    private int maxTokens = 1024;

    private double temperature = 0.7;

    /**
     * Paid-model fallback is NEVER enabled unless explicitly set.
     * When false, the client refuses to call any non-free-tier model.
     */
    private boolean allowPaid = false;

    /** Max copilot messages per user per day. */
    private int dailyMessageLimit = 50;

    public String getGeminiApiKey() { return geminiApiKey; }
    public void setGeminiApiKey(String geminiApiKey) { this.geminiApiKey = geminiApiKey; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getMaxTokens() { return maxTokens; }
    public void setMaxTokens(int maxTokens) { this.maxTokens = maxTokens; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public boolean isAllowPaid() { return allowPaid; }
    public void setAllowPaid(boolean allowPaid) { this.allowPaid = allowPaid; }

    public int getDailyMessageLimit() { return dailyMessageLimit; }
    public void setDailyMessageLimit(int dailyMessageLimit) { this.dailyMessageLimit = dailyMessageLimit; }

    public boolean isConfigured() {
        return geminiApiKey != null && !geminiApiKey.isBlank();
    }
}
