package com.main_project.appointment_service.api.command;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.axonframework.modelling.command.TargetAggregateIdentifier;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevertCheckInCommand {

    /**
     * Đây là ID của AppointmentAggregate cần hoàn tác.
     * Annotation này là BẮT BUỘC.
     */
    @TargetAggregateIdentifier
    private UUID appointmentId;

    // Bạn có thể thêm lý do (reason) nếu muốn
    // private String reason;
}
