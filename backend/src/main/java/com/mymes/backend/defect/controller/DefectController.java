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

    @GetMapping("/api/work-orders/{workOrderId}/defect-records")
    public ResponseEntity<ApiResponse<List<DefectResponse>>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findByWorkOrder(workOrderId)));
    }

    @PostMapping("/api/work-orders/{workOrderId}/defect-records")
    public ResponseEntity<ApiResponse<DefectResponse>> create(
            @PathVariable Long workOrderId,
            @Valid @RequestBody DefectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(defectService.create(workOrderId, request)));
    }

    @GetMapping("/api/defect-records/{id}")
    public ResponseEntity<ApiResponse<DefectResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.findById(id)));
    }

    @PatchMapping("/api/defect-records/{id}/action")
    public ResponseEntity<ApiResponse<DefectResponse>> updateAction(
            @PathVariable Long id,
            @Valid @RequestBody DefectActionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(defectService.updateAction(id, request)));
    }
}
