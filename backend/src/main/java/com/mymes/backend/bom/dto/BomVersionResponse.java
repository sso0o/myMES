package com.mymes.backend.bom.dto;

import com.mymes.backend.bom.entity.BomVersionStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BomVersionResponse {
    private Long id;
    private Integer versionNo;
    private BomVersionStatus status;
    private LocalDateTime createdAt;
}
