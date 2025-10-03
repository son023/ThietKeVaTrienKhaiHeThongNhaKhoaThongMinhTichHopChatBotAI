package com.main_project.notification_service.dto;

import com.main_project.notification_service.model.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketSummaryRequest {
    User user = null;
    Movie movie;
    Room room;
    Schedule schedule;
    List<Seat> seats;
    List<Ticket> tickets = null;
    float totalPrice;
}
