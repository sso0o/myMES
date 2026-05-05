package com.mymes.backend.processEquipment.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentCreateRequest;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentResponse;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentUpdateRequest;
import com.mymes.backend.processEquipment.service.ProcessEquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prod-basic/process-equipment")
@RequiredArgsConstructor
public class ProcessEquipmentController {

    private final ProcessEquipmentService processEquipmentService;

    /**
     * 공정 또는 설비 ID를 기준으로 배정 목록을 조회합니다.
     * processId 또는 equipmentId 중 하나는 반드시 제공해야 합니다.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessEquipmentResponse>>> getList(
            @RequestParam(required = false) Long processId,
            @RequestParam(required = false) Long equipmentId) {
        if (processId != null) {
            return ResponseEntity.ok(ApiResponse.ok(processEquipmentService.findByProcessId(processId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(processEquipmentService.findByEquipmentId(equipmentId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessEquipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(processEquipmentService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProcessEquipmentResponse>> create(
            @Valid @RequestBody ProcessEquipmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(processEquipmentService.create(request)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessEquipmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProcessEquipmentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(processEquipmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        processEquipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
