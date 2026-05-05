package com.mymes.backend.bom.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
public class BomSaveRequest {

    @NotEmpty(message = "BOM 라인은 1개 이상이어야 합니다.")
    @Valid
    private List<BomLineRequest> lines;

    @Getter
    public static class BomLineRequest {

        @NotNull(message = "자재 품목은 필수입니다.")
        private Long materialItemId;

        @NotNull(message = "순서는 필수입니다.")
        @Positive(message = "순서는 1 이상이어야 합니다.")
        private Integer sequence;

        @NotNull(message = "소요수량은 필수입니다.")
        @DecimalMin(value = "0.0", inclusive = false, message = "소요수량은 0보다 커야 합니다.")
        private BigDecimal quantity;

        @Size(max = 500)
        private String description;
    }
}
