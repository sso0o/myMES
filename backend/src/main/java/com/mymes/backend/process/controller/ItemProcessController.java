package com.mymes.backend.process.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.process.dto.ItemProcessCreateRequest;
import com.mymes.backend.process.dto.ItemProcessResponse;
import com.mymes.backend.process.dto.ItemProcessUpdateRequest;
import com.mymes.backend.process.service.ItemProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item-processes")
@RequiredArgsConstructor
public class ItemProcessController {

    private final ItemProcessService itemProcessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemProcessResponse>>> getByItemId(@RequestParam Long itemId) {
        return ResponseEntity.ok(ApiResponse.ok(itemProcessService.findByItemId(itemId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemProcessResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(itemProcessService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemProcessResponse>> create(@Valid @RequestBody ItemProcessCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(itemProcessService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemProcessResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ItemProcessUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(itemProcessService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemProcessService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
