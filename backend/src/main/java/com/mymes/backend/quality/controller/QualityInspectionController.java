package com.mymes.backend.quality.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.quality.dto.request.QualityInspectionCreateRequest;
import com.mymes.backend.quality.dto.request.QualityInspectionUpdateRequest;
import com.mymes.backend.quality.dto.response.QualityInspectionResponse;
import com.mymes.backend.quality.entity.QualityInspectionStatus;
import com.mymes.backend.quality.service.QualityInspectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quality-inspections")
@RequiredArgsConstructor
public class QualityInspectionController {

    private final QualityInspectionService qualityInspectionService;

    /**
     * 품질검사 목록을 조회합니다.
     *
     * @param status 검사상태 필터
     * @return 품질검사 응답 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<QualityInspectionResponse>>> getAll(
            @RequestParam(required = false) QualityInspectionStatus status) {
        List<QualityInspectionResponse> result = status != null
                ? qualityInspectionService.findByStatus(status)
                : qualityInspectionService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * ID로 품질검사를 단건 조회합니다.
     *
     * @param id 품질검사 ID
     * @return 품질검사 응답 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(qualityInspectionService.findById(id)));
    }

    /**
     * 품질검사를 등록합니다.
     *
     * @param request 품질검사 생성 요청 DTO
     * @return 생성된 품질검사 응답 DTO
     */
    @PostMapping
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> create(
            @Valid @RequestBody QualityInspectionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(qualityInspectionService.create(request)));
    }

    /**
     * 품질검사를 수정합니다.
     *
     * @param id 품질검사 ID
     * @param request 품질검사 수정 요청 DTO
     * @return 수정된 품질검사 응답 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody QualityInspectionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(qualityInspectionService.update(id, request)));
    }

    /**
     * 품질검사를 소프트 삭제합니다.
     *
     * @param id 품질검사 ID
     * @return 빈 응답
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        qualityInspectionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
