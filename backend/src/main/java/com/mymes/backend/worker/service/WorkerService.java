package com.mymes.backend.worker.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.worker.dto.request.WorkerCreateRequest;
import com.mymes.backend.worker.dto.request.WorkerResignRequest;
import com.mymes.backend.worker.dto.request.WorkerUpdateRequest;
import com.mymes.backend.worker.dto.response.WorkerResponse;
import com.mymes.backend.worker.entity.Worker;
import com.mymes.backend.worker.entity.WorkerStatus;
import com.mymes.backend.worker.mapper.WorkerMapper;
import com.mymes.backend.worker.repository.WorkerRepository;
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
public class WorkerService {

    private static final String WORKER_CODE_PREFIX = "W";
    private static final int WORKER_CODE_LENGTH = 4;
    private static final int MAX_CODE_RETRIES = 3;

    private final WorkerRepository workerRepository;
    private final WorkerMapper workerMapper;

    /**
     * 전체 작업자 목록을 작업자코드 오름차순으로 조회합니다.
     *
     * @return 작업자 응답 목록
     */
    public List<WorkerResponse> findAll() {
        return workerRepository.findAllByOrderByWorkerCodeAsc().stream()
                .map(workerMapper::toResponse)
                .toList();
    }

    /**
     * ID로 작업자를 단건 조회합니다.
     *
     * @param id 작업자 ID
     * @return 작업자 응답 DTO
     * @throws BusinessException 작업자가 존재하지 않을 경우 (WORKER_NOT_FOUND)
     */
    public WorkerResponse findById(Long id) {
        return workerMapper.toResponse(getWorker(id));
    }

    /**
     * 작업자를 등록합니다. 작업자코드는 퇴사자와 삭제된 작업자를 포함하여 자동 채번됩니다.
     *
     * @param request 작업자 생성 요청 DTO
     * @return 생성된 작업자 응답 DTO
     */
    @Transactional
    public WorkerResponse create(WorkerCreateRequest request) {
        for (int attempt = 1; attempt <= MAX_CODE_RETRIES; attempt++) {
            String workerCode = generateWorkerCode();
            Worker worker = Worker.builder()
                    .workerCode(workerCode)
                    .workerName(request.getWorkerName())
                    .phone(request.getPhone())
                    .department(request.getDepartment())
                    .jobTitle(request.getJobTitle())
                    .status(WorkerStatus.ACTIVE)
                    .hireDate(request.getHireDate())
                    .description(request.getDescription())
                    .build();

            try {
                Worker saved = workerRepository.saveAndFlush(worker);
                log.info("작업자 생성 완료: id={}, workerCode={}", saved.getId(), saved.getWorkerCode());
                return workerMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("작업자코드 충돌로 재시도합니다. attempt={}, workerCode={}", attempt, workerCode);
                if (attempt == MAX_CODE_RETRIES) {
                    throw new BusinessException(ErrorCode.WORKER_CODE_GENERATION_FAILED, workerCode);
                }
            }
        }

        throw new BusinessException(ErrorCode.WORKER_CODE_GENERATION_FAILED);
    }

    /**
     * 작업자 정보를 수정합니다.
     *
     * @param id      작업자 ID
     * @param request 작업자 수정 요청 DTO
     * @return 수정된 작업자 응답 DTO
     * @throws BusinessException 작업자가 존재하지 않을 경우 (WORKER_NOT_FOUND)
     * @throws BusinessException 퇴사 상태인데 퇴사일이 없을 경우 (WORKER_RESIGNED_AT_REQUIRED)
     */
    @Transactional
    public WorkerResponse update(Long id, WorkerUpdateRequest request) {
        validateResignedAt(request.getStatus(), request.getResignedAt());
        Worker worker = getWorker(id);
        worker.update(request.getWorkerName(), request.getPhone(), request.getDepartment(),
                request.getJobTitle(), request.getStatus(), request.getHireDate(),
                request.getResignedAt(), request.getDescription());
        log.info("작업자 수정 완료: id={}, workerCode={}", id, worker.getWorkerCode());
        return workerMapper.toResponse(worker);
    }

    /**
     * 작업자를 퇴사 처리합니다.
     *
     * @param id      작업자 ID
     * @param request 퇴사 처리 요청 DTO
     * @return 퇴사 처리된 작업자 응답 DTO
     * @throws BusinessException 작업자가 존재하지 않을 경우 (WORKER_NOT_FOUND)
     */
    @Transactional
    public WorkerResponse resign(Long id, WorkerResignRequest request) {
        Worker worker = getWorker(id);
        worker.resign(request.getResignedAt());
        log.info("작업자 퇴사 처리 완료: id={}, workerCode={}, resignedAt={}",
                id, worker.getWorkerCode(), request.getResignedAt());
        return workerMapper.toResponse(worker);
    }

    /**
     * 작업자를 소프트 삭제합니다.
     *
     * @param id 작업자 ID
     * @throws BusinessException 작업자가 존재하지 않을 경우 (WORKER_NOT_FOUND)
     */
    @Transactional
    public void delete(Long id) {
        Worker worker = getWorker(id);
        worker.delete();
        log.info("작업자 삭제 완료: id={}, workerCode={}", id, worker.getWorkerCode());
    }

    /**
     * ID로 작업자 엔티티를 조회합니다.
     *
     * @param id 작업자 ID
     * @return 작업자 엔티티
     * @throws BusinessException 작업자가 존재하지 않을 경우 (WORKER_NOT_FOUND)
     */
    public Worker getWorker(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORKER_NOT_FOUND, String.valueOf(id)));
    }

    private void validateResignedAt(WorkerStatus status, java.time.LocalDate resignedAt) {
        if (status == WorkerStatus.RESIGNED && resignedAt == null) {
            throw new BusinessException(ErrorCode.WORKER_RESIGNED_AT_REQUIRED);
        }
    }

    private String generateWorkerCode() {
        int nextSequence = workerRepository.findLatestWorkerCode(WORKER_CODE_PREFIX)
                .map(this::extractSequence)
                .orElse(0) + 1;
        return WORKER_CODE_PREFIX + String.format("%0" + WORKER_CODE_LENGTH + "d", nextSequence);
    }

    private int extractSequence(String workerCode) {
        try {
            return Integer.parseInt(workerCode.substring(WORKER_CODE_PREFIX.length()));
        } catch (NumberFormatException | IndexOutOfBoundsException e) {
            log.warn("작업자코드 채번 시퀀스 추출 실패, 1부터 시작합니다. workerCode={}", workerCode);
            return 0;
        }
    }
}
