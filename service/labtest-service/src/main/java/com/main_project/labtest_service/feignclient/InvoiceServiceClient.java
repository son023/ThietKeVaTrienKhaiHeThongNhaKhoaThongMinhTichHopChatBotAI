package com.main_project.labtest_service.feignclient;

import com.main_project.labtest_service.feignclient.dto.AddLabTestChargeRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "invoice-service", url = "${feign.invoice-service.url:http://localhost:8084/invoice-service/invoices}")
public interface InvoiceServiceClient {
    @PostMapping("/labtest-charge")
    void addLabTestCharge(@RequestBody AddLabTestChargeRequestDTO request);
}