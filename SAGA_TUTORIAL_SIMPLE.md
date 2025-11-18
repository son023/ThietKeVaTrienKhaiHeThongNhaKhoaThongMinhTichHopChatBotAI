# HƯỚNG DẪN SAGA CHO NGƯỜI MỚI BẮT ĐẦU

## Bắt đầu từ ví dụ đời thường

### Tình huống: Đặt đồ ăn online

```
Bạn muốn đặt 1 Pizza:

Bước 1: Bạn đặt món + Thanh toán 200k ✅
Bước 2: Nhà hàng kiểm tra → Hết bột làm pizza ❌

→ Phải làm gì? → HOÀN TIỀN 200k cho bạn!
```

Đây chính là **Saga Pattern** - Khi có lỗi, phải **hoàn tác** (rollback) những gì đã làm.

---

## Áp dụng vào hệ thống y tế

### Tình huống: Bệnh nhân cần điều trị

```
Bước 1: Tạo hồ sơ bảo hiểm ✅
Bước 2: Đặt trước thuốc trong kho ✅
Bước 3: Phê duyệt bảo hiểm ✅
Bước 4: Cấp phát thuốc ✅

→ THÀNH CÔNG 🎉
```

**Nhưng nếu:**
```
Bước 1: Tạo hồ sơ bảo hiểm ✅
Bước 2: Đặt trước thuốc → HẾT THUỐC ❌

→ Phải HỦY hồ sơ bảo hiểm (rollback)
```

---

## Kiến trúc đơn giản

```
           📱 CLIENT (Bệnh nhân yêu cầu điều trị)
                      ↓
           
        🎯 AUTH-SERVICE (Người chỉ huy)
           "MedicalTreatmentSaga"
                ↙        ↘
               ↙          ↘
    🏥 INSURANCE        📦 INVENTORY
       (Bảo hiểm)         (Thuốc)
```

**Giải thích:**
- **Auth-Service**: Là "quản lý dự án" - chỉ huy toàn bộ
- **Insurance**: Chỉ lo về bảo hiểm
- **Inventory**: Chỉ lo về thuốc

---

## Code đơn giản nhất

### 1. Command (Lệnh)

Giống như bạn nói: "Hãy tạo hồ sơ bảo hiểm cho tôi"

```java
public class CreateMedicalClaimCommand {
    private String claimId;        // ID hồ sơ
    private String patientId;      // Bệnh nhân nào?
    private BigDecimal amount;     // Số tiền bao nhiêu?
}
```

### 2. Event (Sự kiện - thông báo)

Giống như hệ thống nói: "Đã tạo xong hồ sơ!"

```java
public class MedicalClaimCreatedEvent {
    private String claimId;
    private String patientId;
    private Instant timestamp;  // Lúc nào?
}
```

### 3. Saga (Người điều phối)

```java
@Saga
public class MedicalTreatmentSaga {
    
    // Bước 1: Bắt đầu
    @StartSaga
    public void handle(MedicalTreatmentInitiatedEvent event) {
        System.out.println("🚀 Bắt đầu điều trị cho bệnh nhân: " + event.getPatientId());
        
        // Gửi lệnh: Tạo hồ sơ bảo hiểm
        CreateMedicalClaimCommand cmd = new CreateMedicalClaimCommand(...);
        commandGateway.send(cmd);
        
        System.out.println("→ Đã gửi lệnh tạo hồ sơ bảo hiểm");
    }
    
    // Bước 2: Khi hồ sơ được tạo xong
    public void handle(MedicalClaimCreatedEvent event) {
        System.out.println("✅ Hồ sơ bảo hiểm đã tạo: " + event.getClaimId());
        
        // Tiếp tục: Đặt trước thuốc
        ReserveMedicineCommand cmd = new ReserveMedicineCommand(...);
        commandGateway.send(cmd);
        
        System.out.println("→ Đã gửi lệnh đặt thuốc");
    }
    
    // Bước 3: Khi thuốc được đặt thành công
    public void handle(MedicineReservedEvent event) {
        System.out.println("✅ Thuốc đã được đặt");
        System.out.println("🎉 HOÀN THÀNH!");
    }
    
    // ROLLBACK: Khi đặt thuốc THẤT BẠI
    public void handle(MedicineReservationFailedEvent event) {
        System.out.println("❌ Không đủ thuốc!");
        System.out.println("🔄 Đang hủy hồ sơ bảo hiểm...");
        
        // Gửi lệnh hủy
        CancelMedicalClaimCommand cmd = new CancelMedicalClaimCommand(...);
        commandGateway.send(cmd);
        
        System.out.println("→ Đã hủy hồ sơ bảo hiểm");
        System.out.println("💔 THẤT BẠI - Nhưng đã rollback sạch sẽ");
    }
}
```

---

## Luồng hoạt động chi tiết

### Case 1: THÀNH CÔNG ✅

```
Bước 1: Client gọi API
   POST /api/medical-treatment/initiate
   {
     "patientId": "BN001",
     "medicineId": "THUOC-AVAILABLE",
     "claimAmount": 500000
   }

↓

Bước 2: Auth-Service nhận request
   MedicalTreatmentSaga bắt đầu
   
   Log: 🚀 Bắt đầu điều trị cho bệnh nhân BN001

↓

Bước 3: Saga gửi Command tạo claim
   → Insurance-Service

   Log: → Đã gửi lệnh tạo hồ sơ bảo hiểm

↓

Bước 4: Insurance-Service xử lý
   - Tạo claim
   - Phát event: MedicalClaimCreatedEvent
   
   Log: ✅ Hồ sơ bảo hiểm đã tạo: CLAIM-123

↓

Bước 5: Saga nhận event, gửi Command đặt thuốc
   → Inventory-Service
   
   Log: → Đã gửi lệnh đặt thuốc

↓

Bước 6: Inventory-Service xử lý
   - Kiểm tra kho: CÓ THUỐC ✅
   - Đặt trước
   - Phát event: MedicineReservedEvent
   
   Log: ✅ Thuốc đã được đặt

↓

Bước 7: Saga nhận event
   
   Log: 🎉 HOÀN THÀNH!
```

### Case 2: ROLLBACK ❌

```
Bước 1-4: Giống case 1
   - Tạo hồ sơ bảo hiểm thành công ✅

↓

Bước 5: Saga gửi Command đặt thuốc
   → Inventory-Service

↓

Bước 6: Inventory-Service xử lý
   - Kiểm tra kho: HẾT THUỐC ❌
   - Phát event: MedicineReservationFailedEvent
   
   Log: ❌ Không đủ thuốc trong kho

↓

Bước 7: Saga nhận event, BẮT ĐẦU ROLLBACK
   
   Log: 🔄 Đang hủy hồ sơ bảo hiểm...
   
   Gửi: CancelMedicalClaimCommand → Insurance-Service

↓

Bước 8: Insurance-Service hủy claim
   - Hủy hồ sơ
   - Phát event: MedicalClaimCancelledEvent
   
   Log: → Đã hủy hồ sơ bảo hiểm

↓

Bước 9: Saga kết thúc
   
   Log: 💔 THẤT BẠI - Nhưng đã rollback sạch sẽ
```

---

## Vai trò của Axon Server

```
        AXON SERVER
        (Bưu điện)
            |
    ________|________
    |       |       |
  Auth   Insurance Inventory
```

**Axon Server làm gì?**

1. **Chuyển Commands**
   ```
   Auth gửi CreateClaimCommand
   → Axon Server nhận
   → Tìm ai xử lý? → Insurance
   → Chuyển đến Insurance
   ```

2. **Phát Events**
   ```
   Insurance phát MedicalClaimCreatedEvent
   → Axon Server broadcast
   → Tất cả ai quan tâm đều nhận được
   → Saga nhận → Tiếp tục bước tiếp
   ```

3. **Lưu Events**
   ```
   Mọi event đều được lưu vĩnh viễn
   → Có thể xem lại lịch sử
   → Có thể replay nếu cần
   ```

---

## Tại sao cần Core-API?

### Vấn đề: Không có Core-API

```
Auth-Service có:
  CreateMedicalClaimCommand.java

Insurance-Service cũng phải có:
  CreateMedicalClaimCommand.java

→ 2 file giống nhau ở 2 nơi!
→ Thay đổi 1 chỗ phải sửa cả 2!
→ Dễ sai!
```

### Giải pháp: Core-API

```
core-api/
  CreateMedicalClaimCommand.java  ← CHỈ 1 FILE

Auth-Service:
  import com.main_project.coreapi.insurance.commands.CreateMedicalClaimCommand;

Insurance-Service:
  import com.main_project.coreapi.insurance.commands.CreateMedicalClaimCommand;

→ Cùng dùng 1 file!
→ Sửa 1 lần, tất cả đều update!
```

---

## Test thử

### 1. Test thành công

```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/success
```

**Xem logs, bạn sẽ thấy:**

```
Auth-Service:
🚀 Bắt đầu điều trị
→ Gửi lệnh tạo claim

Insurance-Service:
✅ Claim đã được tạo

Auth-Service:
→ Gửi lệnh đặt thuốc

Inventory-Service:
✅ Thuốc đã được đặt

Auth-Service:
🎉 HOÀN THÀNH!
```

### 2. Test rollback

```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/rollback
```

**Xem logs:**

```
Auth-Service:
🚀 Bắt đầu điều trị
→ Gửi lệnh tạo claim

Insurance-Service:
✅ Claim đã được tạo

Auth-Service:
→ Gửi lệnh đặt thuốc

Inventory-Service:
❌ Hết thuốc!

Auth-Service:
🔄 Rollback: Hủy claim

Insurance-Service:
→ Claim đã bị hủy

Auth-Service:
💔 THẤT BẠI
```

---

## Tóm tắt 5 điểm chính

1. **Saga = Người chỉ huy** - Điều phối nhiều services
2. **Command = Lệnh** - "Hãy làm cái này"
3. **Event = Thông báo** - "Đã làm xong rồi"
4. **Axon Server = Bưu điện** - Chuyển commands & events
5. **Rollback = Hoàn tác** - Khi có lỗi, hủy những gì đã làm

---

## Các file quan trọng cần đọc

### 1. Saga chính (Người chỉ huy)
```
service/auth-service/src/main/java/com/auth_service/auth_service/axon/saga/
  MedicalTreatmentSaga.java  ← ĐỌC FILE NÀY TRƯỚC
```

### 2. Commands & Events dùng chung
```
service/core-api/src/main/java/com/main_project/coreapi/
  insurance/commands/...
  insurance/events/...
  inventory/commands/...
  inventory/events/...
```

### 3. Aggregates (Logic nghiệp vụ)
```
Insurance:
  service/insurance-service/.../aggregate/MedicalClaimAggregate.java

Inventory:
  service/inventory-service/.../aggregate/MedicineReservationAggregate.java
```

---

## Bài tập thực hành

### Level 1: Đọc hiểu
1. Mở file `MedicalTreatmentSaga.java`
2. Tìm method `@StartSaga`
3. Đọc từ trên xuống, hiểu từng bước

### Level 2: Thử nghiệm
1. Chạy test success
2. Xem logs trong từng service
3. So sánh với diagram trong file này

### Level 3: Thay đổi
1. Thêm log trong Saga: `log.info("Tôi đang ở bước X")`
2. Build lại
3. Chạy test và xem log mới

### Level 4: Mở rộng
1. Thêm 1 bước mới: Gửi email thông báo
2. Tạo command: `SendEmailCommand`
3. Tạo event: `EmailSentEvent`
4. Thêm vào Saga

---

## Câu hỏi? Đọc tiếp:

- **Chi tiết kỹ thuật**: Đọc `SAGA_EXPLAINED.md`
- **Kiến trúc tổng thể**: Đọc `SAGA_ARCHITECTURE.md`
- **Axon docs**: https://docs.axoniq.io/

---

**Chúc bạn học tốt! 🎓**


