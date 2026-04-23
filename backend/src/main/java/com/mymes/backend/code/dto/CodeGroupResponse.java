package com.mymes.backend.code.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CodeGroupResponse {

    private Long id;
    private String groupId;
    private String groupName;
    private String description;
    private Boolean isActive;
    private List<CommonCodeResponse> codes;
    private LocalDateTime createdAt;
}
