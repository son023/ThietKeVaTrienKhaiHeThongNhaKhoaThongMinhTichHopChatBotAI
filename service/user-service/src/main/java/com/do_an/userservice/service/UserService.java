package com.do_an.userservice.service;

import com.do_an.userservice.dto.request.CreateUserRequestDTO;
import com.do_an.userservice.dto.request.UpdateUserRequestDTO;
import com.do_an.userservice.dto.response.UserDTO;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.mapper.UserMapper;
import com.do_an.userservice.repository.RoleRepository;
import com.do_an.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    /**
     * CHỨC NĂNG 1: Tạo User mới
     */
    @Transactional
    public UserDTO createUser(CreateUserRequestDTO request) {
        log.info("Tạo user mới với username: {}", request.getUsername());
        
        // Kiểm tra username đã tồn tại
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username đã tồn tại: " + request.getUsername());
        }
        
        // Kiểm tra email đã tồn tại
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email đã tồn tại: " + request.getEmail());
        }
        
        // Tạo User mới
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getHashedPassword());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setImageUrl(request.getImageUrl());
        user.setActive(request.isActive());
        
        // Gán roles
        List<Role> roles = new ArrayList<>();
        if (request.getRoleNames() != null && !request.getRoleNames().isEmpty()) {
            for (String roleName : request.getRoleNames()) {
                Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy role: " + roleName));
                roles.add(role);
            }
        } else {
            // Mặc định là PATIENT nếu không có role nào
            Role defaultRole = roleRepository.findByRoleName("PATIENT")
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò 'PATIENT' trong cơ sở dữ liệu!"));
            roles.add(defaultRole);
        }
        user.setRoles(roles);
        
        User savedUser = userRepository.save(user);
        log.info("Đã tạo user thành công: {}", savedUser.getId());
        
        return userMapper.toDto(savedUser);
    }

    /**
     * CHỨC NĂNG 2: Cập nhật User
     */
    @Transactional
    public UserDTO updateUser(String userId, UpdateUserRequestDTO request) {
        log.info("Cập nhật user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));
        
        // Cập nhật các trường
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Kiểm tra email không trùng với user khác
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
                throw new IllegalArgumentException("Email đã được sử dụng bởi user khác");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        if (request.getImageUrl() != null) {
            // Xử lý xóa avatar cũ nếu có
            String oldAvatarUrl = user.getImageUrl();
            if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.equals(request.getImageUrl())) {
                try {
                    String oldFileName = fileStorageService.extractFileNameFromUrl(oldAvatarUrl);
                    fileStorageService.deleteFile(oldFileName);
                } catch (Exception e) {
                    log.warn("Không thể xóa avatar cũ: {}", oldAvatarUrl, e);
                }
            }
            user.setImageUrl(request.getImageUrl());
        }
        
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }
        
        // Cập nhật roles nếu có
        if (request.getRoleNames() != null && !request.getRoleNames().isEmpty()) {
            List<Role> roles = new ArrayList<>();
            for (String roleName : request.getRoleNames()) {
                Role role = roleRepository.findByRoleName(roleName.toUpperCase())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy role: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }
        
        User savedUser = userRepository.save(user);
        log.info("Đã cập nhật user thành công: {}", userId);
        
        return userMapper.toDto(savedUser);
    }

    /**
     * CHỨC NĂNG 3: Xóa User (soft delete - set isActive = false)
     */
    @Transactional
    public void deleteUser(String userId) {
        log.info("Xóa user (soft delete): {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));
        
        // Soft delete - chỉ set isActive = false
        user.setActive(false);
        userRepository.save(user);
        
        log.info("Đã xóa user thành công: {}", userId);
    }

    /**
     * CHỨC NĂNG 4: Xóa User vĩnh viễn (hard delete)
     */
    @Transactional
    public void deleteUserPermanently(String userId) {
        log.info("Xóa user vĩnh viễn: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));
        
        userRepository.delete(user);
        log.info("Đã xóa user vĩnh viễn thành công: {}", userId);
    }

    /**
     * CHỨC NĂNG 5: Lấy User theo ID
     */
    @Transactional(readOnly = true)
    public UserDTO getUserById(String userId) {
        log.debug("Lấy user theo ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));
        
        return userMapper.toDto(user);
    }

    /**
     * CHỨC NĂNG 6: Lấy User theo Username
     */
    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        log.debug("Lấy user theo username: {}", username);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng với username: " + username));
        
        return userMapper.toDto(user);
    }

    /**
     * CHỨC NĂNG 7: Lấy danh sách Users với filter
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers(Boolean isActive, String fullName, String email) {
        log.debug("Lấy danh sách users với filters - isActive: {}, fullName: {}, email: {}", 
                isActive, fullName, email);
        
        List<User> users;
        
        if (isActive != null && fullName != null && !fullName.isEmpty()) {
            // Filter theo active và fullName
            users = userRepository.findAllByIsActive(isActive)
                    .stream()
                    .filter(user -> user.getFullName() != null && 
                            user.getFullName().toLowerCase().contains(fullName.toLowerCase()))
                    .collect(Collectors.toList());
        } else if (isActive != null && email != null && !email.isEmpty()) {
            // Filter theo active và email
            users = userRepository.findAllByIsActive(isActive)
                    .stream()
                    .filter(user -> user.getEmail() != null && 
                            user.getEmail().toLowerCase().contains(email.toLowerCase()))
                    .collect(Collectors.toList());
        } else if (isActive != null) {
            // Filter theo active
            users = userRepository.findAllByIsActive(isActive);
        } else if (fullName != null && !fullName.isEmpty()) {
            // Filter theo fullName
            users = userRepository.findAllByFullNameContainingIgnoreCase(fullName);
        } else if (email != null && !email.isEmpty()) {
            // Filter theo email
            users = userRepository.findAllByEmailContainingIgnoreCase(email);
        } else {
            // Lấy tất cả
            users = userRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * CHỨC NĂNG 8: Lấy tất cả Users
     */
    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        log.debug("Lấy tất cả users");
        
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();
        return users.stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Hàm dịch vụ CẬP NHẬT CÁC TRƯỜNG CƠ BẢN của User.
     * Được gọi bởi DoctorService, PatientService, v.v.
     */
    @Transactional
    public void updateUserProfile(String userId, Map<String, Object> userAttributes) {
        if (userAttributes == null || userAttributes.isEmpty()) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userId));

        if (userAttributes.containsKey("fullName")) {
            user.setFullName((String) userAttributes.get("fullName"));
        }
        if (userAttributes.containsKey("phone")) {
            user.setPhone((String) userAttributes.get("phone"));
        }
        // --- LOGIC CẬP NHẬT AVATAR MỚI ---
        if (userAttributes.containsKey("avatarUrl")) {
            String newAvatarUrl = (String) userAttributes.get("avatarUrl");
            String oldAvatarUrl = user.getImageUrl();

            // Chỉ xử lý nếu URL mới khác URL cũ (và không rỗng)
            if (newAvatarUrl != null && !newAvatarUrl.equals(oldAvatarUrl)) {

                // 1. Xóa file cũ (nếu có)
                if (oldAvatarUrl != null && !oldAvatarUrl.isEmpty()) {
                    try {
                        String oldFileName = fileStorageService.extractFileNameFromUrl(oldAvatarUrl);
                        fileStorageService.deleteFile(oldFileName);
                    } catch (Exception e) {
                        log.warn("Không thể xóa avatar cũ: {}", oldAvatarUrl, e);
                    }
                }

                // 2. Cập nhật URL mới vào DB
                user.setImageUrl(newAvatarUrl);
            }
        }

        userRepository.save(user);
    }
}
