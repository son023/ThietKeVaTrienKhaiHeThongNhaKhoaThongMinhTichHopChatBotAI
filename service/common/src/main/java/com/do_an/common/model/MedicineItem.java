package com.do_an.common.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineItem {
    private UUID id;
    private UUID medicineId;   // ID thuốc trong kho (String to support both UUID and String)
    private String name;         // Tên thuốc
    private int quantity;        // Số lượng kê
    private Integer unitPrice;   // Giá đơn vị (VNĐ)
    private String unit;         // Đơn vị (viên, ml,...)
    private String dosage;       // Liều dùng
    private String frequency;    // Tần suất uống
    private String duration;     // Số ngày dùng thuốc
    private String instruction;  // Hướng dẫn chi tiết
}