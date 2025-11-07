package com.do_an.userservice.dto.response;

import com.do_an.userservice.dto.DegreeDTO;
import lombok.Data;

import java.util.List;

@Data
public class DoctorDTO {
    private String id; // ID của hồ sơ Doctor

    // Thông tin từ hồ sơ Doctor
    private String specializationCode;
    private String workingHospital;
    private String licenseNumber;
    private Integer consultationFeeAmount;

    // Danh sách bằng cấp đã được map
    private List<DegreeDTO> degrees;

    // --- Thông tin bổ sung từ bảng User ---
    // Chúng ta nên thêm các thông tin này để client
    // không phải gọi 2 API (lấy user và lấy doctor)

    private String userId; // ID của User (rất quan trọng)
    private String fullName;
    private String email;
    private String phone;
    private String imageUrl;
}
