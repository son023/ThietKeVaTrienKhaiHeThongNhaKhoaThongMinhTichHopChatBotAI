package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "doctor")
@Getter
@Setter
public class Doctor {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id; // varchar(50)

    private String specializationCode;

    private String workingHospital;

    private String licenseNumber;

    private Integer consultationFeeAmount;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Degree> degrees;
}
