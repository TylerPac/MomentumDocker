package dev.tylerpac.momentum.controller;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import dev.tylerpac.momentum.dto.auth.AuthLoginRequest;
import dev.tylerpac.momentum.dto.auth.AuthRegisterRequest;
import dev.tylerpac.momentum.dto.auth.AuthTokenResponse;
import dev.tylerpac.momentum.dto.common.UserDto;
import dev.tylerpac.momentum.exception.ValidationException;
import dev.tylerpac.momentum.mapper.UserDtoMapper;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.security.JwtService;
import dev.tylerpac.momentum.units.UnitSystem;
import dev.tylerpac.momentum.validation.ValidationRules;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String DEFAULT_UNIT_SYSTEM = UnitSystem.METRIC;

    private final UsersRepository usersRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserDtoMapper userDtoMapper;

    public AuthController(
            UsersRepository usersRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            UserDtoMapper userDtoMapper
    ) {
        this.usersRepository = usersRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userDtoMapper = userDtoMapper;
    }

    @PostMapping("/login")
    public AuthTokenResponse login(@RequestBody AuthLoginRequest req) {
        String username = req.username() != null ? req.username().trim() : "";
        String password = req.password() != null ? req.password() : "";

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            String token = jwtService.generateToken(auth.getName());
            Users user = usersRepository.findByUsername(auth.getName())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
            return new AuthTokenResponse(
                    token,
                    "Bearer",
                    jwtService.getExpirationSeconds(),
                    userDtoMapper.toDto(user)
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    @PostMapping("/register")
    public AuthTokenResponse register(@RequestBody AuthRegisterRequest req) {
        String username = req != null && req.username() != null ? req.username().trim() : "";
        String password = req != null && req.password() != null ? req.password() : "";

        Map<String, String> fieldErrors = new HashMap<>();
        if (username.isBlank()) fieldErrors.put("username", "Required");
        if (password.isBlank()) fieldErrors.put("password", "Required");

        if (!username.isBlank() && !ValidationRules.isValidUsername(username)) {
            fieldErrors.put("username", "3-20 characters, letters/numbers/underscore");
        }

        if (!password.isBlank()) {
            String passwordError = ValidationRules.passwordError(password);
            if (passwordError != null) {
                fieldErrors.put("password", passwordError);
            }
        }

        if (!fieldErrors.isEmpty()) {
            throw new ValidationException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields", Map.copyOf(fieldErrors));
        }

        Users saved;
        try {
            if (usersRepository.existsByUsername(username)) {
                throw new ValidationException(HttpStatus.CONFLICT, "Username already exists", Map.of("username", "Username already taken"));
            }

            Users user = new Users();
            user.setUsername(username);
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setUnitSystem(DEFAULT_UNIT_SYSTEM);
            // Guard against DB collation/constraint rules that can still reject duplicates.
            saved = usersRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ValidationException(HttpStatus.CONFLICT, "Username already exists", Map.of("username", "Username already taken"));
        } catch (DataAccessException ex) {
            if (looksLikeDuplicateUsername(ex)) {
                throw new ValidationException(HttpStatus.CONFLICT, "Username already exists", Map.of("username", "Username already taken"));
            }
            throw ex;
        }

        String token = jwtService.generateToken(saved.getUsername());
        return new AuthTokenResponse(
            token,
            "Bearer",
            jwtService.getExpirationSeconds(),
            userDtoMapper.toDto(saved)
        );
    }

    private static boolean looksLikeDuplicateUsername(Throwable ex) {
        Throwable t = ex;
        while (t != null) {
            String msg = t.getMessage();
            if (msg != null) {
                String s = msg.toLowerCase(Locale.ROOT);
                if ((s.contains("duplicate") && s.contains("username")) || s.contains("users.username")) {
                    return true;
                }
            }
            t = t.getCause();
        }
        return false;
    }

    @PostMapping("/logout")
    public void logout() {
        // Stateless JWT: logout is handled client-side by removing the token from sessionStorage.
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }

        Users user = usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));

        return userDtoMapper.toDto(user);
    }
}
