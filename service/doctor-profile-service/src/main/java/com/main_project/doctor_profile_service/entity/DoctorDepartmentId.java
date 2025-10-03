package com.main_project.doctor_profile_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorDepartmentId implements Serializable {

    @Column(name = "doctor_id", columnDefinition = "CHAR(36)")
    String doctorId;

    @Column(name = "department_id", columnDefinition = "CHAR(36)")
    String departmentId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DoctorDepartmentId that = (DoctorDepartmentId) o;
        return Objects.equals(doctorId, that.doctorId) && Objects.equals(departmentId, that.departmentId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(doctorId, departmentId);
    }
}



