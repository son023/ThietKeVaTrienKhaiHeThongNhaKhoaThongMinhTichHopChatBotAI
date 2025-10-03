package com.main_project.api_gateway.model;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    String id;
    String username;
    String password;
    int isAdmin;

    String token;
}
