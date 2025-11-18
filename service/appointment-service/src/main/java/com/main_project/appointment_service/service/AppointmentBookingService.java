package com.main_project.appointment_service.service;

import com.main_project.appointment_service.dto.CreateAppointmentRequest;
import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.entity.DoctorWorkSchedule;
import com.main_project.appointment_service.repository.AppointmentRepository;
import com.main_project.appointment_service.repository.DoctorWorkScheduleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AppointmentBookingService {
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DoctorWorkScheduleRepository doctorWorkScheduleRepository;

//    public Appointment createAppointment(CreateAppointmentRequest request) {
//
//        UUID doctorId = request.getDoctorId();
//        ZonedDateTime slotTime = request.getStartTime();
//
//        // --- BƯỚC 1: KHÓA VÀ KIỂM TRA LỊCH BÁC SĨ ---
//        // Nhờ @Lock, nếu 2 người CÙNG GỌI hàm này CÙNG LÚC
//        // người thứ 2 sẽ phải CHỜ ở dòng này.
//        DoctorWorkSchedule schedule = doctorWorkScheduleRepository.findAndLockByDoctorId(doctorId)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch bác sĩ."));
//
//        // Kiểm tra logic
//        if (!schedule.isSlotAvailable(slotTime)) {
//            // Nếu ném exception, @Transactional sẽ tự động rollback
//            throw new IllegalStateException("Slot này đã có người đặt hoặc bác sĩ không rảnh.");
//        }
//
//        // --- BƯỚC 2: CẬP NHẬT LỊCH BÁC SĨ ---
//        // (Ví dụ: thêm vào 1 Set các slot đã bận)
//        schedule.reserveSlot(slotTime);
//        scheduleRepository.save(schedule); // Lưu lại lịch đã cập nhật
//
//        // --- BƯỚC 3: TẠO LỊCH HẸN MỚI ---
//        Appointment appointment = new Appointment();
//        appointment.setDoctorId(doctorId);
//        appointment.setPatientId(request.getPatientId());
//        appointment.setAppointmentStartTime(slotTime);
//        appointment.setStatus("CONFIRMED");
//        Appointment savedAppointment = appointmentRepository.save(appointment);
//
//        // --- KẾT THÚC ---
//        // Hàm kết thúc, @Transactional sẽ COMMIT
//        // Cả 2 thay đổi (schedule và appointment) sẽ được lưu CÙNG LÚC
//
//        // (Nếu có lỗi thanh toán hoặc gửi mail, bạn cũng gọi ở đây
//        //  VÀ NẾU NÓ THẤT BẠI, toàn bộ giao dịch sẽ rollback)
//
//        log.info("Đã tạo lịch hẹn thành công: {}", savedAppointment.getId());
//        return savedAppointment;
//    }
}
