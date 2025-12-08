package com.do_an.paymentservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DispenseOrderResponse {
    private UUID id;
    private UUID pharmacistId;
    private UUID prescription;
    private String status;
    private UUID medicalHistoryId;
    private UUID doctorId;
    private ZonedDateTime createAt;
    private ZonedDateTime updateAt;
}



