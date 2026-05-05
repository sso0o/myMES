package com.mymes.backend.worker.repository;

import com.mymes.backend.worker.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    List<Worker> findAllByOrderByWorkerCodeAsc();

    /** 삭제된 작업자를 포함하여 prefix로 시작하는 최신 작업자코드를 조회합니다. */
    @Query(value = "SELECT worker_code FROM workers WHERE worker_code LIKE CONCAT(:prefix, '%') ORDER BY worker_code DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestWorkerCode(@Param("prefix") String prefix);
}
