package com.mymes.backend.processEquipment.mapper;

import com.mymes.backend.processEquipment.dto.ProcessEquipmentResponse;
import com.mymes.backend.processEquipment.entity.ProcessEquipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProcessEquipmentMapper {

    @Mapping(source = "process.id",            target = "processId")
    @Mapping(source = "process.processCode",   target = "processCode")
    @Mapping(source = "process.processName",   target = "processName")
    @Mapping(source = "equipment.id",          target = "equipmentId")
    @Mapping(source = "equipment.equipmentCode", target = "equipmentCode")
    @Mapping(source = "equipment.equipmentName", target = "equipmentName")
    ProcessEquipmentResponse toResponse(ProcessEquipment entity);
}
