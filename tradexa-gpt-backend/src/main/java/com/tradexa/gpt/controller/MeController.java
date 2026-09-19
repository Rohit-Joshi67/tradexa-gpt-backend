package com.tradexa.gpt.controller;

import com.tradexa.gpt.billing.SubscriptionService;
import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.dto.BillingStatusData;
import com.tradexa.gpt.dto.MeData;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.security.CurrentUserService;
import com.tradexa.gpt.billing.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1")
public class MeController {

    private final CurrentUserService currentUserService;
    private final SubscriptionService subscriptionService;
    private final BillingService billingService;

    public MeController(CurrentUserService currentUserService,
                        SubscriptionService subscriptionService,
                        BillingService billingService) {
        this.currentUserService = currentUserService;
        this.subscriptionService = subscriptionService;
        this.billingService = billingService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MeData>> me() {
        User user = currentUserService.getCurrentUser();
        String plan = subscriptionService.getEffectivePlan(user.getId());
        boolean trialActive = user.getTrialEndsAt() != null
                && Instant.now().isBefore(user.getTrialEndsAt());

        MeData data = new MeData();

        MeData.UserInfo userInfo = new MeData.UserInfo();
        userInfo.setId(user.getId());
        userInfo.setName(user.getName());
        userInfo.setEmail(user.getEmail());
        userInfo.setRole(user.getRole() == null ? null : user.getRole().name());
        data.setUser(userInfo);

        data.setPlan(plan);
        data.setAdsEnabled(!SubscriptionService.PRO.equals(plan));
        data.setTrialActive(trialActive);
        data.setTrialEndsAt(user.getTrialEndsAt());

        BillingStatusData status = billingService.getStatus(user);
        if (status.getStatus() != null) {
            MeData.SubscriptionInfo info = new MeData.SubscriptionInfo();
            info.setStatus(status.getStatus());
            info.setCurrentEnd(status.getCurrentEnd());
            info.setCancelAtPeriodEnd(status.isCancelAtPeriodEnd());
            info.setLaunchPrice(status.isLaunchPrice());
            data.setSubscription(info);
        }

        ApiResponse<MeData> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Current user");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
