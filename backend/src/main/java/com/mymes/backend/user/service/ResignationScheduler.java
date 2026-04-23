package com.mymes.backend.user.service;

import com.mymes.backend.security.SupabaseAdminClient;
import com.mymes.backend.user.entity.User;
import com.mymes.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 매일 자정, 퇴사일이 도래한 유저의 계정을 실제로 처리하는 스케줄러.
 * - Supabase Auth 계정 삭제 (로그인 불가)
 * - DB soft delete + active = false
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ResignationScheduler {

    private final UserRepository userRepository;
    private final SupabaseAdminClient supabaseAdminClient;

    @Scheduled(cron = "0 0 0 * * *")   // 매일 자정 실행
    @Transactional
    public void processResignations() {
        LocalDate today = LocalDate.now();
        List<User> targets = userRepository.findUsersToResign(today);

        if (targets.isEmpty()) {
            log.debug("처리할 퇴직 유저 없음: {}", today);
            return;
        }

        log.info("퇴직 처리 시작: {}명, 기준일={}", targets.size(), today);

        for (User user : targets) {
            try {
                supabaseAdminClient.deleteUser(user.getSupabaseId());
                user.processResignation();
                log.info("퇴직 처리 완료: empNo={}, resignedAt={}", user.getEmpNo(), user.getResignedAt());
            } catch (Exception e) {
                log.error("퇴직 처리 실패: empNo={}, error={}", user.getEmpNo(), e.getMessage());
                // 한 명 실패해도 나머지는 계속 처리
            }
        }

        log.info("퇴직 처리 완료: {}명", targets.size());
    }
}
