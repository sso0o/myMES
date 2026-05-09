package com.mymes.backend.inspectionitem.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.inspectionitem.dto.InspectionItemCreateRequest;
import com.mymes.backend.inspectionitem.dto.InspectionItemResponse;
import com.mymes.backend.inspectionitem.dto.InspectionItemUpdateRequest;
import com.mymes.backend.inspectionitem.service.InspectionItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inspection-items")
@RequiredArgsConstructor
public class InspectionItemController {

    private final InspectionItemService inspectionItemService;

    /**
     * 전체 검사항목 마스터 목록을 조회합니다.
     *
     * @return 검사항목 마스터 응답 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InspectionItemResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(inspectionItemService.findAll()));
    }

    /**
     * ID로 검사항목 마스터를 단건 조회합니다.
     *
     * @param id 검사항목 마스터 ID
     * @return 검사항목 마스터 응답 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InspectionItemResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionItemService.findById(id)));
    }

    /**
     * 새 검사항목 마스터를 등록합니다.
     *
     * @param request 검사항목 마스터 생성 요청 DTO
     * @return 생성된 검사항목 마스터 응답 DTO
     */
    @PostMapping
    public ResponseEntity<ApiResponse<InspectionItemResponse>> create(
            @Valid @RequestBody InspectionItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(inspectionItemService.create(request)));
    }

    /**
     * 검사항목 마스터 정보를 수정합니다.
     *
     * @param id      검사항목 마스터 ID
     * @param request 검사항목 마스터 수정 요청 DTO
     * @return 수정된 검사항목 마스터 응답 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InspectionItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InspectionItemUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(inspectionItemService.update(id, request)));
    }

    /**
     * 검사항목 마스터를 삭제합니다.
     *
     * @param id 검사항목 마스터 ID
     * @return 응답 본문 없는 204 상태
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inspectionItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
