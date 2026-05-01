package com.mymes.backend.common.response;

import lombok.Builder;
import lombok.Getter;

/**
 * 페이지네이션 메타 정보를 담는 응답 객체.
 * ApiResponse의 pagination 필드로 사용됩니다.
 */
@Getter
@Builder
public class PageResponse {

    /** 현재 페이지 번호 (0부터 시작) */
    private final int page;

    /** 페이지당 항목 수 */
    private final int size;

    /** 전체 항목 수 */
    private final long total;

    /**
     * 페이지네이션 정보 생성 팩토리 메서드.
     *
     * @param page  현재 페이지 번호 (0부터 시작)
     * @param size  페이지당 항목 수
     * @param total 전체 항목 수
     * @return PageResponse 인스턴스
     */
    public static PageResponse of(int page, int size, long total) {
        return PageResponse.builder()
                .page(page)
                .size(size)
                .total(total)
                .build();
    }
}
