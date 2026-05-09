package com.mymes.backend.inspectionstandard.mapper;

import com.mymes.backend.inspectionstandard.dto.InspectionStandardResponse;
import com.mymes.backend.inspectionstandard.entity.InspectionStandard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InspectionStandardMapper {

    @Mapping(source = "item.id", target = "itemId")
    @Mapping(source = "item.itemCode", target = "itemCode")
    @Mapping(source = "item.itemName", target = "itemName")
    @Mapping(source = "process.id", target = "processId")
    @Mapping(source = "process.processCode", target = "processCode")
    @Mapping(source = "process.processName", target = "processName")
    @Mapping(source = "inspectionItem.id", target = "inspectionItemId")
    @Mapping(source = "inspectionItem.inspectionItemCode", target = "inspectionItemCode")
    @Mapping(source = "inspectionItem.inspectionItemName", target = "inspectionItemName")
    @Mapping(source = "inspectionItem.category.code", target = "categoryCode")
    @Mapping(source = "inspectionItem.category.codeName", target = "categoryName")
    @Mapping(source = "inspectionItem.measurementType", target = "measurementType")
    @Mapping(source = "inspectionMethod.id", target = "inspectionMethodId")
    @Mapping(source = "inspectionMethod.code", target = "inspectionMethodCode")
    @Mapping(source = "inspectionMethod.codeName", target = "inspectionMethodName")
    @Mapping(source = "required", target = "isRequired")
    @Mapping(source = "active", target = "isActive")
    InspectionStandardResponse toResponse(InspectionStandard inspectionStandard);
}
