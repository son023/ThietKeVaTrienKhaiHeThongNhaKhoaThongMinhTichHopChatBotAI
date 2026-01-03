package com.do_an.common.command;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentStatusCommand {
    @TargetAggregateIdentifier
    private UUID paymentId;
//    private UUID appointmentId;

    private String status;

    // Có thể thêm message lỗi hoặc lý do nếu cần lưu vết
    private String reason;


}