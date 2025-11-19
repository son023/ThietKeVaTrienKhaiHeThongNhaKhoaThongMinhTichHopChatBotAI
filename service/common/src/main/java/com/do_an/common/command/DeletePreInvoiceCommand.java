package com.do_an.common.command;

import lombok.Data;
import lombok.Value;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

@Value
public class DeletePreInvoiceCommand { // Lệnh bù trừ cho Bước 2 (Theo yêu cầu)
    @TargetAggregateIdentifier
    String invoiceId;
}