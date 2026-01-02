package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.SettingsUpdateRequest;
import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDtoMapper userDtoMapper;

    public SettingsController(UsersRepository usersRepository, PasswordEncoder passwordEncoder, UserDtoMapper userDtoMapper) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDtoMapper = userDtoMapper;
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

    private Users requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }
        return usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    }
}
