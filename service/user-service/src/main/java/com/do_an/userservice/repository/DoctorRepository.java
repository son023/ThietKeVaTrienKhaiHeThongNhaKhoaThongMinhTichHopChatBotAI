package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, String> {
    
    Optional<Doctor> findByUserId(String userId);
    
    // Tìm Doctors theo specialization code
    List<Doctor> findAllBySpecializationCode(String specializationCode);
    
    // Tìm Doctors theo working hospital
    List<Doctor> findAllByWorkingHospitalContainingIgnoreCase(String workingHospital);
    
    // Tìm Doctors theo license number
    Optional<Doctor> findByLicenseNumber(String licenseNumber);
    
    // Tìm Doctors theo specialization code và working hospital
    List<Doctor> findAllBySpecializationCodeAndWorkingHospitalContainingIgnoreCase(
            String specializationCode, String workingHospital);
    
    // Sắp xếp theo consultation fee
    List<Doctor> findAllByOrderByConsultationFeeAmountAsc();
    List<Doctor> findAllByOrderByConsultationFeeAmountDesc();
}
