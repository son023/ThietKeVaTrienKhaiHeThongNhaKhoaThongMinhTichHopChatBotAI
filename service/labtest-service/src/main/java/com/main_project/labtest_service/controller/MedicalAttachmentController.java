package com.main_project.labtest_service.controller;

import com.main_project.labtest_service.dto.MedicalAttachmentDTO;
import com.main_project.labtest_service.dto.MedicalAttachmentRequestDTO;
import com.main_project.labtest_service.service.MedicalAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/labtest-service/medical-attachments")
@RequiredArgsConstructor
public class MedicalAttachmentController {

    private final MedicalAttachmentService service;
    private static final String UPLOAD_BASE_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<MedicalAttachmentDTO> create(@RequestBody MedicalAttachmentRequestDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PostMapping("/upload")
    public ResponseEntity<MedicalAttachmentDTO> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("labTestId") UUID labTestId,
            @RequestParam(value = "type", defaultValue = "IMAGE") String type) {
        try {
            String subDir = "JSON".equalsIgnoreCase(type) ? "json/" : "images/";
            String relativeDir = UPLOAD_BASE_DIR + subDir;

            Path uploadPath = Paths.get(relativeDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            MedicalAttachmentRequestDTO dto = new MedicalAttachmentRequestDTO();
            dto.setFilePath(relativeDir + filename);
            dto.setType(type);
            dto.setLabTestId(labTestId);

            return ResponseEntity.ok(service.create(dto));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @PostMapping("/upload-multiple")
    public ResponseEntity<List<MedicalAttachmentDTO>> uploadMultipleFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("labTestId") UUID labTestId) {
        try {
            java.util.List<MedicalAttachmentDTO> results = new java.util.ArrayList<>();
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String fileName = file.getOriginalFilename();
                String type = "IMAGE";
                if (fileName != null) {
                    String lowerName = fileName.toLowerCase();
                    if (lowerName.endsWith(".json") || "application/json".equals(file.getContentType())) {
                        type = "JSON";
                    } else if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
                        type = "IMAGE";
                    } else if ("application/pdf".equals(file.getContentType())) {
                        type = "PDF";
                    }
                }

                String subDir = "JSON".equalsIgnoreCase(type) ? "json/" : "images/";
                String relativeDir = UPLOAD_BASE_DIR + subDir;

                Path uploadPath = Paths.get(relativeDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String extension = fileName != null && fileName.contains(".") 
                    ? fileName.substring(fileName.lastIndexOf(".")) 
                    : "";
                String filename = UUID.randomUUID().toString() + extension;
                Path filePath = uploadPath.resolve(filename);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                MedicalAttachmentRequestDTO dto = new MedicalAttachmentRequestDTO();
                dto.setFilePath(relativeDir + filename);
                dto.setType(type);
                dto.setLabTestId(labTestId);

                results.add(service.create(dto));
            }
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload files: " + e.getMessage(), e);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalAttachmentDTO> update(@PathVariable UUID id, @RequestBody MedicalAttachmentRequestDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalAttachmentDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<MedicalAttachmentDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/labtest/{labTestId}")
    public ResponseEntity<List<MedicalAttachmentDTO>> getByLabTest(@PathVariable UUID labTestId) {
        return ResponseEntity.ok(service.getByLabTest(labTestId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MedicalAttachmentDTO>> searchByType(@RequestParam String type) {
        return ResponseEntity.ok(service.searchByType(type));
    }

    @GetMapping("/file")
    public ResponseEntity<org.springframework.core.io.Resource> getFile(@RequestParam String path) {
        try {
            // Remove leading slash if exists
            String filePath = path.startsWith("/") ? path.substring(1) : path;
            
            // Construct full path
            Path fullPath = Paths.get(filePath);
            if (!Files.exists(fullPath) || !Files.isRegularFile(fullPath)) {
                return ResponseEntity.notFound().build();
            }
            
            org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(fullPath);
            String contentType = Files.probeContentType(fullPath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
