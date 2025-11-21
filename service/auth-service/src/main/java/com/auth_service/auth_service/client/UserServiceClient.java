package com.auth_service.auth_service.client;

import com.auth_service.auth_service.model.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @PostMapping("/user-service/users/valid")
    ResponseEntity<UserDTO> valid(@RequestBody Map<String, String> credentials);

    @GetMapping("/user-service/users/{username}")
    ResponseEntity<UserDTO> getByUsername(@PathVariable String username);
}

