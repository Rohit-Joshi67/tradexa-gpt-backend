package com.tradexa.gpt.security;

import java.time.Duration;

/**
 * Minimal thread-safe token bucket. {@code capacity} tokens are available
 * per {@code window}; they refill continuously so bursts are absorbed
 * without hard cliff-edges.
 */
public class TokenBucket {

    private final int capacity;
    private final double nanosPerToken;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucket(int capacity, Duration window) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("capacity must be positive");
        }
        this.capacity = capacity;
        this.nanosPerToken = (double) window.toNanos() / capacity;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    public synchronized boolean tryConsume() {
        refill();
        if (tokens >= 1.0) {
            tokens -= 1.0;
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.nanoTime();
        double fresh = (now - lastRefillNanos) / nanosPerToken;
        if (fresh > 0) {
            tokens = Math.min(capacity, tokens + fresh);
            lastRefillNanos = now;
        }
    }
}
