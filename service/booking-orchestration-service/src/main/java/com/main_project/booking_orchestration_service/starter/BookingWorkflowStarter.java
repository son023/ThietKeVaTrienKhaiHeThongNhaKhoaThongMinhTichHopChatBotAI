package com.main_project.booking_orchestration_service.starter;

import com.main_project.booking_orchestration_service.config.TemporalConfig;
import com.main_project.booking_orchestration_service.dto.BookingRequest;
import com.main_project.booking_orchestration_service.workflow.BookingWorkflow;
import io.temporal.client.WorkflowClient;
import io.temporal.client.WorkflowOptions;
import io.temporal.serviceclient.WorkflowServiceStubs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
public class BookingWorkflowStarter {

    @Autowired
    private WorkflowServiceStubs serviceStubs; // Tiêm stub từ TemporalConfig

    /**
     * Gửi lệnh "bắt đầu" workflow đến Temporal Server
     * Được gọi bởi API POST /booking/start
     */
    public void startWorkFlow(BookingRequest request){
        // Tạo một client kết nối đến Temporal Server
        WorkflowClient client = WorkflowClient.newInstance(serviceStubs);

        // Tạo 1 "workflow stub" (một proxy) để gọi
        BookingWorkflow workflow = client.newWorkflowStub(
                BookingWorkflow.class,
                WorkflowOptions.newBuilder()
                        .setTaskQueue(TemporalConfig.TASK_QUEUE) // Phải khớp với Task Queue của Worker
                        // Đặt ID duy nhất cho workflow (Rất quan trọng)
                        // Chúng ta dùng patientId + slotId để đảm bảo tính duy nhất
                        .setWorkflowId("booking_" + request.getPatientId() + "_" + request.getDoctorWorkScheduleId())
                        .build()
        );

        // Bắt đầu workflow (KHÔNG CHỜ) - Bất đồng bộ
        // Lệnh này sẽ gọi hàm startBooking() trong BookingWorkflowImpl
        WorkflowClient.start(workflow::startBooking, request);
    }

    /**
     * Gửi "tín hiệu" (signal) đến một workflow ĐANG CHẠY
     * Được gọi bởi API POST /booking/confirm
     */
    public void sendConfirmationSignal(String patientId, String slotId) {
        WorkflowClient client = WorkflowClient.newInstance(serviceStubs);

        // Tái tạo lại Workflow ID mà chúng ta đã dùng ở hàm startWorkFlow
        String workflowId = "booking_" + patientId + "_" + slotId;

        // Lấy workflow đang chạy bằng ID của nó
        BookingWorkflow workflow = client.newWorkflowStub(BookingWorkflow.class, workflowId);

        // Gửi tín hiệu (sẽ kích hoạt hàm sendConfirmationSignal()
        // bên trong BookingWorkflowImpl)
        workflow.sendConfirmationSignal();
    }
}
