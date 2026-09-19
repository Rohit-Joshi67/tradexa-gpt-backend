package com.tradexa.gpt.service;

import com.tradexa.gpt.config.EmailProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Outbound email, ENV-GATED like the Razorpay pattern: the app boots without
 * a provider and every send degrades to a logged warning instead of failing.
 * Recommended provider is Resend (simple HTTP API, free tier).
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final EmailProperties properties;
    private final RestClient restClient;

    public EmailService(EmailProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public boolean isConfigured() {
        return properties.isConfigured();
    }

    public void sendVerificationEmail(String to, String verifyLink) {
        send(to,
                "Verify your Tradexa email",
                "<p>Welcome to Tradexa! Please verify your email address:</p>"
                        + "<p><a href=\"" + verifyLink + "\">Verify my email</a></p>"
                        + "<p>This link expires in 24 hours.</p>");
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        send(to,
                "Reset your Tradexa password",
                "<p>We received a password reset request for your Tradexa account:</p>"
                        + "<p><a href=\"" + resetLink + "\">Reset my password</a></p>"
                        + "<p>This link expires in 1 hour. If you didn't ask for this, ignore this email.</p>");
    }

    private void send(String to, String subject, String html) {
        if (!properties.isConfigured()) {
            log.warn("Email not configured — skipping '{}' to {}. Set EMAIL_PROVIDER/EMAIL_API_KEY/EMAIL_FROM to enable.",
                    subject, to);
            return;
        }
        if ("resend".equalsIgnoreCase(properties.getProvider())) {
            sendViaResend(to, subject, html);
        } else {
            log.warn("Unknown email provider '{}' — skipping '{}' to {}.",
                    properties.getProvider(), subject, to);
        }
    }

    private void sendViaResend(String to, String subject, String html) {
        try {
            restClient.post()
                    .uri("https://api.resend.com/emails")
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of(
                            "from", properties.getFrom(),
                            "to", List.of(to),
                            "subject", subject,
                            "html", html))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Sent email '{}' to {}", subject, to);
        } catch (Exception e) {
            // Email delivery must never break the user flow (registration etc.).
            log.error("Failed to send email '{}' to {}: {}", subject, to, e.getMessage());
        }
    }
}
