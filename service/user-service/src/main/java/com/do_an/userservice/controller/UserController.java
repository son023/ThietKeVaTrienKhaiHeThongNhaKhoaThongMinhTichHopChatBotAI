package com.do_an.userservice.controller;

import com.do_an.userservice.dto.request.CreateUserRequestDTO;
import com.do_an.userservice.dto.request.UpdateUserRequestDTO;
import com.do_an.userservice.dto.response.UserDTO;
import com.do_an.userservice.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user-service/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "API quản lý người dùng cơ bản")
public class UserController {
    
    private final UserService userService;

    @Operation(
            summary = "Tạo User mới",
            description = "Tạo một user mới trong hệ thống. Mặc định sẽ gán role PATIENT nếu không chỉ định role."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tạo user thành công",
                    content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Username hoặc Email đã tồn tại"),
            @ApiResponse(responseCode = "500", description = "Lỗi server")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @PostMapping
    public ResponseEntity<UserDTO> createUser(
            @Parameter(description = "Thông tin user cần tạo", required = true)
            @Valid @RequestBody CreateUserRequestDTO request) {
        log.info("Nhận request tạo user mới");
        UserDTO user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @Operation(
            summary = "Cập nhật User",
            description = "Cập nhật thông tin user. Các trường không gửi lên sẽ giữ nguyên giá trị cũ."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Email đã được sử dụng bởi user khác"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @PutMapping("/{userId}")
    public ResponseEntity<UserDTO> updateUser(
            @Parameter(description = "ID của User", required = true)
            @PathVariable String userId,
            @Parameter(description = "Thông tin cần cập nhật", required = true)
            @Valid @RequestBody UpdateUserRequestDTO request) {
        log.info("Nhận request cập nhật user: {}", userId);
        UserDTO user = userService.updateUser(userId, request);
        return ResponseEntity.ok(user);
    }

    @Operation(
            summary = "Xóa User (soft delete)",
            description = "Xóa user bằng cách set isActive = false. User sẽ không thể đăng nhập nhưng dữ liệu vẫn được giữ lại."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Xóa thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(
            @Parameter(description = "ID của User", required = true)
            @PathVariable String userId) {
        log.info("Nhận request xóa user: {}", userId);
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Lấy User theo ID",
            description = "Lấy thông tin chi tiết của một user theo User ID"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy user",
                    content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{userId}")
    public ResponseEntity<UserDTO> getUserById(
            @Parameter(description = "ID của User", required = true)
            @PathVariable String userId) {
        log.info("Nhận request lấy user theo ID: {}", userId);
        UserDTO user = userService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @Operation(
            summary = "Lấy User theo Username",
            description = "Lấy thông tin chi tiết của một user theo Username"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy user"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy user")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(
            @Parameter(description = "Username của User", required = true)
            @PathVariable String username) {
        log.info("Nhận request lấy user theo username: {}", username);
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @Operation(
            summary = "Lấy danh sách Users với filter",
            description = "Lấy danh sách users với các filter: isActive, fullName, email"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    //@SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers(
            @Parameter(description = "Trạng thái active (true/false)", required = false)
            @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Tên đầy đủ (tìm kiếm không phân biệt hoa thường)", required = false)
            @RequestParam(required = false) String fullName,
            @Parameter(description = "Email (tìm kiếm không phân biệt hoa thường)", required = false)
            @RequestParam(required = false) String email) {
        log.info("Nhận request lấy danh sách users với filters");
        List<UserDTO> users = userService.getAllUsers(isActive, fullName, email);
        return ResponseEntity.ok(users);
    }
}
