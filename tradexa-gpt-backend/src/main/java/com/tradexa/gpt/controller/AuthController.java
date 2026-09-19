package com.tradexa.gpt.controller;

import com.tradexa.gpt.common.ApiResponse;
import com.tradexa.gpt.config.AuthProperties;
import com.tradexa.gpt.dto.ForgotPasswordRequest;
import com.tradexa.gpt.dto.LoginRequest;
import com.tradexa.gpt.dto.LoginResponse;
import com.tradexa.gpt.dto.RefreshResponse;
import com.tradexa.gpt.dto.RegisterRequest;
import com.tradexa.gpt.dto.RegisterResponse;
import com.tradexa.gpt.dto.ResetPasswordRequest;
import com.tradexa.gpt.dto.VerifyEmailRequest;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.security.JwtService;
import com.tradexa.gpt.service.RefreshTokenService;
import com.tradexa.gpt.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    public static final String REFRESH_COOKIE = "tradexa_refresh";

    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final AuthProperties authProperties;

    public AuthController(UserService userService,
                          RefreshTokenService refreshTokenService,
                          JwtService jwtService,
                          AuthProperties authProperties) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.authProperties = authProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegisterResponse registerResponse = userService.register(request);

        ApiResponse<RegisterResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(registerResponse.isEmailVerificationRequired()
                ? "Account created. Please check your inbox to verify your email before signing in."
                : "User Registered Successfully");
        response.setData(registerResponse);
        response.setTimestamp(LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        UserService.LoginResult result = userService.login(request);

        ApiResponse<LoginResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setData(result.response());
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(result.refreshToken()).toString())
                .body(response);
    }

    /**
     * Silent session refresh: reads the httpOnly cookie, rotates the refresh
     * token (old one is invalidated), and returns a fresh 15-minute access
     * token. Called by the frontend's axios interceptor on 401s.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(HttpServletRequest request) {
        String rawToken = extractRefreshCookie(request);
        if (rawToken == null) {
            throw new InvalidCredentialsException();
        }

        RefreshTokenService.Rotation rotation = refreshTokenService.rotate(rawToken);
        String accessToken = jwtService.generateAccessToken(rotation.user().getEmail());

        ApiResponse<RefreshResponse> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Token refreshed");
        response.setData(new RefreshResponse(accessToken));
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(rotation.newRawToken()).toString())
                .body(response);
    }

    /** Logs out: revokes the refresh token and clears the cookie. */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String rawToken = extractRefreshCookie(request);
        if (rawToken != null) {
            refreshTokenService.revoke(rawToken);
        }

        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Logged out");
        response.setData(null);
        response.setTimestamp(LocalDateTime.now());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .body(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @Valid @RequestBody VerifyEmailRequest request) {
        userService.verifyEmail(request.getToken());

        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Email verified. You can now sign in.");
        response.setData(null);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        userService.requestPasswordReset(request);

        // Generic either way — never reveals whether the email exists.
        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("If an account exists for this email, a reset link has been sent.");
        response.setData(null);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);

        ApiResponse<Void> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Password updated. Please sign in with your new password.");
        response.setData(null);
        response.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    private ResponseCookie refreshCookie(String rawToken) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(REFRESH_COOKIE, rawToken)
                .httpOnly(true)
                .path("/")
                .maxAge(Duration.ofMillis(refreshTokenService.getRefreshExpirationMs()))
                .sameSite(authProperties.getCookieSameSite());
        if (authProperties.isCookieSecure()) {
            builder.secure(true);
        }
        return builder.build();
    }

    private ResponseCookie clearRefreshCookie() {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie
                .from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .sameSite(authProperties.getCookieSameSite());
        if (authProperties.isCookieSecure()) {
            builder.secure(true);
        }
        return builder.build();
    }

    private String extractRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (REFRESH_COOKIE.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
