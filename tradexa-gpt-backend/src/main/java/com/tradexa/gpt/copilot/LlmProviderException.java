package com.tradexa.gpt.copilot;

public class LlmProviderException extends RuntimeException {
    public LlmProviderException(String message) {
        super(message);
    }

    public LlmProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
