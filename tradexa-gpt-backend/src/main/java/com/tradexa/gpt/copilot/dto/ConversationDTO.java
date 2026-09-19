package com.tradexa.gpt.copilot.dto;

import com.tradexa.gpt.copilot.Conversation;
import java.time.Instant;

public class ConversationDTO {

    private Long id;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;

    public static ConversationDTO from(Conversation c) {
        ConversationDTO dto = new ConversationDTO();
        dto.id = c.getId();
        dto.title = c.getTitle();
        dto.createdAt = c.getCreatedAt();
        dto.updatedAt = c.getUpdatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
