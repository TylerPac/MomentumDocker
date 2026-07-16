package dev.tylerpac.momentum.validation;

import java.util.regex.Pattern;

public final class ValidationRules {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9_]{3,20}$");

    private ValidationRules() {}

    public static boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }

    public static String passwordError(String password) {
        if (password == null || password.isBlank()) {
            return "Required";
        }
        if (password.length() < 8) {
            return "Must be at least 8 characters";
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        if (!hasUpper || !hasDigit) {
            return "Must include 1 uppercase letter and 1 number";
        }
        return null;
    }
}