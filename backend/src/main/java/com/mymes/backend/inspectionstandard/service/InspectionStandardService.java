package com.mymes.backend.inspectionstandard.service;

import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.repository.CodeGroupRepository;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import com.mymes.backend.inspectionitem.entity.InspectionItem;
import com.mymes.backend.inspectionitem.entity.MeasurementType;
import com.mymes.backend.inspectionitem.service.InspectionItemService;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardCreateRequest;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardResponse;
import com.mymes.backend.inspectionstandard.dto.InspectionStandardUpdateRequest;
import com.mymes.backend.inspectionstandard.entity.InspectionStandard;
import com.mymes.backend.inspectionstandard.mapper.InspectionStandardMapper;
import com.mymes.backend.inspectionstandard.repository.InspectionStandardRepository;
import com.mymes.backend.item.entity.Item;
import com.mymes.backend.item.service.ItemService;
import com.mymes.backend.itemprocess.service.ItemProcessService;
import com.mymes.backend.process.entity.MfgProcess;
import com.mymes.backend.process.service.MfgProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InspectionStandardService {

    private static final String INSPECTION_METHOD_GROUP_ID = "QC_INSPECTION_METHOD";
    private static final String SAMPLING_METHOD_CODE = "SAMPLING";

    private final InspectionStandardRepository inspectionStandardRepository;
    private final InspectionStandardMapper inspectionStandardMapper;
    private final ItemService itemService;
    private final MfgProcessService processService;
    private final InspectionItemService inspectionItemService;
    private final ItemProcessService itemProcessService;
    private final CodeGroupRepository codeGroupRepository;
    private final CommonCodeRepository commonCodeRepository;

    /**
     * 검사 기준 목록을 조회합니다. itemId와 processId가 모두 있으면 해당 품목/공정 기준만 조회합니다.
     *
     * @param itemId    품목 ID
     * @param processId 공정 ID
     * @return 검사 기준 응답 목록
     */
    public List<InspectionStandardResponse> findAll(Long itemId, Long processId) {
        List<InspectionStandard> standards = itemId != null && processId != null
                ? inspectionStandardRepository.findByItem_IdAndProcess_IdOrderBySortOrderAsc(itemId, processId)
                : inspectionStandardRepository.findAllByOrderByItem_ItemCodeAscProcess_ProcessCodeAscSortOrderAsc();
        return standards.stream()
                .map(inspectionStandardMapper::toResponse)
                .toList();
    }

    /**
     * 품목과 공정에 대해 활성화된 검사 기준이 존재하는지 확인합니다.
     *
     * @param itemId    품목 ID
     * @param processId 공정 ID
     * @return 활성화된 검사 기준 존재 여부
     */
    public boolean existsByItemAndProcess(Long itemId, Long processId) {
        return inspectionStandardRepository.existsByItem_IdAndProcess_IdAndIsActiveTrue(itemId, processId);
    }

    /**
     * ID로 검사 기준을 단건 조회합니다.
     *
     * @param id 검사 기준 ID
     * @return 검사 기준 응답 DTO
     */
    public InspectionStandardResponse findById(Long id) {
        return inspectionStandardMapper.toResponse(getInspectionStandard(id));
    }

    /**
     * 새 검사 기준을 등록합니다.
     *
     * @param request 검사 기준 생성 요청 DTO
     * @return 생성된 검사 기준 응답 DTO
     */
    @Transactional
    public InspectionStandardResponse create(InspectionStandardCreateRequest request) {
        Item item = itemService.getItem(request.getItemId());
        MfgProcess process = processService.getProcess(request.getProcessId());
        InspectionItem inspectionItem = inspectionItemService.getInspectionItem(request.getInspectionItemId());
        CommonCode inspectionMethod = resolveInspectionMethod(request.getInspectionMethodCode());

        validateItemProcess(request.getItemId(), request.getProcessId());
        validateDuplicated(request.getItemId(), request.getProcessId(), request.getInspectionItemId());
        validateValues(inspectionItem, request.getInspectionMethodCode(), request.getLowerLimit(),
                request.getUpperLimit(), request.getSampleQty());

        InspectionStandard inspectionStandard = InspectionStandard.builder()
                .item(item)
                .process(process)
                .inspectionItem(inspectionItem)
                .inspectionMethod(inspectionMethod)
                .standardValue(request.getStandardValue())
                .lowerLimit(resolveLowerLimit(inspectionItem, request.getLowerLimit()))
                .upperLimit(resolveUpperLimit(inspectionItem, request.getUpperLimit()))
                .unit(resolveUnit(request.getUnit(), inspectionItem))
                .sampleQty(request.getSampleQty())
                .isRequired(request.isRequired())
                .sortOrder(request.getSortOrder())
                .isActive(request.isActive())
                .description(request.getDescription())
                .build();

        InspectionStandard saved = inspectionStandardRepository.save(inspectionStandard);
        log.info("검사 기준 생성 완료: id={}, itemId={}, processId={}, inspectionItemId={}",
                saved.getId(), item.getId(), process.getId(), inspectionItem.getId());
        return inspectionStandardMapper.toResponse(saved);
    }

    /**
     * 검사 기준 정보를 수정합니다.
     *
     * @param id      검사 기준 ID
     * @param request 검사 기준 수정 요청 DTO
     * @return 수정된 검사 기준 응답 DTO
     */
    @Transactional
    public InspectionStandardResponse update(Long id, InspectionStandardUpdateRequest request) {
        InspectionStandard inspectionStandard = getInspectionStandard(id);
        InspectionItem inspectionItem = inspectionStandard.getInspectionItem();
        CommonCode inspectionMethod = resolveInspectionMethod(request.getInspectionMethodCode());

        validateValues(inspectionItem, request.getInspectionMethodCode(), request.getLowerLimit(),
                request.getUpperLimit(), request.getSampleQty());

        inspectionStandard.update(
                inspectionMethod,
                request.getStandardValue(),
                resolveLowerLimit(inspectionItem, request.getLowerLimit()),
                resolveUpperLimit(inspectionItem, request.getUpperLimit()),
                resolveUnit(request.getUnit(), inspectionItem),
                request.getSampleQty(),
                request.isRequired(),
                request.getSortOrder(),
                request.isActive(),
                request.getDescription()
        );
        log.info("검사 기준 수정 완료: id={}", id);
        return inspectionStandardMapper.toResponse(inspectionStandard);
    }

    /**
     * 검사 기준을 소프트 삭제합니다.
     *
     * @param id 검사 기준 ID
     */
    @Transactional
    public void delete(Long id) {
        InspectionStandard inspectionStandard = getInspectionStandard(id);
        inspectionStandard.delete();
        log.info("검사 기준 삭제 완료: id={}", id);
    }

    /**
     * ID로 검사 기준 엔티티를 조회합니다.
     *
     * @param id 검사 기준 ID
     * @return 검사 기준 엔티티
     */
    public InspectionStandard getInspectionStandard(Long id) {
        return inspectionStandardRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.INSPECTION_STANDARD_NOT_FOUND,
                        String.valueOf(id)
                ));
    }

    private void validateItemProcess(Long itemId, Long processId) {
        if (!itemProcessService.existsByItemAndProcess(itemId, processId)) {
            throw new BusinessException(ErrorCode.INSPECTION_STANDARD_ITEM_PROCESS_NOT_AVAILABLE);
        }
    }

    private void validateDuplicated(Long itemId, Long processId, Long inspectionItemId) {
        if (inspectionStandardRepository.existsByItem_IdAndProcess_IdAndInspectionItem_Id(
                itemId, processId, inspectionItemId)) {
            throw new BusinessException(ErrorCode.INSPECTION_STANDARD_DUPLICATED);
        }
    }

    private void validateValues(InspectionItem inspectionItem, String inspectionMethodCode,
                                BigDecimal lowerLimit, BigDecimal upperLimit, Integer sampleQty) {
        if (SAMPLING_METHOD_CODE.equals(inspectionMethodCode) && sampleQty == null) {
            throw new BusinessException(ErrorCode.INSPECTION_STANDARD_SAMPLE_REQUIRED);
        }

        if (inspectionItem.getMeasurementType() != MeasurementType.NUMERIC
                && (lowerLimit != null || upperLimit != null)) {
            throw new BusinessException(ErrorCode.INSPECTION_STANDARD_NUMERIC_LIMIT_ONLY);
        }

        if (inspectionItem.getMeasurementType() == MeasurementType.NUMERIC
                && lowerLimit != null
                && upperLimit != null
                && lowerLimit.compareTo(upperLimit) > 0) {
            throw new BusinessException(ErrorCode.INSPECTION_STANDARD_LIMIT_INVALID);
        }
    }

    private CommonCode resolveInspectionMethod(String inspectionMethodCode) {
        CodeGroup methodGroup = codeGroupRepository.findByGroupId(INSPECTION_METHOD_GROUP_ID)
                .orElseThrow(() -> new BusinessException(ErrorCode.CODE_GROUP_NOT_FOUND, INSPECTION_METHOD_GROUP_ID));
        return commonCodeRepository.findByCodeGroupAndCode(methodGroup, inspectionMethodCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, inspectionMethodCode));
    }

    private String resolveUnit(String unit, InspectionItem inspectionItem) {
        if (unit != null && !unit.isBlank()) {
            return unit;
        }
        return inspectionItem.getUnit();
    }

    private BigDecimal resolveLowerLimit(InspectionItem inspectionItem, BigDecimal lowerLimit) {
        return inspectionItem.getMeasurementType() == MeasurementType.NUMERIC ? lowerLimit : null;
    }

    private BigDecimal resolveUpperLimit(InspectionItem inspectionItem, BigDecimal upperLimit) {
        return inspectionItem.getMeasurementType() == MeasurementType.NUMERIC ? upperLimit : null;
    }
}
