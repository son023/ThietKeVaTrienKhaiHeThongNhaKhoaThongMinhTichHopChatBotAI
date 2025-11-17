package com.main_project.inventory_service.axon.eventhandler;

import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MedicalTreatmentEventHandler {
    
    @Autowired
    private CommandGateway commandGateway;
    
    // Event handlers for cross-service communication will be added here
    // This ensures inventory service can respond to insurance events
}
