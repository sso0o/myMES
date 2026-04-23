package com.mymes.backend.security;

import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class SupabaseJwtFilterTest {

    @Test
    void unexpectedJwtParsingErrorDoesNotBreakFilterChain() {
        SupabaseJwtFilter filter = new SupabaseJwtFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        request.addHeader("Authorization", "Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJ1c2VyLTEifQ.");

        @SuppressWarnings("unchecked")
        Map<String, Object> keyById =
                (Map<String, Object>) ReflectionTestUtils.getField(filter, "keyById");
        if (keyById != null) {
            keyById.clear();
        }

        assertThatCode(() -> filter.doFilterInternal(request, response, chain))
                .doesNotThrowAnyException();
    }

    @Test
    void invalidJwtClearsSecurityContext() throws ServletException, IOException {
        SupabaseJwtFilter filter = new SupabaseJwtFilter();
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        SecurityContextHolder.getContext().setAuthentication(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        "stale-user",
                        null
                )
        );

        request.addHeader("Authorization", "Bearer invalid.token.value");

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
