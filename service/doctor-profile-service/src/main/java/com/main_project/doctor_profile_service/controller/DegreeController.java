package com.main_project.doctor_profile_service.controller;

import com.main_project.doctor_profile_service.entity.Degree;
import com.main_project.doctor_profile_service.service.DegreeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/degrees")
public class DegreeController {
    private final DegreeService degreeService;

    public DegreeController(DegreeService degreeService) {
        this.degreeService = degreeService;
    }

    @PostMapping
    public ResponseEntity<Degree> create(@RequestBody Degree body) {
        Degree created = degreeService.create(body);
        return ResponseEntity.created(URI.create("/api/degrees/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Degree> get(@PathVariable String id) {
        Degree found = degreeService.getById(id);
        return found == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(found);
    }

    @GetMapping
    public List<Degree> list() { return degreeService.getAll(); }

    @PutMapping("/{id}")
    public ResponseEntity<Degree> update(@PathVariable String id, @RequestBody Degree body) {
        return ResponseEntity.ok(degreeService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        degreeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



