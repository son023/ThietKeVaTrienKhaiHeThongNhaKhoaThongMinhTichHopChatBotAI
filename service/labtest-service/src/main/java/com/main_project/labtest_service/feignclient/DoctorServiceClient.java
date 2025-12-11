package com.main_project.labtest_service.feignclient;

import com.main_project.labtest_service.feignclient.dto.DoctorResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "doctor-service", url = "http://localhost:8080/doctor-service/doctors")
public interface DoctorServiceClient {
    @GetMapping("/{userId}")
    DoctorResponseDTO getDoctorById(@PathVariable("userId") UUID userId);
}