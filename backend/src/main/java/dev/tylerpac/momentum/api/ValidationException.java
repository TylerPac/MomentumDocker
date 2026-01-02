package dev.tylerpac.momentum.api;

import java.util.Collections;
import java.util.Map;

import org.springframework.http.HttpStatus;

public class ValidationException extends RuntimeException {
    private final HttpStatus status;
    private final Map<String, String> fieldErrors;

    public ValidationException(HttpStatus status, String message, Map<String, String> fieldErrors) {
        super(message);
        this.status = status != null ? status : HttpStatus.BAD_REQUEST;
        this.fieldErrors = fieldErrors != null ? fieldErrors : Collections.emptyMap();
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Map<String, String> getFieldErrors() {
        return fieldErrors;
    }
}
