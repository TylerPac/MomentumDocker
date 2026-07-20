package dev.tylerpac.momentum.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

class JwtServiceTest {

    @Test
    void generateToken_andParseAndValidate_returnsOriginalUsername() {
        // Use a 32+ character secret to satisfy HS256 key length requirements.
        String secret = "test-secret-key-at-least-32-characters-long";
        long expirationSeconds = 1200L;
        JwtService jwtService = new JwtService(secret, expirationSeconds);

        // Generate a signed token for a known username.
        String token = jwtService.generateToken("alice");
        assertNotNull(token);

        // Parse and validate the token signature/claims, then verify subject matches.
        Claims claims = jwtService.parseAndValidate(token);
        assertEquals("alice", claims.getSubject());
    }

    @Test
    void parseAndValidate_withTamperedToken_throwsJwtException() {
        // Same valid setup as production logic.
        String secret = "test-secret-key-at-least-32-characters-long";
        JwtService jwtService = new JwtService(secret, 1200L);

        // Start with a valid token, then tamper with one character so signature validation fails.
        String token = jwtService.generateToken("alice");
        String tamperedToken = token.substring(0, token.length() - 1)
                + (token.endsWith("a") ? "b" : "a");

        // A bad token should not parse into claims; JJWT throws a JwtException.
        assertThrows(JwtException.class, () -> jwtService.parseAndValidate(tamperedToken));
    }
}
