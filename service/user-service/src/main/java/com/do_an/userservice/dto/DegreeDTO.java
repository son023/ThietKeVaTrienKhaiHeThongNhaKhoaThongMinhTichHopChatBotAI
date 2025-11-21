package com.do_an.userservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.UUID;

@Data
public class DegreeDTO {
    // Chúng ta thêm ID để client có thể gửi lại khi muốn CẬP NHẬT
    // Nếu ID null/trống, chúng ta hiểu là TẠO MỚI
    private UUID id;

    @NotEmpty(message = "Tên bằng cấp không được để trống")
    private String degreeName;

    @NotEmpty(message = "Tên trường/tổ chức không được để trống")
    private String institution;

    private Integer yearObtained; // Năm nhận bằng

    // URL ảnh sẽ được xử lý qua API file riêng, không cập nhật ở đây
    // Thêm trường URL ảnh để trả về cho client
    private String imageUrl;
}
