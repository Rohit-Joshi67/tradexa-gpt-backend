package com.tradexa.gpt.exception;

public class EmailNotVerifiedException extends RuntimeException {

    public EmailNotVerifiedException() {
        super("Please verify your email address before signing in. Check your inbox for the verification link.");
    }
}
