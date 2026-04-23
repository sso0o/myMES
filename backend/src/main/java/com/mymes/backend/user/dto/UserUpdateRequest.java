package com.mymes.backend.user.dto;

import com.mymes.backend.user.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UserUpdateRequest {

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50)
    private String name;

    @NotNull(message = "권한은 필수입니다.")
    private UserRole role;
}
