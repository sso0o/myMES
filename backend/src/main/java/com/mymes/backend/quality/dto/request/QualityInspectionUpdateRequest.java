package com.mymes.backend.quality.dto.request;

import com.mymes.backend.quality.entity.QualityInspectionResult;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.entity.QualityInspectionType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspectionUpdateRequest {

    @NotNull(message = "검사일자는 필수입니다.")
    private LocalDate inspectionDate;

    @NotNull(message = "검사유형은 필수입니다.")
    private QualityInspectionType inspectionType;

    @NotNull(message = "검사상태는 필수입니다.")
    private QualityInspectionStatus status;

    @NotNull(message = "판정결과는 필수입니다.")
    private QualityInspectionResult result;

    @NotNull(message = "품목은 필수입니다.")
    private Long itemId;

    private Long processId;

    private Long workOrderId;

    @NotNull(message = "검사수량은 필수입니다.")
    @PositiveOrZero(message = "검사수량은 0 이상이어야 합니다.")
    private Integer inspectionQty;

    @NotNull(message = "합격수량은 필수입니다.")
    @PositiveOrZero(message = "합격수량은 0 이상이어야 합니다.")
    private Integer passQty;

    @NotNull(message = "불량수량은 필수입니다.")
    @PositiveOrZero(message = "불량수량은 0 이상이어야 합니다.")
    private Integer defectQty;

    @Size(max = 50)
    private String inspectorName;

    @Size(max = 500)
    private String remarks;
}
