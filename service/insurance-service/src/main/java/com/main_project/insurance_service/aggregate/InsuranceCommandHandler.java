package com.main_project.insurance_service.aggregate;

import com.do_an.common.command.ValidateInsuranceCommand;
import com.do_an.common.event.InsuranceRejectedEvent;
import com.do_an.common.event.InsuranceValidatedEvent;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.main_project.insurance_service.dto.*;
import com.main_project.insurance_service.entity.InsuranceClaim;
import com.main_project.insurance_service.entity.PatientInsurance;
import com.main_project.insurance_service.repository.InsuranceClaimRepository;
import com.main_project.insurance_service.repository.PatientInsuranceRepository;
import com.main_project.insurance_service.service.IBhytCatalogueService;
import com.main_project.insurance_service.service.IClaimItemService;
import com.main_project.insurance_service.service.IInsuranceClaimService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class InsuranceCommandHandler {

    private final PatientInsuranceRepository patientInsuranceRepository;

    private final IBhytCatalogueService bhytCatalogueService;

    private final InsuranceClaimRepository insuranceClaimRepository;

    private final IClaimItemService claimItemService;

    private final IInsuranceClaimService insuranceClaimService;

    private final Repository<InsuranceAggregate> insuranceAggregateRepository;

    private final EventBus eventBus;


    @CommandHandler
    @Transactional
    public void handle(ValidateInsuranceCommand command){
        try {
            UUID patientId = command.getPatientId();

            //InvoiceDTO invoiceDTO = insuranceClaimService.processInvoiceClaim(command.getInvoiceCheckerRequest());

            // 1. Kiểm tra thông tin bảo hiểm
            PatientInsurance patientInsurance = patientInsuranceRepository
                    .findActiveInsuranceByPatientId(patientId)
                    .orElseThrow(() -> new RuntimeException("No active insurance found for patient: " + patientId));

            // Check valid
            if (!isInsuranceValid(patientInsurance)) {
                eventBus.publish(GenericEventMessage.asEventMessage(
                        new InsuranceRejectedEvent(
                                command.getPatientId(),
                                command.getPrescriptionId(),
                                "Insurance has expired or is not active"
                        )
                ));
                return;
            }

            // Check policy
            if (patientInsurance.getInsurancePolicy() == null) {
                eventBus.publish(GenericEventMessage.asEventMessage(
                        new InsuranceRejectedEvent(
                                command.getPatientId(),
                                command.getPrescriptionId(),
                                "No insurance policy found"
                        )
                ));
                return;
            }

            // 2. Tính toán chi trả
            Float bhytPayRatio = patientInsurance.getInsurancePolicy().getCoverageAmount() / 100.0f;
            Set<InvoiceItemDTO> processedItems = new HashSet<>();
            List<ProcessedInvoiceItem> itemsForClaim = new ArrayList<>();

            Integer totalInsurancePay = 0;
            Integer totalPatientPay = 0;

            InvoiceCheckerRequest requestDTO = command.getInvoiceCheckerRequest();

            for (InvoiceItemCheckerRequest itemRequest : requestDTO.getItems()) {
                ProcessedInvoiceItem processedItem = processInvoiceItem(itemRequest, bhytPayRatio);
                processedItems.add(processedItem.getInvoiceItem());

                if (processedItem.getInvoiceItem().getInsurancePayAmount() > 0) {
                    itemsForClaim.add(processedItem);
                }

                totalInsurancePay += processedItem.getInvoiceItem().getInsurancePayAmount();
                totalPatientPay += processedItem.getInvoiceItem().getPatientPayAmount();
            }

            // 3. Lưu Insurance Claim vào DB
            InsuranceClaim insuranceClaim = new InsuranceClaim();
            insuranceClaim.setId(command.getInsuranceClaimId());
            insuranceClaim.setPatientInsurance(patientInsurance);
            insuranceClaim.setStatus("PENDING");
            insuranceClaim.setTotalClaimAmount(requestDTO.getTotalAmount());
            insuranceClaim.setTotalInsurancePay(totalInsurancePay);
            insuranceClaim.setPatientPayAmount(totalPatientPay);
            insuranceClaim.setClaimDate(ZonedDateTime.now());
            insuranceClaim.setNotes("Claim created from invoice checker request via Saga");

            InsuranceClaim savedClaim = insuranceClaimRepository.save(insuranceClaim);

            // 4. Lưu các Claim Items
            for (ProcessedInvoiceItem processedItem : itemsForClaim) {
                ClaimItemRequestDTO claimItemRequest = createClaimItemRequestFromProcessedItem(processedItem, savedClaim.getId());
                ClaimItemDTO createdClaimItem = claimItemService.createClaimItem(claimItemRequest);

                // Map ngược lại ID để update vào InvoiceItem nếu cần
                for (InvoiceItemDTO invoiceItem : processedItems) {
                    if (invoiceItem.getId().equals(processedItem.getInvoiceItem().getId())) {
                        invoiceItem.setClaimItemId(createdClaimItem.getId());
                        break;
                    }
                }
            }

            // 5. THÀNH CÔNG: Khởi tạo Aggregate để phát sự kiện Validated
            // Lưu ý: totalInsurancePay chính là coverageAmount cần trả về cho Invoice Service
            Integer finalCoverageAmount = totalInsurancePay;

            insuranceAggregateRepository.newInstance(() ->
                    new InsuranceAggregate(
                            command.getInsuranceClaimId(),
                            command.getPrescriptionId(),
                            command.getPatientId(),
                            finalCoverageAmount
                    )
            );

            log.info("Insurance Validated. Coverage: {}", finalCoverageAmount);

        } catch (Exception e) {
            log.error("Insurance validation failed: {}", e.getMessage());
            eventBus.publish(GenericEventMessage.asEventMessage(
                    new InsuranceRejectedEvent(
                            command.getPatientId(),
                            command.getPrescriptionId(),
                            "Insurance validation failed: " + e.getMessage()
                    )
            ));
        }


    }

    private boolean isInsuranceValid(PatientInsurance patientInsurance) {
        LocalDate today = LocalDate.now();
        return "ACTIVE".equals(patientInsurance.getStatus()) &&
                patientInsurance.getExpiryDate() != null &&
                !today.isAfter(patientInsurance.getExpiryDate());
    }

    private ProcessedInvoiceItem processInvoiceItem(InvoiceItemCheckerRequest itemRequest, Float bhytPayRatio) {
        InvoiceItemDTO itemDTO = new InvoiceItemDTO();
        itemDTO.setId(itemRequest.getId());
        itemDTO.setReferenceId(itemRequest.getReferenceId());
        itemDTO.setServiceType(itemRequest.getServiceType());
        itemDTO.setQuantity(itemRequest.getQuantity());
        itemDTO.setDescription(itemRequest.getDescription());
        itemDTO.setUnitPrice(itemRequest.getUnitPrice());

        Integer totalAmount = itemRequest.getQuantity() * itemRequest.getUnitPrice();
        Integer insurancePayAmount = 0;
        Integer patientPayAmount = totalAmount;
        UUID bhytCatalogueId = null;

        try {
            BhytCatalogueDTO bhytService = bhytCatalogueService.getBhytCatalogueByServiceCode(itemRequest.getReferenceId().toString());
            if (Boolean.TRUE.equals(bhytService.getIsCovered()) && bhytService.getMaxCoverageAmount() > 0) {
                Integer maxCoverage = bhytService.getMaxCoverageAmount();
                insurancePayAmount = Math.round(Math.min(maxCoverage, totalAmount * bhytPayRatio));
                patientPayAmount = totalAmount - insurancePayAmount;
                bhytCatalogueId = bhytService.getId();
            }
        } catch (RuntimeException e) {
            log.warn("Service not found in BHYT catalogue: {}. Patient pays full amount.", itemRequest.getReferenceId());
        }

        itemDTO.setInsurancePayAmount(insurancePayAmount);
        itemDTO.setPatientPayAmount(patientPayAmount);

        return new ProcessedInvoiceItem(itemDTO, bhytCatalogueId);
    }

    private ClaimItemRequestDTO createClaimItemRequestFromProcessedItem(ProcessedInvoiceItem processedItem, UUID claimId) {
        InvoiceItemDTO invoiceItem = processedItem.getInvoiceItem();
        Integer totalAmount = invoiceItem.getQuantity() * invoiceItem.getUnitPrice();

        ClaimItemRequestDTO request = new ClaimItemRequestDTO();
        request.setQuantity(invoiceItem.getQuantity());
        request.setUnitPrice(invoiceItem.getUnitPrice());
        request.setTotalAmount(totalAmount);
        Float ratio = totalAmount > 0 ? (float) invoiceItem.getInsurancePayAmount() / totalAmount : 0f;
        request.setInsurancePayRatio(ratio);
        request.setInsurancePayAmount(invoiceItem.getInsurancePayAmount());
        request.setPatientPayAmount(invoiceItem.getPatientPayAmount());
        request.setInsuranceClaimId(claimId);
        request.setBhytCatalogueId(processedItem.getBhytCatalogueId());

        return request;
    }




}
