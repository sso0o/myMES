package com.mymes.backend.user.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.security.SupabaseAdminClient;
import com.mymes.backend.security.SupabaseAdminClient.SupabaseAuthUser;
import com.mymes.backend.user.dto.PasswordResetRequest;
import com.mymes.backend.user.dto.ResignRequest;
import com.mymes.backend.user.dto.UserCreateRequest;
import com.mymes.backend.user.dto.UserResponse;
import com.mymes.backend.user.dto.UserUpdateRequest;
import com.mymes.backend.user.entity.User;
import com.mymes.backend.user.mapper.UserMapper;
import com.mymes.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private static final String EMP_NO_PREFIX = "mes";
    private static final int EMP_NO_DIGITS = 3;   // mes001 ~ mes999

    @Value("${app.emp-email-domain}")
    private String empEmailDomain;

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SupabaseAdminClient supabaseAdminClient;

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    public UserResponse findBySupabaseId(String supabaseId) {
        return userMapper.toResponse(
                userRepository.findBySupabaseId(supabaseId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, supabaseId))
        );
    }

    /**
     * 유저 등록.
     * 1) 사번 자동채번
     * 2) Supabase Auth에 {사번}@{도메인} 계정 생성
     * 3) 로컬 DB에 프로필 저장
     */
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        String empNo = generateEmpNo();
        String email = empNo + "@" + empEmailDomain;

        SupabaseAuthUser authUser = supabaseAdminClient.createUser(email, request.getPassword());

        User user = User.builder()
                .supabaseId(authUser.getId())
                .empNo(empNo)
                .name(request.getName())
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);
        log.info("유저 생성 완료: id={}, empNo={}, email={}", saved.getId(), saved.getEmpNo(), email);
        return userMapper.toResponse(saved);
    }

    /** 이름·권한 수정 */
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUser(id);
        user.update(request.getName(), request.getRole());
        log.info("유저 수정 완료: id={}, empNo={}", id, user.getEmpNo());
        return userMapper.toResponse(user);
    }

    /** 관리자 비밀번호 초기화 — Supabase Auth에 직접 반영 */
    @Transactional
    public void resetPassword(Long id, PasswordResetRequest request) {
        User user = getUser(id);
        supabaseAdminClient.updatePassword(user.getSupabaseId(), request.getNewPassword());
        log.info("비밀번호 초기화 완료: id={}, empNo={}", id, user.getEmpNo());
    }

    /**
     * 퇴직 처리.
     * - DB: active=false + soft delete
     * - Supabase Auth: 계정 삭제 (재입사 시 새 사번·새 계정)
     */
    /** 퇴사일 예약 — 당일까지 로그인 가능, 실제 계정 삭제는 스케줄러가 처리 */
    @Transactional
    public void resign(Long id, ResignRequest request) {
        User user = getUser(id);
        user.scheduleResign(request.getResignedAt());
        log.info("퇴사일 등록 완료: id={}, empNo={}, resignedAt={}", id, user.getEmpNo(), request.getResignedAt());
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, String.valueOf(id)));
    }

    /**
     * 사번 자동채번.
     * mes 로 시작하는 마지막 사번 숫자에서 +1 후 zero-padding.
     */
    private synchronized String generateEmpNo() {
        int next = userRepository.findTopByEmpNoStartingWithOrderByEmpNoDesc(EMP_NO_PREFIX)
                .map(u -> Integer.parseInt(u.getEmpNo().substring(EMP_NO_PREFIX.length())) + 1)
                .orElse(1);

        String empNo = EMP_NO_PREFIX + String.format("%0" + EMP_NO_DIGITS + "d", next);
        if (userRepository.existsByEmpNo(empNo)) {
            throw new BusinessException(ErrorCode.USER_EMP_NO_GENERATION_FAILED);
        }
        return empNo;
    }

    /** 사번으로 Supabase 이메일 변환 */
    public String toEmail(String empNo) {
        return empNo + "@" + empEmailDomain;
    }
}
