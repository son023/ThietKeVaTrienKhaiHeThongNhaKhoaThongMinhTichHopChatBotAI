package com.do_an.userservice.controller;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreateLabTechnicianRequestDTO;
import com.do_an.userservice.dto.request.UpdateLabTechnicianRequestDTO;
import com.do_an.userservice.dto.response.LabTechnicianDTO;
import com.do_an.userservice.service.LabTechnicianService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/user-service/lab-technicians")
@RequiredArgsConstructor
@Slf4j
public class LabTechnicianController {
    
    private final LabTechnicianService labTechnicianService;

    @PostMapping
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LABTECHNICIAN')")
    public ResponseEntity<LabTechnicianDTO> createLabTechnician(@Valid @RequestBody CreateLabTechnicianRequestDTO request) {
        log.info("Nhận request tạo LabTechnician profile");
        LabTechnicianDTO labTechnician = labTechnicianService.createLabTechnician(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(labTechnician);
    }


    @PutMapping("/{labTechnicianId}")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_LABTECHNICIAN')")
    public ResponseEntity<LabTechnicianDTO> updateLabTechnician(
            @PathVariable UUID labTechnicianId,
            @Valid @RequestBody UpdateLabTechnicianRequestDTO request) {
        log.info("Nhận request cập nhật LabTechnician profile: {}", labTechnicianId);
        LabTechnicianDTO labTechnician = labTechnicianService.updateLabTechnician(labTechnicianId, request);
        return ResponseEntity.ok(labTechnician);
    }


    @DeleteMapping("/{labTechnicianId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteLabTechnician(@PathVariable UUID labTechnicianId) {
        log.info("Nhận request xóa LabTechnician profile: {}", labTechnicianId);
        labTechnicianService.deleteLabTechnician(labTechnicianId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteLabTechnicianByUserId(@PathVariable UUID userId) {
        log.info("Nhận request xóa LabTechnician profile theo User ID: {}", userId);
        labTechnicianService.deleteLabTechnicianByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{labTechnicianId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<LabTechnicianDTO> getLabTechnicianById(@PathVariable UUID labTechnicianId) {
        log.info("Nhận request lấy LabTechnician profile theo ID: {}", labTechnicianId);
        LabTechnicianDTO labTechnician = labTechnicianService.getLabTechnicianById(labTechnicianId);
        return ResponseEntity.ok(labTechnician);
    }

    @GetMapping("/user/{userId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<LabTechnicianDTO> getLabTechnicianByUserId(@PathVariable UUID userId) {
        log.info("Nhận request lấy LabTechnician profile theo User ID: {}", userId);
        LabTechnicianDTO labTechnician = labTechnicianService.getLabTechnicianByUserId(userId);
        return ResponseEntity.ok(labTechnician);
    }

    @GetMapping
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LabTechnicianDTO>> getAllLabTechnicians(
            @RequestParam(required = false) String field) {
        log.info("Nhận request lấy danh sách LabTechnicians với filters");
        List<LabTechnicianDTO> labTechnicians = labTechnicianService.getAllLabTechnicians(field);
        return ResponseEntity.ok(labTechnicians);
    }

    @GetMapping("/all")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LabTechnicianDTO>> getAllLabTechniciansList() {
        log.info("Nhận request lấy tất cả LabTechnicians");
        List<LabTechnicianDTO> labTechnicians = labTechnicianService.getAllLabTechnicians();
        return ResponseEntity.ok(labTechnicians);
    }

    @PutMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_LABTECHNICIAN')")
    public ResponseEntity<LabTechnicianDTO> createOrUpdateMyProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody ProfileDTO request) {
        log.info("Nhận request LabTechnician tự cập nhật profile: {}", userId);
        LabTechnicianDTO updatedProfile = labTechnicianService.createOrUpdateMyProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_LABTECHNICIAN')")
    public ResponseEntity<LabTechnicianDTO> getMyProfile(@PathVariable UUID userId) {
        log.info("Nhận request LabTechnician lấy profile của mình: {}", userId);
        LabTechnicianDTO profile = labTechnicianService.getMyProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
