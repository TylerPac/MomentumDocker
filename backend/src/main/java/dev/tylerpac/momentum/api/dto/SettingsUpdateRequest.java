package dev.tylerpac.momentum.api.dto;

public record SettingsUpdateRequest(
        String newUsername,
        String currentPassword,
        String newPassword
) {}
