package com.do_an.common.model;

import lombok.*;

import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class MedicalServiceDTO {
    private UUID id;
    private String serviceName;
    private String serviceType;
    private Integer serviceTime;
    private MedicalServiceStatus status;
    private Float price;
    private String description;
    private String imgUrl;
}
