package com.mymes.backend.equipment.service;

import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.equipment.dto.EquipmentCreateRequest;
import com.mymes.backend.equipment.dto.EquipmentResponse;
import com.mymes.backend.equipment.dto.EquipmentUpdateRequest;
import com.mymes.backend.equipment.entity.Equipment;
import com.mymes.backend.equipment.mapper.EquipmentMapper;
import com.mymes.backend.equipment.repository.EquipmentRepository;
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
public class EquipmentService {

    private static final String EQUIPMENT_CODE_PREFIX = "EQ-";
    private static final int MAX_CODE_RETRIES = 3;

    private final EquipmentRepository equipmentRepository;
    private final EquipmentMapper equipmentMapper;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 전체 설비 목록을 설비코드 오름차순으로 조회합니다.
     *
     * @return 설비 응답 목록
     */
    public List<EquipmentResponse> findAll() {
        return equipmentRepository.findAllByOrderByEquipmentCodeAsc().stream()
                .map(equipmentMapper::toResponse)
                .toList();
    }

    /**
     * ID로 설비를 단건 조회합니다.
     *
     * @param id 설비 ID
     * @return 설비 응답 DTO
     * @throws BusinessException 설비가 존재하지 않을 경우 (EQUIPMENT_NOT_FOUND)
     */
    public EquipmentResponse findById(Long id) {
        return equipmentMapper.toResponse(getEquipment(id));
    }

    /**
     * 새 설비를 등록합니다. 설비코드는 자동 채번됩니다.
     *
     * @param request 설비 생성 요청 DTO
     * @return 생성된 설비 응답 DTO
     */
    @Transactional
    public EquipmentResponse create(EquipmentCreateRequest request) {
        CommonCode equipmentType = resolveEquipmentType(request.getEquipmentTypeId());

        for (int attempt = 1; attempt <= MAX_CODE_RETRIES; attempt++) {
            String equipmentCode = generateEquipmentCode();
            Equipment equipment = Equipment.builder()
                    .equipmentCode(equipmentCode)
                    .equipmentName(request.getEquipmentName())
                    .equipmentType(equipmentType)
                    .location(request.getLocation())
                    .manufacturer(request.getManufacturer())
                    .modelName(request.getModelName())
                    .purchaseDate(request.getPurchaseDate())
                    .description(request.getDescription())
                    .isActive(request.isActive())
                    .build();

            try {
                Equipment saved = equipmentRepository.saveAndFlush(equipment);
                log.info("설비 생성 완료: id={}, code={}", saved.getId(), saved.getEquipmentCode());
                return equipmentMapper.toResponse(saved);
            } catch (DataIntegrityViolationException e) {
                log.warn("설비코드 충돌로 재시도합니다. attempt={}, equipmentCode={}", attempt, equipmentCode);
                if (attempt == MAX_CODE_RETRIES) {
                    throw e;
                }
            }
        }

        throw new IllegalStateException("설비코드 생성 재시도 로직이 비정상 종료되었습니다.");
    }

    /**
     * 설비 정보를 수정합니다.
     *
     * @param id      설비 ID
     * @param request 설비 수정 요청 DTO
     * @return 수정된 설비 응답 DTO
     * @throws BusinessException 설비가 존재하지 않을 경우 (EQUIPMENT_NOT_FOUND)
     */
    @Transactional
    public EquipmentResponse update(Long id, EquipmentUpdateRequest request) {
        Equipment equipment = getEquipment(id);
        CommonCode equipmentType = resolveEquipmentType(request.getEquipmentTypeId());
        equipment.update(request.getEquipmentName(), equipmentType, request.getLocation(),
                request.getManufacturer(), request.getModelName(), request.getPurchaseDate(),
                request.getDescription(), request.isActive());
        log.info("설비 수정 완료: id={}", id);
        return equipmentMapper.toResponse(equipment);
    }

    /**
     * 설비를 소프트 삭제합니다.
     *
     * @param id 설비 ID
     * @throws BusinessException 설비가 존재하지 않을 경우 (EQUIPMENT_NOT_FOUND)
     */
    @Transactional
    public void delete(Long id) {
        Equipment equipment = getEquipment(id);
        equipment.delete();
        log.info("설비 삭제 완료: id={}", id);
    }

    /**
     * ID로 설비 엔티티를 조회합니다.
     *
     * @param id 설비 ID
     * @return 설비 엔티티
     * @throws BusinessException 설비가 존재하지 않을 경우 (EQUIPMENT_NOT_FOUND)
     */
    public Equipment getEquipment(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.EQUIPMENT_NOT_FOUND, String.valueOf(id)));
    }

    private CommonCode resolveEquipmentType(Long equipmentTypeId) {
        if (equipmentTypeId == null) return null;
        return commonCodeRepository.findById(equipmentTypeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, String.valueOf(equipmentTypeId)));
    }

    private String generateEquipmentCode() {
        int nextSequence = equipmentRepository.findLatestEquipmentCode(EQUIPMENT_CODE_PREFIX)
                .map(this::extractSequence)
                .orElse(0) + 1;
        return EQUIPMENT_CODE_PREFIX + String.format("%06d", nextSequence);
    }

    private int extractSequence(String equipmentCode) {
        try {
            return Integer.parseInt(equipmentCode.substring(EQUIPMENT_CODE_PREFIX.length()));
        } catch (NumberFormatException e) {
            log.warn("채번 시퀀스 추출 실패, 1부터 시작합니다. equipmentCode={}", equipmentCode);
            return 0;
        }
    }
}
