package com.mymes.backend.equipment.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.equipment.dto.EquipmentCreateRequest;
import com.mymes.backend.equipment.dto.EquipmentResponse;
import com.mymes.backend.equipment.dto.EquipmentUpdateRequest;
import com.mymes.backend.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prod-basic/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EquipmentResponse>> create(
            @Valid @RequestBody EquipmentCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(equipmentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(equipmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
