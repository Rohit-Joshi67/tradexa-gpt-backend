package com.tradexa.gpt.exception;

public class EmailNotConfiguredException extends RuntimeException {

    public EmailNotConfiguredException() {
        super("Email is not configured yet — this feature is temporarily unavailable.");
    }
}
