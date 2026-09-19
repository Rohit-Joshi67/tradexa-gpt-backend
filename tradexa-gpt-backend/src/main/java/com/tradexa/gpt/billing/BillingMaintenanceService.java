package com.tradexa.gpt.billing;

import com.tradexa.gpt.entity.Subscription;
import com.tradexa.gpt.repository.PromoClaimRepository;
import com.tradexa.gpt.repository.SubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Hourly housekeeping for billing:
 * - checkouts that never completed payment within 24h are marked expired and
 *   their launch-offer slot is released back to the pool.
 */
@Service
public class BillingMaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(BillingMaintenanceService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final PromoClaimRepository promoClaimRepository;

    public BillingMaintenanceService(SubscriptionRepository subscriptionRepository,
                                     PromoClaimRepository promoClaimRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.promoClaimRepository = promoClaimRepository;
    }

    @Scheduled(cron = "0 0 * * * *") // every hour
    @Transactional
    public void releaseAbandonedCheckouts() {
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        List<Subscription> abandoned =
                subscriptionRepository.findByStatusAndCreatedAtBefore("created", cutoff);
        for (Subscription sub : abandoned) {
            sub.setStatus("expired");
            sub.setUpdatedAt(Instant.now());
            subscriptionRepository.save(sub);
            if (sub.isLaunchPrice()) {
                promoClaimRepository.releaseSlot("PRO_LAUNCH");
            }
            log.info("Released abandoned checkout {}", sub.getProviderSubscriptionId());
        }
    }
}
