package com.mymes.backend.code.repository;

import com.mymes.backend.code.entity.CodeGroup;
import com.mymes.backend.code.entity.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {

    List<CommonCode> findByCodeGroupOrderBySortOrder(CodeGroup codeGroup);

    boolean existsByCodeGroupAndCode(CodeGroup codeGroup, String code);

    Optional<CommonCode> findByCodeGroupAndCode(CodeGroup codeGroup, String code);

    boolean existsByCodeGroupAndNumberingPrefix(CodeGroup codeGroup, String numberingPrefix);

    boolean existsByCodeGroupAndNumberingPrefixAndIdNot(CodeGroup codeGroup, String numberingPrefix, Long id);
}
