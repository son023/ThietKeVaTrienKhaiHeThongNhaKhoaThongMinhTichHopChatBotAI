package com.main_project.insurance_service.aggregate;


import com.do_an.common.event.InsuranceClaimCancelledEvent;
import com.do_an.common.event.InsuranceRejectedEvent;
import com.do_an.common.event.InsuranceValidatedEvent;
import com.do_an.common.model.InvoiceItemResponse;
import com.main_project.insurance_service.dto.ClaimItemRequestDTO;
import com.main_project.insurance_service.entity.InsuranceClaim;
import com.main_project.insurance_service.entity.PatientInsurance;
import com.main_project.insurance_service.repository.InsuranceClaimRepository;
import com.main_project.insurance_service.repository.PatientInsuranceRepository;
import com.main_project.insurance_service.service.IClaimItemService;
import com.main_project.insurance_service.service.IInsuranceClaimService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class InsuranceEventHandler {
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final PatientInsuranceRepository patientInsuranceRepository;
    private final IClaimItemService claimItemService;
    private final IInsuranceClaimService insuranceClaimService;

    @EventHandler
    @Transactional
    public void on(InsuranceValidatedEvent event){

        try{
            // 1. Tìm thông tin bảo hiểm bệnh nhân (để map quan hệ)
            PatientInsurance patientInsurance = patientInsuranceRepository.findByPatientId(event.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bảo hiểm của bệnh nhân: " + event.getPatientId()));


            // 2. Tính toán lại tổng tiền từ danh sách items trong Event
            int totalInsurancePay = 0;
            int totalPatientPay = 0;
            int totalClaimAmount = 0;

            for (InvoiceItemResponse item : event.getItems()) {
                totalInsurancePay += item.getInsurancePayAmount();
                totalPatientPay += item.getPatientPayAmount();
                totalClaimAmount += (item.getInsurancePayAmount() + item.getPatientPayAmount());
            }

            // 3. Tạo và Lưu InsuranceClaim (Header)
            InsuranceClaim insuranceClaim = new InsuranceClaim();
            insuranceClaim.setId(event.getInsuranceClaimId());
            insuranceClaim.setPatientInsurance(patientInsurance);
            insuranceClaim.setStatus("PENDING"); // Hoặc VALIDATED tùy quy trình
            insuranceClaim.setTotalClaimAmount(totalClaimAmount);
            insuranceClaim.setTotalInsurancePay(totalInsurancePay);
            insuranceClaim.setPatientPayAmount(totalPatientPay);
            insuranceClaim.setClaimDate(ZonedDateTime.now());

            //insuranceClaim.setNotes("Claim created from invoice checker request via Saga");

            insuranceClaimRepository.save(insuranceClaim);

            // 4. Lưu chi tiết Claim Items
            for (InvoiceItemResponse item : event.getItems()) {
                // Chỉ lưu những item có bảo hiểm chi trả hoặc tùy nghiệp vụ
                if (item.getInsurancePayAmount() > 0 || item.getClaimItemId() != null) {
                    ClaimItemRequestDTO request = new ClaimItemRequestDTO();
                    request.setInsuranceClaimId(insuranceClaim.getId());
                    request.setQuantity(item.getQuantity());
                    request.setUnitPrice(item.getUnitPrice());
                    request.setTotalAmount(item.getQuantity() * item.getUnitPrice());
                    request.setInsurancePayAmount(item.getInsurancePayAmount());
                    request.setPatientPayAmount(item.getPatientPayAmount());

                    Float ratio = item.getQuantity() * item.getUnitPrice() > 0 ? (float) item.getInsurancePayAmount() / (item.getQuantity() * item.getUnitPrice()) : 0f;
                    request.setInsurancePayRatio(ratio);
                    request.setBhytCatalogueId(item.getBhytCatalogueId());
                    claimItemService.createClaimItem(request);

                    log.info("Đã lưu thành công InsuranceClaim {} vào DB.", event.getInsuranceClaimId());
                }
            }
        }
        catch (Exception e){
            log.error("Lỗi khi lưu DB từ Event: {}", e.getMessage());
            throw e;
        }
    }


    @EventHandler
    @Transactional
    public void on(InsuranceClaimCancelledEvent event){
        try {
            //Cập nhật DB sang trạng thái CANCELLED/REJECTED
            insuranceClaimService.rejectClaim(event.getInsuranceClaimId(), event.getReason());

            log.info("Đã cập nhật trạng thái REJECTED cho InsuranceClaim {}", event.getInsuranceClaimId());
        }
        catch (Exception e){
            log.error("Lỗi khi lưu DB để hủy InsuranceClaim: {}", e.getMessage());
        }
    }

    @EventHandler
    @Transactional
    public void on(InsuranceRejectedEvent event) {
        log.info("Nhận sự kiện InsuranceRejectedEvent. Lý do: {}", event.getReason());
    }

}
