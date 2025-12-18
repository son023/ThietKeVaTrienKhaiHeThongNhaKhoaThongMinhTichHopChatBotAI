package com.do_an.userservice.client;

import com.do_an.userservice.dto.patient.PatientCreateRequest;
import com.do_an.userservice.dto.patient.PatientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "patient-service", path = "/patient-service/patients")
public interface PatientServiceClient {

    @PostMapping
    PatientResponse createPatient(@RequestBody PatientCreateRequest request);
}