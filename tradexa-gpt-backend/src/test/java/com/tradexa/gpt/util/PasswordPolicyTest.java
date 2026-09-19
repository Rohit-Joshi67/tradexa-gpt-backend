package com.tradexa.gpt.util;

import com.tradexa.gpt.dto.RegisterRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class PasswordPolicyTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsValidPasswords() {
        assertTrue(PasswordPolicy.isValid("password123"));
        assertTrue(PasswordPolicy.isValid("a1b2c3d4e5"));
        assertTrue(PasswordPolicy.isValid("CorrectHorse9!"));
    }

    @Test
    void rejectsWeakPasswords() {
        assertFalse(PasswordPolicy.isValid(null));
        assertFalse(PasswordPolicy.isValid("short1"));          // too short
        assertFalse(PasswordPolicy.isValid("longbutnodigits")); // no digit
        assertFalse(PasswordPolicy.isValid("1234567890"));      // no letter
        assertFalse(PasswordPolicy.isValid("pass123"));         // 7 chars
    }

    @Test
    void registerDtoRejectsWeakPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("weak");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("password")),
                "expected a password violation, got: " + violations);
    }

    @Test
    void registerDtoAcceptsStrongPassword() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("rohit@gmail.com");
        request.setPassword("strongpass1");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty(), "expected no violations, got: " + violations);
    }

    @Test
    void registerDtoRejectsBadEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Rohit");
        request.setEmail("not-an-email");
        request.setPassword("strongpass1");

        Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);

        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }
}
