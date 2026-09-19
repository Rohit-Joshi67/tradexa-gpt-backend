package com.tradexa.gpt.util;

/**
 * Password policy: minimum 10 characters, at least one letter and one number.
 * The regex constant is shared with the {@code @Pattern} annotation on the
 * request DTOs so the rule lives in exactly one place.
 */
public final class PasswordPolicy {

    public static final String REGEX = "^(?=.*[A-Za-z])(?=.*\\d).{10,}$";

    public static final String MESSAGE =
            "Password must be at least 10 characters long and contain at least one letter and one number.";

    private PasswordPolicy() {
    }

    public static boolean isValid(String password) {
        return password != null && password.matches(REGEX);
    }
}
