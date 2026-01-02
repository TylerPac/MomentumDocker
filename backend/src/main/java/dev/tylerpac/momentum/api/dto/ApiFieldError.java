package dev.tylerpac.momentum.api.dto;

import java.util.Map;

public record ApiFieldError(String error, Map<String, String> fieldErrors) {}
