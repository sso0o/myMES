package com.mymes.backend.equipment.repository;

import com.mymes.backend.equipment.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findAllByOrderByEquipmentCodeAsc();

    /** 삭제된 설비를 포함하여 prefix로 시작하는 최신 코드를 조회합니다. */
    @Query(value = "SELECT equipment_code FROM equipment WHERE equipment_code LIKE :prefix% ORDER BY equipment_code DESC LIMIT 1", nativeQuery = true)
    Optional<String> findLatestEquipmentCode(@Param("prefix") String prefix);
}
