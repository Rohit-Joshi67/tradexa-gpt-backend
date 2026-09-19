package com.tradexa.gpt.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binds the {@code app.auth.*} properties: refresh-cookie hardening flags.
 */
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    /**
     * Set the Secure flag on the refresh cookie. Must be true in production
     * (HTTPS); keep false for local HTTP dev.
     */
    private boolean cookieSecure = false;

    /** SameSite attribute for the refresh cookie. Use "None" for cross-site (Vercel + Render) deployments. */
    private String cookieSameSite = "Lax";

    public boolean isCookieSecure() { return cookieSecure; }
    public void setCookieSecure(boolean cookieSecure) { this.cookieSecure = cookieSecure; }

    public String getCookieSameSite() { return cookieSameSite; }
    public void setCookieSameSite(String cookieSameSite) { this.cookieSameSite = cookieSameSite; }
}
