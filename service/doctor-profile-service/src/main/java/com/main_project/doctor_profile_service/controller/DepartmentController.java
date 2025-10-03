package com.main_project.doctor_profile_service.controller;

import com.main_project.doctor_profile_service.entity.Department;
import com.main_project.doctor_profile_service.service.DepartmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    public ResponseEntity<Department> create(@RequestBody Department body) {
        Department created = departmentService.create(body);
        return ResponseEntity.created(URI.create("/api/departments/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> get(@PathVariable String id) {
        Department found = departmentService.getById(id);
        return found == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(found);
    }

    @GetMapping
    public List<Department> list() { return departmentService.getAll(); }

    @PutMapping("/{id}")
    public ResponseEntity<Department> update(@PathVariable String id, @RequestBody Department body) {
        return ResponseEntity.ok(departmentService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        departmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



