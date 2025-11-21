package com.do_an.userservice.controller;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.RoleDTO;
import com.do_an.userservice.dto.response.*;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/user-service/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {
    private final AdminService adminService;

    // ==== 0. ADMIN PROFILE MANAGEMENT ====

    @PostMapping("/profiles")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminDTO> createAdminProfile(@RequestParam UUID userId) {
        log.info("Nhận request tạo Admin profile cho user: {}", userId);
        AdminDTO admin = adminService.createAdminProfile(userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(admin);
    }

    @GetMapping("/profiles/{adminId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminDTO> getAdminById(@PathVariable UUID adminId) {
        log.info("Nhận request lấy Admin profile theo ID: {}", adminId);
        AdminDTO admin = adminService.getAdminById(adminId);
        return ResponseEntity.ok(admin);
    }

    @GetMapping("/profiles/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<AdminDTO> getAdminByUserId(@PathVariable UUID userId) {
        log.info("Nhận request lấy Admin profile theo User ID: {}", userId);
        AdminDTO admin = adminService.getAdminByUserId(userId);
        return ResponseEntity.ok(admin);
    }

    @GetMapping("/profiles")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        log.info("Nhận request lấy tất cả Admin profiles");
        List<AdminDTO> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }

    @DeleteMapping("/profiles/{adminId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAdminProfile(@PathVariable UUID adminId) {
        log.info("Nhận request xóa Admin profile: {}", adminId);
        adminService.deleteAdminProfile(adminId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/profiles/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAdminProfileByUserId(@PathVariable UUID userId) {
        log.info("Nhận request xóa Admin profile theo User ID: {}", userId);
        adminService.deleteAdminProfileByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    // ==== 1. USER MANAGEMENT ====
    
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.findAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<FullProfileDTO> getFullUserProfile(@PathVariable UUID userId) {
        return ResponseEntity.ok(adminService.getFullUserProfile(userId));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<Void> toggleUserStatus(
            @PathVariable UUID userId,
            @RequestParam boolean active) {
        adminService.toggleUserStatus(userId, active);
        return ResponseEntity.ok().build();
    }

    // ==== 2. PROFILE MANAGEMENT  ====

    @PutMapping("/users/{userId}/profile/doctor")
    public ResponseEntity<DoctorDTO> adminUpdateDoctorProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileDTO dto) {
        return ResponseEntity.ok(adminService.adminUpdateDoctorProfile(userId, dto));
    }

    @PutMapping("/users/{userId}/profile/patient")
    public ResponseEntity<PatientDTO> adminUpdatePatientProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileDTO dto) {
        return ResponseEntity.ok(adminService.adminUpdatePatientProfile(userId, dto));
    }

    @PutMapping("/users/{userId}/profile/pharmacist")
    public ResponseEntity<PharmacistDTO> adminUpdatePharmacistProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileDTO dto) {
        return ResponseEntity.ok(adminService.adminUpdatePharmacistProfile(userId, dto));
    }

    @PutMapping("/users/{userId}/profile/lab-technician")
    public ResponseEntity<LabTechnicianDTO> adminUpdateLabTechnicianProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileDTO dto) {
        return ResponseEntity.ok(adminService.adminUpdateLabTechnicianProfile(userId, dto));
    }

    // ==== 3. ROLE MANAGEMENT ====

    @PostMapping("/users/{userId}/assign-role")
    public ResponseEntity<Void> assignRoleToUser(
            @PathVariable UUID userId,
            @Valid @RequestBody RoleDTO request) {
        adminService.assignRoleToUser(userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}/remove-role")
    public ResponseEntity<Void> removeRoleFromUser(
            @PathVariable UUID userId,
            @RequestParam String roleName) {
        adminService.removeRoleFromUser(userId, roleName);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(adminService.findAllRoles());
    }

    @PostMapping("/roles")
    public ResponseEntity<Role> createRole(@RequestBody Map<String, String> request) {
        String roleName = request.get("roleName");
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.createRole(roleName));
    }

    @PutMapping("/roles/{roleId}")
    public ResponseEntity<Role> updateRole(
            @PathVariable UUID roleId,
            @RequestBody Map<String, String> request) {
        String roleName = request.get("roleName");
        return ResponseEntity.ok(adminService.updateRole(roleId, roleName));
    }

    @DeleteMapping("/roles/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable UUID roleId) {
        adminService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }
}
