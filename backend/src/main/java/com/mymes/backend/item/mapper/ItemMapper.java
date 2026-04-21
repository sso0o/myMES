package com.mymes.backend.item.mapper;

import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.entity.Item;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ItemMapper {
    ItemResponse toResponse(Item item);
}
