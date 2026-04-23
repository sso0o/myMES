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

    /** 전체 사용자 목록을 조회한다. */
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    /** ID로 사용자를 조회한다. */
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getUser(id));
    }

    /** Supabase 사용자 ID로 사용자를 조회한다. */
    public UserResponse findBySupabaseId(String supabaseId) {
        return userMapper.toResponse(
                userRepository.findBySupabaseId(supabaseId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, supabaseId))
        );
    }

    /**
     * 사용자를 등록한다.
     * 1) 사번을 자동 채번한다.
     * 2) Supabase Auth 계정을 생성한다.
     * 3) 로컬 DB에 사용자 정보를 저장한다.
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
        log.info("사용자 생성 완료: id={}, empNo={}, email={}", saved.getId(), saved.getEmpNo(), email);
        return userMapper.toResponse(saved);
    }

    /** 사용자 이름과 권한을 수정한다. */
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getUser(id);
        user.update(request.getName(), request.getRole());
        log.info("사용자 수정 완료: id={}, empNo={}", id, user.getEmpNo());
        return userMapper.toResponse(user);
    }

    /** 관리자가 사용자의 비밀번호를 초기화하고 Supabase Auth에도 반영한다. */
    @Transactional
    public void resetPassword(Long id, PasswordResetRequest request) {
        User user = getUser(id);
        supabaseAdminClient.updatePassword(user.getSupabaseId(), request.getNewPassword());
        log.info("비밀번호 초기화 완료: id={}, empNo={}", id, user.getEmpNo());
    }

    /**
     * 퇴사 처리를 등록한다.
     * 실제 계정 삭제는 스케줄러가 퇴사일 이후에 후속 처리한다.
     */
    @Transactional
    public void resign(Long id, ResignRequest request) {
        User user = getUser(id);
        user.scheduleResign(request.getResignedAt());
        log.info("퇴사 처리 등록 완료: id={}, empNo={}, resignedAt={}", id, user.getEmpNo(), request.getResignedAt());
    }

    /** ID로 사용자 엔티티를 조회한다. */
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, String.valueOf(id)));
    }

    /** Supabase 사용자 ID로 사용자 엔티티를 조회한다. */
    public User getUserBySupabaseId(String supabaseId) {
        return userRepository.findBySupabaseId(supabaseId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, supabaseId));
    }

    /**
     * 다음 사번을 자동 채번한다.
     * mes 접두사의 마지막 번호에서 1 증가시키고 zero-padding을 적용한다.
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

    /** 사번을 Supabase 로그인용 이메일 형식으로 변환한다. */
    public String toEmail(String empNo) {
        return empNo + "@" + empEmailDomain;
    }
}
