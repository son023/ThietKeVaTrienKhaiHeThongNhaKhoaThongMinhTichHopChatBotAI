package com.main_project.user_service.service;

import com.main_project.user_service.dto.UserDTO;
import com.main_project.user_service.entity.User;
import com.main_project.user_service.mapper.UserMapper;
import com.main_project.user_service.exceptions.AppException;
import com.main_project.user_service.exceptions.enums.ErrorCode;
import com.main_project.user_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;

    public User create(User user) {
        // Check if username already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // Generate UUID for user
        if (user.getId() == null) {
            user.setId(UUID.randomUUID().toString());
        }

        // Encode password
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setPasswordUpdatedAt(LocalDateTime.now());

        // Set timestamps
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public User validateCredentials(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsernameAndIsActive(username, true);
        if (userOpt.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        User user = userOpt.get();
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean isValid = passwordEncoder.matches(password, user.getPasswordHash());
        
        if (!isValid) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return user;
    }

    public UserDTO getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return UserMapper.toDto(user);
    }

    public UserDTO getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return UserMapper.toDto(user);
    }

    public User getById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return user;
    }

    public UserDTO getUserDTOById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return UserMapper.toDto(user);
    }

    public User updateUser(User user) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        // Update fields
        if (user.getUsername() != null) {
            if (!existingUser.getUsername().equals(user.getUsername()) && 
                userRepository.existsByUsername(user.getUsername())) {
                throw new AppException(ErrorCode.USER_EXISTED);
            }
            existingUser.setUsername(user.getUsername());
        }
        
        if (user.getEmail() != null) {
            if (!existingUser.getEmail().equals(user.getEmail()) && 
                userRepository.existsByEmail(user.getEmail())) {
                throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
            }
            existingUser.setEmail(user.getEmail());
        }
        
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        
        if (user.getFullName() != null) {
            existingUser.setFullName(user.getFullName());
        }
        
        if (user.getIsEmailVerified() != null) {
            existingUser.setIsEmailVerified(user.getIsEmailVerified());
        }
        
        if (user.getIsActive() != null) {
            existingUser.setIsActive(user.getIsActive());
        }

        // Update password if provided
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            existingUser.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            existingUser.setPasswordUpdatedAt(LocalDateTime.now());
        }

        existingUser.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(existingUser);
    }


    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::toDto)
                .toList();
    }

    public List<UserDTO> getActiveUsers() {
        return userRepository.findAll().stream()
                .filter(user -> user.getIsActive())
                .map(UserMapper::toDto)
                .toList();
    }
}
