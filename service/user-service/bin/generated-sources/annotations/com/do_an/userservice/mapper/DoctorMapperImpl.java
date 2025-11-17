package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.DegreeDTO;
import com.do_an.userservice.dto.response.DoctorDTO;
import com.do_an.userservice.entity.Degree;
import com.do_an.userservice.entity.Doctor;
import com.do_an.userservice.entity.User;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T21:30:10+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class DoctorMapperImpl implements DoctorMapper {

    @Autowired
    private DegreeMapper degreeMapper;

    @Override
    public DoctorDTO toDto(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }

        DoctorDTO doctorDTO = new DoctorDTO();

        doctorDTO.setUserId( doctorUserId( doctor ) );
        doctorDTO.setFullName( doctorUserFullName( doctor ) );
        doctorDTO.setEmail( doctorUserEmail( doctor ) );
        doctorDTO.setPhone( doctorUserPhone( doctor ) );
        doctorDTO.setImageUrl( doctorUserImageUrl( doctor ) );
        doctorDTO.setId( doctor.getId() );
        doctorDTO.setDegrees( degreeSetToDegreeDTOList( doctor.getDegrees() ) );
        doctorDTO.setConsultationFeeAmount( doctor.getConsultationFeeAmount() );
        doctorDTO.setLicenseNumber( doctor.getLicenseNumber() );
        doctorDTO.setSpecializationCode( doctor.getSpecializationCode() );
        doctorDTO.setWorkingHospital( doctor.getWorkingHospital() );

        return doctorDTO;
    }

    private String doctorUserId(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User user = doctor.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String doctorUserFullName(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User user = doctor.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String doctorUserEmail(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User user = doctor.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String doctorUserPhone(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User user = doctor.getUser();
        if ( user == null ) {
            return null;
        }
        String phone = user.getPhone();
        if ( phone == null ) {
            return null;
        }
        return phone;
    }

    private String doctorUserImageUrl(Doctor doctor) {
        if ( doctor == null ) {
            return null;
        }
        User user = doctor.getUser();
        if ( user == null ) {
            return null;
        }
        String imageUrl = user.getImageUrl();
        if ( imageUrl == null ) {
            return null;
        }
        return imageUrl;
    }

    protected List<DegreeDTO> degreeSetToDegreeDTOList(Set<Degree> set) {
        if ( set == null ) {
            return null;
        }

        List<DegreeDTO> list = new ArrayList<DegreeDTO>( set.size() );
        for ( Degree degree : set ) {
            list.add( degreeMapper.toDto( degree ) );
        }

        return list;
    }
}
