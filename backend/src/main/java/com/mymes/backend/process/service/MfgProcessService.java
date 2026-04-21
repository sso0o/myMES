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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MfgProcessService {

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
        if (processRepository.existsByProcessCode(request.getProcessCode())) {
            throw new BusinessException(ErrorCode.PROCESS_CODE_DUPLICATED, request.getProcessCode());
        }
        MfgProcess process = MfgProcess.builder()
                .processCode(request.getProcessCode())
                .processName(request.getProcessName())
                .sequence(request.getSequence())
                .build();
        MfgProcess saved = processRepository.save(process);
        log.info("공정 생성 완료: id={}, code={}", saved.getId(), saved.getProcessCode());
        return processMapper.toResponse(saved);
    }

    @Transactional
    public ProcessResponse update(Long id, ProcessUpdateRequest request) {
        MfgProcess process = getProcess(id);
        if (processRepository.existsByProcessCodeAndIdNot(request.getProcessCode(), id)) {
            throw new BusinessException(ErrorCode.PROCESS_CODE_DUPLICATED, request.getProcessCode());
        }
        process.update(request.getProcessCode(), request.getProcessName(), request.getSequence());
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
}
