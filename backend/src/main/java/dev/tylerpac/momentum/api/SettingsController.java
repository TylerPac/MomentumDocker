package dev.tylerpac.momentum.api;

import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import dev.tylerpac.momentum.api.dto.SettingsActionResponse;
import dev.tylerpac.momentum.api.dto.SettingsPasswordUpdateRequest;
import dev.tylerpac.momentum.api.dto.SettingsProfileUpdateRequest;
import dev.tylerpac.momentum.api.dto.SettingsUpdateRequest;
import dev.tylerpac.momentum.api.dto.SettingsUsernameUpdateRequest;
import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import dev.tylerpac.momentum.security.JwtService;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[A-Za-z0-9_]{3,20}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDtoMapper userDtoMapper;
    private final AvatarController avatarController;
    private final JwtService jwtService;

    public SettingsController(
            UsersRepository usersRepository,
            PasswordEncoder passwordEncoder,
            UserDtoMapper userDtoMapper,
            AvatarController avatarController,
            JwtService jwtService
    ) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDtoMapper = userDtoMapper;
        this.avatarController = avatarController;
        this.jwtService = jwtService;
    }

    @GetMapping("/me")
    public UserDto me(Authentication authentication) {
        Users user = requireUser(authentication);
        return userDtoMapper.toDto(user);
    }

    @PutMapping
    public UserDto update(@RequestBody SettingsUpdateRequest req, Authentication authentication) {
        Users user = requireUser(authentication);

        String currentPassword = req.currentPassword() != null ? req.currentPassword() : "";
        if (currentPassword.isBlank() || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        String newUsername = req.newUsername() != null ? req.newUsername().trim() : "";
        if (!newUsername.isBlank() && !newUsername.equals(user.getUsername())) {
            if (usersRepository.existsByUsername(newUsername)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
            }
            user.setUsername(newUsername);
        }

        String newPassword = req.newPassword() != null ? req.newPassword() : "";
        if (!newPassword.isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }

        Users saved = usersRepository.save(user);
        return userDtoMapper.toDto(saved);
    }

    @PostMapping(value = "/profile/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SettingsActionResponse uploadAvatar(@RequestParam("file") MultipartFile file, Authentication authentication) {
        UserDto updated = avatarController.upload(file, authentication);
        return new SettingsActionResponse(true, "Avatar updated", null, updated, null);
    }

    @PostMapping("/profile/avatar/remove")
    public SettingsActionResponse removeAvatar(Authentication authentication) {
        UserDto updated = avatarController.remove(authentication);
        return new SettingsActionResponse(true, "Avatar removed", null, updated, null);
    }

    @PostMapping("/profile")
    public SettingsActionResponse updateProfile(@RequestBody SettingsProfileUpdateRequest req, Authentication authentication) {
        Users user = requireUser(authentication);

        String email = req != null && req.email() != null ? req.email().trim() : "";
        String firstName = req != null && req.firstName() != null ? req.firstName().trim() : "";
        String lastName = req != null && req.lastName() != null ? req.lastName().trim() : "";

        // Allow clearing fields; validate only if provided.
        if (!email.isBlank() && !EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException(HttpStatus.BAD_REQUEST, "Please enter a valid email", Map.of("email", "Invalid email"));
        }

        String currentEmail = user.getEmail() != null ? user.getEmail() : "";
        if (!email.isBlank() && !email.equalsIgnoreCase(currentEmail) && usersRepository.existsByEmail(email)) {
            throw new ValidationException(HttpStatus.CONFLICT, "Email already in use", Map.of("email", "Email already in use"));
        }

        user.setEmail(email.isBlank() ? null : email);
        user.setFirstName(firstName.isBlank() ? null : firstName);
        user.setLastName(lastName.isBlank() ? null : lastName);

        try {
            Users saved = usersRepository.save(user);
            return new SettingsActionResponse(true, "Profile updated", null, userDtoMapper.toDto(saved), null);
        } catch (DataIntegrityViolationException ex) {
            throw new ValidationException(HttpStatus.CONFLICT, "Email already in use", Map.of("email", "Email already in use"));
        }
    }

    @GetMapping("/account/username/check")
    public Map<String, Boolean> checkUsernameAvailability(@RequestParam("username") String username, Authentication authentication) {
        Users user = requireUser(authentication);

        String candidate = username != null ? username.trim() : "";
        if (candidate.isBlank()) {
            return Map.of("available", false);
        }
        if (candidate.equals(user.getUsername())) {
            // Treat as available so the UI can show a green check, even though submitting would be a no-op.
            return Map.of("available", true);
        }
        if (!USERNAME_PATTERN.matcher(candidate).matches()) {
            return Map.of("available", false);
        }

        return Map.of("available", !usersRepository.existsByUsername(candidate));
    }

    @PostMapping("/account/username")
    public SettingsActionResponse updateUsername(@RequestBody SettingsUsernameUpdateRequest req, Authentication authentication) {
        Users user = requireUser(authentication);

        String newUsername = req != null && req.newUsername() != null ? req.newUsername().trim() : "";
        if (newUsername.isBlank()) {
            throw new ValidationException(HttpStatus.BAD_REQUEST, "Please enter a username", Map.of("newUsername", "Required"));
        }
        if (!USERNAME_PATTERN.matcher(newUsername).matches()) {
            throw new ValidationException(
                    HttpStatus.BAD_REQUEST,
                    "Username must be 3–20 characters and contain only letters, numbers, or underscore",
                    Map.of("newUsername", "3–20 characters, letters/numbers/underscore")
            );
        }
        if (newUsername.equals(user.getUsername())) {
            return new SettingsActionResponse(true, "Username unchanged", null, userDtoMapper.toDto(user), null);
        }
        if (usersRepository.existsByUsername(newUsername)) {
            throw new ValidationException(HttpStatus.CONFLICT, "Username already taken", Map.of("newUsername", "Username already taken"));
        }

        user.setUsername(newUsername);
        try {
            Users saved = usersRepository.save(user);

            // IMPORTANT: JWT subject is the username. If the username changes, we must
            // issue a new token so the client stays authenticated.
            String accessToken = jwtService.generateToken(
                    saved.getUsername(),
                    java.util.List.<GrantedAuthority>of(() -> "ROLE_USER")
            );

            return new SettingsActionResponse(true, "Username updated", null, userDtoMapper.toDto(saved), accessToken);
        } catch (DataIntegrityViolationException ex) {
            // In case the DB collation/constraints treat usernames differently than the existsByUsername check.
            throw new ValidationException(HttpStatus.CONFLICT, "Username already taken", Map.of("newUsername", "Username already taken"));
        }
    }

    @PostMapping("/security/password")
    public SettingsActionResponse updatePassword(@RequestBody SettingsPasswordUpdateRequest req, Authentication authentication) {
        Users user = requireUser(authentication);

        String currentPassword = req != null && req.currentPassword() != null ? req.currentPassword() : "";
        if (currentPassword.isBlank() || !passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ValidationException(HttpStatus.UNAUTHORIZED, "Current password is incorrect", Map.of("currentPassword", "Incorrect password"));
        }

        String newPassword = req != null && req.newPassword() != null ? req.newPassword() : "";
        Map<String, String> passwordErrors = validateNewPassword(newPassword);
        if (!passwordErrors.isEmpty()) {
            throw new ValidationException(HttpStatus.BAD_REQUEST, "Password does not meet requirements", passwordErrors);
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        Users saved = usersRepository.save(user);
        return new SettingsActionResponse(true, "Password updated", null, userDtoMapper.toDto(saved), null);
    }

    private Map<String, String> validateNewPassword(String newPassword) {
        if (newPassword == null || newPassword.isBlank()) {
            return Map.of("newPassword", "Required");
        }
        if (newPassword.length() < 8) {
            return Map.of("newPassword", "Must be at least 8 characters");
        }
        boolean hasUpper = newPassword.chars().anyMatch(Character::isUpperCase);
        boolean hasDigit = newPassword.chars().anyMatch(Character::isDigit);
        if (!hasUpper || !hasDigit) {
            return Map.of("newPassword", "Must include 1 uppercase letter and 1 number");
        }
        return Map.of();
    }

    private Users requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        return usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    }
}
