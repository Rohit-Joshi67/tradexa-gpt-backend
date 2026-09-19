package com.tradexa.gpt.security;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class TokenBucketTest {

    @Test
    void allowsUpToCapacityThenRejects() {
        TokenBucket bucket = new TokenBucket(3, Duration.ofMinutes(1));

        assertTrue(bucket.tryConsume());
        assertTrue(bucket.tryConsume());
        assertTrue(bucket.tryConsume());
        assertFalse(bucket.tryConsume(), "bucket must reject once capacity is exhausted");
    }

    @Test
    void refillsOverTime() throws InterruptedException {
        // 2 tokens per 200ms → one token every ~100ms.
        TokenBucket bucket = new TokenBucket(2, Duration.ofMillis(200));

        assertTrue(bucket.tryConsume());
        assertTrue(bucket.tryConsume());
        assertFalse(bucket.tryConsume());

        Thread.sleep(150);

        assertTrue(bucket.tryConsume(), "a token should have refilled after ~150ms");
    }

    @Test
    void neverExceedsCapacity() throws InterruptedException {
        TokenBucket bucket = new TokenBucket(1, Duration.ofMillis(50));
        Thread.sleep(200);
        assertTrue(bucket.tryConsume());
        assertFalse(bucket.tryConsume(), "refill must cap at capacity");
    }

    @Test
    void rejectsNonPositiveCapacity() {
        assertThrows(IllegalArgumentException.class, () -> new TokenBucket(0, Duration.ofMinutes(1)));
    }
}
