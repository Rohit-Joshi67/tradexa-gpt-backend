package com.tradexa.gpt.copilot;

public class LlmNotConfiguredException extends RuntimeException {
    public LlmNotConfiguredException() {
        super("The Tradexa-GPT AI copilot is not connected yet. Add a Gemini API key to enable it.");
    }
}
