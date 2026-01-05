package com.main_project.labtest_service.service;

import com.main_project.labtest_service.dto.LabTestDTO;
import com.main_project.labtest_service.dto.LabTestRequestDTO;
import com.main_project.labtest_service.entity.LabTechnician;
import com.main_project.labtest_service.entity.LabTest;
import com.main_project.labtest_service.entity.LabTestType;
import com.main_project.labtest_service.feignclient.InvoiceServiceClient;
import com.main_project.labtest_service.feignclient.dto.AddLabTestChargeRequestDTO;
import com.main_project.labtest_service.repository.LabTechnicianRepository;
import com.main_project.labtest_service.repository.LabTestRepository;
import com.main_project.labtest_service.repository.LabTestTypeRepository;
import com.main_project.labtest_service.util.EntityDTOMapper;
import com.do_an.common.event.LabTestRequestedEvent;
import com.do_an.common.event.LabTestCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.axonframework.eventhandling.EventBus;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.axonframework.eventhandling.GenericEventMessage.asEventMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabTestService implements ILabTest{
    private final LabTestRepository labTestRepository;
    private final LabTechnicianRepository labTechnicianRepository;
    private final LabTestTypeRepository labTestTypeRepository;
    private final EntityDTOMapper mapper;
    private final InvoiceServiceClient invoiceServiceClient;
    private final EventBus eventBus;

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
    @Transactional
    public LabTestDTO requestLabTest(LabTestRequestDTO dto) {
        UUID labTestId = UUID.randomUUID();
        
        LabTest entity = new LabTest();
        entity.setId(labTestId);
        entity.setAppointmentId(dto.getAppointmentId());
        entity.setMedicalHistoryId(dto.getMedicalHistoryId());
        entity.setDoctorId(dto.getDoctorId());
        entity.setPrice(dto.getPrice());
        entity.setInstructions(dto.getInstructions());
        entity.setStatus("REQUEST");
        
        if (dto.getLabTestTypeId() != null) {
            LabTestType type = labTestTypeRepository.findById(dto.getLabTestTypeId())
                    .orElseThrow(() -> new RuntimeException("LabTestType not found"));
            entity.setLabTestType(type);
        }
        
        labTestRepository.save(entity);

        try {
            String message = String.format(
                "Yêu cầu xét nghiệm mới đã được tạo. Mã xét nghiệm: %s",
                labTestId.toString().substring(0, 8)
            );
            
            LabTestRequestedEvent event = new LabTestRequestedEvent(
                labTestId,
                dto.getAppointmentId(),
                dto.getMedicalHistoryId(),
                dto.getDoctorId(),
                dto.getLabTestTypeId(),
                dto.getPrice(),
                dto.getInstructions(),
                message
            );
            
            eventBus.publish(asEventMessage(event));
            log.info("Published LabTestRequestedEvent for labTest {}", labTestId);
        } catch (Exception e) {
            log.error("Failed to publish LabTestRequestedEvent: {}", e.getMessage(), e);
        }
        
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(labTestId).orElseThrow());
    }

    @Override
    @Transactional
    public LabTestDTO acceptLabTest(UUID id, UUID labTechnicianId) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));

        if (!"REQUEST".equals(existing.getStatus())) {
            throw new IllegalStateException("Chỉ ACCEPT được từ REQUEST, current=" + existing.getStatus());
        }
        
        if (labTechnicianId != null) {
            LabTechnician technician = labTechnicianRepository.findById(labTechnicianId)
                    .orElseThrow(() -> new RuntimeException("LabTechnician not found"));
            existing.setLabTechnician(technician);
        }
        
        existing.setStatus("ACCEPTED");
        existing.setUpdatedAt(ZonedDateTime.now());
        labTestRepository.save(existing);
        
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }

    @Override
    @Transactional
    public LabTestDTO startLabTest(UUID id) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));

        if (!"ACCEPTED".equals(existing.getStatus())) {
            throw new IllegalStateException("Chỉ IN_PROGRESS được từ ACCEPTED, current=" + existing.getStatus());
        }
        
        existing.setStatus("IN_PROGRESS");
        existing.setUpdatedAt(ZonedDateTime.now());
        labTestRepository.save(existing);
        
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }

    @Transactional
    public LabTestDTO completeLabTest(UUID id, LabTestRequestDTO dto) {
        LabTest existing = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LabTest not found"));
        
        if (!"IN_PROGRESS".equals(existing.getStatus())) {
            throw new IllegalStateException("Chỉ COMPLETE được từ IN_PROGRESS, current=" + existing.getStatus());
        }
        
        // Update result fields if provided
        if (dto != null) {
            if (dto.getUnits() != null) existing.setUnits(dto.getUnits());
            if (dto.getReferenceRange() != null) existing.setReferenceRange(dto.getReferenceRange());
            if (dto.getAbnormalFlag() != null) existing.setAbnormalFlag(dto.getAbnormalFlag());
            if (dto.getStructureJson() != null) existing.setStructureJson(dto.getStructureJson());
            if (dto.getInstructions() != null) existing.setInstructions(dto.getInstructions());
            if (dto.getResultDate() != null) existing.setResultDate(dto.getResultDate());
        }
        
        existing.setStatus("COMPLETE");
        if (existing.getResultDate() == null) {
            existing.setResultDate(ZonedDateTime.now());
        }
        existing.setUpdatedAt(ZonedDateTime.now());
        labTestRepository.save(existing);

        publishLabTestCompletedEvents(existing);
        
        try {
            LabTestCompletedEvent event = new LabTestCompletedEvent(
                existing.getId(),
                existing.getAppointmentId(),
                existing.getDoctorId(),
                existing.getPrice()
            );
            eventBus.publish(asEventMessage(event));
            log.info("Published LabTestCompletedEvent for labTestId: {}, appointmentId: {}, doctorId: {}, price: {}", 
                    existing.getId(), existing.getAppointmentId(), existing.getDoctorId(), existing.getPrice());
        } catch (Exception e) {
            log.error("Failed to publish LabTestCompletedEvent: {}", e.getMessage(), e);
        }
        
        return mapper.toLabTestDTO(labTestRepository.findByIdWithRelations(id).orElseThrow());
    }
    
    private void publishLabTestCompletedEvents(LabTest labTest) {
        log.info("Adding lab test charge to invoice for completed lab test: {}", labTest.getId());
        
        try {
            AddLabTestChargeRequestDTO request = new AddLabTestChargeRequestDTO(
                    labTest.getId(),
                    labTest.getAppointmentId(),
                    labTest.getPrice(),
                    "Phí xét nghiệm"
            );
            
            invoiceServiceClient.addLabTestCharge(request);
            log.info("Lab test charge added to invoice for labTestId: {}, appointmentId: {}, price: {}", 
                    labTest.getId(), labTest.getAppointmentId(), labTest.getPrice());
        } catch (Exception e) {
            log.error("Failed to add lab test charge to invoice for labTestId: {}, appointmentId: {}: {}", 
                    labTest.getId(), labTest.getAppointmentId(), e.getMessage(), e);
            throw new RuntimeException("Add lab test charge failed", e);
        }
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

    @Override
    public List<LabTestDTO> getLabTestsByAppointmentId(UUID appointmentId) {
        return labTestRepository.findByAppointmentId(appointmentId)
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }

    @Override
    public List<LabTestDTO> getLabTestsByMedicalHistoryId(UUID medicalHistoryId) {
        return labTestRepository.findByMedicalHistoryId(medicalHistoryId)
                .stream().map(mapper::toLabTestDTO).collect(Collectors.toList());
    }
}
