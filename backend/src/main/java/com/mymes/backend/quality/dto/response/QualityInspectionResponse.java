package com.mymes.backend.quality.dto.response;

import com.mymes.backend.quality.entity.QualityInspectionResult;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.entity.QualityInspectionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QualityInspectionResponse {

    private Long id;
    private String inspectionNo;
    private LocalDate inspectionDate;
    private QualityInspectionType inspectionType;
    private QualityInspectionStatus status;
    private QualityInspectionResult result;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Long processId;
    private String processCode;
    private String processName;
    private Long workOrderId;
    private String workOrderNo;
    private Integer inspectionQty;
    private Integer passQty;
    private Integer defectQty;
    private String inspectorName;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
