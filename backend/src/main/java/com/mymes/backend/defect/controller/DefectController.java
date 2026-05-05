package com.mymes.backend.defect.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.defect.dto.DefectActionUpdateRequest;
import com.mymes.backend.defect.dto.DefectCreateRequest;
import com.mymes.backend.defect.dto.DefectResponse;
import com.mymes.backend.defect.service.DefectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DefectController {

    private final DefectService defectService;

    /**
     * 전체 불량 기록 목록을 조회합니다.
     *
     * @return 불량 기록 응답 목록
     */
    @GetMapping("/api/defect-records")
    public ResponseEntity<ApiResponse<List<DefectResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findAll()));
    }

    /**
     * 작업지시별 불량 기록 목록을 조회합니다.
     *
     * @param workOrderId 작업지시 ID
     * @return 불량 기록 응답 목록
     */
    @GetMapping("/api/work-orders/{workOrderId}/defect-records")
    public ResponseEntity<ApiResponse<List<DefectResponse>>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findByWorkOrder(workOrderId)));
    }

    /**
     * 작업지시에 불량 기록을 등록합니다.
     *
     * @param workOrderId 작업지시 ID
     * @param request 불량 생성 요청 DTO
     * @return 생성된 불량 기록 응답 DTO
     */
    @PostMapping("/api/work-orders/{workOrderId}/defect-records")
    public ResponseEntity<ApiResponse<DefectResponse>> create(
            @PathVariable Long workOrderId,
            @Valid @RequestBody DefectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(defectService.create(workOrderId, request)));
    }

    /**
     * 품질검사별 불량 기록 목록을 조회합니다.
     *
     * @param inspectionId 품질검사 ID
     * @return 불량 기록 응답 목록
     */
    @GetMapping("/api/quality-inspections/{inspectionId}/defect-records")
    public ResponseEntity<ApiResponse<List<DefectResponse>>> getByQualityInspection(
            @PathVariable Long inspectionId) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findByQualityInspection(inspectionId)));
    }

    /**
     * 품질검사에 불량 기록을 등록합니다.
     *
     * @param inspectionId 품질검사 ID
     * @param request 불량 생성 요청 DTO
     * @return 생성된 불량 기록 응답 DTO
     */
    @PostMapping("/api/quality-inspections/{inspectionId}/defect-records")
    public ResponseEntity<ApiResponse<DefectResponse>> createByQualityInspection(
            @PathVariable Long inspectionId,
            @Valid @RequestBody DefectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(defectService.createByQualityInspection(inspectionId, request)));
    }

    /**
     * ID로 불량 기록을 단건 조회합니다.
     *
     * @param id 불량 기록 ID
     * @return 불량 기록 응답 DTO
     */
    @GetMapping("/api/defect-records/{id}")
    public ResponseEntity<ApiResponse<DefectResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findById(id)));
    }

    /**
     * 불량 조치 정보를 수정합니다.
     *
     * @param id 불량 기록 ID
     * @param request 조치 수정 요청 DTO
     * @return 수정된 불량 기록 응답 DTO
     */
    @PatchMapping("/api/defect-records/{id}/action")
    public ResponseEntity<ApiResponse<DefectResponse>> updateAction(
            @PathVariable Long id,
            @Valid @RequestBody DefectActionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.updateAction(id, request)));
    }
}
