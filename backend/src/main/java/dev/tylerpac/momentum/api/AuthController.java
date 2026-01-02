package dev.tylerpac.momentum.api;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

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

import dev.tylerpac.momentum.api.dto.AuthLoginRequest;
import dev.tylerpac.momentum.api.dto.AuthRegisterRequest;
import dev.tylerpac.momentum.api.dto.AuthTokenResponse;
import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

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

            String token = jwtService.generateToken(auth.getName(), auth.getAuthorities());
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
        String email = req != null && req.email() != null ? req.email().trim() : "";
        String firstName = req != null && req.firstName() != null ? req.firstName().trim() : "";
        String lastName = req != null && req.lastName() != null ? req.lastName().trim() : "";

        Map<String, String> fieldErrors = new HashMap<>();
        if (username.isBlank()) fieldErrors.put("username", "Required");
        if (password.isBlank()) fieldErrors.put("password", "Required");
        if (email.isBlank()) fieldErrors.put("email", "Required");
        if (firstName.isBlank()) fieldErrors.put("firstName", "Required");
        if (lastName.isBlank()) fieldErrors.put("lastName", "Required");

        if (!email.isBlank() && !EMAIL_PATTERN.matcher(email).matches()) {
            fieldErrors.put("email", "Enter a valid email address");
        }

        // Keep password rules aligned with Settings.
        if (!password.isBlank()) {
            boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
            boolean hasDigit = password.chars().anyMatch(Character::isDigit);
            if (password.length() < 8 || !hasUpper || !hasDigit) {
                fieldErrors.put("password", "8+ chars, 1 uppercase, 1 number");
            }
        }

        if (!fieldErrors.isEmpty()) {
            throw new ValidationException(HttpStatus.BAD_REQUEST, "Please fix the highlighted fields", Map.copyOf(fieldErrors));
        }

        if (usersRepository.existsByUsername(username)) {
            throw new ValidationException(HttpStatus.CONFLICT, "Username already exists", Map.of("username", "Username already taken"));
        }
        if (usersRepository.existsByEmail(email)) {
            throw new ValidationException(HttpStatus.CONFLICT, "Email already exists", Map.of("email", "Email already in use"));
        }

        Users user = new Users();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        Users saved = usersRepository.save(user);

        String token = jwtService.generateToken(saved.getUsername(), java.util.List.<org.springframework.security.core.GrantedAuthority>of(() -> "ROLE_USER"));
        return new AuthTokenResponse(
            token,
            "Bearer",
            jwtService.getExpirationSeconds(),
            userDtoMapper.toDto(saved)
        );
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
