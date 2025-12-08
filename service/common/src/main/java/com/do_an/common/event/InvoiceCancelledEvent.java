package com.do_an.common.event;

import com.do_an.common.model.MedicineItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceCancelledEvent {
    private UUID invoiceId;
    private UUID prescriptionId; // Cần thiết để nhả kho
    private UUID insuranceClaimId; // Cần thiết để hủy bảo hiểm
   // private List<MedicineItem> items; // Danh sách thuốc cần trả

    private String reason;
}