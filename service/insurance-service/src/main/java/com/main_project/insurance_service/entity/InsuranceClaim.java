package com.main_project.insurance_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "insurance_claim")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "claim_amount")
    private Integer claimAmount;

    @Column(name = "approved_amount")
    private Integer approvedAmount;

    @Column(name = "status")
    private String status;

    @Column(name = "claim_date")
    private ZonedDateTime claimDate;

    @Column(name = "approval_date")
    private ZonedDateTime approvalDate;

    @Column(name = "notes")
    private String notes;

    @CreationTimestamp
    @Column(name = "create_at", nullable = false, updatable = false)
    private ZonedDateTime createAt;

    @UpdateTimestamp
    @Column(name = "update_at", nullable = false)
    private ZonedDateTime updateAt;

    // Many-to-One relationship with PatientInsurance
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_insurance_id", referencedColumnName = "id")
    private PatientInsurance patientInsurance;

    // One-to-Many relationship with ClaimDocument
    @OneToMany(mappedBy = "insuranceClaim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ClaimDocument> claimDocuments;
}





