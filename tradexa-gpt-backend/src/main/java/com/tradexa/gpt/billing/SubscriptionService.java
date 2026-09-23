package com.tradexa.gpt.billing;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.tradexa.gpt.entity.Subscription;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.repository.PromoClaimRepository;
import com.tradexa.gpt.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Single source of truth for "what plan is this user on".
 *
 * Rules:
 * - PRO (or PRO_YEARLY) with a live subscription -> "PRO"
 * - anything else -> "FREE"
 * - journal access -> PRO, or inside the 3-day free trial
 *
 * The resolved plan is cached for 5 minutes per user and evicted whenever
 * billing state changes (webhook, verify, cancel).
 */
@Service
public class SubscriptionService {

    public static final String FREE = "FREE";
    public static final String PRO = "PRO";

    private static final List<String> LIVE_STATUSES = List.of("active", "authenticated", "cancelled");

    private final SubscriptionRepository subscriptionRepository;
    private final PromoClaimRepository promoClaimRepository;
    private final com.tradexa.gpt.repository.UserRepository userRepository;

    private final Cache<Long, String> planCache = Caffeine.newBuilder()
            .expireAfterWrite(5, TimeUnit.MINUTES)
            .maximumSize(10_000)
            .build();

    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               PromoClaimRepository promoClaimRepository,
                               com.tradexa.gpt.repository.UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.promoClaimRepository = promoClaimRepository;
        this.userRepository = userRepository;
    }

    public String getEffectivePlan(Long userId) {
        return planCache.get(userId, this::resolvePlan);
    }

    public boolean isPro(Long userId) {
        return PRO.equals(getEffectivePlan(userId));
    }

    /** Journal/analytics/upload access: PRO, or within the 3-day free trial. */
    public boolean canAccessJournal(User user) {
        if (isPro(user.getId())) {
            return true;
        }
        return user.getTrialEndsAt() != null && Instant.now().isBefore(user.getTrialEndsAt());
    }

    public void evictPlan(Long userId) {
        planCache.invalidate(userId);
    }

    /**
     * Atomically claims one launch-offer slot (first 100 subscribers).
     * Returns true when this caller won a slot.
     */
    @Transactional
    public boolean claimLaunchSlot() {
        return promoClaimRepository.claimSlot("PRO_LAUNCH") == 1;
    }

    private String resolvePlan(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && user.getRole() != null && user.getRole().name().equals("ADMIN")) {
            return PRO;
        }
        return subscriptionRepository
                .findTopByUserIdAndStatusInOrderByCreatedAtDesc(userId, LIVE_STATUSES)
                .filter(Subscription::isCurrentlyActive)
                .map(sub -> sub.getPlan().effectivePlanCode())
                .orElse(FREE);
    }
}
