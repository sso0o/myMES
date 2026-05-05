package com.mymes.backend.worker.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.worker.dto.request.WorkerCreateRequest;
import com.mymes.backend.worker.dto.request.WorkerResignRequest;
import com.mymes.backend.worker.dto.request.WorkerUpdateRequest;
import com.mymes.backend.worker.dto.response.WorkerResponse;
import com.mymes.backend.worker.service.WorkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/operation/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    /**
     * 전체 작업자 목록을 조회합니다.
     *
     * @return 작업자 응답 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkerResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(workerService.findAll()));
    }

    /**
     * ID로 작업자를 단건 조회합니다.
     *
     * @param id 작업자 ID
     * @return 작업자 응답 DTO
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(workerService.findById(id)));
    }

    /**
     * 작업자를 등록합니다.
     *
     * @param request 작업자 생성 요청 DTO
     * @return 생성된 작업자 응답 DTO
     */
    @PostMapping
    public ResponseEntity<ApiResponse<WorkerResponse>> create(
            @Valid @RequestBody WorkerCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(workerService.create(request)));
    }

    /**
     * 작업자를 수정합니다.
     *
     * @param id      작업자 ID
     * @param request 작업자 수정 요청 DTO
     * @return 수정된 작업자 응답 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody WorkerUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workerService.update(id, request)));
    }

    /**
     * 작업자를 퇴사 처리합니다.
     *
     * @param id      작업자 ID
     * @param request 퇴사 처리 요청 DTO
     * @return 퇴사 처리된 작업자 응답 DTO
     */
    @PatchMapping("/{id}/resign")
    public ResponseEntity<ApiResponse<WorkerResponse>> resign(
            @PathVariable Long id,
            @Valid @RequestBody WorkerResignRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(workerService.resign(id, request)));
    }

    /**
     * 작업자를 소프트 삭제합니다.
     *
     * @param id 작업자 ID
     * @return 응답 없음
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
