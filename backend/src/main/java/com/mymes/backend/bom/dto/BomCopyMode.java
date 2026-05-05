package com.mymes.backend.bom.dto;

/**
 * BOM 일괄 복사 방식.
 */
public enum BomCopyMode {
    /** 대상 품목의 기존 활성 BOM을 이력화하고 원본 BOM으로 새 버전을 생성 */
    REPLACE,
    /** 대상 품목의 기존 BOM 마지막 순서 뒤에 원본 BOM을 이어서 추가 */
    APPEND
}
