package com.mymes.backend.code.mapper;

import com.mymes.backend.code.dto.CodeGroupResponse;
import com.mymes.backend.code.dto.CommonCodeResponse;
import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CodeGroupMapper {

    @Mapping(target = "codes", ignore = true)
    CodeGroupResponse toResponse(CodeGroup codeGroup);

    @Mapping(target = "codes", source = "codes")
    CodeGroupResponse toResponseWithCodes(CodeGroup codeGroup, List<CommonCodeResponse> codes);

    @Mapping(source = "codeGroup.groupId", target = "groupId")
    CommonCodeResponse toCodeResponse(CommonCode commonCode);
}
