package com.mymes.backend.workorder.mapper;

import com.mymes.backend.workorder.dto.WorkOrderResponse;
import com.mymes.backend.workorder.entity.WorkOrder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WorkOrderMapper {

    @Mapping(source = "item.id",             target = "itemId")
    @Mapping(source = "item.itemCode",       target = "itemCode")
    @Mapping(source = "item.itemName",       target = "itemName")
    @Mapping(source = "process.id",          target = "processId")
    @Mapping(source = "process.processCode", target = "processCode")
    @Mapping(source = "process.processName", target = "processName")
    WorkOrderResponse toResponse(WorkOrder workOrder);
}
