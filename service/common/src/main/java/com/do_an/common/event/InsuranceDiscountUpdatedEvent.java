package com.do_an.common.event;     

import com.do_an.common.model.InvoiceItemResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceDiscountUpdatedEvent {
    private UUID insuranceClaimId;
    private UUID prescriptionId;
    private UUID invoiceId;
    private Integer discountAmount;
    private Set<InvoiceItemResponse> items;
}