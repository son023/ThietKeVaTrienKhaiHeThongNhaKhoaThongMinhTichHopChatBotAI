package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "pharmacist")
@Getter
@Setter
public class Pharmacist {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String degree;

    private String certificate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
