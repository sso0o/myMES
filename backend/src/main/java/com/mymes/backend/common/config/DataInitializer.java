package com.mymes.backend.common.config;

import com.mymes.backend.security.SupabaseAdminClient;
import com.mymes.backend.security.SupabaseAdminClient.SupabaseAuthUser;
import com.mymes.backend.user.entity.User;
import com.mymes.backend.user.entity.UserRole;
import com.mymes.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private static final String ADMIN_EMP_NO       = "admin";
    private static final String ADMIN_DEFAULT_PASSWORD = "admin1234";

    @Value("${app.emp-email-domain}")
    private String empEmailDomain;

    private final UserRepository userRepository;
    private final SupabaseAdminClient supabaseAdminClient;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmpNo(ADMIN_EMP_NO)) {
            log.info("admin 계정이 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        String adminEmail = ADMIN_EMP_NO + "@" + empEmailDomain;

        try {
            SupabaseAuthUser authUser = supabaseAdminClient.createUser(adminEmail, ADMIN_DEFAULT_PASSWORD);

            User admin = User.builder()
                    .supabaseId(authUser.getId())
                    .empNo(ADMIN_EMP_NO)
                    .name("시스템 관리자")
                    .role(UserRole.ADMIN)
                    .build();

            userRepository.save(admin);
            log.warn("========================================");
            log.warn("admin 계정 초기 생성 완료");
            log.warn("  사번(로그인ID) : {}", ADMIN_EMP_NO);
            log.warn("  이메일        : {}", adminEmail);
            log.warn("  초기 비밀번호  : {} ← 반드시 변경하세요!", ADMIN_DEFAULT_PASSWORD);
            log.warn("========================================");

        } catch (Exception e) {
            log.error("admin 계정 초기화 실패: {}", e.getMessage());
            // 서버 기동은 계속 진행 (Supabase 연결 불가 환경 등)
        }
    }
}
