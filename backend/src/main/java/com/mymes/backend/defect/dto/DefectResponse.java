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
    private Long qualityInspectionId;
    private String qualityInspectionNo;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Long processId;
    private String processCode;
    private String processName;
    private String defectType;
    private Integer qty;
    private String defectDescription;
    private String causeCategory;
    private DefectAction actionStatus;
    private String causeMemo;
    private String actionMemo;
    private String disposition;
    private String assigneeName;
    private LocalDateTime createdAt;
}
