package dev.tylerpac.momentum.api.dto;

import java.util.Map;

public record SettingsActionResponse(
        boolean success,
        String message,
        Map<String, String> fieldErrors,
        UserDto user,
        String accessToken
) {}
