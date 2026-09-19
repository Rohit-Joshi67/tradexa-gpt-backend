package com.tradexa.gpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SubscribeRequest {

    @NotBlank(message = "interval is required")
    @Pattern(regexp = "monthly|yearly", message = "interval must be 'monthly' or 'yearly'")
    private String interval;

    public SubscribeRequest() {
    }

    public String getInterval() {
        return interval;
    }

    public void setInterval(String interval) {
        this.interval = interval;
    }
}
