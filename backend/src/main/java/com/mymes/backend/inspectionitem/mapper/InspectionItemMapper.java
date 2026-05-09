package com.mymes.backend.inspectionitem.mapper;

import com.mymes.backend.inspectionitem.dto.InspectionItemResponse;
import com.mymes.backend.inspectionitem.entity.InspectionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InspectionItemMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.code", target = "categoryCode")
    @Mapping(source = "category.codeName", target = "categoryName")
    @Mapping(source = "active", target = "isActive")
    InspectionItemResponse toResponse(InspectionItem inspectionItem);
}
