package com.main_project.user_service.controller;

import com.main_project.user_service.entity.Role;
import com.main_project.user_service.service.RoleService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {

    RoleService roleService;

    @PostMapping
    ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role createdRole = roleService.createRole(role.getName());
        return ResponseEntity.ok(createdRole);
    }

    @GetMapping("/{id}")
    ResponseEntity<Role> getRoleById(@PathVariable String id) {
        Role role = roleService.getRoleById(id);
        return ResponseEntity.ok(role);
    }

    @GetMapping("/name/{name}")
    ResponseEntity<Role> getRoleByName(@PathVariable String name) {
        Role role = roleService.getRoleByName(name);
        return ResponseEntity.ok(role);
    }

    @GetMapping
    ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteRole(@PathVariable String id) {
        roleService.deleteRole(id);
        return ResponseEntity.ok().build();
    }
}
