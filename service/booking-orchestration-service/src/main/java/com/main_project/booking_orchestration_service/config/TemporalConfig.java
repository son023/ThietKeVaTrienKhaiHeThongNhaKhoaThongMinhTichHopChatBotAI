package com.main_project.booking_orchestration_service.config;

import com.main_project.booking_orchestration_service.activities.BookingActivities;
import com.main_project.booking_orchestration_service.activities.BookingActivitiesImpl;
import com.main_project.booking_orchestration_service.workflow.BookingWorkflowImpl;
import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TemporalConfig {
    public static final String TASK_QUEUE = "BOOKING_TASK_QUEUE";

    @Bean
    public WorkerFactory workerFactory(WorkflowServiceStubs serviceStubs) {
        WorkflowClient client = WorkflowClient.newInstance(serviceStubs);
        WorkerFactory factory = WorkerFactory.newInstance(client);
        Worker worker = factory.newWorker(TASK_QUEUE);

        // Đăng ký Workflow (Đảm bảo file này cũng có package đúng)
        worker.registerWorkflowImplementationTypes(BookingWorkflowImpl.class);

        // Đăng ký bean Activities
        worker.registerActivitiesImplementations(new BookingActivitiesImpl());

        return factory;
    }

    @Bean
    public WorkflowServiceStubs serviceStubs() {
        // Kết nối đến server Temporal (mặc định localhost:7233)
        return WorkflowServiceStubs.newInstance();
    }

    // --- SỬA LỖI CYCLE: Gọi .start() trên bean đã được tiêm ---
    @PostConstruct
    public void startWorker() {
        // workerFactory(serviceStubs()); // <-- XÓA DÒNG GÂY LỖI NÀY

        // Gọi .start() trên bean WorkerFactory đã được Spring tạo ra
        // Điều này phá vỡ chu kỳ (cycle)
        workerFactory(serviceStubs()).start();
    }

//    @Autowired
//    private WorkerFactory workerFactory;
//
//    @PostConstruct
//    public void startWorker() {
//        // Bây giờ việc .start() nằm ở một bean riêng,
//        // phá vỡ hoàn toàn vòng lặp
//        workerFactory.start();
//        System.out.println("Temporal WorkerFactory Started!");
//    }
}
