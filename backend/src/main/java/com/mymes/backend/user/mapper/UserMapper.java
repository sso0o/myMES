package com.mymes.backend.user.mapper;

import com.mymes.backend.user.dto.UserResponse;
import com.mymes.backend.user.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);
}
