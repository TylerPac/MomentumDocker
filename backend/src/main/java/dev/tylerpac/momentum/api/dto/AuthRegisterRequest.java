package dev.tylerpac.momentum.api.dto;

public record AuthRegisterRequest(
	String username,
	String password,
	String email,
	String firstName,
	String lastName
) {}
