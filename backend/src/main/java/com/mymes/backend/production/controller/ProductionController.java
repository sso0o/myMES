package com.mymes.backend.production.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.production.dto.ProductionCreateRequest;
import com.mymes.backend.production.dto.ProductionResponse;
import com.mymes.backend.production.dto.ProductionUpdateRequest;
import com.mymes.backend.production.service.ProductionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping("/api/work-orders/{workOrderId}/production-records")
    public ResponseEntity<ApiResponse<List<ProductionResponse>>> getByWorkOrder(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(ApiResponse.ok(productionService.findByWorkOrder(workOrderId)));
    }

    @PostMapping("/api/work-orders/{workOrderId}/production-records")
    public ResponseEntity<ApiResponse<ProductionResponse>> create(
            @PathVariable Long workOrderId,
            @Valid @RequestBody ProductionCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(productionService.create(workOrderId, request)));
    }

    @GetMapping("/api/production-records/{id}")
    public ResponseEntity<ApiResponse<ProductionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productionService.findById(id)));
    }

    @PutMapping("/api/production-records/{id}")
    public ResponseEntity<ApiResponse<ProductionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductionUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productionService.update(id, request)));
    }
}
