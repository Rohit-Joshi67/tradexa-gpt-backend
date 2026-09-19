package com.tradexa.gpt.copilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChatRequest {

    private Long conversationId;

    @NotBlank(message = "Message cannot be empty.")
    @Size(max = 4000, message = "Message is too long (max 4000 characters).")
    private String message;

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
