package com.do_an.userservice.service;

import com.do_an.userservice.dto.response.UserAuthDetailDTO;
import com.do_an.userservice.dto.request.InternalRegistrationRequestDTO;
import com.do_an.userservice.entity.Patient;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.exception.UserNotFoundException;
import com.do_an.userservice.repository.PatientRepository;
import com.do_an.userservice.repository.RoleRepository;
import com.do_an.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternalService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public UserAuthDetailDTO getAuthDetails(String userName) {

        User user = userRepository.findByUsername(userName)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng: " + userName));
        List<String> roles = user.getRoles().stream()
                .map(it->it.getRoleName())
                .collect(Collectors.toList());

        return new UserAuthDetailDTO(
                user.getId(),
                user.getPassword(),
                user.isActive(),
                roles
        );
    }

    @Transactional
    public User registerNewUser(InternalRegistrationRequestDTO request) {
        // 1. Kiểm tra tồn tại
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username or Email already exists");
        }

        // 2. Lấy Role mặc định: "PATIENT"
        Role defaultRole = roleRepository.findByRoleName("PATIENT")
                .orElseThrow(() -> new RuntimeException("CRITICAL: 'PATIENT' role not found in database!"));

        // 3. Tạo User cơ bản
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(request.getHashedPassword());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setActive(true); // Kích hoạt luôn
        //user.setCreateAt(OffsetDateTime.now());
        //user.setUpdateAt(OffsetDateTime.now());

        user.setRoles(List.of(defaultRole));
        userRepository.save(user); // Lưu user


        // 5. Tạo hồ sơ Bệnh nhân (PATIENT) mặc định
        Patient patient = new Patient();
        patient.setId(UUID.randomUUID().toString());
        patient.setUser(user);

        patientRepository.save(patient);

        return user;
    }


}
