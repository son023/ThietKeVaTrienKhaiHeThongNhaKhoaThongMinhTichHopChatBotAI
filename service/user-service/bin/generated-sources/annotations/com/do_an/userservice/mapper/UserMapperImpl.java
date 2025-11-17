package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.UserDTO;
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
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDto(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setId( user.getId() );
        userDTO.setRoles( mapRolesToStringSet( user.getRoles() ) );
        userDTO.setActive( user.isActive() );
        userDTO.setCreatedAt( user.getCreatedAt() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setFullName( user.getFullName() );
        userDTO.setImageUrl( user.getImageUrl() );
        userDTO.setPhone( user.getPhone() );
        userDTO.setUsername( user.getUsername() );

        return userDTO;
    }

    @Override
    public List<UserDTO> toDtoList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserDTO> list = new ArrayList<UserDTO>( users.size() );
        for ( User user : users ) {
            list.add( toDto( user ) );
        }

        return list;
    }
}
