package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.PatientDTO;
import com.do_an.userservice.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PatientMapper {
    
    @Mappings({
            @Mapping(source = "user.id", target = "userId"),
            @Mapping(source = "user.fullName", target = "fullName"),
            @Mapping(source = "user.email", target = "email"),
            @Mapping(source = "user.phone", target = "phone"),
            @Mapping(source = "user.imageUrl", target = "imageUrl"),
            @Mapping(source = "id", target = "id")
    })
    PatientDTO toDto(Patient patient);
    
    List<PatientDTO> toDtoList(List<Patient> patients);
}
