package com.tradexa.gpt.copilot;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * Per-user daily copilot quotas + token accounting.
 * Keeps LLM spend bounded: every AI call goes through here first.
 */
@Service
public class CopilotQuotaService {

    private final CopilotUsageRepository usageRepository;
    private final LlmProperties properties;

    public CopilotQuotaService(CopilotUsageRepository usageRepository, LlmProperties properties) {
        this.usageRepository = usageRepository;
        this.properties = properties;
    }

    @Transactional
    public void consumeMessage(Long userId) {
        CopilotUsage usage = today(userId);
        if (usage.getMessagesUsed() >= properties.getDailyMessageLimit()) {
            throw new QuotaExceededException(properties.getDailyMessageLimit(), resetsAt());
        }
        usage.setMessagesUsed(usage.getMessagesUsed() + 1);
        usageRepository.save(usage);
    }

    @Transactional
    public void recordTokens(Long userId, long tokens) {
        CopilotUsage usage = today(userId);
        usage.setTokensUsed(usage.getTokensUsed() + tokens);
        usageRepository.save(usage);
    }

    @Transactional(readOnly = true)
    public QuotaSnapshot getQuota(Long userId) {
        CopilotUsage usage = today(userId);
        int limit = properties.getDailyMessageLimit();
        int used = usage.getMessagesUsed();
        return new QuotaSnapshot(limit, used, Math.max(0, limit - used), resetsAt());
    }

    private CopilotUsage today(Long userId) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return usageRepository.findByUserIdAndUsageDate(userId, today)
                .orElseGet(() -> {
                    CopilotUsage u = new CopilotUsage();
                    u.setUserId(userId);
                    u.setUsageDate(today);
                    return u;
                });
    }

    private Instant resetsAt() {
        return LocalDate.now(ZoneOffset.UTC).plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    public record QuotaSnapshot(int limit, int used, int remaining, Instant resetsAt) {}
}
