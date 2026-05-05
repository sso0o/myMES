package com.mymes.backend.quality.mapper;

import com.mymes.backend.quality.dto.response.QualityInspectionResponse;
import com.mymes.backend.quality.entity.QualityInspection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QualityInspectionMapper {

    @Mapping(source = "item.id", target = "itemId")
    @Mapping(source = "item.itemCode", target = "itemCode")
    @Mapping(source = "item.itemName", target = "itemName")
    @Mapping(source = "process.id", target = "processId")
    @Mapping(source = "process.processCode", target = "processCode")
    @Mapping(source = "process.processName", target = "processName")
    @Mapping(source = "workOrder.id", target = "workOrderId")
    @Mapping(source = "workOrder.workOrderNo", target = "workOrderNo")
    QualityInspectionResponse toResponse(QualityInspection inspection);
}
