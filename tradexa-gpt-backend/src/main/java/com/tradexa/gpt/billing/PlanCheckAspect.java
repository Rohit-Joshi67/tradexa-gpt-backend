package com.tradexa.gpt.billing;

import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.PlanRequiredException;
import com.tradexa.gpt.security.CurrentUserService;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Server-side plan enforcement. Every paid capability flows through here —
 * no request can bypass it by editing browser state.
 */
@Aspect
@Component
public class PlanCheckAspect {

    private final CurrentUserService currentUserService;
    private final SubscriptionService subscriptionService;

    public PlanCheckAspect(CurrentUserService currentUserService,
                           SubscriptionService subscriptionService) {
        this.currentUserService = currentUserService;
        this.subscriptionService = subscriptionService;
    }

    @Before("@annotation(requirePlan)")
    public void checkPlan(RequirePlan requirePlan) {
        User user = currentUserService.getCurrentUser();
        String plan = subscriptionService.getEffectivePlan(user.getId());
        if (Arrays.asList(requirePlan.value()).contains(plan)) {
            return;
        }
        throw new PlanRequiredException(
                "This feature requires Tradexa Pro. Upgrade to unlock it.");
    }

    @Before("@annotation(com.tradexa.gpt.billing.RequireJournalAccess)")
    public void checkJournalAccess() {
        User user = currentUserService.getCurrentUser();
        if (subscriptionService.canAccessJournal(user)) {
            return;
        }
        throw new PlanRequiredException(
                "Your 3-day free trial has ended. Upgrade to Tradexa Pro to keep using the journal.");
    }
}
