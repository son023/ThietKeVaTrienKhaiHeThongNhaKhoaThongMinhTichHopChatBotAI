package com.main_project.booking_orchestration_service.workflow;

import com.main_project.booking_orchestration_service.dto.BookingRequest;
import io.temporal.workflow.SignalMethod;
import io.temporal.workflow.WorkflowInterface;
import io.temporal.workflow.WorkflowMethod;

@WorkflowInterface
public interface BookingWorkflow {
    @WorkflowMethod
    void startBooking(BookingRequest request);

    // Kích hoạt khi client gọi API /confirm
    @SignalMethod
    void sendConfirmationSignal();
}
