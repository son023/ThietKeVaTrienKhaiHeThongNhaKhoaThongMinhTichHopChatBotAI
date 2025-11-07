package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.DegreeDTO;
import com.do_an.userservice.entity.Degree;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DegreeMapper {

    DegreeMapper INSTANCE = Mappers.getMapper(DegreeMapper.class);

    DegreeDTO toDto(Degree degree);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    Degree toEntity(DegreeDTO degreeDto);
}