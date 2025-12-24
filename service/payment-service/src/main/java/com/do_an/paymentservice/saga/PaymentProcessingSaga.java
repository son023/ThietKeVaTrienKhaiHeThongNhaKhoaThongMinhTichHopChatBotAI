package com.do_an.paymentservice.saga;



import com.do_an.common.command.*;
import com.do_an.common.event.InvoiceCancelledEvent;
import com.do_an.common.event.PaymentFailedEvent;
import com.do_an.common.event.PaymentInitiatedEvent;
import com.do_an.common.event.PaymentProcessedEvent;
import com.do_an.paymentservice.client.InventoryClient;
import com.do_an.paymentservice.dto.response.DispenseOrderResponse;
import com.do_an.paymentservice.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.axonframework.deadline.DeadlineManager;
import org.axonframework.deadline.annotation.DeadlineHandler;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.modelling.saga.EndSaga;
import org.axonframework.modelling.saga.SagaEventHandler;
import org.axonframework.modelling.saga.SagaLifecycle;
import org.axonframework.modelling.saga.StartSaga;
import org.axonframework.spring.stereotype.Saga;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.util.UUID;

@Saga
@Slf4j
public class PaymentProcessingSaga {

    @Autowired
    private transient CommandGateway commandGateway;

    @Autowired
    private transient DeadlineManager deadlineManager;

    private UUID paymentId;
    private UUID invoiceId;
    private UUID dispenseOrderId;
    private String deadlineId;

    @StartSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentInitiatedEvent event) {
        this.paymentId = event.getPaymentId();
        this.invoiceId = event.getInvoiceId();
        this.dispenseOrderId = event.getDispenseOrderId();
        log.info("Bắt đầu phiên thanh toán: {}", paymentId);

        // Timeout 30 phút cho mã QR
        this.deadlineId = deadlineManager.schedule(Duration.ofMinutes(30),"paymentSessionTimeout", this.paymentId);
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentProcessedEvent event) {
        log.info("Thanh toán thành công. Cập nhật Invoice {} sang PAID.", event.getInvoiceId());

        cancelDeadline();

        commandGateway.sendAndWait(new MarkInvoiceAsPaidCommand(event.getInvoiceId()));

        //Gửi lệnh sang Inventory để đổi trạng thái từ RELEASE -> SOLD
        commandGateway.send(new MarkPrescripAsSoldCommand(this.dispenseOrderId));
    }

    @EndSaga
    @SagaEventHandler(associationProperty = "paymentId")
    public void on(PaymentFailedEvent event) {
        if ("TIMEOUT".equals(event.getStatus())) {
            log.info("🛑 Giao dịch TIMEOUT. Thực hiện Hủy Hóa Đơn và Trả Thuốc.");
            this.deadlineId = null;
            commandGateway.send(new CancelInvoiceCommand(
                    this.invoiceId,
                    "Hủy do hết hạn thanh toán (Timeout)"
            ));

        } else {
            log.info("⚠️ Giao dịch thất bại do: {}. Giữ nguyên Hóa đơn để thử lại.", event.getReason());
            cancelDeadline();
        }


        //Thông báo Frontend (Notification Service sẽ lắng nghe event này hoặc bạn bắn event notification riêng)


    }


    @DeadlineHandler(deadlineName = "paymentSessionTimeout")
    public void onTimeout() {
        log.info("Saga: Timeout 30p. Tự động đánh dấu Payment là FAILED.");

        commandGateway.send(new UpdatePaymentStatusCommand(
                paymentId,
                PaymentStatus.TIMEOUT.toString(),
                "Thanh toán thất bại do mã hết hạn cho thử lại"
        ));
    }

    private void cancelDeadline() {
        if (deadlineId != null) {
            try {
                deadlineManager.cancelSchedule("paymentSessionTimeout", deadlineId);
            } catch (Exception e) {
                log.debug("Deadline {} đã không còn tồn tại để hủy (có thể đã chạy xong).", deadlineId);
            }
            deadlineId = null;
        }

    }


}
