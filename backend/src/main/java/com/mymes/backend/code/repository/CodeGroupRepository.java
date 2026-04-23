package com.mymes.backend.code.repository;

import com.mymes.backend.code.entity.CodeGroup;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CodeGroupRepository extends JpaRepository<CodeGroup, Long> {

    Optional<CodeGroup> findByGroupId(String groupId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select codeGroup from CodeGroup codeGroup where codeGroup.groupId = :groupId")
    Optional<CodeGroup> findByGroupIdForUpdate(@Param("groupId") String groupId);

    boolean existsByGroupId(String groupId);
}
