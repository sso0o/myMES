package com.mymes.backend.planning.mapper;

import com.mymes.backend.planning.dto.ProductionPlanResponse;
import com.mymes.backend.planning.entity.ProductionPlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductionPlanMapper {

    @Mapping(source = "item.id",            target = "itemId")
    @Mapping(source = "item.itemCode",      target = "itemCode")
    @Mapping(source = "item.itemName",      target = "itemName")
    @Mapping(source = "workOrder.id",       target = "workOrderId")
    @Mapping(source = "workOrder.workOrderNo", target = "workOrderNo")
    @Mapping(source = "createdBy.id",       target = "createdById")
    @Mapping(source = "createdBy.name",     target = "createdByName")
    ProductionPlanResponse toResponse(ProductionPlan productionPlan);
}
