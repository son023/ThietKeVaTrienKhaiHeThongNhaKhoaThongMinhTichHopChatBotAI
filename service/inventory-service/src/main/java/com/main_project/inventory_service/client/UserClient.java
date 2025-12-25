package com.main_project.inventory_service.client;

import com.main_project.inventory_service.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(
        name = "user-service",
        url = "${user.service.url:http://localhost:8085}"
)
public interface UserClient {
    @GetMapping("/user-service/users/{userId}")
    UserDTO getUserById(@PathVariable UUID userId);

}

