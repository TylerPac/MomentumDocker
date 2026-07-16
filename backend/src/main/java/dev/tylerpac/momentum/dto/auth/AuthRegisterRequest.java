package dev.tylerpac.momentum.dto.auth;

public record AuthRegisterRequest(
	String username,
	String password
) {}
