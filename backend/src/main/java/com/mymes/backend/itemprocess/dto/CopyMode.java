package com.mymes.backend.itemprocess.dto;

/**
 * 품목별 공정 일괄 복사 방식.
 */
public enum CopyMode {
    /** 대상 품목의 기존 공정을 모두 삭제하고 원본 공정으로 교체 */
    REPLACE,
    /** 대상 품목의 기존 공정 마지막 순서 뒤에 원본 공정을 이어서 추가 */
    APPEND
}
