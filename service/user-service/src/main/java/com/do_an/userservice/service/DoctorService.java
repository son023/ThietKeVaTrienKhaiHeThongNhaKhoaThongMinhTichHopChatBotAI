package com.do_an.userservice.service;

import com.do_an.userservice.dto.DegreeDTO;
import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.CreateDoctorRequestDTO;
import com.do_an.userservice.dto.request.UpdateDoctorRequestDTO;
import com.do_an.userservice.dto.response.DoctorDTO;
import com.do_an.userservice.entity.Degree;
import com.do_an.userservice.entity.Doctor;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.ProfileNotFoundException;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.DegreeMapper;
import com.do_an.userservice.mapper.DoctorMapper;
import com.do_an.userservice.repository.DegreeRepository;
import com.do_an.userservice.repository.DoctorRepository;
import com.do_an.userservice.repository.RoleRepository;
import com.do_an.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorService {
    
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final DegreeRepository degreeRepository;
    private final RoleRepository roleRepository;
    private final DoctorMapper doctorMapper;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    /**
     * CHỨC NĂNG 1: Tạo Doctor profile mới
     */
    @Transactional
    public DoctorDTO createDoctor(CreateDoctorRequestDTO request) {
        log.info("Tạo Doctor profile cho user: {}", request.getUserId());
        
        // Kiểm tra User tồn tại
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + request.getUserId()));
        
        // Kiểm tra User đã có Doctor profile chưa
        if (doctorRepository.findByUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User đã có Doctor profile");
        }
        
        // Kiểm tra license number đã tồn tại chưa (nếu có)
        if (request.getLicenseNumber() != null && !request.getLicenseNumber().isEmpty()) {
            if (doctorRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
                throw new IllegalArgumentException("License number đã tồn tại: " + request.getLicenseNumber());
            }
        }
        
        // Kiểm tra và gán role DOCTOR nếu chưa có
        boolean hasDoctorRole = user.getRoles().stream()
                .anyMatch(role -> "DOCTOR".equalsIgnoreCase(role.getRoleName()));
        
        if (!hasDoctorRole) {
            Role doctorRole = roleRepository.findByRoleName("DOCTOR")
                    .orElseThrow(() -> new RuntimeException("CRITICAL: 'DOCTOR' role not found in database!"));
            user.getRoles().add(doctorRole);
            userRepository.save(user);
            log.info("Đã tự động gán role DOCTOR cho user: {}", request.getUserId());
        }
        
        // Tạo Doctor profile
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecializationCode(request.getSpecializationCode());
        doctor.setWorkingHospital(request.getWorkingHospital());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setConsultationFeeAmount(request.getConsultationFeeAmount());
        
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        // Xử lý degrees nếu có
        if (request.getDegrees() != null && !request.getDegrees().isEmpty()) {
            savedDoctor = syncDegrees(savedDoctor, request.getDegrees());
            // Reload để lấy degrees
            //savedDoctor = doctorRepository.findById(savedDoctor.getId()).orElse(savedDoctor);
        }
        //savedDoctor.getDegrees().size();

        log.info("Đã tạo Doctor profile thành công: {}", savedDoctor.getId());
        return doctorMapper.toDto(savedDoctor);
    }

    /**
     * CHỨC NĂNG 2: Cập nhật Doctor profile
     */
    @Transactional
    public DoctorDTO updateDoctor(UUID doctorId, UpdateDoctorRequestDTO request) {
        log.info("Cập nhật Doctor profile: {}", doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Doctor profile với ID: " + doctorId));
        
        // Cập nhật thông tin Doctor
        if (request.getSpecializationCode() != null) {
            doctor.setSpecializationCode(request.getSpecializationCode());
        }
        if (request.getWorkingHospital() != null) {
            doctor.setWorkingHospital(request.getWorkingHospital());
        }
        if (request.getLicenseNumber() != null) {
            // Kiểm tra license number không trùng với doctor khác
            doctorRepository.findByLicenseNumber(request.getLicenseNumber())
                    .ifPresent(existingDoctor -> {
                        if (!existingDoctor.getId().equals(doctorId)) {
                            throw new IllegalArgumentException("License number đã được sử dụng bởi doctor khác");
                        }
                    });
            doctor.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getConsultationFeeAmount() != null) {
            doctor.setConsultationFeeAmount(request.getConsultationFeeAmount());
        }
        
        // Cập nhật degrees nếu có
        if (request.getDegrees() != null) {
            syncDegrees(doctor, request.getDegrees());
        }
        
        Doctor savedDoctor = doctorRepository.save(doctor);
        
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
            userService.updateUserProfile(doctor.getUser().getId(), userAttributes);
        }
        
        // Reload để lấy đầy đủ thông tin
        savedDoctor = doctorRepository.findById(savedDoctor.getId()).orElse(savedDoctor);
        
        log.info("Đã cập nhật Doctor profile thành công: {}", doctorId);
        return doctorMapper.toDto(savedDoctor);
    }

    /**
     * CHỨC NĂNG 3: Xóa Doctor profile
     */
    @Transactional
    public void deleteDoctor(UUID doctorId) {
        log.info("Xóa Doctor profile: {}", doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Doctor profile với ID: " + doctorId));
        
        // Xóa tất cả degrees và file ảnh liên quan
        List<Degree> degrees = degreeRepository.findByDoctorId(doctorId);
        for (Degree degree : degrees) {
            deleteDegreeImage(degree.getImageUrl());
        }
        degreeRepository.deleteAll(degrees);
        
        // Xóa role DOCTOR khỏi User (nếu có)
        User user = doctor.getUser();
        if (user != null) {
            user.getRoles().removeIf(role -> "DOCTOR".equalsIgnoreCase(role.getRoleName()));
            userRepository.save(user);
            log.info("Đã xóa role DOCTOR khỏi user: {}", user.getId());
        }
        
        doctorRepository.delete(doctor);
        log.info("Đã xóa Doctor profile thành công: {}", doctorId);
    }

    /**
     * CHỨC NĂNG 4: Xóa Doctor profile theo User ID
     */
    @Transactional
    public void deleteDoctorByUserId(UUID userId) {
        log.info("Xóa Doctor profile theo User ID: {}", userId);
        
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Doctor profile cho User: " + userId));
        
        deleteDoctor(doctor.getId());
    }

    /**
     * CHỨC NĂNG 5: Lấy Doctor theo Doctor ID
     */
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorById(UUID doctorId) {
        log.debug("Lấy Doctor profile theo ID: {}", doctorId);
        
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Doctor profile với ID: " + doctorId));
        
        return doctorMapper.toDto(doctor);
    }

    /**
     * CHỨC NĂNG 6: Lấy Doctor theo User ID
     */
    @Transactional(readOnly = true)
    public DoctorDTO getDoctorByUserId(UUID userId) {
        log.debug("Lấy Doctor profile theo User ID: {}", userId);
        
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy Doctor profile cho User: " + userId));
        
        return doctorMapper.toDto(doctor);
    }

    /**
     * CHỨC NĂNG 7: Lấy danh sách Doctors với filter
     */
    @Transactional(readOnly = true)
    public List<DoctorDTO> getAllDoctors(
            String specializationCode,
            String workingHospital,
            Integer minFee,
            Integer maxFee) {
        
        log.debug("Lấy danh sách Doctors với filters - Specialization: {}, Hospital: {}, Fee: {}-{}", 
                specializationCode, workingHospital, minFee, maxFee);
        
        List<Doctor> doctors;
        
        // Xử lý các trường hợp filter khác nhau
        if (specializationCode != null && workingHospital != null) {
            doctors = doctorRepository.findAllBySpecializationCodeAndWorkingHospitalContainingIgnoreCase(
                    specializationCode, workingHospital);
        } else if (specializationCode != null) {
            doctors = doctorRepository.findAllBySpecializationCode(specializationCode);
        } else if (workingHospital != null) {
            doctors = doctorRepository.findAllByWorkingHospitalContainingIgnoreCase(workingHospital);
        } else {
            doctors = doctorRepository.findAll();
        }
        
        // Filter theo fee range nếu có
        if (minFee != null || maxFee != null) {
            doctors = doctors.stream()
                    .filter(doctor -> {
                        Integer fee = doctor.getConsultationFeeAmount();
                        if (fee == null) return false;
                        if (minFee != null && fee < minFee) return false;
                        if (maxFee != null && fee > maxFee) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
        }
        
        return doctors.stream()
                .map(doctorMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 8: Lấy tất cả Doctors
     */
    @Transactional(readOnly = true)
    public List<DoctorDTO> getAllDoctors() {
        log.debug("Lấy tất cả Doctors");
        
        List<Doctor> doctors = doctorRepository.findAll();
        return doctors.stream()
                .map(doctorMapper::toDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public DoctorDTO createOrUpdateMyProfile(UUID userId, ProfileDTO request) {
        userService.updateUserProfile(userId, request.getUserAttributes());
        Doctor doctor = upsertDoctorProfile(userId, request.getProfileAttributes());
        if (request.getDegrees() != null) {
            syncDegrees(doctor, request.getDegrees());
        }
        Doctor savedDoctor = doctorRepository.save(doctor);
        Doctor fullDoctorInfo = doctorRepository.findById(savedDoctor.getId()).get();
        return doctorMapper.toDto(fullDoctorInfo);
    }

    @Transactional
    public Doctor upsertDoctorProfile(UUID userId, Map<String, Object> attributes) {
        Doctor doctor = doctorRepository.findByUserId(userId).orElseGet(() -> {
            Doctor newDoctor = new Doctor();
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng , không thể tạo hồ sơ"));
            newDoctor.setUser(currentUser);
            return newDoctor;
        });

        if (attributes != null) {
            if (attributes.containsKey("specializationCode")) {
                doctor.setSpecializationCode((String) attributes.get("specializationCode"));
            }
            if (attributes.containsKey("workingHospital")) {
                doctor.setWorkingHospital((String) attributes.get("workingHospital"));
            }
            if (attributes.containsKey("licenseNumber")) {
                doctor.setLicenseNumber((String) attributes.get("licenseNumber"));
            }
            if (attributes.containsKey("consultationFeeAmount")) {
                Object fee = attributes.get("consultationFeeAmount");
                if (fee instanceof Integer) {
                    doctor.setConsultationFeeAmount((Integer) fee);
                } else if (fee instanceof String) {
                    doctor.setConsultationFeeAmount(Integer.parseInt((String) fee));
                }
            }
        }

        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor syncDegrees(Doctor doctor, List<DegreeDTO> degreeDtos) {
        Map<UUID, DegreeDTO> dtoMap = degreeDtos.stream()
                .filter(dto -> dto.getId() != null)
                .collect(Collectors.toMap(DegreeDTO::getId, Function.identity()));

        List<Degree> existingDegrees = degreeRepository.findByDoctorId(doctor.getId());
        List<Degree> degreesToRemove = existingDegrees.stream()
                .filter(existing -> !dtoMap.containsKey(existing.getId()))
                .collect(Collectors.toList());

        for (Degree degree : degreesToRemove) {
            deleteDegreeImage(degree.getImageUrl());
        }
        degreeRepository.deleteAll(degreesToRemove);

        Set<Degree> degreeSet = new HashSet<>();
        for (DegreeDTO dto : degreeDtos) {
            Degree degree;
            if (dto.getId() == null) {
                degree = new Degree();
                degree.setDoctor(doctor);
            } else {
                degree = degreeRepository.findByIdAndDoctorId(dto.getId(), doctor.getId())
                        .orElse(null);
                if (degree == null) continue;
            }

            degree.setDegreeName(dto.getDegreeName());
            degree.setInstitution(dto.getInstitution());
            degree.setYearObtained(dto.getYearObtained());

            if (dto.getImageUrl() != null) {
                String newImageUrl = dto.getImageUrl();
                String oldImageUrl = degree.getImageUrl();

                if (!newImageUrl.equals(oldImageUrl)) {
                    deleteDegreeImage(oldImageUrl);
                    degree.setImageUrl(newImageUrl);
                }
            }

            Degree savedDegree = degreeRepository.save(degree);
            degreeSet.add(savedDegree);
        }
        doctor.setDegrees(degreeSet);
        return doctor;
    }

    private void deleteDegreeImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }
        try {
            String fileName = fileStorageService.extractFileNameFromUrl(imageUrl);
            fileStorageService.deleteFile(fileName);
            log.info("Đã xóa ảnh bằng cấp cũ: {}", fileName);
        } catch (Exception e) {
            log.warn("Không thể xóa ảnh bằng cấp: {}", imageUrl, e);
        }
    }

    @Transactional(readOnly = true)
    public DoctorDTO getMyProfile(UUID userId) {
        return doctorRepository.findByUserId(userId)
                .map(doctorMapper::toDto)
                .orElseThrow(() -> new ProfileNotFoundException("Không tìm thấy hồ sơ bác sĩ. Vui lòng tạo hồ sơ."));
    }
}
