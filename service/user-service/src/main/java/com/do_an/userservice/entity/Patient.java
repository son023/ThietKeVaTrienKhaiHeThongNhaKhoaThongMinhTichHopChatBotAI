package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "patient")
@Getter
@Setter
public class Patient {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;

    private LocalDate dob;

    private String gender;

    private String address;

    private String bloodType;


    @Column(columnDefinition = "TEXT")
    private String allergy;

    private String insuranceNumber;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
