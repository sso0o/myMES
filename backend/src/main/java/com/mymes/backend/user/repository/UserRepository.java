package com.mymes.backend.user.repository;

import com.mymes.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmpNo(String empNo);

    Optional<User> findBySupabaseId(String supabaseId);

    boolean existsByEmpNo(String empNo);

    /** 사번 자동채번용: mes 로 시작하는 사번 중 가장 마지막 것 조회 */
    Optional<User> findTopByEmpNoStartingWithOrderByEmpNoDesc(String prefix);

    /** 스케줄러용: 퇴사일이 오늘 이하이고 아직 active 상태인 유저 조회 */
    @org.springframework.data.jpa.repository.Query(
        "SELECT u FROM User u WHERE u.resignedAt <= :today AND u.active = true"
    )
    java.util.List<User> findUsersToResign(@org.springframework.data.repository.query.Param("today") java.time.LocalDate today);
}
