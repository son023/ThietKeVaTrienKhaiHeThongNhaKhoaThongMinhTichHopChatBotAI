package com.main_project.doctor_profile_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "degree")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Degree {

    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    String id;

    @Column(name = "doctor_id", nullable = false, columnDefinition = "CHAR(36)")
    String doctorId;

    @Column(name = "degree_name", length = 100)
    String degreeName;

    @Column(name = "institution", length = 100)
    String institution;

    @Column(name = "year_obtained")
    Integer yearObtained;

    @Column(name = "certificate_url", length = 255)
    String certificateUrl;
}



