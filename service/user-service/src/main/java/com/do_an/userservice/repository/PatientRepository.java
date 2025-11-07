package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, String> {
    
    Optional<Patient> findByUserId(String userId);
    
    // Tìm Patients theo gender
    List<Patient> findAllByGender(String gender);
    
    // Tìm Patients theo blood type
    List<Patient> findAllByBloodType(String bloodType);
    
    // Tìm Patients theo insurance number
    Optional<Patient> findByInsuranceNumber(String insuranceNumber);
    
    // Tìm Patients theo khoảng ngày sinh
    List<Patient> findAllByDobBetween(LocalDate startDate, LocalDate endDate);
    
    // Tìm Patients theo gender và blood type
    List<Patient> findAllByGenderAndBloodType(String gender, String bloodType);
    
    // Tìm Patients theo address (chứa chuỗi)
    List<Patient> findAllByAddressContainingIgnoreCase(String address);
}
