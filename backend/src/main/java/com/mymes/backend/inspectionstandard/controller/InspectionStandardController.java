package com.mymes.backend.inspectionstandard.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardCreateRequest;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardResponse;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardUpdateRequest;
import com.mymes.backend.inspectionstandard.service.InspectionStandardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspection-standards")
@RequiredArgsConstructor
public class InspectionStandardController {

    private final InspectionStandardService inspectionStandardService;

    /**
     * 검사 기준 목록을 조회합니다.
     *
     * @param itemId    품목 ID
     * @param processId 공정 ID
     * @return 검사 기준 응답 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InspectionStandardResponse>>> getAll(
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long processId) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionStandardService.findAll(itemId, processId)));
    }

    /**
     * ID로 검사 기준을 단건 조회합니다.
     *
     * @param id 검사 기준 ID
     * @return 검사 기준 응답 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InspectionStandardResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionStandardService.findById(id)));
    }

    /**
     * 새 검사 기준을 등록합니다.
     *
     * @param request 검사 기준 생성 요청 DTO
     * @return 생성된 검사 기준 응답 DTO
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InspectionStandardResponse>> create(
            @Valid @RequestBody InspectionStandardCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(inspectionStandardService.create(request)));
    }

    /**
     * 검사 기준 정보를 수정합니다.
     *
     * @param id      검사 기준 ID
     * @param request 검사 기준 수정 요청 DTO
     * @return 수정된 검사 기준 응답 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InspectionStandardResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InspectionStandardUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionStandardService.update(id, request)));
    }

    /**
     * 검사 기준을 삭제합니다.
     *
     * @param id 검사 기준 ID
     * @return 응답 본문 없는 204 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inspectionStandardService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
