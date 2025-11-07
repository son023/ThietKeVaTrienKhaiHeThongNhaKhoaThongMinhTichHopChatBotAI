package com.do_an.userservice.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RoleDTO {
    private String id;
    private String roleName;
}