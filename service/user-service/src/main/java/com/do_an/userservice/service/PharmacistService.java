package com.do_an.userservice.service;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreatePharmacistRequestDTO;
import com.do_an.userservice.dto.request.UpdatePharmacistRequestDTO;
import com.do_an.userservice.dto.response.PharmacistDTO;
import com.do_an.userservice.entity.Pharmacist;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.ProfileNotFoundException;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.PharmacistMapper;
import com.do_an.userservice.repository.PharmacistRepository;
import com.do_an.userservice.repository.RoleRepository;
import com.do_an.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacistService {
    
    private final PharmacistRepository pharmacistRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PharmacistMapper pharmacistMapper;
    private final UserService userService;

    /**
     * CHỨC NĂNG 1: Tạo Pharmacist profile mới
     */
    @Transactional
    public PharmacistDTO createPharmacist(CreatePharmacistRequestDTO request) {
        log.info("Tạo Pharmacist profile cho user: {}", request.getUserId());
        
        // Kiểm tra User tồn tại
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + request.getUserId()));
        
        // Kiểm tra User đã có Pharmacist profile chưa
        if (pharmacistRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User đã có Pharmacist profile");
        }
        
        // Kiểm tra và gán role PHARMACIST nếu chưa có
        boolean hasPharmacistRole = user.getRoles().stream()
                .anyMatch(role -> "PHARMACIST".equalsIgnoreCase(role.getRoleName()));
        
        if (!hasPharmacistRole) {
            Role pharmacistRole = roleRepository.findByRoleName("PHARMACIST")
                    .orElseThrow(() -> new RuntimeException("CRITICAL: 'PHARMACIST' role not found in database!"));
            user.getRoles().add(pharmacistRole);
            userRepository.save(user);
            log.info("Đã tự động gán role PHARMACIST cho user: {}", request.getUserId());
        }
        
        // Tạo Pharmacist profile
        Pharmacist pharmacist = new Pharmacist();
        pharmacist.setId(UUID.randomUUID().toString());
        pharmacist.setUser(user);
        pharmacist.setDegree(request.getDegree());
        pharmacist.setCertificate(request.getCertificate());
        
        Pharmacist savedPharmacist = pharmacistRepository.save(pharmacist);
        
        log.info("Đã tạo Pharmacist profile thành công: {}", savedPharmacist.getId());
        return pharmacistMapper.toDto(savedPharmacist);
    }

    /**
     * CHỨC NĂNG 2: Cập nhật Pharmacist profile
     */
    @Transactional
    public PharmacistDTO updatePharmacist(String pharmacistId, UpdatePharmacistRequestDTO request) {
        log.info("Cập nhật Pharmacist profile: {}", pharmacistId);
        
        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Pharmacist profile với ID: " + pharmacistId));
        
        // Cập nhật thông tin Pharmacist
        if (request.getDegree() != null) {
            pharmacist.setDegree(request.getDegree());
        }
        if (request.getCertificate() != null) {
            pharmacist.setCertificate(request.getCertificate());
        }
        
        Pharmacist savedPharmacist = pharmacistRepository.save(pharmacist);
        
        // Cập nhật thông tin User nếu có
        if (request.getFullName() != null || request.getPhone() != null || request.getImageUrl() != null) {
            Map<String, Object> userAttributes = new HashMap<>();
            if (request.getFullName() != null) {
                userAttributes.put("fullName", request.getFullName());
            }
            if (request.getPhone() != null) {
                userAttributes.put("phone", request.getPhone());
            }
            if (request.getImageUrl() != null) {
                userAttributes.put("avatarUrl", request.getImageUrl());
            }
            userService.updateUserProfile(pharmacist.getUser().getId(), userAttributes);
        }
        
        // Reload để lấy đầy đủ thông tin
        savedPharmacist = pharmacistRepository.findById(savedPharmacist.getId()).orElse(savedPharmacist);
        
        log.info("Đã cập nhật Pharmacist profile thành công: {}", pharmacistId);
        return pharmacistMapper.toDto(savedPharmacist);
    }

    /**
     * CHỨC NĂNG 3: Xóa Pharmacist profile
     */
    @Transactional
    public void deletePharmacist(String pharmacistId) {
        log.info("Xóa Pharmacist profile: {}", pharmacistId);
        
        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Pharmacist profile với ID: " + pharmacistId));
        
        // Xóa role PHARMACIST khỏi User (nếu có)
        User user = pharmacist.getUser();
        if (user != null) {
            user.getRoles().removeIf(role -> "PHARMACIST".equalsIgnoreCase(role.getRoleName()));
            userRepository.save(user);
            log.info("Đã xóa role PHARMACIST khỏi user: {}", user.getId());
        }
        
        pharmacistRepository.delete(pharmacist);
        log.info("Đã xóa Pharmacist profile thành công: {}", pharmacistId);
    }

    /**
     * CHỨC NĂNG 4: Xóa Pharmacist profile theo User ID
     */
    @Transactional
    public void deletePharmacistByUserId(String userId) {
        log.info("Xóa Pharmacist profile theo User ID: {}", userId);
        
        Pharmacist pharmacist = pharmacistRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Pharmacist profile cho User: " + userId));
        
        deletePharmacist(pharmacist.getId());
    }

    /**
     * CHỨC NĂNG 5: Lấy Pharmacist theo Pharmacist ID
     */
    @Transactional(readOnly = true)
    public PharmacistDTO getPharmacistById(String pharmacistId) {
        log.debug("Lấy Pharmacist profile theo ID: {}", pharmacistId);
        
        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Pharmacist profile với ID: " + pharmacistId));
        
        return pharmacistMapper.toDto(pharmacist);
    }

    /**
     * CHỨC NĂNG 6: Lấy Pharmacist theo User ID
     */
    @Transactional(readOnly = true)
    public PharmacistDTO getPharmacistByUserId(String userId) {
        log.debug("Lấy Pharmacist profile theo User ID: {}", userId);
        
        Pharmacist pharmacist = pharmacistRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Pharmacist profile cho User: " + userId));
        
        return pharmacistMapper.toDto(pharmacist);
    }

    /**
     * CHỨC NĂNG 7: Lấy danh sách Pharmacists với filter
     */
    @Transactional(readOnly = true)
    public List<PharmacistDTO> getAllPharmacists(String degree, String certificate) {
        log.debug("Lấy danh sách Pharmacists với filters - Degree: {}, Certificate: {}", degree, certificate);
        
        List<Pharmacist> pharmacists;
        
        // Xử lý các trường hợp filter khác nhau
        if (degree != null && certificate != null) {
            pharmacists = pharmacistRepository.findAllByDegreeContainingIgnoreCaseAndCertificateContainingIgnoreCase(
                    degree, certificate);
        } else if (degree != null && !degree.isEmpty()) {
            pharmacists = pharmacistRepository.findAllByDegreeContainingIgnoreCase(degree);
        } else if (certificate != null && !certificate.isEmpty()) {
            pharmacists = pharmacistRepository.findAllByCertificateContainingIgnoreCase(certificate);
        } else {
            pharmacists = pharmacistRepository.findAll();
        }
        
        return pharmacists.stream()
                .map(pharmacistMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 8: Lấy tất cả Pharmacists
     */
    @Transactional(readOnly = true)
    public List<PharmacistDTO> getAllPharmacists() {
        log.debug("Lấy tất cả Pharmacists");
        
        List<Pharmacist> pharmacists = pharmacistRepository.findAll();
        return pharmacists.stream()
                .map(pharmacistMapper::toDto)
                .collect(Collectors.toList());
    }

    // ==== CÁC PHƯƠNG THỨC CŨ (GIỮ NGUYÊN) ====

    @Transactional(readOnly = true)
    public PharmacistDTO getMyProfile(String userId) {
        return pharmacistRepository.findByUserId(userId)
                .map(pharmacistMapper::toDto)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy hồ sơ dược sĩ."));
    }

    /**
     * Dược sĩ tự CẬP NHẬT hoặc TẠO MỚI hồ sơ.
     */
    @Transactional
    public PharmacistDTO createOrUpdateMyProfile(String userId, ProfileDTO request) {
        // BƯỚC 0: Cập nhật thông tin Bảng User (nếu có)
        userService.updateUserProfile(userId, request.getUserAttributes());

        Pharmacist pharmacist = pharmacistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Logic CREATE
                    Pharmacist newPharmacist = new Pharmacist();
                    newPharmacist.setId(UUID.randomUUID().toString());
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
                    newPharmacist.setUser(user);
                    return newPharmacist;
                });

        // Logic UPDATE (cho cả Create và Update)
        Map<String, Object> attributes = request.getProfileAttributes();
        if (attributes != null) {
            if (attributes.containsKey("degree")) {
                pharmacist.setDegree((String) attributes.get("degree"));
            }
            if (attributes.containsKey("certificate")) {
                pharmacist.setCertificate((String) attributes.get("certificate"));
            }
        }

        Pharmacist savedPharmacist = pharmacistRepository.save(pharmacist);
        return pharmacistMapper.toDto(savedPharmacist);
    }
}
