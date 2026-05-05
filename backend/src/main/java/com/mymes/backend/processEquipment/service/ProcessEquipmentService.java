package com.mymes.backend.processEquipment.service;

import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.service.EquipmentService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentCreateRequest;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentResponse;
import com.mymes.backend.processEquipment.dto.ProcessEquipmentUpdateRequest;
import com.mymes.backend.processEquipment.entity.ProcessEquipment;
import com.mymes.backend.processEquipment.mapper.ProcessEquipmentMapper;
import com.mymes.backend.processEquipment.repository.ProcessEquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcessEquipmentService {

    private final ProcessEquipmentRepository processEquipmentRepository;
    private final ProcessEquipmentMapper processEquipmentMapper;
    private final MfgProcessService processService;
    private final EquipmentService equipmentService;

    /**
     * 공정 ID를 기준으로 배정된 설비 목록을 조회합니다. 주 설비가 먼저 정렬됩니다.
     *
     * @param processId 공정 ID
     * @return 공정-설비 배정 응답 목록
     */
    public List<ProcessEquipmentResponse> findByProcessId(Long processId) {
        return processEquipmentRepository
                .findByProcessIdOrderByIsPrimaryDescCreatedAtAsc(processId).stream()
                .map(processEquipmentMapper::toResponse)
                .toList();
    }

    /**
     * 설비 ID를 기준으로 배정된 공정 목록을 조회합니다. 주 설비로 지정된 항목이 먼저 정렬됩니다.
     *
     * @param equipmentId 설비 ID
     * @return 공정-설비 배정 응답 목록
     */
    public List<ProcessEquipmentResponse> findByEquipmentId(Long equipmentId) {
        return processEquipmentRepository
                .findByEquipmentIdOrderByIsPrimaryDescCreatedAtAsc(equipmentId).stream()
                .map(processEquipmentMapper::toResponse)
                .toList();
    }

    /**
     * ID로 공정-설비 배정을 단건 조회합니다.
     *
     * @param id 공정-설비 배정 ID
     * @return 공정-설비 배정 응답 DTO
     * @throws BusinessException 배정이 존재하지 않을 경우 (PROCESS_EQUIPMENT_NOT_FOUND)
     */
    public ProcessEquipmentResponse findById(Long id) {
        return processEquipmentMapper.toResponse(getProcessEquipment(id));
    }

    /**
     * 공정에 설비를 배정합니다.
     *
     * @param request 배정 생성 요청 DTO (processId, equipmentId, isPrimary)
     * @return 생성된 배정 응답 DTO
     * @throws BusinessException 공정이 존재하지 않을 경우 (PROCESS_NOT_FOUND)
     * @throws BusinessException 설비가 존재하지 않을 경우 (EQUIPMENT_NOT_FOUND)
     * @throws BusinessException 해당 공정-설비 조합이 이미 등록된 경우 (PROCESS_EQUIPMENT_DUPLICATED)
     */
    @Transactional
    public ProcessEquipmentResponse create(ProcessEquipmentCreateRequest request) {
        MfgProcess process = processService.getProcess(request.getProcessId());
        Equipment equipment = equipmentService.getEquipment(request.getEquipmentId());

        if (processEquipmentRepository.existsByProcessIdAndEquipmentId(request.getProcessId(), request.getEquipmentId())) {
            throw new BusinessException(ErrorCode.PROCESS_EQUIPMENT_DUPLICATED);
        }

        ProcessEquipment saved = processEquipmentRepository.save(
                ProcessEquipment.builder()
                        .process(process)
                        .equipment(equipment)
                        .isPrimary(request.isPrimary())
                        .build()
        );

        log.info("공정-설비 배정 완료: id={}, processId={}, equipmentId={}, isPrimary={}",
                saved.getId(), process.getId(), equipment.getId(), saved.isPrimary());
        return processEquipmentMapper.toResponse(saved);
    }

    /**
     * 공정-설비 배정의 주 설비 여부를 수정합니다.
     *
     * @param id      배정 ID
     * @param request 수정 요청 DTO (isPrimary)
     * @return 수정된 배정 응답 DTO
     * @throws BusinessException 배정이 존재하지 않을 경우 (PROCESS_EQUIPMENT_NOT_FOUND)
     */
    @Transactional
    public ProcessEquipmentResponse update(Long id, ProcessEquipmentUpdateRequest request) {
        ProcessEquipment processEquipment = getProcessEquipment(id);
        processEquipment.updateIsPrimary(request.getIsPrimary());
        log.info("공정-설비 배정 수정 완료: id={}, isPrimary={}", id, request.getIsPrimary());
        return processEquipmentMapper.toResponse(processEquipment);
    }

    /**
     * 공정-설비 배정을 소프트 삭제합니다.
     *
     * @param id 배정 ID
     * @throws BusinessException 배정이 존재하지 않을 경우 (PROCESS_EQUIPMENT_NOT_FOUND)
     */
    @Transactional
    public void delete(Long id) {
        ProcessEquipment processEquipment = getProcessEquipment(id);
        processEquipment.delete();
        log.info("공정-설비 배정 삭제 완료: id={}", id);
    }

    /**
     * ID로 공정-설비 배정 엔티티를 조회합니다.
     *
     * @param id 배정 ID
     * @return 공정-설비 배정 엔티티
     * @throws BusinessException 배정이 존재하지 않을 경우 (PROCESS_EQUIPMENT_NOT_FOUND)
     */
    public ProcessEquipment getProcessEquipment(Long id) {
        return processEquipmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROCESS_EQUIPMENT_NOT_FOUND, String.valueOf(id)));
    }
}
