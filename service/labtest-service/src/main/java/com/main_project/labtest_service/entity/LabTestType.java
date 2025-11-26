package com.main_project.labtest_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.*;

@Entity
@Table(name = "lab_test_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestType {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(length = 255)
    private String name;

    @Column(length = 255)
    private String description;

    // Một loại test có thể được dùng trong nhiều LabTest
    @OneToMany(mappedBy = "labTestType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LabTest> labTests = new ArrayList<>();
}
