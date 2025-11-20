package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "lab_technician")
@Getter
@Setter
public class LabTechnician {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String field;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
