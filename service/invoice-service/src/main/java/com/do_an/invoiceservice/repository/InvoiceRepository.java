package com.do_an.invoiceservice.repository;

import com.do_an.invoiceservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, String> {

    // API lọc theo trạng thái
    List<Invoice> findAllByStatus(String status);

    // API lọc theo lịch hẹn
    List<Invoice> findAllByAppointmentId(String appointmentId);
    
    // API lọc theo receptionist ID
    List<Invoice> findAllByReceptionistId(String receptionistId);
    
    // API lọc theo receptionist ID và status
    List<Invoice> findAllByReceptionistIdAndStatus(String receptionistId, String status);
    
    // API lọc theo appointment ID và status
    List<Invoice> findAllByAppointmentIdAndStatus(String appointmentId, String status);
    
    // API lọc theo khoảng thời gian tạo
    List<Invoice> findAllByCreateAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // API lọc theo khoảng thời gian issue
    List<Invoice> findAllByIssueAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // API sắp xếp theo thời gian tạo giảm dần
    List<Invoice> findAllByOrderByCreateAtDesc();
    
    // API sắp xếp theo thời gian tạo tăng dần
    List<Invoice> findAllByOrderByCreateAtAsc();
}
