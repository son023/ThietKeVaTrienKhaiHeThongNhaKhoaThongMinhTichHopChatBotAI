package com.main_project.doctor_profile_service.service;

import com.main_project.doctor_profile_service.entity.DoctorProfile;
import com.main_project.doctor_profile_service.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorProfileService {

    private final DoctorProfileRepository doctorProfileRepository;

    public DoctorProfileService(DoctorProfileRepository doctorProfileRepository) {
        this.doctorProfileRepository = doctorProfileRepository;
    }

    public DoctorProfile create(DoctorProfile profile) {
        return doctorProfileRepository.save(profile);
    }

    public DoctorProfile getById(String id) {
        return doctorProfileRepository.findById(id).orElse(null);
    }

    public List<DoctorProfile> getAll() {
        return doctorProfileRepository.findAll();
    }

    public DoctorProfile update(String id, DoctorProfile profile) {
        profile.setId(id);
        return doctorProfileRepository.save(profile);
    }

    public void delete(String id) {
        doctorProfileRepository.deleteById(id);
    }
}



