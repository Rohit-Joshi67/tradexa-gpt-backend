package com.tradexa.gpt.billing;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.tradexa.gpt.dto.BillingStatusData;
import com.tradexa.gpt.dto.SubscribeData;
import com.tradexa.gpt.dto.VerifyRequest;
import com.tradexa.gpt.entity.Plan;
import com.tradexa.gpt.entity.Subscription;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.BillingException;
import com.tradexa.gpt.exception.BillingNotConfiguredException;
import com.tradexa.gpt.exception.InvalidSignatureException;
import com.tradexa.gpt.repository.PlanRepository;
import com.tradexa.gpt.repository.SubscriptionRepository;
import com.tradexa.gpt.repository.UserRepository;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

/**
 * All Razorpay money flows. The webhook is the source of truth for
 * subscription status — the frontend callback alone never grants access.
 */
@Service
public class BillingService {

    /** Advertised prices in paise. Must match the Razorpay dashboard plans. */
    private static final Map<String, Integer> EXPECTED_AMOUNTS = Map.of(
            "PRO_MONTHLY", 199900,
            "PRO_MONTHLY_LAUNCH", 99900,
            "PRO_YEARLY", 1999900,
            "PRO_YEARLY_LAUNCH", 999900);

    private final RazorpayClient razorpayClient;
    private final RazorpayProperties properties;
    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;

    public BillingService(RazorpayClient razorpayClient,
                          RazorpayProperties properties,
                          SubscriptionRepository subscriptionRepository,
                          PlanRepository planRepository,
                          UserRepository userRepository,
                          SubscriptionService subscriptionService) {
        this.razorpayClient = razorpayClient;
        this.properties = properties;
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
    }

    private void requireConfigured() {
        if (!properties.isConfigured()) {
            throw new BillingNotConfiguredException();
        }
    }

    private String resolveRazorpayPlanId(String interval, boolean launch) {
        RazorpayProperties.PlanIds.Pro p = properties.getPlan().getPro();
        if ("yearly".equals(interval)) {
            return launch ? p.getYearlyLaunch() : p.getYearly();
        }
        return launch ? p.getMonthlyLaunch() : p.getMonthly();
    }

    /**
     * Starts a checkout. Picks the 50%-off launch plan while slots remain
     * (first 100 subscribers), otherwise the regular plan. Verifies the
     * Razorpay plan's configured amount matches what we advertise before
     * creating anything — a misconfigured dashboard plan can never silently
     * charge the wrong price.
     */
    @Transactional
    public SubscribeData createSubscription(User user, String interval) {
        requireConfigured();
        if (!"monthly".equals(interval) && !"yearly".equals(interval)) {
            throw new IllegalArgumentException("interval must be 'monthly' or 'yearly'");
        }
        if (subscriptionService.isPro(user.getId())) {
            throw new IllegalStateException("User already has an active Tradexa Pro subscription");
        }

        boolean launch = subscriptionService.claimLaunchSlot();
        String planKey = ("yearly".equals(interval) ? "PRO_YEARLY" : "PRO")
                + (launch ? "_LAUNCH" : "");
        int expectedAmount = EXPECTED_AMOUNTS.get(planKey);

        String razorpayPlanId = resolveRazorpayPlanId(interval, launch);
        if (razorpayPlanId == null || razorpayPlanId.isBlank()) {
            throw new BillingNotConfiguredException(
                    "Razorpay plan id is not configured for " + planKey
                    + ". Set it in the Render environment variables.");
        }

        try {
            // Accuracy check: the dashboard plan must charge exactly what we show.
            com.razorpay.Plan rzpPlan = razorpayClient.plans.fetch(razorpayPlanId);
            int actualAmount = ((JSONObject) rzpPlan.get("item")).getInt("amount");
            if (actualAmount != expectedAmount) {
                throw new BillingException(
                        "Razorpay plan " + razorpayPlanId + " charges " + actualAmount
                        + " paise but the site advertises " + expectedAmount
                        + ". Fix the plan in the Razorpay dashboard.");
            }

            String dbPlanCode = "yearly".equals(interval) ? "PRO_YEARLY" : "PRO";
            Plan plan = planRepository.findByCode(dbPlanCode)
                    .orElseThrow(() -> new BillingException("Plan not found: " + dbPlanCode));

            JSONObject request = new JSONObject();
            request.put("plan_id", razorpayPlanId);
            request.put("total_count", "yearly".equals(interval) ? 10 : 120);
            request.put("quantity", 1);
            request.put("customer_notify", 1);
            request.put("notes", new JSONObject()
                    .put("user_id", String.valueOf(user.getId()))
                    .put("email", user.getEmail())
                    .put("db_plan_code", dbPlanCode)
                    .put("launch", String.valueOf(launch)));

            com.razorpay.Subscription rzpSub = razorpayClient.subscriptions.create(request);
            String rzpSubscriptionId = String.valueOf(rzpSub.get("id"));

            Subscription sub = new Subscription();
            sub.setUser(user);
            sub.setPlan(plan);
            sub.setProviderSubscriptionId(rzpSubscriptionId);
            sub.setStatus("created");
            sub.setLaunchPrice(launch);
            subscriptionRepository.save(sub);

            SubscribeData data = new SubscribeData();
            data.setKeyId(properties.getKeyId());
            data.setRazorpaySubscriptionId(rzpSubscriptionId);
            data.setAmountPaise(expectedAmount);
            data.setCurrency("INR");
            data.setPlanCode(launch ? "PRO_LAUNCH" : "PRO");
            data.setCustomerName(user.getName());
            data.setCustomerEmail(user.getEmail());
            return data;
        } catch (RazorpayException e) {
            throw new BillingException("Razorpay error while creating subscription: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies the Razorpay checkout signature after a successful payment.
     * Marks the subscription as authenticated — PRO access itself is granted
     * by the webhook (subscription.activated / subscription.charged).
     */
    @Transactional
    public void verifyPayment(VerifyRequest request) {
        requireConfigured();
        boolean ok = RazorpaySignatureVerifier.verifyPaymentSignature(
                request.getRazorpaySubscriptionId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature(),
                properties.getKeySecret());
        if (!ok) {
            throw new InvalidSignatureException("Payment signature verification failed");
        }
        Subscription sub = subscriptionRepository
                .findByProviderSubscriptionId(request.getRazorpaySubscriptionId())
                .orElseThrow(() -> new BillingException("Unknown subscription"));
        sub.setStatus("authenticated");
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
    }

    /**
     * Razorpay webhook. Verifies HMAC signature first, then applies the event.
     * This is the source of truth — it grants and revokes PRO access.
     */
    @Transactional
    public void handleWebhook(String payload, String signature) {
        requireConfigured();
        if (!RazorpaySignatureVerifier.verifyWebhookSignature(
                payload, signature, properties.getWebhookSecret())) {
            throw new InvalidSignatureException("Invalid webhook signature");
        }

        JSONObject root = new JSONObject(payload);
        String event = root.optString("event", "");
        JSONObject payloadObj = root.optJSONObject("payload");
        JSONObject subObj = payloadObj == null ? null : payloadObj.optJSONObject("subscription");
        JSONObject entity = subObj == null ? null : subObj.optJSONObject("entity");
        if (entity == null) {
            return; // not a subscription event — nothing for us to do
        }

        String rzpId = entity.optString("id", null);
        if (rzpId == null) {
            return;
        }

        Subscription sub = subscriptionRepository.findByProviderSubscriptionId(rzpId)
                .orElseGet(() -> createFromWebhook(entity));

        switch (event) {
            case "subscription.activated", "subscription.charged", "subscription.updated" -> {
                sub.setStatus("active");
                applyPeriod(sub, entity);
            }
            case "subscription.halted" -> sub.setStatus("halted");
            case "subscription.cancelled" -> {
                sub.setStatus("cancelled");
                sub.setCancelAtPeriodEnd(true);
                applyPeriod(sub, entity);
            }
            case "subscription.completed" -> sub.setStatus("expired");
            default -> { return; }
        }
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
        subscriptionService.evictPlan(sub.getUser().getId());
    }

    /** A subscription we never saw via /subscribe (e.g. created in dashboard). */
    private Subscription createFromWebhook(JSONObject entity) {
        JSONObject notes = entity.optJSONObject("notes");
        String userId = notes == null ? null : notes.optString("user_id", null);
        String dbPlanCode = notes == null ? "PRO" : notes.optString("db_plan_code", "PRO");
        if (userId == null) {
            throw new BillingException("Webhook for unknown subscription with no user note");
        }
        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new BillingException("Webhook references unknown user"));
        Plan plan = planRepository.findByCode(dbPlanCode)
                .orElseThrow(() -> new BillingException("Unknown plan in webhook: " + dbPlanCode));
        Subscription sub = new Subscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setProviderSubscriptionId(entity.optString("id"));
        sub.setStatus("pending");
        return sub;
    }

    private void applyPeriod(Subscription sub, JSONObject entity) {
        long start = entity.optLong("current_start", 0);
        long end = entity.optLong("current_end", 0);
        if (start > 0) {
            sub.setCurrentStart(Instant.ofEpochSecond(start));
        }
        if (end > 0) {
            sub.setCurrentEnd(Instant.ofEpochSecond(end));
        }
    }

    /** Cancels at Razorpay immediately; local access continues until paid-through date. */
    @Transactional
    public BillingStatusData cancelSubscription(User user) {
        requireConfigured();
        Subscription sub = latestActive(user.getId())
                .orElseThrow(() -> new IllegalStateException("No active subscription to cancel"));
        try {
            razorpayClient.subscriptions.cancel(sub.getProviderSubscriptionId());
        } catch (RazorpayException e) {
            throw new BillingException("Razorpay error while cancelling: " + e.getMessage(), e);
        }
        sub.setStatus("cancelled");
        sub.setCancelAtPeriodEnd(true);
        sub.setUpdatedAt(Instant.now());
        subscriptionRepository.save(sub);
        return toStatusData(user);
    }

    @Transactional(readOnly = true)
    public BillingStatusData getStatus(User user) {
        return toStatusData(user);
    }

    private Optional<Subscription> latestActive(Long userId) {
        return subscriptionRepository
                .findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                        userId, java.util.List.of("active", "authenticated"));
    }

    private BillingStatusData toStatusData(User user) {
        String plan = subscriptionService.getEffectivePlan(user.getId());
        BillingStatusData data = new BillingStatusData();
        data.setPlan(plan);
        data.setAdsEnabled(!SubscriptionService.PRO.equals(plan));
        Optional<Subscription> latest = subscriptionRepository
                .findTopByUserIdAndStatusInOrderByCreatedAtDesc(
                        user.getId(), java.util.List.of("active", "authenticated", "cancelled", "halted"));
        latest.ifPresent(sub -> {
            data.setStatus(sub.getStatus());
            data.setCurrentEnd(sub.getCurrentEnd());
            data.setCancelAtPeriodEnd(sub.isCancelAtPeriodEnd());
            data.setLaunchPrice(sub.isLaunchPrice());
        });
        return data;
    }
}
