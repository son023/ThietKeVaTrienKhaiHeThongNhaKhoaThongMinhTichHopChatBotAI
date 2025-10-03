package com.main_project.user_service.exceptions.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIED(1000, "Uncategorized", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1001, "User existed", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User not existed", HttpStatus.BAD_REQUEST),
    INVALID_CREDENTIALS(1003, "Invalid credential", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1004, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZATION(1005, "Unauthorization", HttpStatus.FORBIDDEN),
    EMAIL_ALREADY_EXISTS(1006, "Email already exists", HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1007, "Role not found", HttpStatus.NOT_FOUND),
    ROLE_ALREADY_EXISTS(1008, "Role already exists", HttpStatus.BAD_REQUEST),
    ROLE_ALREADY_ASSIGNED(1009, "Role already assigned to user", HttpStatus.BAD_REQUEST),
    ROLE_NOT_ASSIGNED(1010, "Role not assigned to user", HttpStatus.BAD_REQUEST);

    private int code;
    private String message;
    private HttpStatusCode httpStatusCode;
}