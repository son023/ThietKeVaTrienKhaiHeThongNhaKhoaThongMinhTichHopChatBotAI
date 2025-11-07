package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Degree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DegreeRepository extends JpaRepository<Degree, String> {
    List<Degree> findByDoctorId(String doctorId);

    Optional<Degree> findByIdAndDoctorId(String id, String doctorId);
}
