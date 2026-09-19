package com.tradexa.gpt.billing;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.dto.BillingStatusData;
import com.tradexa.gpt.dto.SubscribeData;
import com.tradexa.gpt.dto.SubscribeRequest;
import com.tradexa.gpt.dto.VerifyRequest;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

    private final BillingService billingService;
    private final CurrentUserService currentUserService;

    public BillingController(BillingService billingService,
                             CurrentUserService currentUserService) {
        this.billingService = billingService;
        this.currentUserService = currentUserService;
    }

    /** Starts a checkout: returns everything the frontend needs for Razorpay Checkout. */
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<SubscribeData>> subscribe(
            @Valid @RequestBody SubscribeRequest request) {
        User user = currentUserService.getCurrentUser();
        SubscribeData data = billingService.createSubscription(user, request.getInterval());

        ApiResponse<SubscribeData> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Subscription created. Complete the payment to activate Pro.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /** Verifies the Razorpay checkout signature after a successful payment. */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verify(
            @Valid @RequestBody VerifyRequest request) {
        billingService.verifyPayment(request);

        ApiResponse<Map<String, Boolean>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Payment verified. Your Pro access activates momentarily.");
        response.setData(Map.of("verified", true));
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    /**
     * Razorpay webhook — public, authenticated by HMAC signature.
     * Source of truth for subscription status.
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        billingService.handleWebhook(payload, signature);
        return ResponseEntity.ok("OK");
    }

    /** Cancels the subscription; access continues until the paid-through date. */
    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<BillingStatusData>> cancel() {
        User user = currentUserService.getCurrentUser();
        BillingStatusData data = billingService.cancelSubscription(user);

        ApiResponse<BillingStatusData> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Subscription cancelled. Pro stays active until the end of the billing period.");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<BillingStatusData>> status() {
        User user = currentUserService.getCurrentUser();
        BillingStatusData data = billingService.getStatus(user);

        ApiResponse<BillingStatusData> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Subscription status");
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
}
