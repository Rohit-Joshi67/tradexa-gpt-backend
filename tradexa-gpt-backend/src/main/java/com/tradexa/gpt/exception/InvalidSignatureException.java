package com.tradexa.gpt.exception;

/** Thrown when a Razorpay webhook or checkout signature does not verify (HTTP 400). */
public class InvalidSignatureException extends RuntimeException {
    public InvalidSignatureException(String message) {
        super(message);
    }
}
