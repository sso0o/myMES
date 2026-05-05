package com.mymes.backend.bom.controller;

import com.mymes.backend.bom.dto.BomBulkCopyRequest;
import com.mymes.backend.bom.dto.BomBulkCopyResponse;
import com.mymes.backend.bom.dto.BomResponse;
import com.mymes.backend.bom.dto.BomSaveRequest;
import com.mymes.backend.bom.dto.BomVersionResponse;
import com.mymes.backend.bom.service.BomService;
import com.mymes.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/prod-basic/boms")
@RequiredArgsConstructor
public class BomController {

    private final BomService bomService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BomResponse>>> getByParentItemId(@RequestParam Long parentItemId) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.findByParentItemId(parentItemId)));
    }

    @GetMapping("/{parentItemId}/versions")
    public ResponseEntity<ApiResponse<List<BomVersionResponse>>> getVersionHistory(@PathVariable Long parentItemId) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.findVersionHistory(parentItemId)));
    }

    @GetMapping("/{parentItemId}/versions/{versionId}/lines")
    public ResponseEntity<ApiResponse<List<BomResponse>>> getVersionLines(
            @PathVariable Long parentItemId,
            @PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.findByVersion(parentItemId, versionId)));
    }

    @PostMapping("/{parentItemId}/save")
    public ResponseEntity<ApiResponse<List<BomResponse>>> save(
            @PathVariable Long parentItemId,
            @Valid @RequestBody BomSaveRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.save(parentItemId, request)));
    }

    @PostMapping("/{parentItemId}/versions/{versionId}/restore")
    public ResponseEntity<ApiResponse<List<BomResponse>>> restore(
            @PathVariable Long parentItemId,
            @PathVariable Long versionId) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.restore(parentItemId, versionId)));
    }

    @PostMapping("/copy")
    public ResponseEntity<ApiResponse<BomBulkCopyResponse>> bulkCopy(
            @Valid @RequestBody BomBulkCopyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(bomService.bulkCopy(request)));
    }
}
