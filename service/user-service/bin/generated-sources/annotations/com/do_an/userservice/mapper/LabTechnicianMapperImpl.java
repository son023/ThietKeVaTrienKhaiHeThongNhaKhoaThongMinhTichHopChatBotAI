package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.LabTechnicianDTO;
import com.do_an.userservice.entity.LabTechnician;
import com.do_an.userservice.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T21:30:10+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class LabTechnicianMapperImpl implements LabTechnicianMapper {

    @Override
    public LabTechnicianDTO toDto(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }

        LabTechnicianDTO labTechnicianDTO = new LabTechnicianDTO();

        labTechnicianDTO.setUserId( labTechnicianUserId( labTechnician ) );
        labTechnicianDTO.setFullName( labTechnicianUserFullName( labTechnician ) );
        labTechnicianDTO.setEmail( labTechnicianUserEmail( labTechnician ) );
        labTechnicianDTO.setPhone( labTechnicianUserPhone( labTechnician ) );
        labTechnicianDTO.setImageUrl( labTechnicianUserImageUrl( labTechnician ) );
        labTechnicianDTO.setId( labTechnician.getId() );
        labTechnicianDTO.setField( labTechnician.getField() );

        return labTechnicianDTO;
    }

    @Override
    public List<LabTechnicianDTO> toDtoList(List<LabTechnician> labTechnicians) {
        if ( labTechnicians == null ) {
            return null;
        }

        List<LabTechnicianDTO> list = new ArrayList<LabTechnicianDTO>( labTechnicians.size() );
        for ( LabTechnician labTechnician : labTechnicians ) {
            list.add( toDto( labTechnician ) );
        }

        return list;
    }

    private String labTechnicianUserId(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }
        User user = labTechnician.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String labTechnicianUserFullName(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }
        User user = labTechnician.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String labTechnicianUserEmail(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }
        User user = labTechnician.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String labTechnicianUserPhone(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }
        User user = labTechnician.getUser();
        if ( user == null ) {
            return null;
        }
        String phone = user.getPhone();
        if ( phone == null ) {
            return null;
        }
        return phone;
    }

    private String labTechnicianUserImageUrl(LabTechnician labTechnician) {
        if ( labTechnician == null ) {
            return null;
        }
        User user = labTechnician.getUser();
        if ( user == null ) {
            return null;
        }
        String imageUrl = user.getImageUrl();
        if ( imageUrl == null ) {
            return null;
        }
        return imageUrl;
    }
}
