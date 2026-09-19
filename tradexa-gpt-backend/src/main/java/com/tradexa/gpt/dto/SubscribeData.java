package com.tradexa.gpt.dto;

/** Data returned to the frontend to open the Razorpay checkout modal. */
public class SubscribeData {

    private String keyId;
    private String razorpaySubscriptionId;
    private int amountPaise;
    private String currency;
    private String planCode;      // PRO | PRO_LAUNCH
    private String customerName;
    private String customerEmail;

    public SubscribeData() {
    }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public String getRazorpaySubscriptionId() { return razorpaySubscriptionId; }
    public void setRazorpaySubscriptionId(String razorpaySubscriptionId) {
        this.razorpaySubscriptionId = razorpaySubscriptionId;
    }

    public int getAmountPaise() { return amountPaise; }
    public void setAmountPaise(int amountPaise) { this.amountPaise = amountPaise; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPlanCode() { return planCode; }
    public void setPlanCode(String planCode) { this.planCode = planCode; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
}
