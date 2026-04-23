package com.mymes.backend.code.service;

import com.mymes.backend.code.dto.CodeGroupCreateRequest;
import com.mymes.backend.code.dto.CodeGroupResponse;
import com.mymes.backend.code.dto.CodeGroupUpdateRequest;
import com.mymes.backend.code.dto.CommonCodeCreateRequest;
import com.mymes.backend.code.dto.CommonCodeResponse;
import com.mymes.backend.code.dto.CommonCodeUpdateRequest;
import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import com.mymes.backend.code.mapper.CodeGroupMapper;
import com.mymes.backend.code.repository.CodeGroupRepository;
import com.mymes.backend.code.repository.CommonCodeRepository;
import com.mymes.backend.common.exception.BusinessException;
import com.mymes.backend.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CodeGroupService {

    private final CodeGroupRepository codeGroupRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final CodeGroupMapper codeGroupMapper;

    public List<CodeGroupResponse> findAll() {
        return codeGroupRepository.findAll().stream()
                .map(codeGroupMapper::toResponse)
                .toList();
    }

    public CodeGroupResponse findByGroupId(String groupId) {
        CodeGroup group = getCodeGroup(groupId);
        List<CommonCodeResponse> codes = commonCodeRepository.findByCodeGroupOrderBySortOrder(group).stream()
                .map(codeGroupMapper::toCodeResponse)
                .toList();
        return codeGroupMapper.toResponseWithCodes(group, codes);
    }

    @Transactional
    public CodeGroupResponse create(CodeGroupCreateRequest request) {
        if (codeGroupRepository.existsByGroupId(request.getGroupId())) {
            throw new BusinessException(ErrorCode.CODE_GROUP_ID_DUPLICATED, request.getGroupId());
        }
        CodeGroup group = CodeGroup.builder()
                .groupId(request.getGroupId())
                .groupName(request.getGroupName())
                .description(request.getDescription())
                .build();
        CodeGroup saved = codeGroupRepository.save(group);
        log.info("코드 그룹 생성 완료: groupId={}", saved.getGroupId());
        return codeGroupMapper.toResponse(saved);
    }

    @Transactional
    public CodeGroupResponse update(String groupId, CodeGroupUpdateRequest request) {
        CodeGroup group = getCodeGroup(groupId);
        group.update(request.getGroupName(), request.getDescription());
        log.info("코드 그룹 수정 완료: groupId={}", groupId);
        return codeGroupMapper.toResponse(group);
    }

    @Transactional
    public void delete(String groupId) {
        CodeGroup group = getCodeGroup(groupId);
        group.delete();
        log.info("코드 그룹 삭제 완료: groupId={}", groupId);
    }

    public List<CommonCodeResponse> findCodes(String groupId) {
        CodeGroup group = getCodeGroup(groupId);
        return commonCodeRepository.findByCodeGroupOrderBySortOrder(group).stream()
                .map(codeGroupMapper::toCodeResponse)
                .toList();
    }

    @Transactional
    public CommonCodeResponse createCode(String groupId, CommonCodeCreateRequest request) {
        CodeGroup group = getCodeGroupForUpdate(groupId);
        String nextCode = generateNextCommonCode(group);
        String numberingPrefix = request.getNumberingPrefix() != null && !request.getNumberingPrefix().isBlank()
                ? request.getNumberingPrefix().strip().toUpperCase() : null;
        if (numberingPrefix != null
                && commonCodeRepository.existsByCodeGroupAndNumberingPrefix(group, numberingPrefix)) {
            throw new BusinessException(ErrorCode.COMMON_CODE_NUMBERING_PREFIX_DUPLICATED, numberingPrefix);
        }
        CommonCode code = CommonCode.builder()
                .codeGroup(group)
                .code(nextCode)
                .codeName(request.getCodeName())
                .sortOrder(request.getSortOrder())
                .numberingPrefix(numberingPrefix)
                .build();
        CommonCode saved = commonCodeRepository.save(code);
        log.info("공통 코드 생성 완료: groupId={}, code={}", groupId, saved.getCode());
        return codeGroupMapper.toCodeResponse(saved);
    }

    @Transactional
    public CommonCodeResponse updateCode(String groupId, Long codeId, CommonCodeUpdateRequest request) {
        getCodeGroup(groupId);
        CommonCode code = commonCodeRepository.findById(codeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, String.valueOf(codeId)));
        String numberingPrefix = request.getNumberingPrefix() != null && !request.getNumberingPrefix().isBlank()
                ? request.getNumberingPrefix().strip().toUpperCase() : null;
        if (numberingPrefix != null
                && commonCodeRepository.existsByCodeGroupAndNumberingPrefixAndIdNot(code.getCodeGroup(), numberingPrefix, codeId)) {
            throw new BusinessException(ErrorCode.COMMON_CODE_NUMBERING_PREFIX_DUPLICATED, numberingPrefix);
        }
        code.update(request.getCodeName(), request.getSortOrder(), numberingPrefix);
        log.info("공통 코드 수정 완료: groupId={}, codeId={}", groupId, codeId);
        return codeGroupMapper.toCodeResponse(code);
    }

    @Transactional
    public void deleteCode(String groupId, Long codeId) {
        getCodeGroup(groupId);
        CommonCode code = commonCodeRepository.findById(codeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.COMMON_CODE_NOT_FOUND, String.valueOf(codeId)));
        code.delete();
        log.info("공통 코드 삭제 완료: groupId={}, codeId={}", groupId, codeId);
    }

    private CodeGroup getCodeGroup(String groupId) {
        return codeGroupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CODE_GROUP_NOT_FOUND, groupId));
    }

    private CodeGroup getCodeGroupForUpdate(String groupId) {
        return codeGroupRepository.findByGroupIdForUpdate(groupId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CODE_GROUP_NOT_FOUND, groupId));
    }

    private String generateNextCommonCode(CodeGroup group) {
        int nextValue = commonCodeRepository.findByCodeGroupOrderBySortOrder(group).stream()
                .map(CommonCode::getCode)
                .filter(code -> code != null && code.matches("\\d+"))
                .mapToInt(Integer::parseInt)
                .max()
                .orElse(-1) + 1;
        return String.format("%03d", nextValue);
    }
}
