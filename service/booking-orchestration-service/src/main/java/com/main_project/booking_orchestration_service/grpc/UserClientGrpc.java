package com.main_project.booking_orchestration_service.grpc;

import com.main_project.booking_orchestration_service.grpc.user.UserServiceGrpc;
import com.main_project.booking_orchestration_service.grpc.user.ValidatePatientRequest;
import com.main_project.booking_orchestration_service.grpc.user.ValidatePatientResponse;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;

import java.util.UUID;

public class UserClientGrpc {
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public ValidatePatientResponse callValidatePatient(UUID patientId)
    {
        System.out.println("[Saga] Step 1: Validating patient (gRPC) " + patientId);
        try {
            ValidatePatientRequest grpcRequest = ValidatePatientRequest.newBuilder()
                    .setPatientId(String.valueOf(patientId))
                    .build();

            ValidatePatientResponse response = userStub.validatePatient(grpcRequest);

            System.out.println("[Saga] Step 1: Patient VALID.");
            return response; // Trả về response chứa insurance_number

        } catch (StatusRuntimeException e) {
            throw new RuntimeException("Lỗi gRPC khi gọi user-service: " + e.getStatus(), e);
        }
    }
}
