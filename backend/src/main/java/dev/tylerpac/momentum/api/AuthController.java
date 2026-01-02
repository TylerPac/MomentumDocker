package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.AuthLoginRequest;
import dev.tylerpac.momentum.api.dto.AuthRegisterRequest;
import dev.tylerpac.momentum.api.dto.AuthTokenResponse;
import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsersRepository usersRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UsersRepository usersRepository,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.usersRepository = usersRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
            return new AuthTokenResponse(token, "Bearer", jwtService.getExpirationSeconds());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    @PostMapping("/register")
    public AuthTokenResponse register(@RequestBody AuthRegisterRequest req) {
        String username = req.username() != null ? req.username().trim() : "";
        String password = req.password() != null ? req.password() : "";

        if (username.isBlank() || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username and password are required");
        }

        if (usersRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }

        Users user = new Users();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        Users saved = usersRepository.save(user);

        String token = jwtService.generateToken(saved.getUsername(), java.util.List.of(() -> "ROLE_USER"));
        return new AuthTokenResponse(token, "Bearer", jwtService.getExpirationSeconds());
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

        return new UserDto(user.getUserId(), user.getUsername());
    }
}
