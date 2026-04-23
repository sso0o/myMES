package com.mymes.backend.code.controller;

import com.mymes.backend.code.dto.*;
import com.mymes.backend.code.service.CodeGroupService;
import com.mymes.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/code-groups")
@RequiredArgsConstructor
public class CodeGroupController {

    private final CodeGroupService codeGroupService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CodeGroupResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(codeGroupService.findAll()));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<CodeGroupResponse>> getByGroupId(@PathVariable String groupId) {
        return ResponseEntity.ok(ApiResponse.ok(codeGroupService.findByGroupId(groupId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CodeGroupResponse>> create(@Valid @RequestBody CodeGroupCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(codeGroupService.create(request)));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<ApiResponse<CodeGroupResponse>> update(
            @PathVariable String groupId,
            @Valid @RequestBody CodeGroupUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(codeGroupService.update(groupId, request)));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> delete(@PathVariable String groupId) {
        codeGroupService.delete(groupId);
        return ResponseEntity.noContent().build();
    }

    // 코드 항목 관리 (그룹 하위)

    @GetMapping("/{groupId}/codes")
    public ResponseEntity<ApiResponse<List<CommonCodeResponse>>> getCodes(@PathVariable String groupId) {
        return ResponseEntity.ok(ApiResponse.ok(codeGroupService.findCodes(groupId)));
    }

    @PostMapping("/{groupId}/codes")
    public ResponseEntity<ApiResponse<CommonCodeResponse>> createCode(
            @PathVariable String groupId,
            @Valid @RequestBody CommonCodeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(codeGroupService.createCode(groupId, request)));
    }

    @PutMapping("/{groupId}/codes/{codeId}")
    public ResponseEntity<ApiResponse<CommonCodeResponse>> updateCode(
            @PathVariable String groupId,
            @PathVariable Long codeId,
            @Valid @RequestBody CommonCodeUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(codeGroupService.updateCode(groupId, codeId, request)));
    }

    @DeleteMapping("/{groupId}/codes/{codeId}")
    public ResponseEntity<Void> deleteCode(
            @PathVariable String groupId,
            @PathVariable Long codeId) {
        codeGroupService.deleteCode(groupId, codeId);
        return ResponseEntity.noContent().build();
    }
}
