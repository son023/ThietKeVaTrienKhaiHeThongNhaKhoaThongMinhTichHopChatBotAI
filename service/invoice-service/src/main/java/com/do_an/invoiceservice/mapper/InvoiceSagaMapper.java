package com.do_an.invoiceservice.mapper;

import com.do_an.common.model.InvoiceCheckerRequest;
import com.do_an.invoiceservice.entity.Invoice;
import org.mapstruct.Mapper;

@Mapper(
        componentModel = "spring",
        uses = { InvoiceItemSagaMapper.class }
)
public interface InvoiceSagaMapper {
    InvoiceCheckerRequest toDto(Invoice invoice);
}
