# Medical Treatment Saga - Orchestrator Pattern

## Tổng quan Kiến trúc

Hệ thống sử dụng **Saga Orchestrator Pattern** với **auth-service** làm orchestrator chính điều phối giữa **insurance-service** và **inventory-service**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        AXON SERVER                              │
│                    (Event Store & Message Bus)                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲ ▼
                              │ │
        ┌─────────────────────┼─┼────────────────────┐
        │                     │ │                    │
        ▼                     ▼ ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ AUTH-SERVICE │      │  INSURANCE   │      │  INVENTORY   │
│              │      │   SERVICE    │      │   SERVICE    │
│ [ORCHESTR.]  │◄────►│              │      │              │
│              │      │              │      │              │
│ Port: 8099   │      │ Port: 8086   │      │ Port: 8082   │
└──────────────┘      └──────────────┘      └──────────────┘
       │                      │                      │
       │                      ▼                      ▼
       │              [Medical Claims]      [Medicine Inventory]
       │              [PostgreSQL]           [PostgreSQL]
       │
       └─── MedicalTreatmentSaga (Orchestrator)
```

## Luồng Saga (Happy Path)

### Bước 1: Khởi tạo Treatment
**Client** → **Auth-Service**
```
POST /api/medical-treatment/initiate
{
    "patientId": "patient-123",
    "patientInsuranceId": "policy-456",
    "medicineId": "medicine-available-success",
    "medicineQuantity": 2,
    "claimAmount": 500000,
    "treatmentDescription": "Điều trị cảm cúm"
}
```

**Auth-Service** tạo `InitiateMedicalTreatmentCommand` → `MedicalTreatmentAggregate`
→ Phát event `MedicalTreatmentInitiatedEvent`

### Bước 2: Tạo Medical Claim
**MedicalTreatmentSaga** nhận event và gửi `CreateMedicalClaimCommand` → **Insurance-Service**

**Insurance-Service** → `MedicalClaimAggregate` xử lý
→ Phát event `MedicalClaimCreatedEvent`

### Bước 3: Đặt trước Thuốc
**MedicalTreatmentSaga** nhận event và gửi `ReserveMedicineCommand` → **Inventory-Service**

**Inventory-Service** → `MedicineReservationAggregate` kiểm tra tồn kho
- ✅ Đủ thuốc → Phát event `MedicineReservedEvent`
- ❌ Hết thuốc → Phát event `MedicineReservationFailedEvent` → **ROLLBACK**

### Bước 4: Phê duyệt Claim
**MedicalTreatmentSaga** nhận `MedicineReservedEvent` và gửi `ApproveMedicalClaimCommand` → **Insurance-Service**

**Insurance-Service** → `MedicalClaimAggregate` phê duyệt
→ Phát event `MedicalClaimApprovedEvent`

### Bước 5: Xác nhận Cấp phát
**MedicalTreatmentSaga** nhận event và gửi `ConfirmMedicineReservationCommand` → **Inventory-Service**

**Inventory-Service** → `MedicineReservationAggregate` xác nhận
→ Phát event `MedicineReservationConfirmedEvent`

### Bước 6: Hoàn thành Treatment
**MedicalTreatmentSaga** nhận event và gửi `CompleteMedicalTreatmentCommand` → **Auth-Service**

**Auth-Service** → `MedicalTreatmentAggregate` hoàn thành
→ Phát event `MedicalTreatmentCompletedEvent`
→ **END SAGA** ✅

## Luồng Rollback

### Scenario 1: Thuốc hết hàng
```
1. Tạo Claim ✅
2. Đặt trước Thuốc ❌ (hết hàng)
   → MedicineReservationFailedEvent
3. ROLLBACK:
   → Hủy Claim (CancelMedicalClaimCommand)
   → MedicalClaimCancelledEvent
4. Thất bại Treatment (FailMedicalTreatmentCommand)
   → MedicalTreatmentFailedEvent
5. END SAGA ❌
```

### Scenario 2: Claim bị từ chối
```
1. Tạo Claim ✅
2. Đặt trước Thuốc ✅
3. Phê duyệt Claim ❌ (bị từ chối)
   → MedicalClaimCancelledEvent
4. ROLLBACK:
   → Hủy Reservation (CancelMedicineReservationCommand)
   → MedicineReservationCancelledEvent
5. Thất bại Treatment (FailMedicalTreatmentCommand)
   → MedicalTreatmentFailedEvent
6. END SAGA ❌
```

## Core-API: Shared Library

### Tại sao cần Core-API?

Trong microservices với Axon Framework, các services cần gửi Commands và nhận Events từ nhau. Nếu mỗi service tự định nghĩa commands/events riêng:

❌ **Vấn đề:**
- Duplicate code
- Khó đồng bộ khi thay đổi
- Dễ sai sót về tên class, field
- Không type-safe

✅ **Giải pháp: Core-API**
- Định nghĩa 1 lần, dùng nhiều nơi
- Đảm bảo consistency
- Type-safe communication
- Dễ maintain và refactor

### Cấu trúc Core-API

```
core-api/
└── src/main/java/com/main_project/coreapi/
    ├── insurance/
    │   ├── commands/  (CreateMedicalClaimCommand, ApproveMedicalClaimCommand, ...)
    │   └── events/    (MedicalClaimCreatedEvent, MedicalClaimApprovedEvent, ...)
    └── inventory/
        ├── commands/  (ReserveMedicineCommand, ConfirmMedicineReservationCommand, ...)
        └── events/    (MedicineReservedEvent, MedicineReservationConfirmedEvent, ...)
```

### Sử dụng Core-API

**Trong build.gradle của mỗi service:**
```gradle
dependencies {
    implementation project(':service:core-api')
}
```

**Trong code:**
```java
// Auth-Service (Orchestrator)
import com.main_project.coreapi.insurance.commands.*;
import com.main_project.coreapi.inventory.commands.*;

// Insurance-Service
import com.main_project.coreapi.insurance.commands.*;
import com.main_project.coreapi.insurance.events.*;

// Inventory-Service
import com.main_project.coreapi.inventory.commands.*;
import com.main_project.coreapi.inventory.events.*;
```

## Cấu hình Services

### 1. Axon Server

Tất cả services cần kết nối đến Axon Server:

```properties
# application.properties (tất cả services)
axon.axonserver.servers=localhost:8124
axon.serializer.general=jackson
axon.serializer.events=jackson
axon.serializer.messages=jackson
```

### 2. Ports

- **Axon Server**: 8124
- **Auth-Service**: 8099 (Orchestrator)
- **Insurance-Service**: 8086
- **Inventory-Service**: 8082
- **Eureka Registry**: 8761

## Testing

### Test Success Scenario

```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/success
```

Hoặc

```bash
curl -X POST http://localhost:8099/api/medical-treatment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "patientInsuranceId": "policy-456",
    "medicineId": "medicine-available-success",
    "medicineQuantity": 2,
    "claimAmount": 500000,
    "treatmentDescription": "Điều trị thành công"
  }'
```

**Kết quả mong đợi:**
```
✅ Claim được tạo
✅ Thuốc được đặt trước
✅ Claim được phê duyệt
✅ Thuốc được cấp phát
✅ SAGA HOÀN THÀNH
```

### Test Rollback Scenario

```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/rollback
```

Hoặc

```bash
curl -X POST http://localhost:8099/api/medical-treatment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-456",
    "patientInsuranceId": "policy-789",
    "medicineId": "medicine-outofstock-fail",
    "medicineQuantity": 5,
    "claimAmount": 750000,
    "treatmentDescription": "Test rollback - thuốc hết hàng"
  }'
```

**Kết quả mong đợi:**
```
✅ Claim được tạo
❌ Thuốc HẾT HÀNG (MedicineReservationFailedEvent)
🔄 ROLLBACK: Hủy Claim
❌ SAGA THẤT BẠI
```

## Monitoring

### Xem Log Saga

Các logs quan trọng sẽ hiển thị:

```
Auth-Service (Orchestrator):
═══════════════════════════════════════════════════════════
🚀 BẮT ĐẦU MEDICAL TREATMENT SAGA
Treatment ID: xxx
Patient ID: xxx
═══════════════════════════════════════════════════════════

Insurance-Service:
✅ BƯỚC 2: Medical Claim đã được tạo thành công
Claim ID: xxx

Inventory-Service:
✅ BƯỚC 3: Thuốc đã được đặt trước thành công
Reservation ID: xxx

Auth-Service:
═══════════════════════════════════════════════════════════
✅✅✅ SAGA HOÀN THÀNH THÀNH CÔNG ✅✅✅
═══════════════════════════════════════════════════════════
```

### Rollback Logs

```
Inventory-Service:
❌ Không đủ thuốc trong kho. Yêu cầu: 5

Auth-Service (Orchestrator):
═══════════════════════════════════════════════════════════
❌ ROLLBACK: Không thể đặt trước thuốc
🔄 ROLLBACK: Hủy Claim
❌ Thất bại Treatment
═══════════════════════════════════════════════════════════
```

## Build & Deploy

### 1. Build Core-API

```bash
cd service/core-api
./gradlew build
```

### 2. Build Services

```bash
# Insurance Service
cd service/insurance-service
./gradlew build

# Inventory Service
cd service/inventory-service
./gradlew build

# Auth Service (Orchestrator)
cd service/auth-service
./gradlew build
```

### 3. Start Axon Server

```bash
docker run -d --name axonserver \
  -p 8024:8024 -p 8124:8124 \
  axoniq/axonserver:latest
```

### 4. Start Services

```bash
# Start trong thứ tự:
1. Eureka Registry (port 8761)
2. Insurance Service (port 8086)
3. Inventory Service (port 8082)
4. Auth Service - Orchestrator (port 8099)
```

## Ưu điểm của Kiến trúc này

### 1. Separation of Concerns
- **Auth-Service**: Chỉ lo orchestrate saga
- **Insurance-Service**: Chỉ lo business logic về claims
- **Inventory-Service**: Chỉ lo business logic về inventory

### 2. Scalability
- Mỗi service có thể scale độc lập
- Axon Server handle event distribution

### 3. Resilience
- Tự động rollback khi có lỗi
- Eventual consistency
- Event sourcing cho audit trail

### 4. Maintainability
- Core-API đảm bảo consistency
- Saga logic tập trung ở 1 nơi
- Dễ debug và monitor

### 5. Flexibility
- Dễ dàng thêm services mới vào saga
- Dễ dàng thay đổi luồng xử lý
- Không cần thay đổi các services khác khi thêm step mới

## Lưu ý Quan trọng

⚠️ **Axon Server phải chạy trước khi start các services**

⚠️ **Core-API phải được build trước khi build các services khác**

⚠️ **Tất cả services phải kết nối đến cùng một Axon Server instance**

⚠️ **Event ordering được đảm bảo bởi Axon Framework**

⚠️ **Saga state được manage tự động bởi Axon**

## Tài liệu Tham khảo

- [Axon Framework Documentation](https://docs.axoniq.io/reference-guide/)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)

