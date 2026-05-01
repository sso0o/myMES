package com.mymes.backend.item.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.common.response.PageResponse;
import com.mymes.backend.item.dto.ItemCreateRequest;
import com.mymes.backend.item.dto.ItemResponse;
import com.mymes.backend.item.dto.ItemUpdateRequest;
import com.mymes.backend.item.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    /**
     * 품목 목록을 페이지 단위로 조회합니다.
     *
     * @param page 페이지 번호 (0부터 시작, 기본값: 0)
     * @param size 페이지당 항목 수 (기본값: 20)
     * @return 품목 목록과 페이지 메타 정보
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ItemResponse> result = itemService.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(
                result.getContent(),
                PageResponse.of(page, size, result.getTotalElements())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> create(@Valid @RequestBody ItemCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(itemService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ItemUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
