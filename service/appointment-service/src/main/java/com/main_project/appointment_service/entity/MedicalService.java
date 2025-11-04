package com.main_project.appointment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "medical_services")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalService {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 255)
    private String serviceName;

    @Column(nullable = false, length = 255)
    private String serviceType;

    @Column(nullable = false)
    private Integer serviceTime;  // đơn vị: phút

    @Column(nullable = false)
    private Float price;
}