package dev.tylerpac.momentum.api.dto;

public record UserDto(
	int userId,
	String username,
	String email,
	String firstName,
	String lastName,
	String avatarUrl
) {}
