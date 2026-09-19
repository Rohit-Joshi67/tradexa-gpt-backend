package com.tradexa.gpt.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code email.*} properties. Everything comes from environment
 * variables (see application.properties). Empty until rj configures a
 * provider — the app boots fine; email-dependent features degrade
 * gracefully (see {@link com.tradexa.gpt.service.EmailService}).
 */
@ConfigurationProperties(prefix = "email")
public class EmailProperties {

    /** Provider id, e.g. "resend". Blank = no provider configured. */
    private String provider = "";
    private String apiKey = "";
    private String from = "";

    public boolean isConfigured() {
        return provider != null && !provider.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && from != null && !from.isBlank();
    }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
}
