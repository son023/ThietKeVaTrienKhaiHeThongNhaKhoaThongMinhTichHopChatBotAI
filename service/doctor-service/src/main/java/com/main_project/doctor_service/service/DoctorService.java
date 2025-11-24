package com.main_project.doctor_service.service;

import com.main_project.doctor_service.dto.DoctorRequestDTO;
import com.main_project.doctor_service.dto.DoctorResponseDTO;
import com.main_project.doctor_service.entity.Doctor;
import com.main_project.doctor_service.repository.DoctorRepository;
import com.main_project.doctor_service.util.EntityMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService implements IDoctorService {

    private final DoctorRepository doctorRepository;
    private final EntityMapper mapper;

    @Override
    public DoctorResponseDTO createDoctor(DoctorRequestDTO request) {
        if (doctorRepository.existsById(request.getUserId())) {
            throw new DataIntegrityViolationException("Doctor already exists for user " + request.getUserId());
        }
        Doctor doctor = mapper.toDoctorEntity(request);
        return mapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDTO> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(mapper::toDoctorResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponseDTO getDoctorById(String userId) {
        return doctorRepository.findById(userId)
                .map(mapper::toDoctorResponse)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found for user " + userId));
    }

    @Override
    public DoctorResponseDTO updateDoctor(String userId, DoctorRequestDTO request) {
        Doctor doctor = doctorRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found for user " + userId));

        mapper.updateDoctorEntity(doctor, request);
        return mapper.toDoctorResponse(doctorRepository.save(doctor));
    }

    @Override
    public void deleteDoctor(String userId) {
        if (!doctorRepository.existsById(userId)) {
            throw new EntityNotFoundException("Doctor not found for user " + userId);
        }
        doctorRepository.deleteById(userId);
    }
}
