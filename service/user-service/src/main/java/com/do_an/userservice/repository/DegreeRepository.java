package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Degree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DegreeRepository extends JpaRepository<Degree, UUID> {
    List<Degree> findByDoctorId(UUID doctorId);

    Optional<Degree> findByIdAndDoctorId(UUID id, UUID doctorId);
}
