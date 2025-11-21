package com.do_an.userservice.service;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreateLabTechnicianRequestDTO;
import com.do_an.userservice.dto.request.UpdateLabTechnicianRequestDTO;
import com.do_an.userservice.dto.response.LabTechnicianDTO;
import com.do_an.userservice.entity.LabTechnician;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.ProfileNotFoundException;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.LabTechnicianMapper;
import com.do_an.userservice.repository.LabTechnicianRepository;
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
public class LabTechnicianService {

    private final LabTechnicianRepository labTechnicianRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LabTechnicianMapper labTechnicianMapper;
    private final UserService userService;

    /**
     * CHỨC NĂNG 1: Tạo LabTechnician profile mới
     */
    @Transactional
    public LabTechnicianDTO createLabTechnician(CreateLabTechnicianRequestDTO request) {
        log.info("Tạo LabTechnician profile cho user: {}", request.getUserId());
        
        // Kiểm tra User tồn tại
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + request.getUserId()));
        
        // Kiểm tra User đã có LabTechnician profile chưa
        if (labTechnicianRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User đã có LabTechnician profile");
        }
        
        // Kiểm tra và gán role LABTECHNICIAN nếu chưa có
        boolean hasLabTechRole = user.getRoles().stream()
                .anyMatch(role -> "LABTECHNICIAN".equalsIgnoreCase(role.getRoleName()));
        
        if (!hasLabTechRole) {
            Role labTechRole = roleRepository.findByRoleName("LABTECHNICIAN")
                    .orElseThrow(() -> new RuntimeException("CRITICAL: 'LABTECHNICIAN' role not found in database!"));
            user.getRoles().add(labTechRole);
            userRepository.save(user);
            log.info("Đã tự động gán role LABTECHNICIAN cho user: {}", request.getUserId());
        }
        
        // Tạo LabTechnician profile
        LabTechnician labTechnician = new LabTechnician();
        labTechnician.setUser(user);
        labTechnician.setField(request.getField());
        
        LabTechnician savedLabTech = labTechnicianRepository.save(labTechnician);
        
        log.info("Đã tạo LabTechnician profile thành công: {}", savedLabTech.getId());
        return labTechnicianMapper.toDto(savedLabTech);
    }

    /**
     * CHỨC NĂNG 2: Cập nhật LabTechnician profile
     */
    @Transactional
    public LabTechnicianDTO updateLabTechnician(UUID labTechnicianId, UpdateLabTechnicianRequestDTO request) {
        log.info("Cập nhật LabTechnician profile: {}", labTechnicianId);
        
        LabTechnician labTechnician = labTechnicianRepository.findById(labTechnicianId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy LabTechnician profile với ID: " + labTechnicianId));
        
        // Cập nhật thông tin LabTechnician
        if (request.getField() != null) {
            labTechnician.setField(request.getField());
        }
        
        LabTechnician savedLabTech = labTechnicianRepository.save(labTechnician);
        
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
            userService.updateUserProfile(labTechnician.getUser().getId(), userAttributes);
        }
        
        // Reload để lấy đầy đủ thông tin
        savedLabTech = labTechnicianRepository.findById(savedLabTech.getId()).orElse(savedLabTech);
        
        log.info("Đã cập nhật LabTechnician profile thành công: {}", labTechnicianId);
        return labTechnicianMapper.toDto(savedLabTech);
    }

    /**
     * CHỨC NĂNG 3: Xóa LabTechnician profile
     */
    @Transactional
    public void deleteLabTechnician(UUID labTechnicianId) {
        log.info("Xóa LabTechnician profile: {}", labTechnicianId);
        
        LabTechnician labTechnician = labTechnicianRepository.findById(labTechnicianId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy LabTechnician profile với ID: " + labTechnicianId));
        
        // Xóa role LABTECHNICIAN khỏi User (nếu có)
        User user = labTechnician.getUser();
        if (user != null) {
            user.getRoles().removeIf(role -> "LABTECHNICIAN".equalsIgnoreCase(role.getRoleName()));
            userRepository.save(user);
            log.info("Đã xóa role LABTECHNICIAN khỏi user: {}", user.getId());
        }
        
        labTechnicianRepository.delete(labTechnician);
        log.info("Đã xóa LabTechnician profile thành công: {}", labTechnicianId);
    }

    /**
     * CHỨC NĂNG 4: Xóa LabTechnician profile theo User ID
     */
    @Transactional
    public void deleteLabTechnicianByUserId(UUID userId) {
        log.info("Xóa LabTechnician profile theo User ID: {}", userId);
        
        LabTechnician labTechnician = labTechnicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy LabTechnician profile cho User: " + userId));
        
        deleteLabTechnician(labTechnician.getId());
    }

    /**
     * CHỨC NĂNG 5: Lấy LabTechnician theo LabTechnician ID
     */
    @Transactional(readOnly = true)
    public LabTechnicianDTO getLabTechnicianById(UUID labTechnicianId) {
        log.debug("Lấy LabTechnician profile theo ID: {}", labTechnicianId);
        
        LabTechnician labTechnician = labTechnicianRepository.findById(labTechnicianId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy LabTechnician profile với ID: " + labTechnicianId));
        
        return labTechnicianMapper.toDto(labTechnician);
    }

    /**
     * CHỨC NĂNG 6: Lấy LabTechnician theo User ID
     */
    @Transactional(readOnly = true)
    public LabTechnicianDTO getLabTechnicianByUserId(UUID userId) {
        log.debug("Lấy LabTechnician profile theo User ID: {}", userId);
        
        LabTechnician labTechnician = labTechnicianRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy LabTechnician profile cho User: " + userId));
        
        return labTechnicianMapper.toDto(labTechnician);
    }

    /**
     * CHỨC NĂNG 7: Lấy danh sách LabTechnicians với filter
     */
    @Transactional(readOnly = true)
    public List<LabTechnicianDTO> getAllLabTechnicians(String field) {
        log.debug("Lấy danh sách LabTechnicians với filter - Field: {}", field);
        
        List<LabTechnician> labTechnicians;
        
        if (field != null && !field.isEmpty()) {
            // Tìm kiếm không phân biệt hoa thường
            labTechnicians = labTechnicianRepository.findAllByFieldContainingIgnoreCase(field);
        } else {
            // Lấy tất cả
            labTechnicians = labTechnicianRepository.findAll();
        }
        
        return labTechnicians.stream()
                .map(labTechnicianMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 8: Lấy tất cả LabTechnicians
     */
    @Transactional(readOnly = true)
    public List<LabTechnicianDTO> getAllLabTechnicians() {
        log.debug("Lấy tất cả LabTechnicians");
        
        List<LabTechnician> labTechnicians = labTechnicianRepository.findAll();
        return labTechnicians.stream()
                .map(labTechnicianMapper::toDto)
                .collect(Collectors.toList());
    }

    // ==== CÁC PHƯƠNG THỨC CŨ (GIỮ NGUYÊN) ====

    @Transactional(readOnly = true)
    public LabTechnicianDTO getMyProfile(UUID userId) {
        return labTechnicianRepository.findByUserId(userId)
                .map(labTechnicianMapper::toDto)
                .orElseThrow(() -> new ProfileNotFoundException("LabTechnician profile not found."));
    }

    /**
     * KTV Lab tự CẬP NHẬT hoặc TẠO MỚI hồ sơ.
     */
    @Transactional
    public LabTechnicianDTO createOrUpdateMyProfile(UUID userId, ProfileDTO request) {
        // BƯỚC 0: Cập nhật thông tin Bảng User (nếu có)
        userService.updateUserProfile(userId, request.getUserAttributes());

        LabTechnician labTechnician = labTechnicianRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Logic CREATE
                    LabTechnician newLabTech = new LabTechnician();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UserNotFoundException("User not found."));
                    newLabTech.setUser(user);
                    return newLabTech;
                });

        // Logic UPDATE (cho cả Create và Update)
        Map<String, Object> attributes = request.getProfileAttributes();
        if (attributes != null) {
            if (attributes.containsKey("field")) {
                labTechnician.setField((String) attributes.get("field"));
            }
        }

        LabTechnician savedLabTech = labTechnicianRepository.save(labTechnician);
        return labTechnicianMapper.toDto(savedLabTech);
    }
}
