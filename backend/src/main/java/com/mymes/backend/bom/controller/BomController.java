package com.mymes.backend.bom.controller;

import com.mymes.backend.bom.dto.BomCreateRequest;
import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomUpdateRequest;
import com.mymes.backend.bom.service.BomService;
import com.mymes.backend.common.response.ApiResponse;
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
@RequestMapping("/api/boms")
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BomResponse>>> getByParentItemId(@RequestParam Long parentItemId) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.findByParentItemId(parentItemId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BomResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BomResponse>> create(@Valid @RequestBody BomCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(bomService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BomResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody BomUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
