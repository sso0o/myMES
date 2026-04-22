package com.mymes.backend.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 공통
    INVALID_INPUT(400, "잘못된 입력값입니다."),
    RESOURCE_NOT_FOUND(404, "요청한 경로를 찾을 수 없습니다."),
    INTERNAL_SERVER_ERROR(500, "서버 오류가 발생했습니다."),

    // 품목
    ITEM_NOT_FOUND(404, "품목을 찾을 수 없습니다."),
    ITEM_CODE_DUPLICATED(409, "이미 존재하는 품목코드입니다."),

    // 공정
    PROCESS_NOT_FOUND(404, "공정을 찾을 수 없습니다."),
    PROCESS_CODE_DUPLICATED(409, "이미 존재하는 공정코드입니다."),

    // 작업지시
    WORK_ORDER_NOT_FOUND(404, "작업 지시를 찾을 수 없습니다."),
    WORK_ORDER_INVALID_STATUS_TRANSITION(409, "유효하지 않은 상태 전이입니다."),
    WORK_ORDER_NOT_MODIFIABLE(409, "대기 상태의 작업지시만 수정할 수 있습니다."),
    WORK_ORDER_NOT_DELETABLE(409, "대기 상태의 작업지시만 삭제할 수 있습니다."),
    WORK_ORDER_NO_GENERATION_FAILED(500, "작업지시 번호 생성에 실패했습니다."),

    // 생산실적
    PRODUCTION_NOT_FOUND(404, "생산 실적을 찾을 수 없습니다."),
    PRODUCTION_QTY_EXCEEDED(400, "완료수량 + 불량수량이 투입수량을 초과할 수 없습니다."),
    PRODUCTION_WORK_ORDER_NOT_IN_PROGRESS(409, "진행 중인 작업지시에만 생산실적을 등록할 수 있습니다."),

    // 불량
    DEFECT_NOT_FOUND(404, "불량 기록을 찾을 수 없습니다."),
    DEFECT_PRODUCTION_RECORD_WORK_ORDER_MISMATCH(400, "선택한 생산실적이 해당 작업지시에 속하지 않습니다.");

    private final int status;
    private final String message;
}
