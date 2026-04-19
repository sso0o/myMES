package com.mymes.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Header;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Jwk;
import io.jsonwebtoken.security.JwkSet;
import io.jsonwebtoken.security.Jwks;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.PublicKey;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Supabase가 발급한 JWT를 검증하는 필터.
 * Supabase JWKS 엔드포인트에서 공개키(ECC P-256, ES256)를 로드하여 서명을 검증합니다.
 * Authorization: Bearer <token> 헤더를 파싱하여 Spring Security 컨텍스트에 사용자 정보를 설정합니다.
 */
@Slf4j
@Component
public class SupabaseJwtFilter extends OncePerRequestFilter {

    @Value("${supabase.url}")
    private String supabaseUrl;

    /** kid → PublicKey 맵 (JWKS 엔드포인트에서 로드) */
    private final Map<String, PublicKey> keyById = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        try {
            String jwksUrl = supabaseUrl + "/auth/v1/.well-known/jwks.json";
            log.info("Supabase JWKS 로드 중: {}", jwksUrl);

            URL url = URI.create(jwksUrl).toURL();
            try (InputStream is = url.openStream()) {
                String jwksJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JwkSet jwkSet = Jwks.setParser().build().parse(jwksJson);

                for (Jwk<?> jwk : jwkSet.getKeys()) {
                    Key key = jwk.toKey();
                    if (key instanceof PublicKey publicKey) {
                        String kid = jwk.getId() != null ? jwk.getId() : "key-" + keyById.size();
                        keyById.put(kid, publicKey);
                        log.info("공개키 로드: kid={}, type={}", kid, key.getAlgorithm());
                    }
                }
            }
            log.info("Supabase JWKS 로드 완료: {}개 공개키", keyById.size());

            if (keyById.isEmpty()) {
                throw new IllegalStateException("JWKS에서 유효한 공개키를 찾을 수 없음");
            }
        } catch (Exception e) {
            log.error("Supabase JWKS 로드 실패: {}", e.getMessage(), e);
            throw new IllegalStateException("Supabase JWKS 초기화 실패", e);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractBearerToken(request);

        if (token != null) {
            try {
                Claims claims = Jwts.parser()
                        .keyLocator(this::findKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String userId = claims.getSubject();
                String email  = claims.get("email", String.class);
                String role   = claims.get("role", String.class);
                if (role == null) role = "authenticated";

                SupabasePrincipal principal = new SupabasePrincipal(userId, email, role);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.debug("Supabase JWT 인증 성공: userId={}, email={}", userId, email);

            } catch (JwtException e) {
                log.warn("유효하지 않은 Supabase JWT: {}", e.getMessage());
                // 토큰 검증 실패 시 필터 체인 계속 진행 (SecurityConfig에서 권한 처리)
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * JJWT KeyLocator: JWT 헤더의 kid 값으로 공개키를 찾아 반환.
     * kid가 없거나 매칭 안 되면 첫 번째 공개키를 사용.
     */
    @SuppressWarnings("rawtypes")
    private Key findKey(Header header) {
        Object kid = header.get("kid");
        if (kid instanceof String kidStr && keyById.containsKey(kidStr)) {
            return keyById.get(kidStr);
        }
        // kid 없거나 매칭 실패 → 첫 번째 키 시도
        return keyById.values().iterator().next();
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
