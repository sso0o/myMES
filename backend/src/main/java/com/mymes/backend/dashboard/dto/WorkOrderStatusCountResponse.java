package com.mymes.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkOrderStatusCountResponse {

    /** 작업지시 상태 (WAITING / IN_PROGRESS / COMPLETED) */
    private final String status;

    /** 해당 상태의 작업지시 수 */
    private final long count;
}
