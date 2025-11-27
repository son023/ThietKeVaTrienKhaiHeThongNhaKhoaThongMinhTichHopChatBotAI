package com.main_project.clinical_service.controller;

import com.do_an.common.command.CreatePrescriptionCommand;
import com.main_project.clinical_service.command.StartClinicalCommand;
import com.main_project.clinical_service.dto.StartClinicalrRequest;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/clinical-service/start")
public class ClinicalController {
    private final CommandGateway commandGateway;

    @PostMapping
    public ResponseEntity<String> start(@RequestBody StartClinicalrRequest request) {
       UUID clinicalId = UUID.randomUUID();

       commandGateway.send(new StartClinicalCommand(
               clinicalId,
               request.getAppointmentId(),
               request.getPatientId(),
               request.getMedicalServices()
       ));
       return ResponseEntity.status(HttpStatus.CREATED).body("Clinical Service");
    }
}
