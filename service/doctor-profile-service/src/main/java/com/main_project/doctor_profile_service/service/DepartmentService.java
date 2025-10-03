package com.main_project.doctor_profile_service.service;

import com.main_project.doctor_profile_service.entity.Department;
import com.main_project.doctor_profile_service.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public Department create(Department entity) { return departmentRepository.save(entity); }
    public Department getById(String id) { return departmentRepository.findById(id).orElse(null); }
    public List<Department> getAll() { return departmentRepository.findAll(); }
    public Department update(String id, Department entity) { entity.setId(id); return departmentRepository.save(entity); }
    public void delete(String id) { departmentRepository.deleteById(id); }
}



