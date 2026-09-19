package com.tradexa.gpt.billing;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Razorpay signature verification. Pure static functions — no SDK needed,
 * fully unit-testable.
 *
 * Webhook:  HMAC_SHA256(webhook_secret, raw_request_body) == X-Razorpay-Signature
 * Checkout: HMAC_SHA256(key_secret, subscription_id + "|" + payment_id) == razorpay_signature
 */
public final class RazorpaySignatureVerifier {

    private RazorpaySignatureVerifier() {
    }

    public static boolean verifyWebhookSignature(String payload, String signature, String secret) {
        if (payload == null || signature == null || secret == null || secret.isBlank()) {
            return false;
        }
        String expected = hmacSha256Hex(payload, secret);
        return constantTimeEquals(expected, signature);
    }

    public static boolean verifyPaymentSignature(
            String subscriptionId, String paymentId, String signature, String secret) {
        if (subscriptionId == null || paymentId == null || signature == null
                || secret == null || secret.isBlank()) {
            return false;
        }
        String data = subscriptionId + "|" + paymentId;
        String expected = hmacSha256Hex(data, secret);
        return constantTimeEquals(expected, signature);
    }

    static String hmacSha256Hex(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException("HMAC-SHA256 unavailable", e);
        }
    }

    private static boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(
                a.getBytes(StandardCharsets.UTF_8),
                b.getBytes(StandardCharsets.UTF_8));
    }
}
