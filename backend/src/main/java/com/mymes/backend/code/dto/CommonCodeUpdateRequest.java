package com.mymes.backend.code.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class CommonCodeUpdateRequest {

    @NotBlank(message = "코드명은 필수입니다.")
    @Size(max = 100)
    private String codeName;

    @NotNull(message = "정렬 순서는 필수입니다.")
    @Positive(message = "정렬 순서는 0보다 커야 합니다.")
    private Integer sortOrder;

    @Size(max = 20)
    private String numberingPrefix;
}
