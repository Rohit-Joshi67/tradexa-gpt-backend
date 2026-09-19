package com.tradexa.gpt.copilot;

import java.time.Instant;

public class QuotaExceededException extends RuntimeException {

    private final int limit;
    private final Instant resetsAt;

    public QuotaExceededException(int limit, Instant resetsAt) {
        super("Daily copilot limit reached (" + limit + " messages). Try again tomorrow.");
        this.limit = limit;
        this.resetsAt = resetsAt;
    }

    public int getLimit() { return limit; }
    public Instant getResetsAt() { return resetsAt; }
}
