package com.main_project.appointment_service.service;

import com.main_project.appointment_service.entity.Appointment;
import com.main_project.appointment_service.entity.MedicalService;
import com.main_project.appointment_service.repository.AppointmentRepository;
import com.main_project.appointment_service.repository.MedicalServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class SlotService implements ISlotService {

    private final AppointmentRepository appointmentRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String SLOT_KEY_PREFIX = "slot:";
    private static final int SLOT_STEP_MINUTE = 10;
    private static final long LOCK_EXPIRE_SEC = 120; // slot lock tạm 2 phút

    @Override
    public List<ZonedDateTime> getAvailableSlots(UUID doctorId, UUID serviceId, ZonedDateTime date) {

        MedicalService service = medicalServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        int serviceTime = service.getServiceTime(); // phút

        // Khung giờ làm việc (có thể sau này lấy từ WorkSchedule)
        ZonedDateTime workStart = date.withHour(7).withMinute(0).withSecond(0).withNano(0);
        ZonedDateTime workEnd   = date.withHour(17).withMinute(0).withSecond(0).withNano(0);

        // Lấy các appointment đã đặt trong ngày cho bác sĩ này
        List<Appointment> appointments = appointmentRepository
                .findByDoctorIdAndStartTimeBetween(doctorId, workStart, workEnd);

        List<ZonedDateTime> slots = new ArrayList<>();
        ZonedDateTime slotStart = workStart;

        while (!slotStart.plusMinutes(serviceTime).isAfter(workEnd)) {

            ZonedDateTime slotEnd = slotStart.plusMinutes(serviceTime);
            ZonedDateTime finalSlotStart = slotStart;

            // Kiểm tra trùng lịch với DB (khoảng [slotStart, slotEnd) vs [apptStart, apptEnd))
            boolean dbConflict = appointments.stream().anyMatch(a ->
                    !(slotEnd.isEqual(a.getAppointmentStartTime())
                            || slotEnd.isBefore(a.getAppointmentStartTime())
                            || a.getAppointmentEndTime().isEqual(finalSlotStart)
                            || a.getAppointmentEndTime().isBefore(finalSlotStart))
            );

            // Key redis cho slot (theo ngày + giờ của slotStart)
            String dateString = slotStart.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE);
            String timeString = finalSlotStart.toLocalTime().format(DateTimeFormatter.ofPattern("HHmm"));
            String redisKey = SLOT_KEY_PREFIX + doctorId + ":" + dateString + ":" + timeString;

            Boolean locked = redisTemplate.hasKey(redisKey);

            // Slot chỉ được xem là "available" nếu:
            // - Không trùng Appointment trong DB
            // - Không đang bị giữ trong Redis
            if (!dbConflict && (locked == null || !locked)) {
                slots.add(slotStart);
            }

            // Bước nhảy 10 phút
            slotStart = slotStart.plusMinutes(SLOT_STEP_MINUTE);
        }
        return slots;
    }
    /**
     * USER click chọn slot → LOCK slot (theo doctor + startTime + patient)
     * Trả về true nếu giữ thành công, false nếu slot đã bị người khác giữ.
     */
    @Override
    public boolean lockSlot(UUID doctorId, UUID patientId, ZonedDateTime slotStart) {
        String key = buildKey(doctorId, slotStart);

        // Dùng setIfAbsent (SETNX) + TTL để đảm bảo atomic lock
        Boolean success = redisTemplate.opsForValue().setIfAbsent(
                key,
                patientId.toString(),
                LOCK_EXPIRE_SEC,
                TimeUnit.SECONDS
        );

        return Boolean.TRUE.equals(success);
    }

    /**
     * USER bỏ chọn slot → UNLOCK slot (nhả luôn, không đợi 10 phút)
     */
    @Override
    public void unlockSlot(UUID doctorId, ZonedDateTime slotStart) {
        redisTemplate.delete(buildKey(doctorId, slotStart));
    }

    /**
     * Khi bệnh nhân ấn "Hoàn thành", trước khi tạo Appointment:
     * - Kiểm tra slot đang được giữ bởi đúng patientId không
     * - Nếu đúng → xoá key redis (nhả lock), trả true
     * - Nếu sai / hết hạn → trả false → báo lỗi "Slot hết hạn hoặc không hợp lệ"
     */
    @Override
    public boolean validateAndUnlockSlot(UUID doctorId, UUID patientId, ZonedDateTime slotStart) {
        String key = buildKey(doctorId, slotStart);
        Object value = redisTemplate.opsForValue().get(key);

        if (value == null) {
            // TTL hết hoặc chưa từng lock
            return false;
        }

        if (!patientId.toString().equals(value.toString())) {
            // Người khác đang giữ slot này
            return false;
        }

        // Đúng bệnh nhân → xoá lock và cho phép tạo Appointment
        redisTemplate.delete(key);
        return true;
    }

    private String buildKey(UUID doctorId, ZonedDateTime slotStart) {
        String dateStr = slotStart.toLocalDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String timeStr = slotStart.toLocalTime().format(DateTimeFormatter.ofPattern("HHmm"));
        return SLOT_KEY_PREFIX + doctorId + ":" + dateStr + ":" + timeStr;
    }
}
