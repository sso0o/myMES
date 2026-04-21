package com.mymes.backend.workorder.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.workorder.entity.WorkOrderStatus;
import com.mymes.backend.workorder.dto.WorkOrderCreateRequest;
import com.mymes.backend.workorder.dto.WorkOrderResponse;
import com.mymes.backend.workorder.dto.WorkOrderStatusUpdateRequest;
import com.mymes.backend.workorder.dto.WorkOrderUpdateRequest;
import com.mymes.backend.workorder.service.WorkOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkOrderResponse>>> getAll(
            @RequestParam(required = false) WorkOrderStatus status) {
        List<WorkOrderResponse> result = (status != null)
                ? workOrderService.findByStatus(status)
                : workOrderService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WorkOrderResponse>> create(
            @Valid @RequestBody WorkOrderCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workOrderService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkOrderResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<WorkOrderResponse>> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody WorkOrderStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workOrderService.changeStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workOrderService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
