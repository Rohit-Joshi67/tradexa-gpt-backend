package com.tradexa.gpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class VerifyRequest {

    @NotBlank
    @JsonProperty("razorpay_subscription_id")
    private String razorpaySubscriptionId;

    @NotBlank
    @JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;

    @NotBlank
    @JsonProperty("razorpay_signature")
    private String razorpaySignature;

    public VerifyRequest() {
    }

    public String getRazorpaySubscriptionId() { return razorpaySubscriptionId; }
    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) {
        this.razorpaySubscriptionId = razorpaySubscriptionId;
    }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) {
        this.razorpaySignature = razorpaySignature;
    }
}
