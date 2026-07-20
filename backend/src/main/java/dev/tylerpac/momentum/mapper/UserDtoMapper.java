package dev.tylerpac.momentum.mapper;

import org.springframework.stereotype.Component;

import dev.tylerpac.momentum.dto.common.UserDto;
import dev.tylerpac.momentum.model.Users;

@Component
public class UserDtoMapper {

    public UserDto toDto(Users user) {
        return new UserDto(
            user.getUserId(),
            user.getUsername(),
            user.getUnitSystem()
        );
    }
}
