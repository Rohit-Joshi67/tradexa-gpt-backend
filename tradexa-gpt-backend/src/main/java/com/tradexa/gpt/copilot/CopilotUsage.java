package com.tradexa.gpt.copilot;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "copilot_usage")
public class CopilotUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "usage_date", nullable = false)
    private LocalDate usageDate;

    @Column(name = "messages_used", nullable = false)
    private int messagesUsed = 0;

    @Column(name = "tokens_used", nullable = false)
    private long tokensUsed = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDate getUsageDate() { return usageDate; }
    public void setUsageDate(LocalDate usageDate) { this.usageDate = usageDate; }

    public int getMessagesUsed() { return messagesUsed; }
    public void setMessagesUsed(int messagesUsed) { this.messagesUsed = messagesUsed; }

    public long getTokensUsed() { return tokensUsed; }
    public void setTokensUsed(long tokensUsed) { this.tokensUsed = tokensUsed; }
}
