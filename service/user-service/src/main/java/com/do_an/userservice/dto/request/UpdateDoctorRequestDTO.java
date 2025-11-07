package com.do_an.userservice.dto.request;

import com.do_an.userservice.dto.DegreeDTO;
import lombok.Data;

import java.util.List;

@Data
public class UpdateDoctorRequestDTO {
    private String specializationCode;
    
    private String workingHospital;
    
    private String licenseNumber;
    
    private Integer consultationFeeAmount;
    
    private List<DegreeDTO> degrees; // Danh sách bằng cấp
    
    // Thông tin User (optional)
    private String fullName;
    private String phone;
    private String imageUrl;
}
