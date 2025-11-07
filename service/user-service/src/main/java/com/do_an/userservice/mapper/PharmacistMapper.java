package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.PharmacistDTO;
import com.do_an.userservice.entity.Pharmacist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PharmacistMapper {
    
    @Mappings({
            @Mapping(source = "user.id", target = "userId"),
            @Mapping(source = "user.fullName", target = "fullName"),
            @Mapping(source = "user.email", target = "email"),
            @Mapping(source = "user.phone", target = "phone"),
            @Mapping(source = "user.imageUrl", target = "imageUrl"),
            @Mapping(source = "id", target = "id")
    })
    PharmacistDTO toDto(Pharmacist pharmacist);
    
    List<PharmacistDTO> toDtoList(List<Pharmacist> pharmacists);
}