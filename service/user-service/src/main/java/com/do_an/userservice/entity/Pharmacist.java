package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "pharmacist")
@Getter
@Setter
public class Pharmacist {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;

    private String degree;

    private String certificate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
