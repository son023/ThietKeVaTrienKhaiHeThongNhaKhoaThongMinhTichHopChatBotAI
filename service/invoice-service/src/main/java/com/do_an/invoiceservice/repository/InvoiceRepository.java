package com.do_an.invoiceservice.repository;

import com.do_an.invoiceservice.dto.InvoiceDTO;
import com.do_an.invoiceservice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    // Lưu Invoice vào database
    Optional<Invoice> save(InvoiceDTO invoice);

    // Cập nhật Invoice trong database
    Optional<Invoice> update(InvoiceDTO invoice);

    // Tìm tất cả Invoice theo trạng thái
    List<Invoice> findAllByStatus(String status);

    // Xóa InvoiceItem theo ID và loại dịch vụ
    void deleteByInvoiceItemIdAndServiceType(UUID invoiceItemId, String serviceType);
}
