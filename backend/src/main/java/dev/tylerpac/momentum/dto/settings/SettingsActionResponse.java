package dev.tylerpac.momentum.dto.settings;

import java.util.Map;

import dev.tylerpac.momentum.dto.common.UserDto;

public record SettingsActionResponse(
        boolean success,
        String message,
        Map<String, String> fieldErrors,
        UserDto user,
        String accessToken
) {}
