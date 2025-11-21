package com.do_an.userservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
    private UUID id; // Admin ID
    private UUID userId; // User ID
    private UserDTO user; // Thông tin User đầy đủ
}
