package dev.tylerpac.momentum.api.dto;

public record SettingsProfileUpdateRequest(
        String email,
        String firstName,
        String lastName
) {}
