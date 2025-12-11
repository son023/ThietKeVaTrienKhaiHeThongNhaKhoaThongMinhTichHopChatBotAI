package com.main_project.labtest_service.service;

import com.main_project.labtest_service.aggregate.AcceptLabTestCommand;
import com.main_project.labtest_service.aggregate.CompleteLabTestCommand;
import com.main_project.labtest_service.aggregate.RequestLabTestCommand;
import com.main_project.labtest_service.aggregate.StartLabTestCommand;
import com.main_project.labtest_service.dto.LabTestDTO;
import com.main_project.labtest_service.dto.LabTestRequestDTO;
import com.main_project.labtest_service.entity.LabTechnician;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.entity.LabTestType;
import com.main_project.labtest_service.repository.LabTechnicianRepository;
import com.main_project.labtest_service.repository.LabTestRepository;
import com.main_project.labtest_service.repository.LabTestTypeRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabTestService implements ILabTest{
    private final LabTestRepository labTestRepository;
    private final LabTechnicianRepository labTechnicianRepository;
    private final LabTestTypeRepository labTestTypeRepository;
    private final EntityDTOMapper mapper;
    private final CommandGateway commandGateway;

    @Override
    public LabTestDTO createLabTest(LabTestRequestDTO requestDTO) {
        LabTestType type = labTestTypeRepository.findById(requestDTO.getLabTestTypeId())
                .orElseThrow(() -> new RuntimeException("LabTestType not found"));

        LabTechnician technician = null;
        if (requestDTO.getLabTechnicianId() != null) {
            technician = labTechnicianRepository.findById(requestDTO.getLabTechnicianId())
                    .orElseThrow(() -> new RuntimeException("LabTechnician not found"));
        }

        LabTest entity = mapper.toLabTestEntity(requestDTO, type, technician);
        labTestRepository.save(entity);
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(entity.getId()).orElseThrow());
    }

    @Override
    public LabTestDTO updateLabTest(UUID id, LabTestRequestDTO requestDTO) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));

        existing.setDoctorId(requestDTO.getDoctorId());
        if (requestDTO.getLabTechnicianId() != null) {
            LabTechnician technician = labTechnicianRepository.findById(requestDTO.getLabTechnicianId())
                    .orElseThrow(() -> new RuntimeException("LabTechnician not found"));
            existing.setLabTechnician(technician);
        } else {
            existing.setLabTechnician(null);
        }
        existing.setPrice(requestDTO.getPrice());
        existing.setInstructions(requestDTO.getInstructions());
        existing.setStatus(requestDTO.getStatus());
        existing.setAbnormalFlag(requestDTO.getAbnormalFlag());
        existing.setUnits(requestDTO.getUnits());
        existing.setStructureJson(requestDTO.getStructureJson());
        existing.setReferenceRange(requestDTO.getReferenceRange());
        existing.setUpdatedAt(java.time.ZonedDateTime.now());

        if (requestDTO.getResultDate() != null)
            existing.setResultDate(requestDTO.getResultDate());

        labTestRepository.save(existing);
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }


    @Override
    public LabTestDTO requestLabTest(LabTestRequestDTO dto) {
        UUID labTestId = UUID.randomUUID();
        RequestLabTestCommand cmd = new RequestLabTestCommand(
                labTestId,
                dto.getAppointmentId(),
                dto.getMedicalHistoryId(),
                dto.getDoctorId(),
                dto.getLabTechnicianId(),
                dto.getLabTestTypeId(),
                dto.getPrice(),
                dto.getInstructions()
        );
        commandGateway.send(cmd);
        LabTestDTO res = new LabTestDTO();
        res.setId(labTestId);
        res.setAppointmentId(dto.getAppointmentId());
        res.setMedicalHistoryId(dto.getMedicalHistoryId());
        res.setDoctorId(dto.getDoctorId());
        res.setPrice(dto.getPrice());
        res.setInstructions(dto.getInstructions());
        res.setStatus("REQUEST");
        return res;
    }

    @Override
    public LabTestDTO acceptLabTest(UUID id) {
        commandGateway.sendAndWait(new AcceptLabTestCommand(id));
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }

    @Override
    public LabTestDTO startLabTest(UUID id) {
        commandGateway.sendAndWait(new StartLabTestCommand(id));
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }

    @Override
    public LabTestDTO completeLabTest(UUID id) {
        LabTestDTO labTestDTO = mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
        commandGateway.sendAndWait(new CompleteLabTestCommand(id, labTestDTO.getAppointmentId(), labTestDTO.getPrice()));
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }

    public LabTestDTO completeLabTest(UUID id, LabTestRequestDTO dto) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));
        
        // Update result fields if provided
        if (dto != null) {
            if (dto.getUnits() != null) existing.setUnits(dto.getUnits());
            if (dto.getReferenceRange() != null) existing.setReferenceRange(dto.getReferenceRange());
            if (dto.getAbnormalFlag() != null) existing.setAbnormalFlag(dto.getAbnormalFlag());
            if (dto.getStructureJson() != null) existing.setStructureJson(dto.getStructureJson());
            if (dto.getInstructions() != null) existing.setInstructions(dto.getInstructions());
            if (dto.getResultDate() != null) existing.setResultDate(dto.getResultDate());
            existing.setUpdatedAt(java.time.ZonedDateTime.now());
            labTestRepository.save(existing);
        }
        
        LabTestDTO labTestDTO = mapper.toLabTestDTO(existing);
        commandGateway.sendAndWait(new CompleteLabTestCommand(id, labTestDTO.getAppointmentId(), labTestDTO.getPrice()));
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }
    @Override
    public void deleteLabTest(UUID id) {
        if (!labTestRepository.existsById(id))
            throw new RuntimeException("LabTest not found");
        labTestRepository.deleteById(id);
    }

    @Override
    public LabTestDTO getLabTestById(UUID id) {
        return labTestRepository.findByIdWithRelations(id)
                .map(mapper::toLabTestDTO)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));
    }

    @Override
    public List<LabTestDTO> getAllLabTests() {
        return labTestRepository.findAllWithRelations()
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }

    @Override
    public List<LabTestDTO> getLabTestsByDoctorId(UUID doctorId) {
        return labTestRepository.findByDoctorId(doctorId)
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }

    @Override
    public List<LabTestDTO> getLabTestsByLabTechnicianId(UUID labTechnicianId) {
        return labTestRepository.findByLabTechnician_UserId(labTechnicianId)
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }

    @Override
    public List<LabTestDTO> getLabTestsByStatus(String status) {
        return labTestRepository.findByStatus(status)
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }
}
