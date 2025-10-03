package com.auth_service.auth_service.controller;

import com.auth_service.auth_service.model.UserDTO;
import com.auth_service.auth_service.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@RequestBody Map<String, String> credentials) {
        log.error("1");
        return authService.login(credentials);
    }
    @GetMapping("/test")
    String test(){
        return "1";
    }

}
