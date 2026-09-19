package com.tradexa.gpt.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * Short-lived access token lifetime (default 15 minutes).
     * The legacy {@code jwt.expiration} property is retired.
     */
    @Value("${jwt.access-expiration:900000}")
    private long accessExpiration;

    /** Refresh-token lifetime (opaque DB tokens are used; kept for property compatibility). */
    @Value("${jwt.refresh-expiration:604800000}")
    @SuppressWarnings("unused")
    private long refreshExpiration;

    public static final String TOKEN_TYPE_CLAIM = "type";
    public static final String TOKEN_TYPE_ACCESS = "access";

    /**
     * Short-lived access token for API calls (Authorization: Bearer).
     * Carries a {@code type=access} claim — the auth filter rejects any
     * other token type presented as a Bearer token.
     */
    public String generateAccessToken(String email) {
        return Jwts.builder()
                .subject(email)
                .claim(TOKEN_TYPE_CLAIM, TOKEN_TYPE_ACCESS)
                .id(UUID.randomUUID().toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    /** True only for a live, correctly-typed access token belonging to this email. */
    public boolean isAccessTokenValid(String token, String email) {
        try {
            return TOKEN_TYPE_ACCESS.equals(extractTokenType(token))
                    && extractUsername(token).equals(email)
                    && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    // Extract Email from Token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get(TOKEN_TYPE_CLAIM, String.class));
    }

    // Extract Expiration
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic Claim Extractor
    public <T> T extractClaim(String token,
                              Function<Claims, T> resolver) {

        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Parse JWT
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Secret Key
    private SecretKey getSigningKey() {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secretKey.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
