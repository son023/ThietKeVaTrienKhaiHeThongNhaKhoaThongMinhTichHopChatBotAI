package com.do_an.common.event;

import lombok.Data;
import lombok.Value;

@Value
public class PreInvoiceDeletedEvent { // Sự kiện bù trừ 2
    String invoiceId;
}
