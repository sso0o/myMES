package com.mymes.backend.process.service;

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

    public List<ProcessResponse> findAll() {
        return processRepository.findAllByOrderBySequenceAsc().stream()
                .map(processMapper::toResponse)
                .toList();
    }

    public ProcessResponse findById(Long id) {
        return processMapper.toResponse(getProcess(id));
    }

    @Transactional
    public ProcessResponse create(ProcessCreateRequest request) {
        for (int attempt = 1; attempt <= MAX_PROCESS_CODE_RETRIES; attempt++) {
            String processCode = generateProcessCode();
            MfgProcess process = MfgProcess.builder()
                    .processCode(processCode)
                    .processName(request.getProcessName())
                    .sequence(request.getSequence())
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

    @Transactional
    public ProcessResponse update(Long id, ProcessUpdateRequest request) {
        MfgProcess process = getProcess(id);
        process.update(request.getProcessName(), request.getSequence());
        log.info("공정 수정 완료: id={}", id);
        return processMapper.toResponse(process);
    }

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

    private String generateProcessCode() {
        MfgProcess latest = processRepository.findTopByProcessCodeStartingWithOrderByProcessCodeDesc(PROCESS_CODE_PREFIX);
        int nextSequence = latest == null ? 1 : extractSequence(latest.getProcessCode()) + 1;
        return PROCESS_CODE_PREFIX + String.format("%06d", nextSequence);
    }

    private int extractSequence(String processCode) {
        return Integer.parseInt(processCode.substring(PROCESS_CODE_PREFIX.length()));
    }
}
