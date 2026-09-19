package com.tradexa.gpt.service;

import com.tradexa.gpt.config.EmailProperties;
import com.tradexa.gpt.dto.ForgotPasswordRequest;
import com.tradexa.gpt.dto.LoginRequest;
import com.tradexa.gpt.dto.LoginResponse;
import com.tradexa.gpt.dto.RegisterRequest;
import com.tradexa.gpt.dto.RegisterResponse;
import com.tradexa.gpt.dto.ResetPasswordRequest;
import com.tradexa.gpt.entity.AuthToken;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.entity.UserRole;
import com.tradexa.gpt.exception.EmailNotConfiguredException;
import com.tradexa.gpt.exception.EmailNotVerifiedException;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.repository.UserRepository;
import com.tradexa.gpt.security.JwtService;
import com.tradexa.gpt.util.PasswordPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final EmailProperties emailProperties;
    private final String frontendUrl;

    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenService refreshTokenService,
                       AuthTokenService authTokenService,
                       EmailService emailService,
                       EmailProperties emailProperties,
                       @Value("${app.frontend-url:https://tradexa-gpt-frontend.vercel.app}") String frontendUrl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.authTokenService = authTokenService;
        this.emailService = emailService;
        this.emailProperties = emailProperties;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Registers a new account. NEVER reveals whether an email is already
     * taken: duplicate attempts get the same generic success response
     * (no user enumeration).
     */
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        boolean emailConfigured = emailProperties.isConfigured();

        if (userRepository.existsByEmail(email)) {
            log.info("Duplicate registration attempt for {}", email);
            return genericRegisterResponse(request.getName(), email, emailConfigured);
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);

        // 3-day free journal trial starts at registration.
        user.setTrialEndsAt(Instant.now().plus(3, ChronoUnit.DAYS));

        if (emailConfigured) {
            user.setEmailVerified(false);
        } else {
            // Email provider not connected yet: auto-verify so signup keeps working.
            user.setEmailVerified(true);
            log.warn("Email not configured — auto-verifying new user {}", email);
        }

        User savedUser = userRepository.save(user);

        if (emailConfigured) {
            String token = authTokenService.createEmailVerificationToken(savedUser);
            emailService.sendVerificationEmail(email, frontendUrl + "/verify-email?token=" + token);
        }

        RegisterResponse response = new RegisterResponse();
        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole().name());
        response.setEmailVerificationRequired(emailConfigured);
        return response;
    }

    private RegisterResponse genericRegisterResponse(String name, String email, boolean emailConfigured) {
        RegisterResponse response = new RegisterResponse();
        response.setName(name);
        response.setEmail(email);
        response.setEmailVerificationRequired(emailConfigured);
        return response;
    }

    /**
     * Authenticates and returns the login payload plus a fresh refresh token.
     * Both "unknown email" and "wrong password" produce the identical
     * {@link InvalidCredentialsException} — no user enumeration.
     */
    @Transactional
    public LoginResult login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        if (emailProperties.isConfigured() && !user.isEmailVerified()) {
            throw new EmailNotVerifiedException();
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = refreshTokenService.issue(user);

        LoginResponse response = new LoginResponse();
        response.setId(user.getId());
        response.setToken(accessToken);
        response.setEmail(user.getEmail());
        response.setSubscription(user.getSubscription());
        response.setName(user.getName());
        response.setRole(user.getRole().name());

        return new LoginResult(response, refreshToken);
    }

    /** Marks the user's email verified from a verification link token. */
    @Transactional
    public void verifyEmail(String rawToken) {
        AuthToken token = authTokenService.consumeEmailVerificationToken(rawToken);
        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified for user {}", user.getId());
    }

    /**
     * Starts the password-reset flow. Always silent: unknown emails and
     * unconfigured email both produce the same outward result — no
     * enumeration. Requires the email provider to actually send.
     */
    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        if (!emailProperties.isConfigured()) {
            throw new EmailNotConfiguredException();
        }
        String email = normalizeEmail(request.getEmail());
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = authTokenService.createPasswordResetToken(user);
            emailService.sendPasswordResetEmail(email, frontendUrl + "/reset-password?token=" + token);
            log.info("Password reset requested for user {}", user.getId());
        });
    }

    /** Completes the password reset and revokes all sessions. */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!PasswordPolicy.isValid(request.getNewPassword())) {
            throw new IllegalArgumentException(PasswordPolicy.MESSAGE);
        }
        AuthToken token = authTokenService.consumePasswordResetToken(request.getToken());
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(user.getId());
        log.info("Password reset completed for user {}", user.getId());
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    /** Login payload plus the raw refresh token (for the httpOnly cookie). */
    public record LoginResult(LoginResponse response, String refreshToken) {
    }
}
