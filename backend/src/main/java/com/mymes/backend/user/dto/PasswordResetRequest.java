package com.mymes.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

/** 관리자가 특정 유저의 비밀번호를 강제 초기화할 때 사용 */
@Getter
public class PasswordResetRequest {

    @NotBlank(message = "새 비밀번호는 필수입니다.")
    @Size(min = 6, message = "비밀번호는 6자 이상이어야 합니다.")
    private String newPassword;
}
