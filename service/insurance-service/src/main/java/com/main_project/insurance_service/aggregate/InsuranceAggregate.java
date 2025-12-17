package com.main_project.insurance_service.aggregate;


import com.do_an.common.event.InsuranceRejectedEvent;
import com.do_an.common.event.InsuranceValidatedEvent;
import com.do_an.common.model.InvoiceItemResponse;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventsourcing.EventSourcingHandler;
import org.axonframework.modelling.command.AggregateIdentifier;
import org.axonframework.modelling.command.AggregateLifecycle;
import org.axonframework.spring.stereotype.Aggregate;
import java.util.*;

@Aggregate
@NoArgsConstructor
@Slf4j
public class InsuranceAggregate {

    @AggregateIdentifier
    private UUID insuranceClaimId;
    
    private String status;
    private UUID prescriptionId;
    private UUID patientId;
    private Integer coverageAmount;

    // ✅ Constructor với idempotency guard
    public InsuranceAggregate(UUID insuranceClaimId, UUID prescriptionId, UUID patientId, Integer coverageAmount, Set<InvoiceItemResponse> items) {
        // ⚠️ CRITICAL GUARD: Aggregate đã được validate rồi, từ chối duplicate validation
//        if (this.status != null && ("VALIDATED".equals(this.status) || "REJECTED".equals(this.status))) {
//            log.warn("⚠️ [AGGREGATE GUARD] InsuranceAggregate {} already in final state {}, rejecting duplicate command",
//                    insuranceClaimId, this.status);
//            return; // Không apply event, giữ nguyên state
//        }
//
//        log.info("✅ [AGGREGATE] Creating InsuranceAggregate: claimId={}, prescriptionId={}, coverage={}",
//                insuranceClaimId, prescriptionId, coverageAmount);
        
        // Apply event chỉ khi chưa được validate
        AggregateLifecycle.apply(new InsuranceValidatedEvent(
                insuranceClaimId,
                prescriptionId,
                patientId,
                coverageAmount,
                items
        ));
    }

    @EventSourcingHandler
    public void on(InsuranceValidatedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying InsuranceValidatedEvent: claimId={}, coverage={}", 
                event.getInsuranceClaimId(), event.getCoverageAmount());
        this.insuranceClaimId = event.getInsuranceClaimId();
        this.prescriptionId = event.getPrescriptionId();
        this.patientId = event.getPatientId();
        this.coverageAmount = event.getCoverageAmount();

        this.status = "VALIDATED";
    }

    @EventSourcingHandler
    public void on(InsuranceRejectedEvent event) {
        log.info("📝 [EVENT SOURCING] Applying InsuranceRejectedEvent: claimId={}", this.insuranceClaimId);
        // ✅ Chỉ chuyển sang REJECTED nếu chưa VALIDATED
        if (!"VALIDATED".equals(this.status)) {
            this.status = "REJECTED";
        } else {
            log.warn("⚠️ [AGGREGATE GUARD] Cannot reject InsuranceAggregate {} - already VALIDATED", this.insuranceClaimId);
        }
    }

    // ✅ HELPER: Kiểm tra trạng thái cuối cùng
    private boolean isInFinalState() {
        return "VALIDATED".equals(this.status) || "REJECTED".equals(this.status);
    }

}

