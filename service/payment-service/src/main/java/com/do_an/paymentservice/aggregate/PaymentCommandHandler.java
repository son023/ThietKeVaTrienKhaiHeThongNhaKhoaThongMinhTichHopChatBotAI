package com.do_an.paymentservice.aggregate;


import com.do_an.common.command.AddMedicineChargesCommand;
import com.do_an.common.command.CreatePaymentCommand;
import com.do_an.common.command.UpdatePaymentStatusCommand;
import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.InvoiceItemCheckerRequest;
import com.do_an.paymentservice.entity.Payment;
import com.do_an.paymentservice.entity.PaymentStatus;
import com.do_an.paymentservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.commandhandling.CommandHandler;
import org.axonframework.modelling.command.AggregateNotFoundException;
import org.axonframework.modelling.command.Repository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentCommandHandler {
    private final PaymentRepository paymentRepository;
    private final Repository<PaymentAggregate> paymentAggregateRepository;

    @CommandHandler
    @Transactional
    public void handle(CreatePaymentCommand command) throws Exception {
        paymentAggregateRepository.newInstance(() -> new PaymentAggregate(
                command.getPaymentId(),
                command.getInvoiceId(),
                command.getDispenseOrderId()
        ));
    }

    @CommandHandler
    public void handle(UpdatePaymentStatusCommand command){
        Payment payment = paymentRepository.findById(command.getPaymentId())
                .orElseThrow(() -> new IllegalStateException("Không tồn tại thanh toán: " + command.getPaymentId()));
        if(payment.getStatus() == PaymentStatus.SUCCESSFUL){
            log.warn("Payment {} đã thành công, không thể cập nhật sang trạng thái khác.", payment.getId());
            return;
        }

        paymentAggregateRepository.load(command.getPaymentId().toString())
                .execute(aggregate -> aggregate.applyUpdatePaymentStatus(
                        command.getPaymentId(),
                        command.getStatus(),
                        command.getReason()
                ));


    }


}
