package com.mymes.backend.item.repository;

import com.mymes.backend.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByItemCode(String itemCode);
    boolean existsByItemCode(String itemCode);
    boolean existsByItemCodeAndIdNot(String itemCode, Long id);
    Item findTopByItemCodeStartingWithOrderByItemCodeDesc(String prefix);
}
