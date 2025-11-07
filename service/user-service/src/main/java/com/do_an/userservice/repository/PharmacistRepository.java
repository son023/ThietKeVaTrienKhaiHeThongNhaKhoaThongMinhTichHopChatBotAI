package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacistRepository extends JpaRepository<Pharmacist, String> {
    
    Optional<Pharmacist> findByUserId(String userId);
    
    // Tìm Pharmacists theo degree
    List<Pharmacist> findAllByDegreeContainingIgnoreCase(String degree);
    
    // Tìm Pharmacists theo certificate
    List<Pharmacist> findAllByCertificateContainingIgnoreCase(String certificate);
    
    // Tìm Pharmacists theo degree và certificate
    List<Pharmacist> findAllByDegreeContainingIgnoreCaseAndCertificateContainingIgnoreCase(
            String degree, String certificate);
}
