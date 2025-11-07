package com.do_an.userservice.service;

import com.do_an.userservice.dto.ProfileDTO;
import com.do_an.userservice.dto.request.RoleDTO;
import com.do_an.userservice.dto.response.*;
import com.do_an.userservice.entity.Admin;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.*;
import com.do_an.userservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AdminRepository adminRepository;

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PharmacistRepository pharmacistRepository;
    private final LabTechnicianRepository labTechnicianRepository;

    private final PatientMapper patientMapper;
    private final DoctorMapper doctorMapper;
    private final PharmacistMapper pharmacistMapper;
    private final LabTechnicianMapper labTechnicianMapper;
    private final UserMapper userMapper;
    private final AdminMapper adminMapper;

    // Inject các Service chuyên môn
    private final DoctorService doctorService;
    private final PatientService patientService;
    private final PharmacistService pharmacistService;
    private final LabTechnicianService labTechnicianService;
    private final UserService userService;

    // --- 0. CHỨC NĂNG CRUD CHO ADMIN PROFILE ---

    /**
     * CHỨC NĂNG 1: Tạo Admin profile cho User
     */
    @Transactional
    public AdminDTO createAdminProfile(String userId) {
        log.info("Tạo Admin profile cho user: {}", userId);
        
        // Kiểm tra User tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));
        
        // Kiểm tra User đã có Admin profile chưa
        if (adminRepository.findByUserId(userId).isPresent()) {
            throw new IllegalStateException("User đã có Admin profile");
        }
        
        // Kiểm tra User có role ADMIN chưa
        boolean hasAdminRole = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equalsIgnoreCase(role.getRoleName()));
        
        if (!hasAdminRole) {
            // Tự động gán role ADMIN
            Role adminRole = roleRepository.findByRoleName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("CRITICAL: 'ADMIN' role not found in database!"));
            user.getRoles().add(adminRole);
            userRepository.save(user);
            log.info("Đã tự động gán role ADMIN cho user: {}", userId);
        }
        
        // Tạo Admin profile
        Admin admin = new Admin();
        admin.setId(UUID.randomUUID().toString());
        admin.setUser(user);
        
        Admin savedAdmin = adminRepository.save(admin);
        log.info("Đã tạo Admin profile thành công: {}", savedAdmin.getId());
        
        return adminMapper.toDto(savedAdmin);
    }

    /**
     * CHỨC NĂNG 2: Lấy Admin profile theo Admin ID
     */
    @Transactional(readOnly = true)
    public AdminDTO getAdminById(String adminId) {
        log.debug("Lấy Admin profile theo ID: {}", adminId);
        
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Admin profile với ID: " + adminId));
        
        return adminMapper.toDto(admin);
    }

    /**
     * CHỨC NĂNG 3: Lấy Admin profile theo User ID
     */
    @Transactional(readOnly = true)
    public AdminDTO getAdminByUserId(String userId) {
        log.debug("Lấy Admin profile theo User ID: {}", userId);
        
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Admin profile cho User: " + userId));
        
        return adminMapper.toDto(admin);
    }

    /**
     * CHỨC NĂNG 4: Lấy tất cả Admin profiles
     */
    @Transactional(readOnly = true)
    public List<AdminDTO> getAllAdmins() {
        log.debug("Lấy tất cả Admin profiles");
        
        List<Admin> admins = adminRepository.findAll();
        return adminMapper.toDtoList(admins);
    }

    /**
     * CHỨC NĂNG 5: Xóa Admin profile
     */
    @Transactional
    public void deleteAdminProfile(String adminId) {
        log.info("Xóa Admin profile: {}", adminId);
        
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Admin profile với ID: " + adminId));
        
        // Xóa role ADMIN khỏi User (nếu có)
        User user = admin.getUser();
        if (user != null) {
            user.getRoles().removeIf(role -> "ADMIN".equalsIgnoreCase(role.getRoleName()));
            userRepository.save(user);
            log.info("Đã xóa role ADMIN khỏi user: {}", user.getId());
        }
        
        adminRepository.delete(admin);
        log.info("Đã xóa Admin profile thành công: {}", adminId);
    }

    /**
     * CHỨC NĂNG 6: Xóa Admin profile theo User ID
     */
    @Transactional
    public void deleteAdminProfileByUserId(String userId) {
        log.info("Xóa Admin profile theo User ID: {}", userId);
        
        Admin admin = adminRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Admin profile cho User: " + userId));
        
        deleteAdminProfile(admin.getId());
    }

    // --- 1. CHỨC NĂNG QUẢN LÝ USER ---

    /**
     * Lấy danh sách user (đơn giản) không phân trang.
     * Trả về UserDto (chỉ thông tin cơ bản)
     */
    @Transactional(readOnly = true)
    public List<UserDTO> findAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    /**
     * Lấy TOÀN BỘ thông tin chi tiết của 1 user
     */
    @Transactional(readOnly = true)
    public FullProfileDTO getFullUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Lấy các vai trò
        Set<String> roles = user.getRoles().stream()
                .map(ur -> ur.getRoleName())
                .collect(Collectors.toSet());

        // Dùng Builder để xây dựng DTO
        return FullProfileDTO.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .isActive(user.isActive())
                .imageUrl(user.getImageUrl())
                .roles(roles)
                // Lấy các hồ sơ con (sẽ trả về DTO hoặc null)
                .patientProfile(
                        patientRepository.findByUserId(userId).map(patientMapper::toDto).orElse(null)
                )
                .doctorProfile(
                        doctorRepository.findByUserId(userId).map(doctorMapper::toDto).orElse(null)
                )
                .pharmacistProfile(
                        pharmacistRepository.findByUserId(userId).map(pharmacistMapper::toDto).orElse(null)
                )
                .labTechnicianProfile(
                        labTechnicianRepository.findByUserId(userId).map(labTechnicianMapper::toDto).orElse(null)
                )
                .build();
    }

    /**
     * Kích hoạt hoặc Vô hiệu hóa User (Soft Delete)
     */
    @Transactional
    public void toggleUserStatus(String userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));
        user.setActive(status);
        userRepository.save(user);
    }

    // --- 2. CHỨC NĂNG QUẢN LÝ HỒ SƠ CHUYÊN MÔN ---

    /**
     * Admin cập nhật hồ sơ Bác sĩ (gọi logic của DoctorService)
     */
    @Transactional
    public DoctorDTO adminUpdateDoctorProfile(String userId, ProfileDTO dto) {
        // Tái sử dụng 100% logic "upsert" của DoctorService
        return doctorService.createOrUpdateMyProfile(userId, dto);
    }

    /**
     * Admin cập nhật hồ sơ Bệnh nhân (gọi logic của PatientService)
     */
    @Transactional
    public PatientDTO adminUpdatePatientProfile(String userId, ProfileDTO dto) {
        // Tái sử dụng 100% logic "update" của PatientService
        return patientService.updateMyProfile(userId, dto);
    }

    /**
     * Admin cập nhật hồ sơ Dược sĩ
     */
    @Transactional
    public PharmacistDTO adminUpdatePharmacistProfile(String userId, ProfileDTO dto) {
        return pharmacistService.createOrUpdateMyProfile(userId, dto);
    }

    /**
     * Admin cập nhật hồ sơ KTV Lab
     */
    @Transactional
    public LabTechnicianDTO adminUpdateLabTechnicianProfile(String userId, ProfileDTO dto) {
        return labTechnicianService.createOrUpdateMyProfile(userId, dto);
    }

    // --- 3. CHỨC NĂNG QUẢN LÝ VAI TRÒ ---

    @Transactional
    public void assignRoleToUser(String userId, RoleDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));

        Role newRole = roleRepository.findByRoleName(request.getRoleName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò: " + request.getRoleName()));

        // Kiểm tra role đã tồn tại chưa
        boolean roleExists = user.getRoles().stream()
                .anyMatch(role -> role.getRoleName().equalsIgnoreCase(request.getRoleName()));
        
        if (!roleExists) {
            user.getRoles().add(newRole);
            userRepository.save(user);
        }
    }

    @Transactional
    public void removeRoleFromUser(String userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));

        user.getRoles().removeIf(role -> role.getRoleName().equalsIgnoreCase(roleName));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<Role> findAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional
    public Role createRole(String roleName) {
        if (roleRepository.findByRoleName(roleName).isPresent()) {
            throw new IllegalArgumentException("Tên vai trò đã tồn tại");
        }
        Role newRole = new Role();
        newRole.setId(UUID.randomUUID().toString());
        newRole.setRoleName(roleName.toUpperCase()); // Luôn viết hoa
        return roleRepository.save(newRole);
    }

    @Transactional
    public Role updateRole(String roleId, String newRoleName) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role với ID: " + roleId));
        
        // Kiểm tra tên mới đã tồn tại chưa
        Optional<Role> existingRole = roleRepository.findByRoleName(newRoleName.toUpperCase());
        if (existingRole.isPresent() && !existingRole.get().getId().equals(roleId)) {
            throw new IllegalArgumentException("Tên vai trò đã tồn tại");
        }
        
        role.setRoleName(newRoleName.toUpperCase());
        return roleRepository.save(role);
    }

    @Transactional
    public void deleteRole(String roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role với ID: " + roleId));
        
        // Kiểm tra role có đang được sử dụng không
        long userCount = userRepository.findAll().stream()
                .filter(user -> user.getRoles().stream()
                        .anyMatch(r -> r.getId().equals(roleId)))
                .count();
        
        if (userCount > 0) {
            throw new IllegalStateException("Không thể xóa vai trò. Hiện có " + userCount + " người dùng đang sử dụng vai trò này.");
        }
        
        roleRepository.delete(role);
    }
}
