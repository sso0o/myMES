package com.mymes.backend.user.controller;

import com.mymes.backend.common.response.ApiResponse;
import com.mymes.backend.security.SupabasePrincipal;
import com.mymes.backend.user.dto.PasswordResetRequest;
import com.mymes.backend.user.dto.ResignRequest;
import com.mymes.backend.user.dto.UserCreateRequest;
import com.mymes.backend.user.dto.UserResponse;
import com.mymes.backend.user.dto.UserUpdateRequest;
import com.mymes.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** 현재 로그인 유저 정보 */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @AuthenticationPrincipal SupabasePrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(userService.findBySupabaseId(principal.getUserId())));
    }

    /** 전체 유저 목록 */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(userService.findAll()));
    }

    /** 유저 단건 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.findById(id)));
    }

    /** 유저 등록 — 사번 자동채번 + Supabase Auth 계정 생성 */
    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(
            @Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(userService.create(request)));
    }

    /** 유저 정보 수정 (이름, 권한) */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.update(id, request)));
    }

    /** 관리자 비밀번호 초기화 */
    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody PasswordResetRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.noContent().build();
    }

    /** 퇴직 처리 — 퇴사일 입력, DB soft delete + Supabase Auth 계정 삭제 */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> resign(
            @PathVariable Long id,
            @Valid @RequestBody ResignRequest request) {
        userService.resign(id, request);
        return ResponseEntity.noContent().build();
    }
}
