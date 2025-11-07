package com.do_an.userservice.service;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreatePatientRequestDTO;
import com.do_an.userservice.dto.request.UpdatePatientRequestDTO;
import com.do_an.userservice.dto.response.PatientDTO;
import com.do_an.userservice.entity.Patient;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.ProfileNotFoundException;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.PatientMapper;
import com.do_an.userservice.repository.PatientRepository;
import com.do_an.userservice.repository.RoleRepository;
import com.do_an.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientMapper patientMapper;
    private final UserService userService;

    /**
     * CHỨC NĂNG 1: Tạo Patient profile mới
     */
    @Transactional
    public PatientDTO createPatient(CreatePatientRequestDTO request) {
        log.info("Tạo Patient profile cho user: {}", request.getUserId());
        
        // Kiểm tra User tồn tại
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + request.getUserId()));
        
        // Kiểm tra User đã có Patient profile chưa
        if (patientRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User đã có Patient profile");
        }
        
        // Kiểm tra insurance number đã tồn tại chưa (nếu có)
        if (request.getInsuranceNumber() != null && !request.getInsuranceNumber().isEmpty()) {
            if (patientRepository.findByInsuranceNumber(request.getInsuranceNumber()).isPresent()) {
                throw new IllegalArgumentException("Insurance number đã tồn tại: " + request.getInsuranceNumber());
            }
        }
        
        // Kiểm tra và gán role PATIENT nếu chưa có
        boolean hasPatientRole = user.getRoles().stream()
                .anyMatch(role -> "PATIENT".equalsIgnoreCase(role.getRoleName()));
        
        if (!hasPatientRole) {
            Role patientRole = roleRepository.findByRoleName("PATIENT")
                    .orElseThrow(() -> new RuntimeException("CRITICAL: 'PATIENT' role not found in database!"));
            user.getRoles().add(patientRole);
            userRepository.save(user);
            log.info("Đã tự động gán role PATIENT cho user: {}", request.getUserId());
        }
        
        // Tạo Patient profile
        Patient patient = new Patient();
        patient.setId(UUID.randomUUID().toString());
        patient.setUser(user);
        patient.setDob(request.getDob());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());
        patient.setBloodType(request.getBloodType());
        patient.setAllergy(request.getAllergy());
        patient.setInsuranceNumber(request.getInsuranceNumber());
        
        Patient savedPatient = patientRepository.save(patient);
        
        log.info("Đã tạo Patient profile thành công: {}", savedPatient.getId());
        return patientMapper.toDto(savedPatient);
    }

    /**
     * CHỨC NĂNG 2: Cập nhật Patient profile
     */
    @Transactional
    public PatientDTO updatePatient(String patientId, UpdatePatientRequestDTO request) {
        log.info("Cập nhật Patient profile: {}", patientId);
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile với ID: " + patientId));
        
        // Cập nhật thông tin Patient
        if (request.getDob() != null) {
            patient.setDob(request.getDob());
        }
        if (request.getGender() != null) {
            patient.setGender(request.getGender());
        }
        if (request.getAddress() != null) {
            patient.setAddress(request.getAddress());
        }
        if (request.getBloodType() != null) {
            patient.setBloodType(request.getBloodType());
        }
        if (request.getAllergy() != null) {
            patient.setAllergy(request.getAllergy());
        }
        if (request.getInsuranceNumber() != null) {
            // Kiểm tra insurance number không trùng với patient khác
            patientRepository.findByInsuranceNumber(request.getInsuranceNumber())
                    .ifPresent(existingPatient -> {
                        if (!existingPatient.getId().equals(patientId)) {
                            throw new IllegalArgumentException("Insurance number đã được sử dụng bởi patient khác");
                        }
                    });
            patient.setInsuranceNumber(request.getInsuranceNumber());
        }
        
        Patient savedPatient = patientRepository.save(patient);
        
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
            userService.updateUserProfile(patient.getUser().getId(), userAttributes);
        }
        
        // Reload để lấy đầy đủ thông tin
        savedPatient = patientRepository.findById(savedPatient.getId()).orElse(savedPatient);
        
        log.info("Đã cập nhật Patient profile thành công: {}", patientId);
        return patientMapper.toDto(savedPatient);
    }

    /**
     * CHỨC NĂNG 3: Xóa Patient profile
     */
    @Transactional
    public void deletePatient(String patientId) {
        log.info("Xóa Patient profile: {}", patientId);
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile với ID: " + patientId));
        
        // Xóa role PATIENT khỏi User (nếu có)
        User user = patient.getUser();
        if (user != null) {
            user.getRoles().removeIf(role -> "PATIENT".equalsIgnoreCase(role.getRoleName()));
            userRepository.save(user);
            log.info("Đã xóa role PATIENT khỏi user: {}", user.getId());
        }
        
        patientRepository.delete(patient);
        log.info("Đã xóa Patient profile thành công: {}", patientId);
    }

    /**
     * CHỨC NĂNG 4: Xóa Patient profile theo User ID
     */
    @Transactional
    public void deletePatientByUserId(String userId) {
        log.info("Xóa Patient profile theo User ID: {}", userId);
        
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile cho User: " + userId));
        
        deletePatient(patient.getId());
    }

    /**
     * CHỨC NĂNG 5: Lấy Patient theo Patient ID
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(String patientId) {
        log.debug("Lấy Patient profile theo ID: {}", patientId);
        
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile với ID: " + patientId));
        
        return patientMapper.toDto(patient);
    }

    /**
     * CHỨC NĂNG 6: Lấy Patient theo User ID
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientByUserId(String userId) {
        log.debug("Lấy Patient profile theo User ID: {}", userId);
        
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile cho User: " + userId));
        
        return patientMapper.toDto(patient);
    }

    /**
     * CHỨC NĂNG 7: Lấy Patient theo Insurance Number
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientByInsuranceNumber(String insuranceNumber) {
        log.debug("Lấy Patient profile theo Insurance Number: {}", insuranceNumber);
        
        Patient patient = patientRepository.findByInsuranceNumber(insuranceNumber)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Patient profile với Insurance Number: " + insuranceNumber));
        
        return patientMapper.toDto(patient);
    }

    /**
     * CHỨC NĂNG 8: Lấy danh sách Patients với filter
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients(
            String gender,
            String bloodType,
            String address,
            LocalDate dobFrom,
            LocalDate dobTo) {
        
        log.debug("Lấy danh sách Patients với filters - Gender: {}, BloodType: {}, Address: {}", 
                gender, bloodType, address);
        
        List<Patient> patients;
        
        // Xử lý các trường hợp filter khác nhau
        if (gender != null && bloodType != null) {
            patients = patientRepository.findAllByGenderAndBloodType(gender, bloodType);
        } else if (gender != null) {
            patients = patientRepository.findAllByGender(gender);
        } else if (bloodType != null) {
            patients = patientRepository.findAllByBloodType(bloodType);
        } else if (address != null && !address.isEmpty()) {
            patients = patientRepository.findAllByAddressContainingIgnoreCase(address);
        } else if (dobFrom != null && dobTo != null) {
            patients = patientRepository.findAllByDobBetween(dobFrom, dobTo);
        } else {
            patients = patientRepository.findAll();
        }
        
        return patients.stream()
                .map(patientMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 9: Lấy tất cả Patients
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> getAllPatients() {
        log.debug("Lấy tất cả Patients");
        
        List<Patient> patients = patientRepository.findAll();
        return patients.stream()
                .map(patientMapper::toDto)
                .collect(Collectors.toList());
    }

    // ==== CÁC PHƯƠNG THỨC CŨ (GIỮ NGUYÊN) ====

    @Transactional(readOnly = true)
    public PatientDTO getMyProfile(String userId) {
        return patientRepository.findByUserId(userId)
                .map(patientMapper::toDto)
                .orElseThrow(() -> new ProfileNotFoundException("Patient profile not found."));
    }

    /**
     * Người dùng (Bệnh nhân) tự cập nhật hồ sơ của mình.
     * Đây là logic UPDATE-ONLY.
     */
    @Transactional
    public PatientDTO updateMyProfile(String userId, ProfileDTO request) {
        // BƯỚC 0: Cập nhật thông tin Bảng User (nếu có)
        userService.updateUserProfile(userId, request.getUserAttributes());

        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Patient profile not found. Cannot update."));

        Map<String, Object> attributes = request.getProfileAttributes();
        if (attributes == null) {
            return patientMapper.toDto(patient); // Không có gì để cập nhật
        }

        // Cập nhật các trường từ Map
        if (attributes.containsKey("dob")) {
            patient.setDob(LocalDate.parse((String) attributes.get("dob")));
        }
        if (attributes.containsKey("gender")) {
            patient.setGender((String) attributes.get("gender"));
        }
        if (attributes.containsKey("address")) {
            patient.setAddress((String) attributes.get("address"));
        }
        if (attributes.containsKey("bloodType")) {
            patient.setBloodType((String) attributes.get("bloodType"));
        }
        if (attributes.containsKey("allergy")) {
            patient.setAllergy((String) attributes.get("allergy"));
        }
        if (attributes.containsKey("insuranceNumber")) {
            patient.setInsuranceNumber((String) attributes.get("insuranceNumber"));
        }

        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toDto(savedPatient);
    }
}