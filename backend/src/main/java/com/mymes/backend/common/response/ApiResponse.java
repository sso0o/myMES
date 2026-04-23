package com.mymes.backend.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final PageResponse pagination;
    private final String message;
    private final String code;

    private ApiResponse(boolean success, T data, PageResponse pagination, String message, String code) {
        this.success = success;
        this.data = data;
        this.pagination = pagination;
        this.message = message;
        this.code = code;
    }

    /**
     * 단건 또는 목록 성공 응답 생성 (페이지네이션 없음).
     *
     * @param data 응답 데이터
     */
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null, null, null);
    }

    /**
     * 페이지네이션이 포함된 목록 성공 응답 생성.
     *
     * @param data       응답 데이터 (목록)
     * @param pagination 페이지 메타 정보
     */
    public static <T> ApiResponse<T> ok(T data, PageResponse pagination) {
        return new ApiResponse<>(true, data, pagination, null, null);
    }

    /**
     * 실패 응답 생성.
     *
     * @param message 오류 메시지
     * @param code    오류 코드
     */
    public static <T> ApiResponse<T> fail(String message, String code) {
        return new ApiResponse<>(false, null, null, message, code);
    }
}
