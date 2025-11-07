package com.do_an.userservice.controller;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreateDoctorRequestDTO;
import com.do_an.userservice.dto.request.UpdateDoctorRequestDTO;
import com.do_an.userservice.dto.response.DoctorDTO;
import com.do_an.userservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-service/doctors")
@RequiredArgsConstructor
@Slf4j
public class DoctorController {
    
    private final DoctorService doctorService;

    @PostMapping
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<DoctorDTO> createDoctor(@Valid @RequestBody CreateDoctorRequestDTO request) {
        log.info("Nhận request tạo Doctor profile");
        DoctorDTO doctor = doctorService.createDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(doctor);
    }

    @PutMapping("/{doctorId}")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DOCTOR')")
    public ResponseEntity<DoctorDTO> updateDoctor(
            @PathVariable String doctorId,
            @Valid @RequestBody UpdateDoctorRequestDTO request) {
        log.info("Nhận request cập nhật Doctor profile: {}", doctorId);
        DoctorDTO doctor = doctorService.updateDoctor(doctorId, request);
        return ResponseEntity.ok(doctor);
    }

    @DeleteMapping("/{doctorId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable String doctorId) {
        log.info("Nhận request xóa Doctor profile: {}", doctorId);
        doctorService.deleteDoctor(doctorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteDoctorByUserId(@PathVariable String userId) {
        log.info("Nhận request xóa Doctor profile theo User ID: {}", userId);
        doctorService.deleteDoctorByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{doctorId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorDTO> getDoctorById(@PathVariable String doctorId) {
        log.info("Nhận request lấy Doctor profile theo ID: {}", doctorId);
        DoctorDTO doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/user/{userId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorDTO> getDoctorByUserId(@PathVariable String userId) {
        log.info("Nhận request lấy Doctor profile theo User ID: {}", userId);
        DoctorDTO doctor = doctorService.getDoctorByUserId(userId);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors(
            @RequestParam(required = false) String specializationCode,
            @RequestParam(required = false) String workingHospital,
            @RequestParam(required = false) Integer minFee,
            @RequestParam(required = false) Integer maxFee) {
        log.info("Nhận request lấy danh sách Doctors với filters");
        List<DoctorDTO> doctors = doctorService.getAllDoctors(
                specializationCode, workingHospital, minFee, maxFee);
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/all")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorDTO>> getAllDoctorsList() {
        log.info("Nhận request lấy tất cả Doctors");
        List<DoctorDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<DoctorDTO> createOrUpdateMyProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileDTO request) {
        log.info("Nhận request Doctor tự cập nhật profile: {}", userId);
        DoctorDTO updatedProfile = doctorService.createOrUpdateMyProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_DOCTOR')")
    public ResponseEntity<DoctorDTO> getMyProfile(@PathVariable String userId) {
        log.info("Nhận request Doctor lấy profile của mình: {}", userId);
        DoctorDTO profile = doctorService.getMyProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
