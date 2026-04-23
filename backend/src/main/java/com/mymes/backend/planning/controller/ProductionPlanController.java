package com.mymes.backend.planning.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.planning.dto.ProductionPlanCreateRequest;
import com.mymes.backend.planning.dto.ProductionPlanResponse;
import com.mymes.backend.planning.dto.ProductionPlanStatusUpdateRequest;
import com.mymes.backend.planning.dto.ProductionPlanUpdateRequest;
import com.mymes.backend.planning.entity.PlanStatus;
import com.mymes.backend.planning.service.ProductionPlanService;
import com.mymes.backend.security.SupabasePrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-plans")
@RequiredArgsConstructor
public class ProductionPlanController {

    private final ProductionPlanService productionPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductionPlanResponse>>> getAll(
            @RequestParam(required = false) PlanStatus status) {
        List<ProductionPlanResponse> result = (status != null)
                ? productionPlanService.findByStatus(status)
                : productionPlanService.findAll();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductionPlanResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productionPlanService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductionPlanResponse>> create(
            @Valid @RequestBody ProductionPlanCreateRequest request,
            @AuthenticationPrincipal SupabasePrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(productionPlanService.create(request, principal.getUserId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductionPlanResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductionPlanUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productionPlanService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductionPlanResponse>> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductionPlanStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productionPlanService.changeStatus(id, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productionPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
