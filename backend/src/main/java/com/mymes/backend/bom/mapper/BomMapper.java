package com.mymes.backend.bom.mapper;

import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomVersionResponse;
import com.mymes.backend.bom.entity.Bom;
import com.mymes.backend.bom.entity.BomVersion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BomMapper {

    @Mapping(source = "parentItem.id", target = "parentItemId")
    @Mapping(source = "parentItem.itemCode", target = "parentItemCode")
    @Mapping(source = "parentItem.itemName", target = "parentItemName")
    @Mapping(source = "materialItem.id", target = "materialItemId")
    @Mapping(source = "materialItem.itemCode", target = "materialItemCode")
    @Mapping(source = "materialItem.itemName", target = "materialItemName")
    @Mapping(source = "materialItem.itemType.codeName", target = "materialItemTypeName")
    @Mapping(source = "materialItem.unit", target = "unit")
    @Mapping(source = "bomVersion.id", target = "versionId")
    @Mapping(source = "bomVersion.versionNo", target = "versionNo")
    @Mapping(source = "bomVersion.status", target = "versionStatus")
    BomResponse toResponse(Bom bom);

    BomVersionResponse toVersionResponse(BomVersion bomVersion);
}
