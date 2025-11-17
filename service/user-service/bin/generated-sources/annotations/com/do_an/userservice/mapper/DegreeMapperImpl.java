package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.DegreeDTO;
import com.do_an.userservice.entity.Degree;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T21:30:10+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class DegreeMapperImpl implements DegreeMapper {

    @Override
    public DegreeDTO toDto(Degree degree) {
        if ( degree == null ) {
            return null;
        }

        DegreeDTO degreeDTO = new DegreeDTO();

        degreeDTO.setDegreeName( degree.getDegreeName() );
        degreeDTO.setId( degree.getId() );
        degreeDTO.setImageUrl( degree.getImageUrl() );
        degreeDTO.setInstitution( degree.getInstitution() );
        degreeDTO.setYearObtained( degree.getYearObtained() );

        return degreeDTO;
    }

    @Override
    public Degree toEntity(DegreeDTO degreeDto) {
        if ( degreeDto == null ) {
            return null;
        }

        Degree degree = new Degree();

        degree.setDegreeName( degreeDto.getDegreeName() );
        degree.setInstitution( degreeDto.getInstitution() );
        degree.setYearObtained( degreeDto.getYearObtained() );

        return degree;
    }
}
