package com.do_an.userservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "degree")
@Getter
@Setter
public class Degree {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;

    private String degreeName;

    private String institution;

    private Integer yearObtained;

    private String imageUrl;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", referencedColumnName = "id")
    private Doctor doctor;

}
