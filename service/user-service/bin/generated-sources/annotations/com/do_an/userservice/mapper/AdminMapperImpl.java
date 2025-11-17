package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.AdminDTO;
import com.do_an.userservice.entity.Admin;
import com.do_an.userservice.entity.User;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-11-17T21:30:10+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.44.0.v20251023-0518, environment: Java 21.0.8 (Eclipse Adoptium)"
)
@Component
public class AdminMapperImpl implements AdminMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public AdminDTO toDto(Admin admin) {
        if ( admin == null ) {
            return null;
        }

        AdminDTO.AdminDTOBuilder adminDTO = AdminDTO.builder();

        adminDTO.userId( adminUserId( admin ) );
        adminDTO.user( userMapper.toDto( admin.getUser() ) );
        adminDTO.id( admin.getId() );

        return adminDTO.build();
    }

    @Override
    public List<AdminDTO> toDtoList(List<Admin> admins) {
        if ( admins == null ) {
            return null;
        }

        List<AdminDTO> list = new ArrayList<AdminDTO>( admins.size() );
        for ( Admin admin : admins ) {
            list.add( toDto( admin ) );
        }

        return list;
    }

    private String adminUserId(Admin admin) {
        if ( admin == null ) {
            return null;
        }
        User user = admin.getUser();
        if ( user == null ) {
            return null;
        }
        String id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
