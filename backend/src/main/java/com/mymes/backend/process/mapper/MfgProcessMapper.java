package com.mymes.backend.process.mapper;

import com.mymes.backend.process.dto.ProcessResponse;
import com.mymes.backend.process.entity.MfgProcess;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MfgProcessMapper {
    ProcessResponse toResponse(MfgProcess process);
}
