package com.do_an.userservice.mapper;

import com.do_an.userservice.dto.response.AdminDTO;
import com.do_an.userservice.entity.Admin;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface AdminMapper {
    
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user", target = "user")
    AdminDTO toDto(Admin admin);
    
    List<AdminDTO> toDtoList(List<Admin> admins);
}
