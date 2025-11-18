# HIỂU RÕ VỀ SAGA PATTERN - Giải thích từ cơ bản

## 1. SAGA PATTERN LÀ GÌ?

### Vấn đề cần giải quyết

Tưởng tượng bạn đặt món ăn online:
1. Đặt món → Trừ tiền 
2. Nhà hàng xác nhận → Nấu món
3. Shipper nhận → Giao hàng

**Vấn đề:** Nếu bước 2 thất bại (hết nguyên liệu), phải HOÀN TIỀN cho bạn!

Trong microservices:
- Mỗi service có database riêng
- **KHÔNG THỂ** dùng transaction thông thường (rollback)
- Cần cơ chế để "hoàn tác" khi có lỗi

### Giải pháp: SAGA PATTERN

Saga = một chuỗi các giao dịch nhỏ, nếu bước nào thất bại → chạy **compensating transactions** (hoàn tác)

**2 cách triển khai:**

#### Choreography (Phân tán)
```
Service A → Event → Service B
         ← Event ← Service B → Event → Service C
```
❌ Khó debug, khó biết luồng chạy như thế nào

#### Orchestration (Tập trung) ⭐ - Đang dùng
```
        Orchestrator (chỉ huy)
         ↓     ↓     ↓
    Service A | B | C
```
✅ Dễ hiểu, dễ debug, luồng rõ ràng

---

## 2. KIẾN TRÚC HỆ THỐNG NÀY

### Vai trò các service:

```
┌─────────────────────────────────────────────┐
│         AUTH-SERVICE (Orchestrator)         │
│         "Người chỉ huy toàn bộ"            │
│                                             │
│  MedicalTreatmentSaga ← Đây là SAGA chính  │
└─────────────────────────────────────────────┘
          │                    │
          ↓                    ↓
┌──────────────────┐  ┌──────────────────┐
│ INSURANCE-SERVICE│  │ INVENTORY-SERVICE│
│ "Xử lý bảo hiểm" │  │ "Quản lý thuốc"  │
└──────────────────┘  └──────────────────┘
```

### Luồng nghiệp vụ đơn giản:

```
Bệnh nhân cần điều trị:
1. Tạo yêu cầu bảo hiểm (Insurance)
2. Đặt trước thuốc (Inventory)
3. Phê duyệt bảo hiểm
4. Cấp phát thuốc
5. Hoàn thành ✅

Nếu bước nào lỗi → ROLLBACK (hoàn tác)
```

---

## 3. GIẢI THÍCH CÁC THÀNH PHẦN CODE

### A. COMMANDS (Lệnh)

**Commands = Yêu cầu làm gì đó**

```java
// Ví dụ: Yêu cầu tạo claim bảo hiểm
public class CreateMedicalClaimCommand {
    private String claimId;           // ID của claim
    private String patientId;         // Bệnh nhân nào?
    private BigDecimal claimAmount;   // Số tiền bao nhiêu?
    private String treatmentDescription; // Điều trị gì?
}
```

Tương tự như bạn gọi món: "Cho tôi 1 phở bò" → đó là Command

### B. EVENTS (Sự kiện)

**Events = Thông báo điều gì đã xảy ra**

```java
// Ví dụ: Thông báo claim đã được tạo
public class MedicalClaimCreatedEvent {
    private String claimId;
    private String patientId;
    private BigDecimal claimAmount;
    private Instant timestamp; // Thời gian tạo
}
```

Tương tự như nhà hàng nói: "Đã nhận order của bạn" → đó là Event

### C. AGGREGATE (Thực thể nghiệp vụ)

**Aggregate = Nơi xử lý business logic**

```java
@Aggregate
public class MedicalClaimAggregate {
    
    @AggregateIdentifier
    private String claimId;
    
    // Constructor xử lý Command
    @CommandHandler
    public MedicalClaimAggregate(CreateMedicalClaimCommand cmd) {
        // Validation
        if (cmd.getClaimAmount() <= 0) {
            throw new Exception("Số tiền phải > 0");
        }
        
        // Tạo Event thông báo đã tạo thành công
        MedicalClaimCreatedEvent event = new MedicalClaimCreatedEvent(...);
        AggregateLifecycle.apply(event); // Phát event
    }
    
    // Cập nhật state khi Event xảy ra
    @EventSourcingHandler
    public void on(MedicalClaimCreatedEvent event) {
        this.claimId = event.getClaimId();
        this.status = "PENDING";
    }
}
```

**Luồng hoạt động:**
```
1. Nhận Command → Validate
2. Nếu OK → Tạo Event
3. Event được phát ra → Cập nhật state
```

### D. SAGA (Orchestrator)

**Saga = Người chỉ huy toàn bộ luồng**

---

## 4. PHÂN TÍCH SAGA CODE CHI TIẾT

Hãy xem file `MedicalTreatmentSaga.java` trong auth-service:

### Bước 1: Bắt đầu Saga

```java
@Saga
public class MedicalTreatmentSaga {
    
    @Autowired
    private transient CommandGateway commandGateway; // Để gửi Commands
    
    // State của Saga (nhớ đã làm gì, chưa làm gì)
    private String treatmentId;
    private String claimId;
    private String reservationId;
    private boolean claimCreated = false;
    private boolean medicineReserved = false;
    
    // BƯỚC 1: Bắt đầu khi nhận MedicalTreatmentInitiatedEvent
    @StartSaga
    @SagaEventHandler(associationProperty = "treatmentId")
    public void handle(MedicalTreatmentInitiatedEvent event) {
        log.info("🚀 BẮT ĐẦU SAGA");
        
        // Lưu thông tin
        this.treatmentId = event.getTreatmentId();
        this.claimId = UUID.randomUUID().toString();
        
        // GỬI COMMAND ĐẦU TIÊN: Tạo claim
        CreateMedicalClaimCommand cmd = new CreateMedicalClaimCommand(
            claimId,
            event.getPatientId(),
            event.getClaimAmount(),
            ...
        );
        
        commandGateway.send(cmd); // Gửi đến Insurance Service
    }
```

**Giải thích:**
- `@StartSaga`: Đánh dấu đây là điểm bắt đầu
- `@SagaEventHandler`: Lắng nghe Event
- `associationProperty = "treatmentId"`: Saga này quản lý treatment có ID này
- `commandGateway.send(cmd)`: Gửi Command đến service khác

### Bước 2: Xử lý khi Claim được tạo

```java
@SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
public void handle(MedicalClaimCreatedEvent event) {
    log.info("✅ Claim đã được tạo: {}", event.getClaimId());
    
    this.claimCreated = true; // Đánh dấu đã tạo claim
    
    // BƯỚC TIẾP THEO: Đặt trước thuốc
    ReserveMedicineCommand cmd = new ReserveMedicineCommand(
        reservationId,
        event.getMedicineId(),
        event.getQuantity(),
        ...
    );
    
    commandGateway.send(cmd); // Gửi đến Inventory Service
}
```

**Giải thích:**
- Insurance Service đã tạo xong claim → phát `MedicalClaimCreatedEvent`
- Saga nhận event → biết claim OK → tiếp tục bước tiếp theo
- Gửi command đặt thuốc đến Inventory Service

### Bước 3: Xử lý khi Thuốc được đặt

```java
@SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
public void handle(MedicineReservedEvent event) {
    log.info("✅ Thuốc đã được đặt: {}", event.getReservationId());
    
    this.medicineReserved = true; // Đánh dấu đã đặt thuốc
    
    // BƯỚC TIẾP THEO: Phê duyệt claim
    ApproveMedicalClaimCommand cmd = new ApproveMedicalClaimCommand(
        claimId,
        claimAmount,
        "Phê duyệt"
    );
    
    commandGateway.send(cmd);
}
```

### Bước 4: Hoàn thành Saga

```java
@SagaEventHandler(associationProperty = "reservationId")
@EndSaga  // Đánh dấu kết thúc Saga
public void handle(MedicineReservationConfirmedEvent event) {
    log.info("✅✅✅ SAGA HOÀN THÀNH THÀNH CÔNG!");
    
    // Gửi command hoàn thành treatment
    CompleteMedicalTreatmentCommand cmd = new CompleteMedicalTreatmentCommand(
        treatmentId,
        event.getDispenseOrderId()
    );
    
    commandGateway.send(cmd);
}
```

**Giải thích:**
- `@EndSaga`: Đánh dấu saga kết thúc, Axon sẽ dọn dẹp state

---

## 5. ROLLBACK (HOÀN TÁC)

### Khi thuốc hết hàng:

```java
@SagaEventHandler(associationProperty = "sagaId", keyName = "treatmentId")
@EndSaga
public void handle(MedicineReservationFailedEvent event) {
    log.error("❌ Không thể đặt thuốc: {}", event.getFailureReason());
    
    // ROLLBACK: Hủy claim đã tạo
    if (claimCreated) {
        CancelMedicalClaimCommand cmd = new CancelMedicalClaimCommand(
            claimId,
            "Rollback: " + event.getFailureReason()
        );
        
        commandGateway.send(cmd); // Gửi lệnh hủy
    }
    
    // Thông báo treatment thất bại
    FailMedicalTreatmentCommand failCmd = new FailMedicalTreatmentCommand(
        treatmentId,
        event.getFailureReason()
    );
    
    commandGateway.send(failCmd);
}
```

**Luồng rollback:**
```
1. Tạo Claim ✅ (claimCreated = true)
2. Đặt thuốc ❌ (hết hàng)
   → MedicineReservationFailedEvent
3. Saga nhận event → Kiểm tra: đã tạo claim chưa?
4. Có → Gửi CancelMedicalClaimCommand
5. Hủy treatment → Kết thúc ❌
```

---

## 6. AXON FRAMEWORK - Vai trò

### Axon Server

```
┌─────────────────────────────────────┐
│        AXON SERVER (8124)           │
│                                     │
│  - Event Store (lưu events)        │
│  - Message Bus (phân phối messages)│
│  - Saga State (lưu trạng thái saga)│
└─────────────────────────────────────┘
        ↑           ↑           ↑
        │           │           │
   Auth-Svc   Insurance   Inventory
```

**Chức năng:**
1. **Event Store**: Lưu tất cả events (audit trail)
2. **Message Bus**: Đảm bảo Commands/Events đến đúng nơi
3. **Saga State**: Tự động lưu/khôi phục state của Saga

### Command Gateway

```java
@Autowired
private CommandGateway commandGateway;

// Gửi command đến service khác
commandGateway.send(command)
    .thenAccept(result -> log.info("Success"))
    .exceptionally(error -> {
        log.error("Failed: {}", error);
        return null;
    });
```

**Cách hoạt động:**
```
1. commandGateway.send(CreateClaimCommand)
2. Axon Server nhận command
3. Tìm service nào handle command này (Insurance)
4. Gửi command đến Insurance Service
5. Insurance xử lý → Phát event
6. Axon Server broadcast event cho tất cả listeners
7. Saga nhận event → Tiếp tục bước tiếp
```

---

## 7. LUỒNG HOẠT ĐỘNG HOÀN CHỈNH

### Ví dụ Success Case:

```
CLIENT
  │
  │ POST /api/medical-treatment/initiate
  ↓
AUTH-SERVICE (Orchestrator)
  │
  │ InitiateMedicalTreatmentCommand
  ↓
MedicalTreatmentAggregate
  │
  │ apply(MedicalTreatmentInitiatedEvent)
  ↓
AXON SERVER
  │
  │ broadcast event
  ↓
MedicalTreatmentSaga (lắng nghe)
  │
  │ @StartSaga
  │ handle(MedicalTreatmentInitiatedEvent)
  │
  │ send(CreateMedicalClaimCommand) ───→ INSURANCE-SERVICE
  │                                         │
  │                                         │ MedicalClaimAggregate
  │                                         │ apply(MedicalClaimCreatedEvent)
  │                                         ↓
  │                                      AXON SERVER
  │                                         │
  │ ←─────────────────────────────────────┘
  │ handle(MedicalClaimCreatedEvent)
  │
  │ send(ReserveMedicineCommand) ───────→ INVENTORY-SERVICE
  │                                         │
  │                                         │ MedicineReservationAggregate
  │                                         │ - Kiểm tra tồn kho
  │                                         │ - OK → apply(MedicineReservedEvent)
  │                                         ↓
  │                                      AXON SERVER
  │                                         │
  │ ←─────────────────────────────────────┘
  │ handle(MedicineReservedEvent)
  │
  │ send(ApproveMedicalClaimCommand) ───→ INSURANCE-SERVICE
  │                                         │
  │                                         │ apply(MedicalClaimApprovedEvent)
  │                                         ↓
  │                                      AXON SERVER
  │                                         │
  │ ←─────────────────────────────────────┘
  │ handle(MedicalClaimApprovedEvent)
  │
  │ send(ConfirmReservationCommand) ─────→ INVENTORY-SERVICE
  │                                         │
  │                                         │ apply(ReservationConfirmedEvent)
  │                                         ↓
  │                                      AXON SERVER
  │                                         │
  │ ←─────────────────────────────────────┘
  │ @EndSaga
  │ handle(MedicineReservationConfirmedEvent)
  │
  │ send(CompleteMedicalTreatmentCommand)
  ↓
MedicalTreatmentAggregate
  │
  │ apply(MedicalTreatmentCompletedEvent)
  ↓
✅ HOÀN THÀNH
```

### Ví dụ Rollback Case:

```
... (giống bên trên đến bước đặt thuốc)
  │
  │ send(ReserveMedicineCommand) ───────→ INVENTORY-SERVICE
  │                                         │
  │                                         │ MedicineReservationAggregate
  │                                         │ - Kiểm tra tồn kho
  │                                         │ - HẾT HÀNG ❌
  │                                         │ - apply(MedicineReservationFailedEvent)
  │                                         ↓
  │                                      AXON SERVER
  │                                         │
  │ ←─────────────────────────────────────┘
  │ handle(MedicineReservationFailedEvent)
  │
  │ 🔄 ROLLBACK: send(CancelMedicalClaimCommand) → INSURANCE-SERVICE
  │                                                     │
  │                                                     │ apply(MedicalClaimCancelledEvent)
  │                                                     ↓
  │                                                  AXON SERVER
  │                                                     │
  │ ←──────────────────────────────────────────────────┘
  │ send(FailMedicalTreatmentCommand)
  ↓
MedicalTreatmentAggregate
  │
  │ apply(MedicalTreatmentFailedEvent)
  ↓
❌ THẤT BẠI (nhưng đã rollback sạch sẽ)
```

---

## 8. TÓM TẮT CÁC KHÁI NIỆM

| Khái niệm | Là gì | Ví dụ |
|-----------|-------|-------|
| **Command** | Yêu cầu làm gì đó | "Tạo claim bảo hiểm" |
| **Event** | Thông báo đã xảy ra | "Claim đã được tạo" |
| **Aggregate** | Xử lý logic nghiệp vụ | MedicalClaimAggregate |
| **Saga** | Điều phối luồng phức tạp | MedicalTreatmentSaga |
| **CommandGateway** | Gửi command | commandGateway.send() |
| **EventHandler** | Lắng nghe event | @SagaEventHandler |
| **Axon Server** | Message bus + Event store | Trung tâm giao tiếp |

---

## 9. LỢI ÍCH CỦA KIẾN TRÚC NÀY

✅ **Tách biệt rõ ràng**: Mỗi service chỉ lo việc của mình
✅ **Dễ mở rộng**: Thêm service mới không ảnh hưởng cũ
✅ **Rollback tự động**: Không sợ dữ liệu inconsistent
✅ **Audit trail**: Có log đầy đủ mọi sự kiện
✅ **Eventually consistent**: Đảm bảo data cuối cùng đúng
✅ **Resilient**: Lỗi ở 1 service không crash cả hệ thống

---

## 10. CÂU HỎI THƯỜNG GẶP

### Q: Tại sao cần Axon Server?
**A:** Axon Server là "bưu điện" - đảm bảo Commands/Events đến đúng nơi, đúng lúc. Nó cũng lưu tất cả events để audit và replay.

### Q: Saga khác gì Aggregate?
**A:** 
- **Aggregate**: Xử lý logic 1 entity (VD: 1 claim)
- **Saga**: Điều phối nhiều aggregates/services (VD: cả luồng treatment)

### Q: Nếu Saga bị crash giữa chừng?
**A:** Axon tự động lưu state của Saga. Khi restart, Saga tiếp tục từ điểm dừng.

### Q: Làm sao biết Command gửi đến service nào?
**A:** Axon tự động routing dựa trên `@CommandHandler` trong Aggregate.

### Q: Event có thể lost không?
**A:** Không, Axon Server lưu tất cả events vào Event Store (persistent).

---

## KẾT LUẬN

Saga Pattern giúp quản lý transaction phân tán một cách an toàn và dễ hiểu. Với Axon Framework, bạn không cần lo về infrastructure - chỉ cần focus vào business logic!

**Next steps:**
1. Đọc code trong `MedicalTreatmentSaga.java`
2. Chạy test và xem logs
3. Thử thêm bước mới vào saga
4. Đọc docs Axon: https://docs.axoniq.io/


