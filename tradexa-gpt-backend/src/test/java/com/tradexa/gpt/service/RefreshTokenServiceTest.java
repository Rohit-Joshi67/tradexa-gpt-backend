package com.tradexa.gpt.service;

import com.tradexa.gpt.entity.RefreshToken;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.repository.RefreshTokenRepository;
import com.tradexa.gpt.util.TokenHash;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RefreshTokenServiceTest {

    private RefreshTokenRepository repository;
    private RefreshTokenService service;
    private User user;

    @BeforeEach
    void setUp() {
        repository = mock(RefreshTokenRepository.class);
        service = new RefreshTokenService(repository, 604_800_000L);
        user = new User();
        user.setId(7L);
        user.setEmail("rohit@gmail.com");
    }

    @Test
    void issueStoresOnlyTheHash() {
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String raw = service.issue(user);

        assertNotNull(raw);
        verify(repository).save(captor.capture());
        RefreshToken saved = captor.getValue();
        assertEquals(TokenHash.sha256Hex(raw), saved.getTokenHash());
        assertNotEquals(raw, saved.getTokenHash(), "raw token must never be persisted");
        assertFalse(saved.isRevoked());
        assertTrue(saved.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    void rotateInvalidatesOldTokenAndIssuesNew() {
        String raw = "old-raw-token";
        RefreshToken stored = liveToken(raw);

        when(repository.findByTokenHash(TokenHash.sha256Hex(raw)))
                .thenReturn(Optional.of(stored));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RefreshTokenService.Rotation rotation = service.rotate(raw);

        assertTrue(stored.isRevoked(), "presented token must be revoked on rotation");
        assertEquals(user.getId(), rotation.user().getId());
        assertNotNull(rotation.newRawToken());
        assertNotEquals(raw, rotation.newRawToken());
    }

    @Test
    void rotateUnknownTokenFails() {
        when(repository.findByTokenHash(any())).thenReturn(Optional.empty());
        assertThrows(InvalidCredentialsException.class, () -> service.rotate("nope"));
    }

    @Test
    void rotateExpiredTokenDeletesAndFails() {
        String raw = "expired-raw";
        RefreshToken stored = liveToken(raw);
        stored.setExpiresAt(Instant.now().minusSeconds(60));

        when(repository.findByTokenHash(TokenHash.sha256Hex(raw)))
                .thenReturn(Optional.of(stored));

        assertThrows(InvalidCredentialsException.class, () -> service.rotate(raw));
        verify(repository).delete(stored);
    }

    @Test
    void revokedTokenTriggersTheftResponse() {
        // Presenting an already-rotated (revoked) token wipes all user tokens.
        String raw = "stolen-raw";
        RefreshToken stored = liveToken(raw);
        stored.setRevoked(true);

        when(repository.findByTokenHash(TokenHash.sha256Hex(raw)))
                .thenReturn(Optional.of(stored));

        assertThrows(InvalidCredentialsException.class, () -> service.rotate(raw));
        verify(repository).revokeAllForUser(user.getId());
    }

    private RefreshToken liveToken(String raw) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setTokenHash(TokenHash.sha256Hex(raw));
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        return token;
    }
}
