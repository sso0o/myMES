package com.mymes.backend.equipment.mapper;

import com.mymes.backend.equipment.dto.EquipmentResponse;
import com.mymes.backend.equipment.entity.Equipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EquipmentMapper {

    @Mapping(source = "equipmentType.id", target = "equipmentTypeId")
    @Mapping(source = "equipmentType.codeName", target = "equipmentTypeName")
    @Mapping(source = "active", target = "isActive")
    EquipmentResponse toResponse(Equipment equipment);
}
