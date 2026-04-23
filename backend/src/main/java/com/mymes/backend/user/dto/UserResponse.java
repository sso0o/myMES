package com.mymes.backend.user.dto;

import com.mymes.backend.user.entity.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String empNo;
    private String name;
    private UserRole role;
    private boolean active;
    private LocalDate resignedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
