package com.tradexa.gpt.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * IP-based rate limiting for abuse-sensitive endpoints, applied before the
 * security filters so brute-force traffic is shed cheaply.
 *
 * <ul>
 *   <li>POST /api/v1/auth/login — 5 attempts / minute / IP</li>
 *   <li>POST /api/v1/auth/register — 3 attempts / hour / IP</li>
 *   <li>POST /api/v1/auth/refresh — 30 / minute / IP</li>
 *   <li>POST /api/v1/auth/forgot-password — 5 / hour / IP</li>
 *   <li>POST /api/v1/billing/webhook — 120 / minute / IP</li>
 *   <li>POST /api/v1/copilot/chat — 30 / minute / IP (per-user daily quota also applies)</li>
 *   <li>POST /api/v1/copilot/edge-validate — 60 / minute / IP</li>
 * </ul>
 * Limited requests get HTTP 429 with the standard API envelope.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private record Rule(int capacity, Duration window) {
    }

    private static final Map<String, Rule> RULES = Map.of(
            "/api/v1/auth/login", new Rule(5, Duration.ofMinutes(1)),
            "/api/v1/auth/register", new Rule(3, Duration.ofHours(1)),
            "/api/v1/auth/refresh", new Rule(30, Duration.ofMinutes(1)),
            "/api/v1/auth/forgot-password", new Rule(5, Duration.ofHours(1)),
            "/api/v1/billing/webhook", new Rule(120, Duration.ofMinutes(1)),
            "/api/v1/copilot/chat", new Rule(30, Duration.ofMinutes(1)),
            "/api/v1/copilot/edge-validate", new Rule(60, Duration.ofMinutes(1))
    );

    private final Cache<String, TokenBucket> buckets = Caffeine.newBuilder()
            .expireAfterAccess(2, TimeUnit.HOURS)
            .maximumSize(100_000)
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Rule rule = "POST".equalsIgnoreCase(request.getMethod())
                ? RULES.get(request.getRequestURI())
                : null;

        if (rule == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = request.getRequestURI() + "|" + clientIp(request);
        TokenBucket bucket = buckets.get(key, k -> new TokenBucket(rule.capacity(), rule.window()));

        if (!bucket.tryConsume()) {
            response.setStatus(429);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\","
                            + "\"data\":null,\"timestamp\":\"" + LocalDateTime.now() + "\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    /** Honors X-Forwarded-For (Render terminates TLS at its proxy). */
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
