package com.mymes.backend.process.mapper;

import com.mymes.backend.process.dto.ProcessResponse;
import com.mymes.backend.process.entity.MfgProcess;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MfgProcessMapper {

    @Mapping(source = "processType.id", target = "processTypeId")
    @Mapping(source = "processType.codeName", target = "processTypeName")
    @Mapping(source = "active", target = "isActive")
    ProcessResponse toResponse(MfgProcess process);
}
