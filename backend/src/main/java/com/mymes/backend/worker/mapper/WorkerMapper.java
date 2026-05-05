package com.mymes.backend.worker.mapper;

import com.mymes.backend.worker.dto.response.WorkerResponse;
import com.mymes.backend.worker.entity.Worker;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WorkerMapper {

    WorkerResponse toResponse(Worker worker);
}
