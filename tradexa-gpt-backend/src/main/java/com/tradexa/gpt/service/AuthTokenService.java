package com.tradexa.gpt.service;

import com.tradexa.gpt.entity.AuthToken;
import com.tradexa.gpt.entity.AuthTokenType;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.InvalidTokenException;
import com.tradexa.gpt.repository.AuthTokenRepository;
import com.tradexa.gpt.util.TokenHash;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

/**
 * Single-use token lifecycle for email verification and password reset.
 * Returns raw tokens (emailed to the user); only hashes are persisted.
 */
@Service
public class AuthTokenService {

    private final AuthTokenRepository repository;

    public AuthTokenService(AuthTokenRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public String createEmailVerificationToken(User user) {
        return create(user, AuthTokenType.EMAIL_VERIFICATION, Duration.ofHours(24));
    }

    @Transactional
    public String createPasswordResetToken(User user) {
        return create(user, AuthTokenType.PASSWORD_RESET, Duration.ofHours(1));
    }

    private String create(User user, AuthTokenType type, Duration ttl) {
        String raw = TokenHash.generateRawToken();
        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setTokenHash(TokenHash.sha256Hex(raw));
        token.setTokenType(type);
        token.setExpiresAt(Instant.now().plus(ttl));
        repository.save(token);
        return raw;
    }

    @Transactional
    public AuthToken consumeEmailVerificationToken(String rawToken) {
        return consume(rawToken, AuthTokenType.EMAIL_VERIFICATION, "Invalid or expired verification link.");
    }

    @Transactional
    public AuthToken consumePasswordResetToken(String rawToken) {
        return consume(rawToken, AuthTokenType.PASSWORD_RESET, "Invalid or expired reset link.");
    }

    private AuthToken consume(String rawToken, AuthTokenType type, String failureMessage) {
        AuthToken token = repository.findByTokenHash(TokenHash.sha256Hex(rawToken))
                .orElseThrow(() -> new InvalidTokenException(failureMessage));

        if (token.getTokenType() != type
                || token.isUsed()
                || token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException(failureMessage);
        }

        token.setUsed(true);
        repository.save(token);
        return token;
    }

    /** Nightly cleanup of expired rows. */
    @Scheduled(fixedDelay = 86_400_000, initialDelay = 3_600_000)
    @Transactional
    public void purgeExpired() {
        repository.deleteByExpiresAtBefore(Instant.now());
    }
}
