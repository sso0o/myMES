package com.mymes.backend.process.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.process.dto.ProcessCreateRequest;
import com.mymes.backend.process.dto.ProcessResponse;
import com.mymes.backend.process.dto.ProcessUpdateRequest;
import com.mymes.backend.process.service.MfgProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prod-basic/processes")
@RequiredArgsConstructor
public class MfgProcessController {

    private final MfgProcessService processService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProcessResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(processService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(processService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProcessResponse>> create(@Valid @RequestBody ProcessCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(processService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProcessResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProcessUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(processService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        processService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
