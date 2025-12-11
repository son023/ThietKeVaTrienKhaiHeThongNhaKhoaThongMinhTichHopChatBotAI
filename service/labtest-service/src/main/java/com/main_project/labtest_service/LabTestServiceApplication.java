package com.main_project.labtest_service;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class LabTestServiceApplication {
    public static void main(String[] args) {
        org.springframework.boot.SpringApplication.run(LabTestServiceApplication.class, args);
    }
}
