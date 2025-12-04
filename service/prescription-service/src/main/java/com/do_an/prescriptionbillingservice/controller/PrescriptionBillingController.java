package com.do_an.prescriptionbillingservice.controller;

import com.do_an.common.command.CreatePrescriptionCommand;
import com.do_an.common.model.MedicineItem;
import com.do_an.prescriptionbillingservice.dto.CreatePrescriptionRequest;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/prescription-billing-service/prescription-billings")
@CrossOrigin(origins = "*")
public class PrescriptionBillingController {
    private final CommandGateway commandGateway;

    public PrescriptionBillingController(CommandGateway commandGateway) {
        this.commandGateway = commandGateway;
    }

    @PostMapping
    public CompletableFuture<String> createPrescription(@RequestBody CreatePrescriptionRequest request) {
        UUID prescriptionId = UUID.randomUUID();

        return commandGateway.send(new CreatePrescriptionCommand(
                prescriptionId,
                request.getPatientId(),
                request.getDoctorId(),
                request.getMedicalHistoryId(),
                request.getItems()
        ));
    }


}
