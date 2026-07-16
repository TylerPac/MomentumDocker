package dev.tylerpac.momentum.dto.common;

import java.util.Map;

public record ApiFieldError(String error, Map<String, String> fieldErrors) {}
