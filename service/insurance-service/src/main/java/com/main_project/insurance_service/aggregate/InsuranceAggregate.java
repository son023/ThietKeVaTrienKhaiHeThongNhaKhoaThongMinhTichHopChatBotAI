package com.main_project.insurance_service.aggregate;

import com.do_an.common.command.ValidateInsuranceCommand;
import com.do_an.common.event.InsuranceRejectedEvent;
import com.do_an.common.event.InsuranceValidatedEvent;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.main_project.insurance_service.dto.*;
import com.main_project.insurance_service.entity.InsuranceClaim;
import com.main_project.insurance_service.entity.InsurancePolicy;
import com.main_project.insurance_service.entity.PatientInsurance;
import com.main_project.insurance_service.repository.InsuranceClaimRepository;
import com.main_project.insurance_service.repository.PatientInsuranceRepository;
import com.main_project.insurance_service.service.IBhytCatalogueService;
import com.main_project.insurance_service.service.IClaimItemService;
import lombok.NoArgsConstructor;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

@Aggregate
@NoArgsConstructor
public class InsuranceAggregate {

    @AggregateIdentifier
    private UUID insuranceClaimId;
    
    private String status;

    public InsuranceAggregate(UUID insuranceClaimId, UUID prescriptionId, UUID patientId, Integer coverageAmount) {
        AggregateLifecycle.apply(new InsuranceValidatedEvent(
                insuranceClaimId,
                prescriptionId,
                patientId,
                coverageAmount
        ));

    }

    @EventSourcingHandler
    public void on(InsuranceValidatedEvent event) {
        this.insuranceClaimId = event.getInsuranceClaimId();
        this.status = "VALIDATED";
    }

    @EventSourcingHandler
    public void on(InsuranceRejectedEvent event) {
        this.status = "REJECTED";
    }



}

