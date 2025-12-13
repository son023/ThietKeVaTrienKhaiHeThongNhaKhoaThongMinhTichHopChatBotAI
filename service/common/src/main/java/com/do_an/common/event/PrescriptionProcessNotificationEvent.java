package com.do_an.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionProcessNotificationEvent {
    private String doctorId;      // ID để định tuyến WebSocket tới đúng bác sĩ
    private String prescriptionId;
    private String step;          // VD: INVENTORY, INVOICE, INSURANCE
    private String status;        // VD: SUCCESS, FAILED
    private String message;       // Nội dung thông báo hiển thị
}
