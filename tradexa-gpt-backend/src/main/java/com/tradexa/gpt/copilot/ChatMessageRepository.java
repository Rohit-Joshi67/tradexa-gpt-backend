package com.tradexa.gpt.copilot;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByIdAsc(Long conversationId);
    long countByConversationId(Long conversationId);
}
