package com.tradexa.gpt.service;

import com.tradexa.gpt.config.EmailProperties;
import com.tradexa.gpt.dto.LoginRequest;
import com.tradexa.gpt.dto.RegisterRequest;
import com.tradexa.gpt.dto.RegisterResponse;
import com.tradexa.gpt.dto.LoginResponse;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.entity.UserRole;
import com.tradexa.gpt.exception.EmailNotVerifiedException;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.repository.UserRepository;
import com.tradexa.gpt.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private AuthTokenService authTokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailProperties emailProperties;

    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, passwordEncoder, jwtService,
                refreshTokenService, authTokenService, emailService, emailProperties,
                "https://frontend.test");
    }

    @Test
    void registerSuccess() {

        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Rohit");
        savedUser.setEmail("rohit@gmail.com");
        savedUser.setPassword("encodedPassword");
        savedUser.setRole(UserRole.USER);

        when(emailProperties.isConfigured()).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail()))
                .thenReturn(false);

        when(passwordEncoder.encode(request.getPassword()))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        // Act
        RegisterResponse response = userService.register(request);

        // Assert
        assertNotNull(response);

        assertEquals(1, response.getId());
        assertEquals("Rohit", response.getName());
        assertEquals("rohit@gmail.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertFalse(response.isEmailVerificationRequired());

        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
        // Email unconfigured → auto-verified, no verification email sent.
        verify(authTokenService, never()).createEmailVerificationToken(any());
    }

    @Test
    void registerDuplicateEmailDoesNotReveal() {
        // No user enumeration: duplicate registration returns a generic
        // success response instead of throwing.
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        when(emailProperties.isConfigured()).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        RegisterResponse response = userService.register(request);

        assertNotNull(response);
        assertNull(response.getId()); // no account was created
        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void registerWithEmailConfiguredRequiresVerification() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Rohit");
        savedUser.setEmail("rohit@gmail.com");
        savedUser.setPassword("encodedPassword");
        savedUser.setRole(UserRole.USER);

        when(emailProperties.isConfigured()).thenReturn(true);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(authTokenService.createEmailVerificationToken(any())).thenReturn("raw-token");

        RegisterResponse response = userService.register(request);

        assertTrue(response.isEmailVerificationRequired());
        verify(authTokenService).createEmailVerificationToken(any(User.class));
        verify(emailService).sendVerificationEmail(eq("rohit@gmail.com"), contains("/verify-email?token=raw-token"));
    }

    @Test
    void loginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        User user = new User();
        user.setId(1L);
        user.setName("Rohit");
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);
        user.setEmailVerified(true);

        when(emailProperties.isConfigured()).thenReturn(false);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        when(passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .thenReturn(true);

        when(jwtService.generateAccessToken(user.getEmail()))
                .thenReturn("sample-access-token");
        when(refreshTokenService.issue(user)).thenReturn("raw-refresh-token");

        UserService.LoginResult result = userService.login(request);
        LoginResponse response = result.response();

        assertNotNull(response);

        assertEquals("sample-access-token", response.getToken());
        assertEquals("Rohit", response.getName());
        assertEquals("rohit@gmail.com", response.getEmail());
        assertEquals("USER", response.getRole());
        assertEquals("raw-refresh-token", result.refreshToken());

        verify(userRepository).findByEmail(request.getEmail());
        verify(passwordEncoder)
                .matches(request.getPassword(), user.getPassword());
        verify(jwtService).generateAccessToken(user.getEmail());
        verify(refreshTokenService).issue(user);
    }

    @Test
    void loginWrongPassword() {

        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("wrongPassword1");

        User user = new User();
        user.setId(1L);
        user.setName("Rohit");
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);
        user.setEmailVerified(true);

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()))
                .thenReturn(false);

        // Act + Assert — generic message, no enumeration
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> userService.login(request)
        );

        assertEquals(
                "Invalid email or password.",
                exception.getMessage()
        );

        verify(userRepository).findByEmail(request.getEmail());

        verify(passwordEncoder)
                .matches(request.getPassword(), user.getPassword());

        verify(jwtService, never()).generateAccessToken(anyString());
        verify(refreshTokenService, never()).issue(any());
    }

    @Test
    void loginUserNotFound() {

        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@gmail.com");
        request.setPassword("password123");

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        // Act + Assert — identical error to wrong-password (no enumeration)
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> userService.login(request)
        );

        assertEquals(
                "Invalid email or password.",
                exception.getMessage()
        );

        verify(userRepository).findByEmail(request.getEmail());

        verify(passwordEncoder, never())
                .matches(anyString(), anyString());

        verify(jwtService, never())
                .generateAccessToken(anyString());
    }

    @Test
    void loginUnverifiedEmailBlockedWhenEmailConfigured() {
        LoginRequest request = new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        User user = new User();
        user.setId(1L);
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);
        user.setEmailVerified(false);

        when(emailProperties.isConfigured()).thenReturn(true);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);

        assertThrows(EmailNotVerifiedException.class, () -> userService.login(request));

        verify(jwtService, never()).generateAccessToken(anyString());
        verify(refreshTokenService, never()).issue(any());
    }

    @Test
    void loginUnverifiedEmailAllowedWhenEmailUnconfigured() {
        // Email provider not connected → everyone is auto-verified.
        LoginRequest request = new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("password123");

        User user = new User();
        user.setId(1L);
        user.setName("Rohit");
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);
        user.setEmailVerified(true);

        when(emailProperties.isConfigured()).thenReturn(false);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(user.getEmail())).thenReturn("token");
        when(refreshTokenService.issue(user)).thenReturn("refresh");

        UserService.LoginResult result = userService.login(request);
        assertNotNull(result.response());
    }
}
