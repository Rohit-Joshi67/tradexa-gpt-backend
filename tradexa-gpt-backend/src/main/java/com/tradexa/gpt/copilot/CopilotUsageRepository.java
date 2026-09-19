package com.tradexa.gpt.copilot;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface CopilotUsageRepository extends JpaRepository<CopilotUsage, Long> {
    Optional<CopilotUsage> findByUserIdAndUsageDate(Long userId, LocalDate usageDate);
}
