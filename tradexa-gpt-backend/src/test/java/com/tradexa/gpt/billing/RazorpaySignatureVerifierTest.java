package com.tradexa.gpt.billing;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RazorpaySignatureVerifierTest {

    // RFC 4231 test vector: HMAC-SHA256("Jefe", "what do ya want for nothing?")
    private static final String RFC_KEY = "Jefe";
    private static final String RFC_DATA = "what do ya want for nothing?";
    private static final String RFC_HMAC =
            "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843";

    @Test
    void webhookSignatureMatchesKnownVector() {
        assertTrue(RazorpaySignatureVerifier.verifyWebhookSignature(RFC_DATA, RFC_HMAC, RFC_KEY));
    }

    @Test
    void webhookSignatureRejectsTamperedPayload() {
        assertFalse(RazorpaySignatureVerifier.verifyWebhookSignature(RFC_DATA + "!", RFC_HMAC, RFC_KEY));
    }

    @Test
    void webhookSignatureRejectsWrongSignature() {
        assertFalse(RazorpaySignatureVerifier.verifyWebhookSignature(
                RFC_DATA, "0".repeat(64), RFC_KEY));
    }

    @Test
    void webhookSignatureRejectsBlankSecret() {
        assertFalse(RazorpaySignatureVerifier.verifyWebhookSignature(RFC_DATA, RFC_HMAC, " "));
        assertFalse(RazorpaySignatureVerifier.verifyWebhookSignature(RFC_DATA, RFC_HMAC, null));
    }

    @Test
    void paymentSignatureVerifies() {
        String secret = "test_secret";
        String subId = "sub_ABC123";
        String payId = "pay_XYZ789";
        String signature = RazorpaySignatureVerifier.hmacSha256Hex(subId + "|" + payId, secret);

        assertTrue(RazorpaySignatureVerifier.verifyPaymentSignature(subId, payId, signature, secret));
    }

    @Test
    void paymentSignatureRejectsMismatch() {
        assertFalse(RazorpaySignatureVerifier.verifyPaymentSignature(
                "sub_A", "pay_B", "0".repeat(64), "secret"));
    }
}
