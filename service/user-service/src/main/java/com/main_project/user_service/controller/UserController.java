package com.main_project.user_service.controller;

import com.main_project.user_service.dto.UserDTO;
import com.main_project.user_service.entity.User;
import com.main_project.user_service.mapper.UserMapper;
import com.main_project.user_service.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping("/register")
    ResponseEntity<UserDTO> register(@RequestBody User user) {
        User createdUser = userService.create(user);
        return ResponseEntity.ok(UserMapper.toDto(createdUser));
    }

    @PostMapping("/valid")
    ResponseEntity<UserDTO> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        User user = userService.validateCredentials(username, password);
        return ResponseEntity.ok(UserMapper.toDto(user));
    }

    @GetMapping("/{id}")
    ResponseEntity<UserDTO> getUserById(@PathVariable String id) {
        UserDTO user = userService.getUserDTOById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        UserDTO user = userService.getByUsername(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO user = userService.getByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    ResponseEntity<UserDTO> updateUser(@PathVariable String id, @RequestBody User user) {
        user.setId(id);
        User updatedUser = userService.updateUser(user);
        return ResponseEntity.ok(UserMapper.toDto(updatedUser));
    }

    @GetMapping
    ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    ResponseEntity<List<UserDTO>> getActiveUsers() {
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }
}