package com.tradexa.gpt.billing;

import com.tradexa.gpt.entity.Plan;
import com.tradexa.gpt.entity.Subscription;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.repository.PromoClaimRepository;
import com.tradexa.gpt.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private PromoClaimRepository promoClaimRepository;

    private SubscriptionService subscriptionService;

    @BeforeEach
    void setUp() {
        subscriptionService = new SubscriptionService(subscriptionRepository, promoClaimRepository);
    }

    private Subscription activeSub(String planCode, Instant currentEnd) {
        Plan plan = new Plan();
        plan.setCode(planCode);
        Subscription sub = new Subscription();
        sub.setPlan(plan);
        sub.setStatus("active");
        sub.setCurrentEnd(currentEnd);
        return sub;
    }

    private User user(long id, Instant trialEndsAt) {
        User u = new User();
        u.setId(id);
        u.setTrialEndsAt(trialEndsAt);
        return u;
    }

    @Test
    void freeWhenNoSubscription() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(1L), anyList())).thenReturn(Optional.empty());

        assertEquals("FREE", subscriptionService.getEffectivePlan(1L));
        assertFalse(subscriptionService.isPro(1L));
    }

    @Test
    void proWhenActiveSubscription() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(2L), anyList()))
                .thenReturn(Optional.of(activeSub("PRO", Instant.now().plus(30, ChronoUnit.DAYS))));

        assertEquals("PRO", subscriptionService.getEffectivePlan(2L));
        assertTrue(subscriptionService.isPro(2L));
    }

    @Test
    void yearlyCountsAsPro() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(3L), anyList()))
                .thenReturn(Optional.of(activeSub("PRO_YEARLY", Instant.now().plus(300, ChronoUnit.DAYS))));

        assertEquals("PRO", subscriptionService.getEffectivePlan(3L));
    }

    @Test
    void freeWhenSubscriptionExpired() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(4L), anyList()))
                .thenReturn(Optional.of(activeSub("PRO", Instant.now().minus(1, ChronoUnit.DAYS))));

        assertEquals("FREE", subscriptionService.getEffectivePlan(4L));
    }

    @Test
    void cancelledButPaidThroughStillPro() {
        Subscription sub = activeSub("PRO", Instant.now().plus(10, ChronoUnit.DAYS));
        sub.setStatus("cancelled");
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(5L), anyList())).thenReturn(Optional.of(sub));

        assertEquals("PRO", subscriptionService.getEffectivePlan(5L));
    }

    @Test
    void journalAccessDuringTrial() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(6L), anyList())).thenReturn(Optional.empty());

        User u = user(6L, Instant.now().plus(2, ChronoUnit.DAYS));
        assertTrue(subscriptionService.canAccessJournal(u));
    }

    @Test
    void journalBlockedAfterTrial() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(7L), anyList())).thenReturn(Optional.empty());

        User u = user(7L, Instant.now().minus(1, ChronoUnit.DAYS));
        assertFalse(subscriptionService.canAccessJournal(u));
    }

    @Test
    void claimLaunchSlotDelegatesAtomically() {
        when(promoClaimRepository.claimSlot("PRO_LAUNCH")).thenReturn(1);
        assertTrue(subscriptionService.claimLaunchSlot());

        when(promoClaimRepository.claimSlot("PRO_LAUNCH")).thenReturn(0);
        assertFalse(subscriptionService.claimLaunchSlot());
    }

    @Test
    void planCacheEvictionRefreshes() {
        when(subscriptionRepository.findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                eq(8L), anyList()))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(activeSub("PRO", Instant.now().plus(30, ChronoUnit.DAYS))));

        assertEquals("FREE", subscriptionService.getEffectivePlan(8L));
        // cached — still FREE without eviction
        assertEquals("FREE", subscriptionService.getEffectivePlan(8L));

        subscriptionService.evictPlan(8L);
        assertEquals("PRO", subscriptionService.getEffectivePlan(8L));
    }
}
