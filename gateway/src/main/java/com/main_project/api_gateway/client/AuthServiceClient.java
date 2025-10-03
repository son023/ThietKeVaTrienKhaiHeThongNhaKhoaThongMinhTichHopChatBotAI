package com.main_project.api_gateway.client;

import com.main_project.api_gateway.model.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "auth-service")
public interface AuthServiceClient {

    @PostMapping("/auth/validate")
    ResponseEntity<Boolean> validate(@RequestBody String token);

}
