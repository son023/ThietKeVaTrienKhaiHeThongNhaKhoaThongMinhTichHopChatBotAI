package com.do_an.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
    private String id; // Admin ID
    private String userId; // User ID
    private UserDTO user; // Thông tin User đầy đủ
}
