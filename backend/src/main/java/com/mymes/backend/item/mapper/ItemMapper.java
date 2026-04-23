package com.mymes.backend.item.mapper;

import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.entity.Item;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(source = "itemType.id", target = "itemTypeId")
    @Mapping(source = "itemType.code", target = "itemTypeCode")
    @Mapping(source = "itemType.codeName", target = "itemTypeName")
    ItemResponse toResponse(Item item);
}
