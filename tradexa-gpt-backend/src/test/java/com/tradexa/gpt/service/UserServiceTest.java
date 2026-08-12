package com.tradexa.gpt.service;

import com.tradexa.gpt.dto.LoginRequest;
import com.tradexa.gpt.exception.InvalidCredentialsException;
import com.tradexa.gpt.exception.UserAlreadyExistsException;
import com.tradexa.gpt.repository.UserRepository;
import com.tradexa.gpt.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.tradexa.gpt.dto.RegisterRequest;
import com.tradexa.gpt.dto.RegisterResponse;
import com.tradexa.gpt.entity.User;
import com.tradexa.gpt.entity.UserRole;
import com.tradexa.gpt.dto.LoginResponse;

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

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerSuccess() {

        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("123456");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Rohit");
        savedUser.setEmail("rohit@gmail.com");
        savedUser.setPassword("encodedPassword");
        savedUser.setRole(UserRole.USER);

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

        verify(userRepository).existsByEmail(request.getEmail());
        verify(passwordEncoder).encode(request.getPassword());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("123456");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(
                UserAlreadyExistsException.class,
                () -> userService.register(request)
        );

        verify(userRepository).existsByEmail(request.getEmail());
        verify(userRepository,never()).save(any(User.class));
    }

    @Test
    void loginSuccess() {
        LoginRequest request =new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("123456");

        User user = new User();
        user.setId(1L);
        user.setName("Rohit");
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));

        when(passwordEncoder.matches(request.getPassword(),user.getPassword()))
                .thenReturn(true);

        when(jwtService.generateToken(user.getEmail()))
                .thenReturn("sample-jwt-token");

        LoginResponse response = userService.login(request);

        assertNotNull(response);

        assertEquals("sample-jwt-token", response.getToken());
        assertEquals("Rohit", response.getName());
        assertEquals("rohit@gmail.com", response.getEmail());
        assertEquals("USER", response.getRole());

        verify(userRepository).findByEmail(request.getEmail());
        verify(passwordEncoder)
                .matches(request.getPassword(), user.getPassword());
        verify(jwtService).generateToken(user.getEmail());
    }

    @Test
    void loginWrongPassword() {

        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("rohit@gmail.com");
        request.setPassword("wrongPassword");

        User user = new User();
        user.setId(1L);
        user.setName("Rohit");
        user.setEmail("rohit@gmail.com");
        user.setPassword("encodedPassword");
        user.setRole(UserRole.USER);

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()))
                .thenReturn(false);

        // Act + Assert
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

        verify(jwtService, never()).generateToken(anyString());
    }
    @Test
    void loginUserNotFound() {

        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@gmail.com");
        request.setPassword("123456");

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        // Act + Assert
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
                .generateToken(anyString());
    }
}