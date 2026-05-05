package com.mymes.backend.defect.mapper;

import com.mymes.backend.defect.dto.DefectResponse;
import com.mymes.backend.defect.entity.DefectRecord;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.quality.entity.QualityInspection;
import com.mymes.backend.workorder.entity.WorkOrder;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface DefectMapper {

    /**
     * 불량 기록 엔티티를 응답 DTO로 변환합니다.
     *
     * @param defect 불량 기록 엔티티
     * @return 불량 기록 응답 DTO
     */
    default DefectResponse toResponse(DefectRecord defect) {
        WorkOrder workOrder = defect.getWorkOrder();
        QualityInspection inspection = defect.getQualityInspection();
        Item item = resolveItem(workOrder, inspection);
        MfgProcess process = resolveProcess(workOrder, inspection);

        return DefectResponse.builder()
                .id(defect.getId())
                .workOrderId(workOrder != null ? workOrder.getId() : null)
                .workOrderNo(workOrder != null ? workOrder.getWorkOrderNo() : null)
                .productionRecordId(defect.getProductionRecord() != null
                        ? defect.getProductionRecord().getId() : null)
                .qualityInspectionId(inspection != null ? inspection.getId() : null)
                .qualityInspectionNo(inspection != null ? inspection.getInspectionNo() : null)
                .itemId(item != null ? item.getId() : null)
                .itemCode(item != null ? item.getItemCode() : null)
                .itemName(item != null ? item.getItemName() : null)
                .processId(process != null ? process.getId() : null)
                .processCode(process != null ? process.getProcessCode() : null)
                .processName(process != null ? process.getProcessName() : null)
                .defectType(defect.getDefectType())
                .qty(defect.getQty())
                .defectDescription(defect.getDefectDescription())
                .causeCategory(defect.getCauseCategory())
                .actionStatus(defect.getActionStatus())
                .causeMemo(defect.getCauseMemo())
                .actionMemo(defect.getActionMemo())
                .disposition(defect.getDisposition())
                .assigneeName(defect.getAssigneeName())
                .createdAt(defect.getCreatedAt())
                .build();
    }

    private Item resolveItem(WorkOrder workOrder, QualityInspection inspection) {
        if (workOrder != null) {
            return workOrder.getItem();
        }
        return inspection != null ? inspection.getItem() : null;
    }

    private MfgProcess resolveProcess(WorkOrder workOrder, QualityInspection inspection) {
        if (workOrder != null && workOrder.getProcess() != null) {
            return workOrder.getProcess();
        }
        return inspection != null ? inspection.getProcess() : null;
    }
}
