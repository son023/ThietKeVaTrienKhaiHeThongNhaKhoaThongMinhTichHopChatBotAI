package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.UserDTO;
import com.do_an.userservice.entity.Role;
import com.do_an.userservice.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {


    @Mapping(source = "id", target = "id")
    @Mapping(source = "roles", target = "roles", qualifiedByName = "mapRolesToStringSet")
    UserDTO toDto(User user);


    List<UserDTO> toDtoList(List<User> users);

    /**
     * Hàm helper tùy chỉnh:
     * Chuyển Set<UserRole> (Entity) -> Set<String> (Tên Role)
     */
    @Named("mapRolesToStringSet")
    default Set<String> mapRolesToStringSet(List<Role> roles) {
        if (roles == null || roles.isEmpty()) {
            return Set.of(); // Trả về Set rỗng
        }

        return roles.stream()
                .map(userRole -> userRole.getRoleName())
                .collect(Collectors.toSet());
    }
}