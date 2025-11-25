package com.do_an.common.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class InvoiceItemCheckerRequest {
    private UUID id;

    private UUID referenceId;
    private String serviceType;
    private Integer quantity;
    private String description;
    private Integer unitPrice;
}
