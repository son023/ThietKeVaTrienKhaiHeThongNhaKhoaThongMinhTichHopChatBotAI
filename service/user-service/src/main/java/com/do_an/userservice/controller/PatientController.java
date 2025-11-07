package com.do_an.userservice.controller;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreatePatientRequestDTO;
import com.do_an.userservice.dto.request.UpdatePatientRequestDTO;
import com.do_an.userservice.dto.response.PatientDTO;
import com.do_an.userservice.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/user-service/patients")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Patient Management", description = "API quản lý thông tin bệnh nhân")
public class PatientController {
    
    private final PatientService patientService;

    @Operation(
            summary = "Tạo Patient profile mới",
            description = "Tạo profile bệnh nhân mới cho một User. Tự động gán role PATIENT nếu chưa có."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo thành công",
                    content = @Content(schema = @Schema(implementation = PatientDTO.class))),
            @ApiResponse(responseCode = "400", description = "User đã có Patient profile hoặc Insurance number đã tồn tại"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy User")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(
            @Parameter(description = "Thông tin bệnh nhân cần tạo", required = true)
            @Valid @RequestBody CreatePatientRequestDTO request) {
        log.info("Nhận request tạo Patient profile");
        PatientDTO patient = patientService.createPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(patient);
    }


    @PutMapping("/{patientId}")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PATIENT')")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable String patientId,
            @Valid @RequestBody UpdatePatientRequestDTO request) {
        log.info("Nhận request cập nhật Patient profile: {}", patientId);
        PatientDTO patient = patientService.updatePatient(patientId, request);
        return ResponseEntity.ok(patient);
    }

    @DeleteMapping("/{patientId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable String patientId) {
        log.info("Nhận request xóa Patient profile: {}", patientId);
        patientService.deletePatient(patientId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePatientByUserId(@PathVariable String userId) {
        log.info("Nhận request xóa Patient profile theo User ID: {}", userId);
        patientService.deletePatientByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{patientId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable String patientId) {
        log.info("Nhận request lấy Patient profile theo ID: {}", patientId);
        PatientDTO patient = patientService.getPatientById(patientId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/user/{userId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<PatientDTO> getPatientByUserId(@PathVariable String userId) {
        log.info("Nhận request lấy Patient profile theo User ID: {}", userId);
        PatientDTO patient = patientService.getPatientByUserId(userId);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/insurance/{insuranceNumber}")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<PatientDTO> getPatientByInsuranceNumber(@PathVariable String insuranceNumber) {
        log.info("Nhận request lấy Patient profile theo Insurance Number: {}", insuranceNumber);
        PatientDTO patient = patientService.getPatientByInsuranceNumber(insuranceNumber);
        return ResponseEntity.ok(patient);
    }

    @GetMapping
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<List<PatientDTO>> getAllPatients(
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String bloodType,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dobFrom,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dobTo) {
        log.info("Nhận request lấy danh sách Patients với filters");
        List<PatientDTO> patients = patientService.getAllPatients(
                gender, bloodType, address, dobFrom, dobTo);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/all")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<List<PatientDTO>> getAllPatientsList() {
        log.info("Nhận request lấy tất cả Patients");
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }


    @GetMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<PatientDTO> getMyProfile(@PathVariable String userId) {
        log.info("Nhận request Patient lấy profile của mình: {}", userId);
        PatientDTO profile = patientService.getMyProfile(userId);
        return ResponseEntity.ok(profile);
    }


    @PutMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_PATIENT')")
    public ResponseEntity<PatientDTO> updateMyProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileDTO request) {
        log.info("Nhận request Patient tự cập nhật profile: {}", userId);
        PatientDTO updatedProfile = patientService.updateMyProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }
}
