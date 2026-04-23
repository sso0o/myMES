package com.mymes.backend.user.dto;

import com.mymes.backend.user.entity.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class UserCreateRequest {

    @NotBlank(message = "이름은 필수입니다.")
    @Size(max = 50)
    private String name;

    /** Supabase Auth에 등록할 초기 비밀번호 */
    @NotBlank(message = "비밀번호는 필수입니다.")
    @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
    private String password;

    @NotNull(message = "권한은 필수입니다.")
    private UserRole role;
}
