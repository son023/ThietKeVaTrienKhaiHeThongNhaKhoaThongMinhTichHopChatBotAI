package com.do_an.userservice.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "lab_technician")
@Getter
@Setter
public class LabTechnician {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;

    private String field;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
