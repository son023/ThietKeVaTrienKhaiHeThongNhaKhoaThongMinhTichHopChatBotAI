package com.do_an.userservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


import java.util.List;

@Entity
@Table(name = "role")
@Getter
@Setter
public class Role {
    @Id
    @Column(length = 50, unique = true, nullable = false)
    private String id;

    private String roleName;
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    private List<User> users;
}
