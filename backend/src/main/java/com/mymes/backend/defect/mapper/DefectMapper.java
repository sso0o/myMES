package com.mymes.backend.defect.mapper;

import com.mymes.backend.defect.dto.DefectResponse;
import com.mymes.backend.defect.entity.DefectRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DefectMapper {

    @Mapping(source = "workOrder.id",          target = "workOrderId")
    @Mapping(source = "workOrder.workOrderNo", target = "workOrderNo")
    @Mapping(source = "productionRecord.id",   target = "productionRecordId")
    DefectResponse toResponse(DefectRecord defect);
}
