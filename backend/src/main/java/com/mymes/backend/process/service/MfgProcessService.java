package com.mymes.backend.process.service;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.process.dto.ProcessCreateRequest;
import com.mymes.backend.process.dto.ProcessResponse;
import com.mymes.backend.process.dto.ProcessUpdateRequest;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.mapper.MfgProcessMapper;
import com.mymes.backend.process.repository.MfgProcessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MfgProcessService {

    private static final String PROCESS_CODE_PREFIX = "PROC-";
    private static final int MAX_PROCESS_CODE_RETRIES = 3;

    private final MfgProcessRepository processRepository;
    private final MfgProcessMapper processMapper;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 전체 공정 목록을 공정코드 오름차순으로 조회합니다.
     *
     * @return 공정 응답 목록
     */
    public List<ProcessResponse> findAll() {
        return processRepository.findAllByOrderByProcessCodeAsc().stream()
                .map(processMapper::toResponse)
                .toList();
    }

    /**
     * ID로 공정을 단건 조회합니다.
     *
     * @param id 공정 ID
     * @return 공정 응답 DTO
     * @throws BusinessException 공정이 존재하지 않을 경우 (PROCESS_NOT_FOUND)
     */
    public ProcessResponse findById(Long id) {
        return processMapper.toResponse(getProcess(id));
    }

    /**
     * 새 공정을 등록합니다. 공정코드는 자동 채번됩니다.
     *
     * @param request 공정 생성 요청 DTO
     * @return 생성된 공정 응답 DTO
     */
    @Transactional
    public ProcessResponse create(ProcessCreateRequest request) {
        CommonCode processType = resolveProcessType(request.getProcessTypeId());

        for (int attempt = 1; attempt <= MAX_PROCESS_CODE_RETRIES; attempt++) {
            String processCode = generateProcessCode();
            MfgProcess process = MfgProcess.builder()
                    .processCode(processCode)
                    .processName(request.getProcessName())
                    .processType(processType)
                    .standardTime(request.getStandardTime())
                    .description(request.getDescription())
                    .isActive(request.isActive())
                    .build();

            try {
                MfgProcess saved = processRepository.saveAndFlush(process);
                log.info("공정 생성 완료: id={}, code={}", saved.getId(), saved.getProcessCode());
                return processMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("공정 코드 충돌로 재시도합니다. attempt={}, processCode={}", attempt, processCode);
                if (attempt == MAX_PROCESS_CODE_RETRIES) {
                    throw e;
                }
            }
        }

        throw new IllegalStateException("공정 코드 생성 재시도 로직이 비정상 종료되었습니다.");
    }

    /**
     * 공정 정보를 수정합니다.
     *
     * @param id      공정 ID
     * @param request 공정 수정 요청 DTO
     * @return 수정된 공정 응답 DTO
     * @throws BusinessException 공정이 존재하지 않을 경우 (PROCESS_NOT_FOUND)
     */
    @Transactional
    public ProcessResponse update(Long id, ProcessUpdateRequest request) {
        MfgProcess process = getProcess(id);
        CommonCode processType = resolveProcessType(request.getProcessTypeId());
        process.update(request.getProcessName(), processType, request.getStandardTime(),
                request.getDescription(), request.isActive());
        log.info("공정 수정 완료: id={}", id);
        return processMapper.toResponse(process);
    }

    /**
     * 공정을 소프트 삭제합니다.
     *
     * @param id 공정 ID
     * @throws BusinessException 공정이 존재하지 않을 경우 (PROCESS_NOT_FOUND)
     */
    @Transactional
    public void delete(Long id) {
        MfgProcess process = getProcess(id);
        process.delete();
        log.info("공정 삭제 완료: id={}", id);
    }

    public MfgProcess getProcess(Long id) {
        return processRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_NOT_FOUND, String.valueOf(id)));
    }

    private CommonCode resolveProcessType(Long processTypeId) {
        if (processTypeId == null) return null;
        return commonCodeRepository.findById(processTypeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, String.valueOf(processTypeId)));
    }

    private String generateProcessCode() {
        MfgProcess latest = processRepository.findTopByProcessCodeStartingWithOrderByProcessCodeDesc(PROCESS_CODE_PREFIX);
        int nextSequence = latest == null ? 1 : extractSequence(latest.getProcessCode()) + 1;
        return PROCESS_CODE_PREFIX + String.format("%06d", nextSequence);
    }

    private int extractSequence(String processCode) {
        try {
            return Integer.parseInt(processCode.substring(PROCESS_CODE_PREFIX.length()));
        } catch (NumberFormatException e) {
            log.warn("채번 시퀀스 추출 실패, 1부터 시작합니다. processCode={}", processCode);
            return 0;
        }
    }
}
