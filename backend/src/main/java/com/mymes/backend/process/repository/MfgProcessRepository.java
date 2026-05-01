package com.mymes.backend.process.repository;

import com.mymes.backend.process.entity.MfgProcess;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MfgProcessRepository extends JpaRepository<MfgProcess, Long> {
    List<MfgProcess> findAllByOrderByProcessCodeAsc();
    MfgProcess findTopByProcessCodeStartingWithOrderByProcessCodeDesc(String prefix);
}
