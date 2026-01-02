package dev.tylerpac.momentum.api.dto;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {}
