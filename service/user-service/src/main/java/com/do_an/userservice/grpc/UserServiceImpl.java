package com.do_an.userservice.grpc;

import com.do_an.userservice.entity.Patient;
import com.do_an.userservice.entity.User;
import com.do_an.userservice.grpc.user.UserServiceGrpc;
import com.do_an.userservice.grpc.user.ValidatePatientRequest;
import com.do_an.userservice.grpc.user.ValidatePatientResponse;
import com.do_an.userservice.repository.PatientRepository;
import com.do_an.userservice.repository.UserRepository;
import io.grpc.stub.StreamObserver;
import lombok.NoArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

import static ch.qos.logback.classic.spi.ThrowableProxyVO.build;

@GrpcService
@NoArgsConstructor
public class UserServiceImpl extends UserServiceGrpc.UserServiceImplBase {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PatientRepository patientRepository;

    @Override
    public void validatePatient (ValidatePatientRequest request, StreamObserver<ValidatePatientResponse> responseObserver)
    {
        // 1. Tìm Patient và User
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElse(null); // Xử lý lỗi

        if (patient == null || patient.getUser() == null) {
            // Trả về lỗi gRPC
            responseObserver.onError(io.grpc.Status.NOT_FOUND
                    .withDescription("Không tìm thấy bệnh nhân với ID: " + request.getPatientId())
                    .asRuntimeException());
            return;
        }

        User user = patient.getUser();

        // 2. Build response
        ValidatePatientResponse response = ValidatePatientResponse.newBuilder()
                .setPatientId(patient.getId())
                .setFullName(user.getFullName())
                .setPhoneNumber(user.getPhone())
                .build();

        // 3. Trả về cho client
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

}
