package dev.tylerpac.momentum.api;

import org.springframework.stereotype.Component;

import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;

@Component
public class UserDtoMapper {

    public UserDto toDto(Users user) {
    return new UserDto(
        user.getUserId(),
        user.getUsername(),
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        avatarUrl(user)
    );
    }

    private String avatarUrl(Users user) {
        String path = user.getAvatarPath();
        if (path == null || path.isBlank()) return null;

        String url = "/media/avatars/" + path;
        if (user.getAvatarUpdatedAt() != null) {
            url += "?v=" + user.getAvatarUpdatedAt().toEpochMilli();
        }
        return url;
    }
}
