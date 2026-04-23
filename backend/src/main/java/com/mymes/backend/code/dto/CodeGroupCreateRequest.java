package com.mymes.backend.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CodeGroupCreateRequest {

    @NotBlank(message = "그룹 ID는 필수입니다.")
    @Size(max = 50)
    private String groupId;

    @NotBlank(message = "그룹명은 필수입니다.")
    @Size(max = 100)
    private String groupName;

    @Size(max = 255)
    private String description;
}
