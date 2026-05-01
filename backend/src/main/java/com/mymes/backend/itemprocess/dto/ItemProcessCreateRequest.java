package com.mymes.backend.itemprocess.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ItemProcessCreateRequest {

    @NotNull(message = "품목은 필수입니다.")
    private Long itemId;

    @NotNull(message = "공정은 필수입니다.")
    private Long processId;

    @NotNull(message = "순서는 필수입니다.")
    @Min(value = 1, message = "순서는 1 이상이어야 합니다.")
    private Integer sequence;
}
