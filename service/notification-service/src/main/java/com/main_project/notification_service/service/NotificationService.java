package com.main_project.notification_service.service;

import com.main_project.notification_service.dto.TicketSummaryRequest;
import com.main_project.notification_service.model.*;
import com.main_project.notification_service.exceptions.AppException;
import com.main_project.notification_service.exceptions.enums.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    EmailService emailService;

    public boolean sendWelcomeEmail() {
        try {
            User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();


            String subject = "Chào mừng bạn đến với hệ thống đặt vé xem phim";

            Map<String, Object> templateData = new HashMap<>();
            String templateName = "welcome-email";
            templateData.put("userName", user.getUsername());
            templateData.put("userEmail", user.getEmail());

            return emailService.sendHtmlEmail(
                    user.getEmail(),
                    subject,
                    templateName,
                    templateData
            );

        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    // public boolean sendPaymentSuccessEmail(TicketSummaryRequest ticketSummaryRequest) {
    //     try {
    //         User user = ticketSummaryRequest.getUser();

    //         // add mapping logic and delete lines belows
    //         System.out.println("Xin chaào đây là quý đạt");
    //         System.out.println(ticketSummaryRequest.getMovie().getName());
    //         System.out.println(ticketSummaryRequest.getRoom().getName());
    //         System.out.println(ticketSummaryRequest.getSeats().size());
    //         System.out.println(ticketSummaryRequest.getTotalPrice());

    //         String subject = "Xác nhận mua vé xem phim";

    //         Map<String, Object> templateData = new HashMap<>();
    //         // create map for each necessary info in invoiceDTO

    //         String templateName = "payment-success";
    //         templateData.put("userName", user.getUsername());
    //         templateData.put("userEmail", user.getEmail());

    //         return emailService.sendHtmlEmail(
    //                 user.getEmail(),
    //                 subject,
    //                 templateName,
    //                 templateData
    //         );

    //     } catch (Exception e) {
    //         throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
    //     }
    // }


    public boolean sendPaymentSuccessEmail(TicketSummaryRequest ticketSummaryRequest) {
        try {
            User user = ticketSummaryRequest.getUser();
            
            String subject = "Xác nhận đặt vé xem phim thành công";

            Map<String, Object> templateData = new HashMap<>();
            // Thông tin người dùng
            templateData.put("userName", user.getUsername());
            templateData.put("userEmail", user.getEmail());
            templateData.put("userPhone", user.getPhone());
            
            // Thông tin phim
            Movie movie = ticketSummaryRequest.getMovie();
            templateData.put("movieName", movie.getName());
            templateData.put("movieCover", movie.getCover());
            templateData.put("movieGenre", movie.getGenre());
            templateData.put("movieDuration", movie.getDuration());
            templateData.put("movieLanguage", movie.getLanguage());
            templateData.put("movieDirector", movie.getDirector());
            
            // Thông tin phòng chiếu
            Room room = ticketSummaryRequest.getRoom();
            templateData.put("roomName", room.getName());
            templateData.put("roomType", room.getType());
            
            // Thông tin lịch chiếu
            Schedule schedule = ticketSummaryRequest.getSchedule();
            templateData.put("showDate", formatDate(schedule.getStart()));
            templateData.put("showTime", formatTime(schedule.getStart()));
            templateData.put("endTime", formatTime(schedule.getEnd()));
            
            // Thông tin ghế
            templateData.put("seats", ticketSummaryRequest.getSeats());
            templateData.put("seatsCount", ticketSummaryRequest.getSeats().size());
            
            // Thông tin vé
            List<Ticket> tickets = ticketSummaryRequest.getTickets();
            templateData.put("tickets", tickets);
            templateData.put("ticketsCount", tickets != null ? tickets.size() : 0);
            
            // Thông tin tổng tiền
            templateData.put("totalPrice", formatCurrency(ticketSummaryRequest.getTotalPrice()));
            templateData.put("bookingDate", formatCurrentDateTime());
            
            // ID cho mã QR
            templateData.put("bookingId", generateBookingId());

            return emailService.sendHtmlEmail(
                    user.getEmail(),
                    subject,
                    "payment-success",
                    templateData
            );

        } catch (Exception e) {
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    private String formatDate(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return dateTime.format(formatter);
    }

    private String formatTime(LocalDateTime dateTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        return dateTime.format(formatter);
    }

    private String formatCurrentDateTime() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }

    private String formatCurrency(float amount) {
        NumberFormat currencyFormat = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return currencyFormat.format(amount) + " VNĐ";
    }

    private String generateBookingId() {
        return "CGV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

}