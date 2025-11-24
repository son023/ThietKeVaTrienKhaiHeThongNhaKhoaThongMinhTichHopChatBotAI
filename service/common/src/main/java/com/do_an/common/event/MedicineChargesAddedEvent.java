package com.do_an.common.event;

import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.common.model.MedicineItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineChargesAddedEvent {
    private UUID prescriptionId;
    private UUID invoiceId;
    private List<MedicineItem> medicineItems;
    private InvoiceCheckerRequest invoiceItemCheckerRequest;
}
