package dev.tylerpac.momentum.api;

import dev.tylerpac.momentum.api.dto.UserDto;
import dev.tylerpac.momentum.model.Users;
import org.springframework.stereotype.Component;

@Component
public class UserDtoMapper {

    public UserDto toDto(Users user) {
        return new UserDto(user.getUserId(), user.getUsername(), avatarUrl(user));
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
