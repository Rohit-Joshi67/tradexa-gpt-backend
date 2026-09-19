package com.tradexa.gpt.exception;

/** Thrown when Razorpay itself fails or returns something unexpected (HTTP 502). */
public class BillingException extends RuntimeException {
    public BillingException(String message) {
        super(message);
    }

    public BillingException(String message, Throwable cause) {
        super(message, cause);
    }
}
