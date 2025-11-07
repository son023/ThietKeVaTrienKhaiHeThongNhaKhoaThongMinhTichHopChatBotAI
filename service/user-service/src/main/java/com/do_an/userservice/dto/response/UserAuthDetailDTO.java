package com.do_an.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthDetailDTO {
    private String userId;
    private String hashedPassword; // Tên rõ ràng, đây là hash
    private boolean isActive;
    private List<String> roles; // Danh sách các roleName, vd: ["PATIENT", "ADMIN"]
}