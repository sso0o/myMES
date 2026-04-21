package com.mymes.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import com.mymes.backend.security.SupabaseJwtFilter;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

	@MockBean
	private SupabaseJwtFilter supabaseJwtFilter;

	@Test
	void contextLoads() {
	}

}
