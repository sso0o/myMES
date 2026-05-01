package com.mymes.backend.itemprocess.mapper;

import com.mymes.backend.itemprocess.dto.ItemProcessResponse;
import com.mymes.backend.itemprocess.entity.ItemProcess;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ItemProcessMapper {

    @Mapping(source = "item.id",          target = "itemId")
    @Mapping(source = "item.itemCode",    target = "itemCode")
    @Mapping(source = "item.itemName",    target = "itemName")
    @Mapping(source = "process.id",       target = "processId")
    @Mapping(source = "process.processCode", target = "processCode")
    @Mapping(source = "process.processName", target = "processName")
    ItemProcessResponse toResponse(ItemProcess itemProcess);
}
