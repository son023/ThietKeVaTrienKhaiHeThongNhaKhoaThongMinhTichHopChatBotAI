package com.do_an.paymentservice.aggregate;


import com.do_an.common.command.CancelInsuranceClaimCommand;
import com.do_an.common.command.ReturnMedicineReservationCommand;
import com.do_an.common.event.*;
import com.do_an.paymentservice.client.InventoryClient;
import com.do_an.paymentservice.dto.response.DispenseOrderResponse;
import com.do_an.paymentservice.entity.Payment;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.eventhandling.GenericEventMessage;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventHandler {
    private final PaymentRepository paymentRepository;
    private final EventBus eventBus;



    @EventHandler
    @Transactional
    public void on(PaymentStatusUpdatedEvent event){
        log.info("Event Handler: Cập nhật Status {} -> {}", event.getPaymentId(), event.getStatus());

        UUID paymentId = event.getPaymentId();
        PaymentStatus newStatus = PaymentStatus.valueOf(event.getStatus());
        String reason = event.getReason();

        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy PaymentId: " + paymentId
                    ));

            payment.setStatus(newStatus);
            if (newStatus == PaymentStatus.SUCCESSFUL) {
                payment.setPaidAt(LocalDateTime.now());
            }
            payment.setDescription(reason);
            paymentRepository.save(payment);

            log.info("Đã cập nhật DB: Payment {} với status {}", paymentId, newStatus);

            // Nếu thành công -> Phát thêm sự kiện PaymentProcessedEvent để Saga chốt đơn
            if (PaymentStatus.valueOf(event.getStatus()) == PaymentStatus.SUCCESSFUL) {
                eventBus.publish(GenericEventMessage.asEventMessage(
                        new PaymentProcessedEvent(
                                event.getPaymentId(),
                                event.getInvoiceId()
                        )
                ));
            } else if (PaymentStatus.valueOf(event.getStatus()) == PaymentStatus.FAILED ||
                    PaymentStatus.valueOf(event.getStatus()) == PaymentStatus.CANCELLED ||
                    PaymentStatus.valueOf(event.getStatus()) == PaymentStatus.TIMEOUT ) {
                eventBus.publish(GenericEventMessage.asEventMessage
                        (new PaymentFailedEvent(
                        event.getPaymentId(),
                        event.getStatus(),
                        event.getReason()
                        )
                ));
            }

        } catch (Exception e) {
            log.error("Lỗi khi cập nhật thanh toán {}: {}", paymentId, e.getMessage(), e);
        }

    }

//    @EventHandler
//    public void on(InvoiceCancelledEvent event) {
//        log.info("Hóa đơn {} đã chuyển sang CANCELLED. Thực hiện đồng bộ trạng thái các service khác...", event.getInvoiceId());
//        DispenseOrderResponse dispenseOrderResponse =  inventoryClient.getByPrescriptionId(event.getPrescriptionId());
//        UUID dispenseOrderId = dispenseOrderResponse.getId();
//
//        //Cập nhật Inventory: Chuyển DispenseOrder sang CANCELLED và trả lại số lượng
//        commandGateway.send(new ReturnMedicineReservationCommand(
//                dispenseOrderId,
//                event.getPrescriptionId()
//
//        ));
//
//        //Cập nhật Insurance: Chuyển Claim sang CANCELLED
//        if (event.getInsuranceClaimId() != null) {
//            commandGateway.send(new CancelInsuranceClaimCommand(
//                    event.getInsuranceClaimId(),
//                    event.getPrescriptionId(),
//                    event.getReason()
//            ));
//        }
//    }


}
