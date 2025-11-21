package com.do_an.userservice.repository;

import com.do_an.userservice.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PharmacistRepository extends JpaRepository<Pharmacist, UUID> {
    
    Optional<Pharmacist> findByUserId(UUID userId);
    
    // Tìm Pharmacists theo degree
    List<Pharmacist> findAllByDegreeContainingIgnoreCase(String degree);
    
    // Tìm Pharmacists theo certificate
    List<Pharmacist> findAllByCertificateContainingIgnoreCase(String certificate);
    
    // Tìm Pharmacists theo degree và certificate
    List<Pharmacist> findAllByDegreeContainingIgnoreCaseAndCertificateContainingIgnoreCase(
            String degree, String certificate);
}
