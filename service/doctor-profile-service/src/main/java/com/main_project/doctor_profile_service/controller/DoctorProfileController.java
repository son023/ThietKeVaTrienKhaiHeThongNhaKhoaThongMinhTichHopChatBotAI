package com.main_project.doctor_profile_service.controller;

import com.main_project.doctor_profile_service.entity.DoctorProfile;
import com.main_project.doctor_profile_service.service.DoctorProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/doctor-profiles")
public class DoctorProfileController {

    private final DoctorProfileService doctorProfileService;

    public DoctorProfileController(DoctorProfileService doctorProfileService) {
        this.doctorProfileService = doctorProfileService;
    }

    @PostMapping
    public ResponseEntity<DoctorProfile> create(@RequestBody DoctorProfile body) {
        DoctorProfile created = doctorProfileService.create(body);
        return ResponseEntity.created(URI.create("/api/doctor-profiles/" + created.getId())).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorProfile> get(@PathVariable String id) {
        DoctorProfile found = doctorProfileService.getById(id);
        return found == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(found);
    }

    @GetMapping
    public List<DoctorProfile> list() {
        return doctorProfileService.getAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorProfile> update(@PathVariable String id, @RequestBody DoctorProfile body) {
        return ResponseEntity.ok(doctorProfileService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        doctorProfileService.delete(id);
        return ResponseEntity.noContent().build();
    }
}



