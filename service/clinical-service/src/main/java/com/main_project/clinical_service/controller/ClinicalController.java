package com.main_project.clinical_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/clitical-service/start")
public class ClinicalController {

   @PostMapping
   public ResponseEntity<String> start() {
        return ResponseEntity.status(HttpStatus.CREATED).body("Clinical Service");
   }
}
