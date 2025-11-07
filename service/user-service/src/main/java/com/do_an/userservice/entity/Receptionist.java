package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "receptionist")
@Getter
@Setter
public class Receptionist {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
