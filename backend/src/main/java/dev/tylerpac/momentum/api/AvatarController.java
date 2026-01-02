package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import dev.tylerpac.momentum.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/avatar")
public class AvatarController {

    private static final long MAX_BYTES = 2L * 1024 * 1024;

    private final UsersRepository usersRepository;
    private final UserDtoMapper userDtoMapper;
    private final String avatarDir;

    public AvatarController(
            UsersRepository usersRepository,
            UserDtoMapper userDtoMapper,
            @Value("${momentum.avatars.dir:./uploads/avatars}") String avatarDir
    ) {
        this.usersRepository = usersRepository;
        this.userDtoMapper = userDtoMapper;
        this.avatarDir = avatarDir;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserDto upload(@RequestParam("file") MultipartFile file, Authentication authentication) {
        Users user = requireUser(authentication);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No file uploaded");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Avatar must be 2MB or less");
        }

        String contentType = Optional.ofNullable(file.getContentType()).orElse("");
        if (!contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Please upload an image");
        }

        String ext = extensionForContentType(contentType);
        if (ext == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supported formats: PNG, JPEG, WEBP");
        }

        String newRelPath = user.getUserId() + "/" + UUID.randomUUID() + "." + ext;
        Path dest = resolveAvatarPath(newRelPath);

        try {
            Files.createDirectories(dest.getParent());
            Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save avatar");
        }

        // Best-effort cleanup of previous avatar file
        deleteIfExists(user.getAvatarPath());

        user.setAvatarPath(newRelPath);
        user.setAvatarUpdatedAt(Instant.now());
        Users saved = usersRepository.save(user);

        return userDtoMapper.toDto(saved);
    }

    @DeleteMapping
    public UserDto remove(Authentication authentication) {
        Users user = requireUser(authentication);

        deleteIfExists(user.getAvatarPath());
        user.setAvatarPath(null);
        user.setAvatarUpdatedAt(Instant.now());
        Users saved = usersRepository.save(user);

        return userDtoMapper.toDto(saved);
    }

    private void deleteIfExists(String relPath) {
        if (relPath == null || relPath.isBlank()) return;
        try {
            Files.deleteIfExists(resolveAvatarPath(relPath));
        } catch (Exception ignored) {
            // ignore
        }
    }

    private Path resolveAvatarPath(String relPath) {
        Path base = Paths.get(avatarDir).toAbsolutePath().normalize();
        Path resolved = base.resolve(relPath).normalize();
        if (!resolved.startsWith(base)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid avatar path");
        }
        return resolved;
    }

    private String extensionForContentType(String contentType) {
        String ct = contentType.toLowerCase(Locale.ROOT);
        if (ct.equals("image/png")) return "png";
        if (ct.equals("image/jpeg") || ct.equals("image/jpg")) return "jpg";
        if (ct.equals("image/webp")) return "webp";
        return null;
    }

    private Users requireUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in");
        }

        return usersRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not signed in"));
    }
}
