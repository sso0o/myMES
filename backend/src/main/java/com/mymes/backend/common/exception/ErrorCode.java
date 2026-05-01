package com.mymes.backend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common
    INVALID_INPUT(400, "잘못된 입력값입니다."),
    RESOURCE_NOT_FOUND(404, "요청한 경로를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(500, "서버 오류가 발생했습니다."),

    // Item
    ITEM_NOT_FOUND(404, "품목을 찾을 수 없습니다."),
    ITEM_CODE_DUPLICATED(409, "이미 존재하는 품목코드입니다."),

    // Process
    PROCESS_NOT_FOUND(404, "공정을 찾을 수 없습니다."),
    PROCESS_CODE_DUPLICATED(409, "이미 존재하는 공정코드입니다."),

    // Item Process
    ITEM_PROCESS_NOT_FOUND(404, "품목-공정 매핑을 찾을 수 없습니다."),
    ITEM_PROCESS_DUPLICATED(409, "해당 품목에 이미 등록된 공정입니다."),
    ITEM_PROCESS_SEQUENCE_DUPLICATED(409, "해당 품목에 이미 사용 중인 순서입니다."),

    // Work Order
    WORK_ORDER_NOT_FOUND(404, "작업 지시를 찾을 수 없습니다."),
    WORK_ORDER_INVALID_STATUS_TRANSITION(409, "유효하지 않은 상태 전이입니다."),
    WORK_ORDER_NOT_MODIFIABLE(409, "대기 상태의 작업지시만 수정할 수 있습니다."),
    WORK_ORDER_NOT_DELETABLE(409, "대기 상태의 작업지시만 삭제할 수 있습니다."),
    WORK_ORDER_NO_GENERATION_FAILED(500, "작업지시 번호 생성에 실패했습니다."),

    // Production
    PRODUCTION_NOT_FOUND(404, "생산 실적을 찾을 수 없습니다."),
    PRODUCTION_QTY_EXCEEDED(400, "양품수량과 불량수량의 합은 투입수량을 초과할 수 없습니다."),
    PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS(409, "진행 중인 작업지시에만 생산실적을 등록할 수 있습니다."),

    // Defect
    DEFECT_NOT_FOUND(404, "불량 기록을 찾을 수 없습니다."),
    DEFECT_PRODUCTION_RECORD_WORK_ORDER_MISMATCH(400, "선택한 생산실적이 해당 작업지시에 속하지 않습니다."),

    // Common Code
    CODE_GROUP_NOT_FOUND(404, "코드 그룹을 찾을 수 없습니다."),
    CODE_GROUP_ID_DUPLICATED(409, "이미 존재하는 코드 그룹 ID입니다."),
    COMMON_CODE_NOT_FOUND(404, "공통 코드를 찾을 수 없습니다."),
    COMMON_CODE_DUPLICATED(409, "해당 그룹에 이미 존재하는 코드입니다."),
    COMMON_CODE_NUMBERING_PREFIX_DUPLICATED(409, "해당 그룹에 이미 사용 중인 채번코드입니다."),

    // Production Plan
    PLAN_NOT_FOUND(404, "생산계획을 찾을 수 없습니다."),
    PLAN_INVALID_STATUS_TRANSITION(409, "유효하지 않은 상태 전이입니다."),
    PLAN_NOT_MODIFIABLE(409, "초안 상태의 생산계획만 수정할 수 있습니다."),
    PLAN_NOT_DELETABLE(409, "초안 상태의 생산계획만 삭제할 수 있습니다."),
    PLAN_NO_GENERATION_FAILED(500, "생산계획 번호 생성에 실패했습니다."),
    PLAN_ALREADY_RELEASED(409, "이미 작업지시가 발행된 생산계획입니다."),

    // Equipment
    EQUIPMENT_NOT_FOUND(404, "설비를 찾을 수 없습니다."),
    EQUIPMENT_CODE_DUPLICATED(409, "이미 존재하는 설비코드입니다."),

    // User
    USER_NOT_FOUND(404, "유저를 찾을 수 없습니다."),
    USER_PASSWORD_MISMATCH(400, "현재 비밀번호가 일치하지 않습니다."),
    USER_EMP_NO_GENERATION_FAILED(500, "사번 생성에 실패했습니다."),

    // Supabase Admin API
    SUPABASE_USER_CREATE_FAILED(500, "Supabase 계정 생성에 실패했습니다."),
    SUPABASE_USER_UPDATE_FAILED(500, "Supabase 계정 수정에 실패했습니다."),
    SUPABASE_USER_DELETE_FAILED(500, "Supabase 계정 삭제에 실패했습니다.");

    private final int status;
    private final String message;
}
