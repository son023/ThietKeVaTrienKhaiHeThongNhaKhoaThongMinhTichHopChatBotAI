package com.do_an.userservice.mapper;


import com.do_an.userservice.dto.response.DoctorDTO;
import com.do_an.userservice.entity.Doctor;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring", uses = {DegreeMapper.class})
public interface DoctorMapper {

    DoctorMapper INSTANCE = Mappers.getMapper(DoctorMapper.class);


    @Mappings({
            @Mapping(source = "user.id", target = "userId"),
            @Mapping(source = "user.fullName", target = "fullName"),
            @Mapping(source = "user.email", target = "email"),
            @Mapping(source = "user.phone", target = "phone"),
            @Mapping(source = "user.imageUrl", target = "imageUrl"),

            @Mapping(source = "id", target = "id"),
            @Mapping(source = "degrees", target = "degrees")
    })
    DoctorDTO toDto(Doctor doctor);

}