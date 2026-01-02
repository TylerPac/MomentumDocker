package dev.tylerpac.momentum.api.dto;

public record SettingsPasswordUpdateRequest(String currentPassword, String newPassword) {}
