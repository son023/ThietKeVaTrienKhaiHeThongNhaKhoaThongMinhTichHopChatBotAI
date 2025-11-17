package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.PharmacistDTO;
import com.do_an.userservice.entity.Pharmacist;
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
public class PharmacistMapperImpl implements PharmacistMapper {

    @Override
    public PharmacistDTO toDto(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }

        PharmacistDTO pharmacistDTO = new PharmacistDTO();

        pharmacistDTO.setUserId( pharmacistUserId( pharmacist ) );
        pharmacistDTO.setFullName( pharmacistUserFullName( pharmacist ) );
        pharmacistDTO.setEmail( pharmacistUserEmail( pharmacist ) );
        pharmacistDTO.setPhone( pharmacistUserPhone( pharmacist ) );
        pharmacistDTO.setImageUrl( pharmacistUserImageUrl( pharmacist ) );
        pharmacistDTO.setId( pharmacist.getId() );
        pharmacistDTO.setCertificate( pharmacist.getCertificate() );
        pharmacistDTO.setDegree( pharmacist.getDegree() );

        return pharmacistDTO;
    }

    @Override
    public List<PharmacistDTO> toDtoList(List<Pharmacist> pharmacists) {
        if ( pharmacists == null ) {
            return null;
        }

        List<PharmacistDTO> list = new ArrayList<PharmacistDTO>( pharmacists.size() );
        for ( Pharmacist pharmacist : pharmacists ) {
            list.add( toDto( pharmacist ) );
        }

        return list;
    }

    private String pharmacistUserId(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }
        User user = pharmacist.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String pharmacistUserFullName(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }
        User user = pharmacist.getUser();
        if ( user == null ) {
            return null;
        }
        String fullName = user.getFullName();
        if ( fullName == null ) {
            return null;
        }
        return fullName;
    }

    private String pharmacistUserEmail(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }
        User user = pharmacist.getUser();
        if ( user == null ) {
            return null;
        }
        String email = user.getEmail();
        if ( email == null ) {
            return null;
        }
        return email;
    }

    private String pharmacistUserPhone(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }
        User user = pharmacist.getUser();
        if ( user == null ) {
            return null;
        }
        String phone = user.getPhone();
        if ( phone == null ) {
            return null;
        }
        return phone;
    }

    private String pharmacistUserImageUrl(Pharmacist pharmacist) {
        if ( pharmacist == null ) {
            return null;
        }
        User user = pharmacist.getUser();
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
