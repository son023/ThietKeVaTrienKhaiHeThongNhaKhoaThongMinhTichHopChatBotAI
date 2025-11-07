package com.do_an.userservice.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class ProfileDTO {


    private Map<String, Object> userAttributes;
    private Map<String, Object> profileAttributes;
    private List<DegreeDTO> degrees;

}
