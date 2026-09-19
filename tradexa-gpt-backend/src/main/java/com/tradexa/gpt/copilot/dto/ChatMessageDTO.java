package com.tradexa.gpt.copilot.dto;

import com.tradexa.gpt.copilot.ChatMessage;
import java.time.Instant;

public class ChatMessageDTO {

    private Long id;
    private String role;
    private String content;
    private Instant createdAt;

    public static ChatMessageDTO from(ChatMessage m) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.id = m.getId();
        dto.role = m.getRole().name();
        dto.content = m.getContent();
        dto.createdAt = m.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getRole() { return role; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
}
