package com.main_project.labtest_service.feignclient;

import com.main_project.labtest_service.feignclient.dto.AppointmentResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "appointment-service", url = "${feign.appointment-service.url:http://localhost:8082/appointment-service/appointments}")
public interface AppointmentServiceClient {
    @GetMapping("/{appointmentId}")
    AppointmentResponseDTO getAppointmentById(@PathVariable("appointmentId") UUID appointmentId);
}