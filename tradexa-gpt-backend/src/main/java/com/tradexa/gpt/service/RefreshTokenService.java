package com.tradexa.gpt.service;

import com.tradexa.gpt.entity.RefreshToken;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.repository.RefreshTokenRepository;
import com.tradexa.gpt.util.TokenHash;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Opaque refresh-token lifecycle for the httpOnly cookie session.
 *
 * <ul>
 *   <li>Issue: stores the SHA-256 hash; the raw token goes to the client once.</li>
 *   <li>Rotate: presenting a live token revokes it and issues a fresh one.</li>
 *   <li>Theft detection: presenting a revoked token wipes all of the user's
 *       tokens, forcing a fresh login everywhere.</li>
 * </ul>
 */
@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);

    private final RefreshTokenRepository repository;
    private final long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository repository,
                               @Value("${jwt.refresh-expiration:604800000}") long refreshExpirationMs) {
        this.repository = repository;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    /** Issues a new refresh token for the user; returns the RAW token (store only its hash). */
    @Transactional
    public String issue(User user) {
        String raw = TokenHash.generateRawToken();
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(TokenHash.sha256Hex(raw));
        token.setExpiresAt(Instant.now().plusMillis(refreshExpirationMs));
        repository.save(token);
        return raw;
    }

    /**
     * Validates the presented token and rotates it.
     *
     * @return the user the token belongs to, plus the new raw refresh token
     * @throws InvalidCredentialsException when the token is unknown, expired,
     *         or revoked (revoked = possible theft: all user tokens are wiped)
     */
    @Transactional
    public Rotation rotate(String rawToken) {
        String hash = TokenHash.sha256Hex(rawToken);
        RefreshToken token = repository.findByTokenHash(hash)
                .orElseThrow(InvalidCredentialsException::new);

        if (token.isRevoked()) {
            log.warn("Revoked refresh token presented for user {} — possible theft, wiping all tokens",
                    token.getUser().getId());
            repository.revokeAllForUser(token.getUser().getId());
            throw new InvalidCredentialsException();
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            repository.delete(token);
            throw new InvalidCredentialsException();
        }

        token.setRevoked(true);
        repository.save(token);

        String nextRaw = issue(token.getUser());
        return new Rotation(token.getUser(), nextRaw);
    }

    /** Revokes a single token (logout). Unknown tokens are ignored. */
    @Transactional
    public void revoke(String rawToken) {
        repository.findByTokenHash(TokenHash.sha256Hex(rawToken)).ifPresent(token -> {
            token.setRevoked(true);
            repository.save(token);
        });
    }

    /** Revokes every refresh token for the user (password change, reset, admin action). */
    @Transactional
    public void revokeAllForUser(Long userId) {
        repository.revokeAllForUser(userId);
    }

    /** Nightly cleanup of expired rows. */
    @Scheduled(fixedDelay = 86_400_000, initialDelay = 3_600_000)
    @Transactional
    public void purgeExpired() {
        repository.deleteByExpiresAtBefore(Instant.now());
    }

    public record Rotation(User user, String newRawToken) {
    }
}
