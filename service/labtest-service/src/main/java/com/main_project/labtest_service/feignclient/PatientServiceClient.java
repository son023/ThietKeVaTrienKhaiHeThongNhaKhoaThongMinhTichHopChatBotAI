package com.main_project.labtest_service.feignclient;

import com.main_project.labtest_service.feignclient.dto.PatientResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "patient-service", url = "${feign.patient-service.url:http://localhost:8089/patient-service/patients}")
public interface PatientServiceClient {
    @GetMapping("/{patientId}")
    PatientResponseDTO getPatientById(@PathVariable("patientId") UUID patientId);
}

