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
    @Mapping(source = ".", target = "primaryRole", qualifiedByName = "extractPrimaryRole")
    @Mapping(source = ".", target = "profileId", qualifiedByName = "extractProfileId")
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
    
    /**
     * Trích xuất vai trò chính từ User
     * Ưu tiên: DOCTOR > ADMIN > PHARMACIST > LAB_TECHNICIAN > RECEPTIONIST > PATIENT
     */
    @Named("extractPrimaryRole")
    default String extractPrimaryRole(User user) {
        if (user == null || user.getRoles() == null || user.getRoles().isEmpty()) {
            return null;
        }
        
        Set<String> roleNames = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());
        
        // Ưu tiên theo thứ tự
        if (roleNames.contains("DOCTOR")) return "DOCTOR";
        if (roleNames.contains("ADMIN")) return "ADMIN";
        if (roleNames.contains("PHARMACIST")) return "PHARMACIST";
        if (roleNames.contains("LAB_TECHNICIAN")) return "LAB_TECHNICIAN";
        if (roleNames.contains("RECEPTIONIST")) return "RECEPTIONIST";
        if (roleNames.contains("PATIENT")) return "PATIENT";
        
        // Nếu không có role nào khớp, lấy role đầu tiên
        return roleNames.iterator().next();
    }
    
    /**
     * Trích xuất profile ID dựa trên vai trò chính
     */
    @Named("extractProfileId")
    default java.util.UUID extractProfileId(User user) {
        if (user == null) {
            return null;
        }
        
        String primaryRole = extractPrimaryRole(user);
        if (primaryRole == null) {
            return null;
        }
        
        switch (primaryRole) {
            case "DOCTOR":
                return user.getDoctor() != null ? user.getDoctor().getId() : null;
            case "ADMIN":
                return user.getAdmin() != null ? user.getAdmin().getId() : null;
            case "PHARMACIST":
                return user.getPharmacist() != null ? user.getPharmacist().getId() : null;
            case "LAB_TECHNICIAN":
                return user.getLabTechnician() != null ? user.getLabTechnician().getId() : null;
            case "RECEPTIONIST":
                return user.getReceptionist() != null ? user.getReceptionist().getId() : null;
            case "PATIENT":
                return user.getPatient() != null ? user.getPatient().getId() : null;
            default:
                return null;
        }
    }
}