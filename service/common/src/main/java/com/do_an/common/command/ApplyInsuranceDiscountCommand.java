package com.do_an.common.command;

import com.do_an.common.model.InvoiceItemResponse;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyInsuranceDiscountCommand {
    @TargetAggregateIdentifier
    private UUID invoiceId;
    private UUID prescriptionId;
    private Integer discountAmount;
    private Set<InvoiceItemResponse> items;
}
