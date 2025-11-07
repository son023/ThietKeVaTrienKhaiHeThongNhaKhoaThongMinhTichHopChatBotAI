package com.do_an.userservice.controller;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreatePharmacistRequestDTO;
import com.do_an.userservice.dto.request.UpdatePharmacistRequestDTO;
import com.do_an.userservice.dto.response.PharmacistDTO;
import com.do_an.userservice.service.PharmacistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-service/pharmacists")
@RequiredArgsConstructor
@Slf4j
public class PharmacistController {
    
    private final PharmacistService pharmacistService;

    @PostMapping
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PHARMACIST')")
    public ResponseEntity<PharmacistDTO> createPharmacist(@Valid @RequestBody CreatePharmacistRequestDTO request) {
        log.info("Nhận request tạo Pharmacist profile");
        PharmacistDTO pharmacist = pharmacistService.createPharmacist(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacist);
    }

    @PutMapping("/{pharmacistId}")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_PHARMACIST')")
    public ResponseEntity<PharmacistDTO> updatePharmacist(
            @PathVariable String pharmacistId,
            @Valid @RequestBody UpdatePharmacistRequestDTO request) {
        log.info("Nhận request cập nhật Pharmacist profile: {}", pharmacistId);
        PharmacistDTO pharmacist = pharmacistService.updatePharmacist(pharmacistId, request);
        return ResponseEntity.ok(pharmacist);
    }

    @DeleteMapping("/{pharmacistId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePharmacist(@PathVariable String pharmacistId) {
        log.info("Nhận request xóa Pharmacist profile: {}", pharmacistId);
        pharmacistService.deletePharmacist(pharmacistId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deletePharmacistByUserId(@PathVariable String userId) {
        log.info("Nhận request xóa Pharmacist profile theo User ID: {}", userId);
        pharmacistService.deletePharmacistByUserId(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{pharmacistId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<PharmacistDTO> getPharmacistById(@PathVariable String pharmacistId) {
        log.info("Nhận request lấy Pharmacist profile theo ID: {}", pharmacistId);
        PharmacistDTO pharmacist = pharmacistService.getPharmacistById(pharmacistId);
        return ResponseEntity.ok(pharmacist);
    }

    @GetMapping("/user/{userId}")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<PharmacistDTO> getPharmacistByUserId(@PathVariable String userId) {
        log.info("Nhận request lấy Pharmacist profile theo User ID: {}", userId);
        PharmacistDTO pharmacist = pharmacistService.getPharmacistByUserId(userId);
        return ResponseEntity.ok(pharmacist);
    }

    @GetMapping
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PharmacistDTO>> getAllPharmacists(
            @RequestParam(required = false) String degree,
            @RequestParam(required = false) String certificate) {
        log.info("Nhận request lấy danh sách Pharmacists với filters");
        List<PharmacistDTO> pharmacists = pharmacistService.getAllPharmacists(degree, certificate);
        return ResponseEntity.ok(pharmacists);
    }

    @GetMapping("/all")
    //@PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PharmacistDTO>> getAllPharmacistsList() {
        log.info("Nhận request lấy tất cả Pharmacists");
        List<PharmacistDTO> pharmacists = pharmacistService.getAllPharmacists();
        return ResponseEntity.ok(pharmacists);
    }

    @PutMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_PHARMACIST')")
    public ResponseEntity<PharmacistDTO> createOrUpdateMyProfile(
            @PathVariable String userId,
            @Valid @RequestBody ProfileDTO request) {
        log.info("Nhận request Pharmacist tự cập nhật profile: {}", userId);
        PharmacistDTO updatedProfile = pharmacistService.createOrUpdateMyProfile(userId, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/me/{userId}")
    //@PreAuthorize("hasAuthority('ROLE_PHARMACIST')")
    public ResponseEntity<PharmacistDTO> getMyProfile(@PathVariable String userId) {
        log.info("Nhận request Pharmacist lấy profile của mình: {}", userId);
        PharmacistDTO profile = pharmacistService.getMyProfile(userId);
        return ResponseEntity.ok(profile);
    }
}
