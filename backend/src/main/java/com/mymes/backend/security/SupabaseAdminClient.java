package com.mymes.backend.security;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Supabase Admin REST API 클라이언트.
 * 사용자 생성·비밀번호 변경·삭제 등 서버 사이드에서만 가능한 작업 수행.
 * service_role 키를 사용하므로 절대 프론트엔드에 노출 금지.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseAdminClient {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    private final RestTemplate restTemplate;

    /** Supabase Auth에 유저 생성. 이미 존재하면 기존 유저 반환. */
    public SupabaseAuthUser createUser(String email, String password) {
        HttpHeaders headers = adminHeaders();
        Map<String, Object> body = Map.of(
                "email", email,
                "password", password,
                "email_confirm", true   // 이메일 인증 없이 바로 활성화
        );

        try {
            ResponseEntity<SupabaseAuthUser> response = restTemplate.exchange(
                    supabaseUrl + "/auth/v1/admin/users",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    SupabaseAuthUser.class
            );
            log.info("Supabase Auth 유저 생성 완료: email={}", email);
            return response.getBody();
        } catch (HttpClientErrorException e) {
            log.error("Supabase Auth 유저 생성 실패: email={}, status={}, body={}",
                    email, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(ErrorCode.SUPABASE_USER_CREATE_FAILED);
        }
    }

    /** Supabase Auth 유저 비밀번호 변경 */
    public void updatePassword(String supabaseId, String newPassword) {
        HttpHeaders headers = adminHeaders();
        Map<String, Object> body = Map.of("password", newPassword);

        try {
            restTemplate.exchange(
                    supabaseUrl + "/auth/v1/admin/users/" + supabaseId,
                    HttpMethod.PUT,
                    new HttpEntity<>(body, headers),
                    Void.class
            );
            log.info("Supabase Auth 비밀번호 변경 완료: supabaseId={}", supabaseId);
        } catch (HttpClientErrorException e) {
            log.error("Supabase Auth 비밀번호 변경 실패: supabaseId={}, status={}", supabaseId, e.getStatusCode());
            throw new BusinessException(ErrorCode.SUPABASE_USER_UPDATE_FAILED);
        }
    }

    /** Supabase Auth 유저 삭제 */
    public void deleteUser(String supabaseId) {
        try {
            restTemplate.exchange(
                    supabaseUrl + "/auth/v1/admin/users/" + supabaseId,
                    HttpMethod.DELETE,
                    new HttpEntity<>(adminHeaders()),
                    Void.class
            );
            log.info("Supabase Auth 유저 삭제 완료: supabaseId={}", supabaseId);
        } catch (HttpClientErrorException e) {
            log.error("Supabase Auth 유저 삭제 실패: supabaseId={}, status={}", supabaseId, e.getStatusCode());
            throw new BusinessException(ErrorCode.SUPABASE_USER_DELETE_FAILED);
        }
    }

    private HttpHeaders adminHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", serviceRoleKey);          // Supabase 필수 헤더
        headers.setBearerAuth(serviceRoleKey);
        return headers;
    }

    /** Supabase Admin API 응답 중 필요한 필드만 매핑 */
    @Getter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SupabaseAuthUser {
        private String id;    // Supabase UUID
        private String email;
        @JsonProperty("created_at")
        private String createdAt;
    }
}
