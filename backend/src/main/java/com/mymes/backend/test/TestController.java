package com.mymes.backend.test;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final TestRepository testRepository;

    @GetMapping
    public List<TestEntity> getAll() {
        return testRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<TestEntity> create(@RequestBody TestRequest request) {
        TestEntity entity = new TestEntity();
        entity.setName(request.name());
        entity.setDescription(request.description());
        return ResponseEntity.ok(testRepository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        testRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record TestRequest(String name, String description) {}
}
