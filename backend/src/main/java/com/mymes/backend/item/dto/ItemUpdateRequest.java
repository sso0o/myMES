package com.mymes.backend.item.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ItemUpdateRequest {

    @NotBlank(message = "품목명은 필수입니다.")
    @Size(max = 100)
    private String itemName;

    @NotBlank(message = "단위는 필수입니다.")
    @Size(max = 20)
    private String unit;

    @NotNull(message = "품목구분은 필수입니다.")
    private Long itemTypeId;
}
