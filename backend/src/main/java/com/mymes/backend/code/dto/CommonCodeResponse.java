package com.mymes.backend.code.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommonCodeResponse {

    private Long id;
    private String groupId;
    private String code;
    private String codeName;
    private Integer sortOrder;
    private Boolean isActive;
    private String numberingPrefix;
    private LocalDateTime createdAt;
}
