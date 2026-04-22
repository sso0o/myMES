package com.mymes.backend.defect.dto;

import com.mymes.backend.defect.entity.DefectAction;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class DefectResponse {
    private Long id;
    private Long workOrderId;
    private String workOrderNo;
    private Long productionRecordId;
    private String defectType;
    private Integer qty;
    private DefectAction actionStatus;
    private String causeMemo;
    private LocalDateTime createdAt;
}
