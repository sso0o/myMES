package com.mymes.backend.security;

import lombok.Getter;

/**
 * Supabase 인증 사용자 정보를 담는 Principal 객체.
 * SecurityContextHolder에서 꺼내 컨트롤러에서 @AuthenticationPrincipal로 주입받을 수 있습니다.
 *
 * 사용 예:
 *   @GetMapping("/me")
 *   public ResponseEntity<?> getMe(@AuthenticationPrincipal SupabasePrincipal principal) {
 *       return ResponseEntity.ok(principal);
 *   }
 */
@Getter
public class SupabasePrincipal {

    private final String userId;   // Supabase user UUID (JWT sub 클레임)
    private final String email;    // 사용자 이메일
    private final String role;     // "authenticated" 또는 "anon"

    public SupabasePrincipal(String userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    @Override
    public String toString() {
        return "SupabasePrincipal{userId='" + userId + "', email='" + email + "', role='" + role + "'}";
    }
}
