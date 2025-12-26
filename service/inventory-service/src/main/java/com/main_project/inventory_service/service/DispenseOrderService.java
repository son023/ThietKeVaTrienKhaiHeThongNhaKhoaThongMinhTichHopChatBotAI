package com.main_project.inventory_service.service;

import com.main_project.inventory_service.client.InvoiceClient;
import com.main_project.inventory_service.client.PatientClient;
import com.main_project.inventory_service.client.UserClient;
import com.main_project.inventory_service.dto.*;
import org.axonframework.eventhandling.EventBus;
import org.axonframework.eventhandling.GenericEventMessage;
import com.do_an.common.event.PrescriptionDispensedEvent;
import lombok.extern.slf4j.Slf4j;
import com.main_project.inventory_service.entity.DispenseOrder;
import com.main_project.inventory_service.entity.Pharmacist;
import com.main_project.inventory_service.iservice.IDispenseOrderService;
import com.main_project.inventory_service.repository.DispenseOrderRepository;
import com.main_project.inventory_service.repository.PharmacistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispenseOrderService implements IDispenseOrderService {

    private final DispenseOrderRepository dispenseOrderRepository;
    private final PharmacistRepository pharmacistRepository;

    private final InvoiceClient invoiceClient;
    private final PatientClient patientClient;
    private final UserClient userClient;
    private final EventBus eventBus;

    @Override
    @Transactional
    public DispenseOrderResponse create(DispenseOrderRequest request) {
        Pharmacist pharmacist = pharmacistRepository.findById(request.getPharmacistId())
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + request.getPharmacistId()));

        DispenseOrder dispenseOrder = new DispenseOrder();
        dispenseOrder.setPharmacist(pharmacist);
        dispenseOrder.setPrescription(request.getPrescription());
        dispenseOrder.setStatus(request.getStatus());
        dispenseOrder.setMedicalHistoryId(request.getMedicalHistoryId());
        dispenseOrder.setDoctorId(request.getDoctorId());

        DispenseOrder saved = dispenseOrderRepository.save(dispenseOrder);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public DispenseOrderResponse update(UUID id, DispenseOrderRequest request) {
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + id));

        Pharmacist pharmacist = pharmacistRepository.findById(request.getPharmacistId())
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + request.getPharmacistId()));

        dispenseOrder.setPharmacist(pharmacist);
        dispenseOrder.setPrescription(request.getPrescription());
        dispenseOrder.setStatus(request.getStatus());
        dispenseOrder.setMedicalHistoryId(request.getMedicalHistoryId());
        dispenseOrder.setDoctorId(request.getDoctorId());

        DispenseOrder updated = dispenseOrderRepository.save(dispenseOrder);
        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public DispenseOrderResponse getById(UUID id) {
        DispenseOrder dispenseOrder = dispenseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DispenseOrder not found with id: " + id));
        return mapToResponse(dispenseOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DispenseOrderResponse> getAll() {
        return dispenseOrderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!dispenseOrderRepository.existsById(id)) {
            throw new RuntimeException("DispenseOrder not found with id: " + id);
        }
        dispenseOrderRepository.deleteById(id);
    }

    private DispenseOrderResponse mapToResponse(DispenseOrder dispenseOrder) {
        return new DispenseOrderResponse(
                dispenseOrder.getId(),
                dispenseOrder.getPharmacist() != null ? dispenseOrder.getPharmacist().getUserId() : null,
                dispenseOrder.getPrescription(),
                dispenseOrder.getStatus(),
                dispenseOrder.getMedicalHistoryId(),
                dispenseOrder.getDoctorId(),
                dispenseOrder.getCreateAt(),
                dispenseOrder.getUpdateAt()
        );
    }


    @Override
    public DispenseOrderResponse markAsSold(UUID id, UUID pharmacistId) {
        DispenseOrder order = dispenseOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc có DispenseOrder: " + id));

 // ✅ KIỂM TRA THANH TOÁN
    Map<String, Object> paymentStatus = getPaymentStatusOfPrescription(id);
    boolean isPaid = (Boolean) paymentStatus.get("isPaid");
    
    if (!isPaid) {
        throw new IllegalStateException(
            "Không thể cấp phát đơn thuốc. Hóa đơn chưa được thanh toán. " +
            "Trạng thái: " + paymentStatus.get("invoiceStatus")
        );
    }

        // Gán pharmacist vào đơn
        Pharmacist pharmacist = pharmacistRepository.findById(pharmacistId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dược sĩ: " + pharmacistId));

        order.setPharmacist(pharmacist);
        order.setStatus("SOLD");

        DispenseOrder savedOrder = dispenseOrderRepository.save(order);
        
        // ✅ PUBLISH EVENT để gửi thông báo cho lễ tân
        try {
            // Lấy appointmentId từ medicalHistory
            MedicalHistoryResponseDTO mh = patientClient.getMedicalHistory(order.getMedicalHistoryId());
            UUID appointmentId = mh.getAppointmentId();
            
            // Lấy tên dược sĩ từ user-service
            String pharmacistName = "Dược sĩ";
            try {
                UserDTO user = userClient.getUserById(pharmacist.getUserId());
                pharmacistName = user.getFullname() != null ? user.getFullname() : pharmacistName;
            } catch (Exception e) {
                log.warn("Could not get pharmacist name from user-service: {}", e.getMessage());
            }
            
            // Tạo message
            String message = String.format(
                "Đơn thuốc #%s đã được dược sĩ %s cấp phát thành công.",
                id.toString().substring(0, 8),
                pharmacistName
            );
            
            PrescriptionDispensedEvent event = new PrescriptionDispensedEvent(
                savedOrder.getId(),
                savedOrder.getPrescription(),
                savedOrder.getMedicalHistoryId(),
                appointmentId,
                pharmacistId,
                pharmacistName,
                message
            );
            
            eventBus.publish(GenericEventMessage.asEventMessage(event));
            log.info("✅ Published PrescriptionDispensedEvent for dispenseOrder: {}", savedOrder.getId());
        } catch (Exception e) {
            log.error("❌ Lỗi khi publish PrescriptionDispensedEvent: {}", e.getMessage(), e);
            // Không throw exception để không ảnh hưởng đến việc cập nhật status
        }
        
        return mapToResponse(savedOrder);
    }

    @Override
    public DispenseOrderResponse getByPrescriptionId(UUID id) {
        DispenseOrder order = dispenseOrderRepository.findByPrescription(id).get();
        return mapToResponse(order);
    }

    @Override
    public List<DispenseOrderResponse> getAllByStatus(String status) {
        return dispenseOrderRepository.findAllByStatusOrderByCreateAtDesc(status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DispenseOrderResponse> getAllByStatuses(List<String> statuses) {
        return dispenseOrderRepository.findAllByStatusInOrderByCreateAtDesc(statuses)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPrescriptionStatusByMedicalHistoryId(UUID medicalHistoryId) {
        // Các trạng thái chặn việc tạo đơn thuốc mới
        List<String> blockingStatuses = List.of("SOLD", "RELEASED");

        // Ưu tiên tìm đơn ở trạng thái chặn
        return dispenseOrderRepository
                .findFirstByMedicalHistoryIdAndStatusInOrderByCreateAtDesc(medicalHistoryId, blockingStatuses)
                .map(order -> buildStatusResponse(order))
                // Nếu không có, trả về đơn gần nhất (có thể đang RESERVED/IN_PROGRESS/FAILED...)
                .orElseGet(() -> dispenseOrderRepository
                        .findFirstByMedicalHistoryIdOrderByCreateAtDesc(medicalHistoryId)
                        .map(order -> buildStatusResponse(order))
                        .orElse(Map.of("status", "NONE")));
    }

    private Map<String, Object> buildStatusResponse(DispenseOrder order) {
        Map<String, Object> status = new HashMap<>();
        status.put("status", order.getStatus());
        status.put("dispenseOrderId", order.getId());
        status.put("prescriptionId", order.getPrescription());
        status.put("medicalHistoryId", order.getMedicalHistoryId());
        return status;
    }

    @Override
@Transactional(readOnly = true)
public Map<String, Object> getPaymentStatusOfPrescription(UUID dispenseOrderId) {
    DispenseOrder order = dispenseOrderRepository.findById(dispenseOrderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc: " + dispenseOrderId));
    
    // Lấy appointmentId từ medicalHistory
    MedicalHistoryResponseDTO mh = patientClient.getMedicalHistory(order.getMedicalHistoryId());
    UUID appointmentId = mh.getAppointmentId();
    
    // Lấy invoice theo appointmentId
    List<InvoiceResponseDTO> invoices = invoiceClient.getInvoicesByAppointmentId(appointmentId);
    
    boolean isPaid = invoices.stream()
            .anyMatch(inv -> "PAID".equals(inv.getStatus()));
    
    Map<String, Object> result = new HashMap<>();
    result.put("isPaid", isPaid);
    result.put("invoiceId", invoices.isEmpty() ? null : invoices.get(0).getId());
    result.put("invoiceStatus", invoices.isEmpty() ? "NOT_FOUND" : invoices.get(0).getStatus());
    return result;
}

    @Override
    public DispenseOrderResponse getByMedicalHistoryId(UUID id) {
        DispenseOrder order = dispenseOrderRepository.findByMedicalHistoryId(id).get();
        return mapToResponse(order);
    }


}



