package dev.tylerpac.momentum.dto.auth;

import dev.tylerpac.momentum.dto.common.UserDto;

public record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserDto user
) {}
