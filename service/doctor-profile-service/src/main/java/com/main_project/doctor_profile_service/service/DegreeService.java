package com.main_project.doctor_profile_service.service;

import com.main_project.doctor_profile_service.entity.Degree;
import com.main_project.doctor_profile_service.repository.DegreeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DegreeService {
    private final DegreeRepository degreeRepository;

    public DegreeService(DegreeRepository degreeRepository) {
        this.degreeRepository = degreeRepository;
    }

    public Degree create(Degree entity) { return degreeRepository.save(entity); }
    public Degree getById(String id) { return degreeRepository.findById(id).orElse(null); }
    public List<Degree> getAll() { return degreeRepository.findAll(); }
    public Degree update(String id, Degree entity) { entity.setId(id); return degreeRepository.save(entity); }
    public void delete(String id) { degreeRepository.deleteById(id); }
}



