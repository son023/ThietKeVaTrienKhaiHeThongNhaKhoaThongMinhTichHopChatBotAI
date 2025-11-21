package com.do_an.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAuthDetailDTO {
    private UUID userId;
    private String hashedPassword; // Tên rõ ràng, đây là hash
    private boolean isActive;
    private List<String> roles; // Danh sách các roleName, vd: ["PATIENT", "ADMIN"]
}