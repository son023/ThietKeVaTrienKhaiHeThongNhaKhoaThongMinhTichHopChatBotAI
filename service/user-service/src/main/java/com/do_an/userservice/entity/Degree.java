package com.do_an.userservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "degree")
@Getter
@Setter
public class Degree {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String degreeName;

    private String institution;

    private Integer yearObtained;

    private String imageUrl;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id")
    private Doctor doctor;

}
