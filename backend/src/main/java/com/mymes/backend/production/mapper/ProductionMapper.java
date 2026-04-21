package com.mymes.backend.production.mapper;

import com.mymes.backend.production.dto.ProductionResponse;
import com.mymes.backend.production.entity.ProductionRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductionMapper {

    @Mapping(source = "workOrder.id",          target = "workOrderId")
    @Mapping(source = "workOrder.workOrderNo", target = "workOrderNo")
    @Mapping(source = "process.id",            target = "processId")
    @Mapping(source = "process.processName",   target = "processName")
    ProductionResponse toResponse(ProductionRecord record);
}
