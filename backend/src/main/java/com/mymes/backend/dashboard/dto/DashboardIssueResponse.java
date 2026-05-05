package com.mymes.backend.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DashboardIssueResponse {

    /** 작업지시 ID */
    private final Long workOrderId;

    /** 작업지시 번호 */
    private final String workOrderNo;

    /** 품목명 */
    private final String itemName;

    /** 작업지시 상태 (WAITING / IN_PROGRESS) */
    private final String status;

    /** 납기일 */
    private final LocalDate dueDate;

    /** 납기 초과 일수 (납기일이 오늘 이후면 0) */
    private final int daysOverdue;
}
