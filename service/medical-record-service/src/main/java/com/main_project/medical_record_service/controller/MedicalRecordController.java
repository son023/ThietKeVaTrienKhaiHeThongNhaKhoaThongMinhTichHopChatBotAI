package com.main_project.medical_record_service.controller;

import com.main_project.medical_record_service.entity.MedicalAttachment;
import com.main_project.medical_record_service.entity.MedicalRecord;
import com.main_project.medical_record_service.repository.MedicalAttachmentRepository;
import com.main_project.medical_record_service.repository.MedicalRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/medical-records")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordRepository recordRepository;
    private final MedicalAttachmentRepository attachmentRepository;

    @GetMapping
    public List<MedicalRecord> getAll() {
        return recordRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getById(@PathVariable String id) {
        return recordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public MedicalRecord create(@RequestBody MedicalRecord record) {
        if (record.getId() == null || record.getId().isEmpty()) {
            record.setId(UUID.randomUUID().toString());
        }
        LocalDateTime now = LocalDateTime.now();
        record.setCreatedAt(now);
        record.setUpdatedAt(now);
        if (record.getVersion() == null) {
            record.setVersion(1);
        }
        return recordRepository.save(record);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> update(@PathVariable String id, @RequestBody MedicalRecord updated) {
        return recordRepository.findById(id)
                .map(existing -> {
                    updated.setId(existing.getId());
                    updated.setCreatedAt(existing.getCreatedAt());
                    updated.setUpdatedAt(LocalDateTime.now());
                    if (updated.getVersion() == null) {
                        updated.setVersion(existing.getVersion());
                    }
                    return ResponseEntity.ok(recordRepository.save(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!recordRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        recordRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attachments")
    public List<MedicalAttachment> listAttachments(@PathVariable String id) {
        return attachmentRepository.findByRecordId(id);
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<MedicalAttachment> addAttachment(@PathVariable String id, @RequestBody MedicalAttachment attachment) {
        if (!recordRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        if (attachment.getId() == null || attachment.getId().isEmpty()) {
            attachment.setId(UUID.randomUUID().toString());
        }
        attachment.setRecordId(id);
        attachment.setUploadedAt(LocalDateTime.now());
        return ResponseEntity.ok(attachmentRepository.save(attachment));
    }
}






