package com.do_an.invoiceservice.repository;

import com.do_an.invoiceservice.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, String> {

    // Tìm các item theo ID hóa đơn
    List<InvoiceItem> findByInvoiceId(String invoiceId);

    // Tìm 1 item cụ thể thuộc 1 hóa đơn cụ thể (bảo mật)
    Optional<InvoiceItem> findByIdAndInvoiceId(String itemId, String invoiceId);
}
