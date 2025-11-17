package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.PatientDTO;
import com.do_an.userservice.entity.Patient;
import com.do_an.userservice.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T21:30:09+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class PatientMapperImpl implements PatientMapper {

    @Override
    public PatientDTO toDto(Patient patient) {
        if ( patient == null ) {
            return null;
        }

        PatientDTO patientDTO = new PatientDTO();

        patientDTO.setUserId( patientUserId( patient ) );
        patientDTO.setFullName( patientUserFullName( patient ) );
        patientDTO.setEmail( patientUserEmail( patient ) );
        patientDTO.setPhone( patientUserPhone( patient ) );
        patientDTO.setImageUrl( patientUserImageUrl( patient ) );
        patientDTO.setId( patient.getId() );
        patientDTO.setAddress( patient.getAddress() );
        patientDTO.setAllergy( patient.getAllergy() );
        patientDTO.setBloodType( patient.getBloodType() );
        patientDTO.setDob( patient.getDob() );
        patientDTO.setGender( patient.getGender() );
        patientDTO.setInsuranceNumber( patient.getInsuranceNumber() );

        return patientDTO;
    }

    @Override
    public List<PatientDTO> toDtoList(List<Patient> patients) {
        if ( patients == null ) {
            return null;
        }

        List<PatientDTO> list = new ArrayList<PatientDTO>( patients.size() );
        for ( Patient patient : patients ) {
            list.add( toDto( patient ) );
        }

        return list;
    }

    private String patientUserId(Patient patient) {
        if ( patient == null ) {
            return null;
        }
        User user = patient.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String patientUserFullName(Patient patient) {
        if ( patient == null ) {
            return null;
        }
        User user = patient.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String patientUserEmail(Patient patient) {
        if ( patient == null ) {
            return null;
        }
        User user = patient.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String patientUserPhone(Patient patient) {
        if ( patient == null ) {
            return null;
        }
        User user = patient.getUser();
        if ( user == null ) {
            return null;
        }
        String phone = user.getPhone();
        if ( phone == null ) {
            return null;
        }
        return phone;
    }

    private String patientUserImageUrl(Patient patient) {
        if ( patient == null ) {
            return null;
        }
        User user = patient.getUser();
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
