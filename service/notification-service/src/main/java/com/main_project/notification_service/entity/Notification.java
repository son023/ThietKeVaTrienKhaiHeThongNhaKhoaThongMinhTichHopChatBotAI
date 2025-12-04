//package com.main_project.notification_service.entity;
//
//
//import jakarta.persistence.*;
//import lombok.*;
//import java.time.LocalDateTime;
//import java.util.UUID;
//
//@Entity
//@Table(name = "notification")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Notification {
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
//    private UUID id;
//
//    @Column(length = 255)
//    private String chanel;
//
//    @Column(name = "template_id", length = 255)
//    private String templateId;
//
//    @Column(columnDefinition = "text")
//    private String message;
//
//    @Column(length = 50)
//    private String status;
//
//    @Column(name = "error_message", columnDefinition = "text")
//    private String errorMessage;
//
//    private Integer rentryCount;
//
//    private LocalDateTime createAt;
//
//    private LocalDateTime updateAt;
//
//    @Column(name = "user_id")
//    private UUID userId;
//}
