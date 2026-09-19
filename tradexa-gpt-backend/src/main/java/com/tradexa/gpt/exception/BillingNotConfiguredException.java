package com.tradexa.gpt.exception;

/** Thrown when billing endpoints are hit before Razorpay keys are configured (HTTP 503). */
public class BillingNotConfiguredException extends RuntimeException {
    public BillingNotConfiguredException() {
        super("Billing is not configured yet. Please try again later.");
    }

    public BillingNotConfiguredException(String message) {
        super(message);
    }
}
