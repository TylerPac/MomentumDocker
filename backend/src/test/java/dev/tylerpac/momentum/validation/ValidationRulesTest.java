package dev.tylerpac.momentum.validation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class ValidationRulesTest {

    @Test
    void passwordError_enforcesRequiredLengthAndComplexity() {
        // Empty password should be rejected as required input.
        assertEquals("Required", ValidationRules.passwordError(""));

        // Passwords shorter than 8 chars should fail length validation.
        assertEquals("Must be at least 8 characters", ValidationRules.passwordError("Abc123"));

        // Password must contain both an uppercase letter and a number.
        assertEquals("Must include 1 uppercase letter and 1 number", ValidationRules.passwordError("lowercaseonly"));

        // Having uppercase but no number should still fail complexity validation.
        assertEquals("Must include 1 uppercase letter and 1 number", ValidationRules.passwordError("NoDigitsHere"));

        // A strong password that meets all rules should return no error.
        assertNull(ValidationRules.passwordError("StrongPass1"));
    }
}
