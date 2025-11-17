# 🔄 MEDICAL TREATMENT SAGA - LUỒNG HOẠT ĐỘNG CHI TIẾT

## 📋 Tổng Quan

**Saga Pattern**: Medical Treatment Saga  
**Mục đích**: Điều phối quy trình điều trị y tế liên quan đến 2 services:
- **Insurance Service**: Xử lý claim bảo hiểm
- **Inventory Service**: Quản lý đặt trước và cấp phát thuốc

## 🎯 Các Bước Trong Luồng Saga

### ✅ LUỒNG THÀNH CÔNG (Happy Path)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEDICAL TREATMENT SAGA                        │
│                       (Success Flow)                             │
└─────────────────────────────────────────────────────────────────┘

Client Request
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 0: Khởi Tạo Request                                │
│  ─────────────────────────────────────────────────────   │
│  • POST /saga-test/trigger                               │
│  • EventGateway publish: MedicalTreatmentRequestedEvent  │
│  • Saga bắt đầu với @StartSaga                           │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 1: Tạo Claim Bảo Hiểm                              │
│  ─────────────────────────────────────────────────────   │
│  Service: Insurance Service                              │
│  Command: CreateMedicalClaimCommand                      │
│  Aggregate: MedicalClaimAggregate                        │
│                                                           │
│  ➤ Tạo claim với:                                        │
│    - claimId: UUID mới                                   │
│    - patientId                                           │
│    - patientInsuranceId                                  │
│    - claimAmount                                         │
│    - treatmentDescription                                │
│    - sagaId (để track saga)                              │
│                                                           │
│  ➤ Validation:                                           │
│    - claimAmount > 0                                     │
│    - patientId không empty                               │
│                                                           │
│  ➤ Event phát ra: MedicalClaimCreatedEvent               │
│    - status = "PENDING"                                  │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 2: Đặt Trước Thuốc                                 │
│  ─────────────────────────────────────────────────────   │
│  Service: Inventory Service                              │
│  Command: ReserveMedicineCommand                         │
│  Aggregate: MedicineReservationAggregate                 │
│                                                           │
│  ➤ Saga nhận MedicalClaimCreatedEvent                    │
│  ➤ Gửi command đặt trước thuốc với:                      │
│    - reservationId: UUID mới                             │
│    - medicineId                                          │
│    - medicineQuantity                                    │
│    - patientId                                           │
│    - claimId (link với claim)                            │
│    - sagaId (để track)                                   │
│                                                           │
│  ➤ Kiểm tra tồn kho:                                     │
│    - medicineId contains "available" → SUCCESS ✅        │
│    - medicineId contains "outofstock" → FAIL ❌          │
│                                                           │
│  ➤ Event phát ra (nếu thành công):                       │
│    MedicineReservedEvent                                 │
│    - status = "RESERVED"                                 │
│    - Thuốc được giữ chỗ trong kho                        │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 3: Phê Duyệt Claim                                 │
│  ─────────────────────────────────────────────────────   │
│  Service: Insurance Service                              │
│  Command: ApproveMedicalClaimCommand                     │
│  Aggregate: MedicalClaimAggregate                        │
│                                                           │
│  ➤ Saga nhận MedicineReservedEvent                       │
│  ➤ Gửi command phê duyệt claim với:                      │
│    - claimId                                             │
│    - approvedAmount (= claimAmount)                      │
│    - approvalNotes                                       │
│                                                           │
│  ➤ Validation:                                           │
│    - status phải là "PENDING"                            │
│    - approvedAmount <= claimAmount                       │
│                                                           │
│  ➤ Event phát ra: MedicalClaimApprovedEvent              │
│    - status = "APPROVED"                                 │
│    - approvedAmount được lưu                             │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 4: Xác Nhận Cấp Phát Thuốc                         │
│  ─────────────────────────────────────────────────────   │
│  Service: Inventory Service                              │
│  Command: ConfirmMedicineReservationCommand              │
│  Aggregate: MedicineReservationAggregate                 │
│                                                           │
│  ➤ Saga nhận MedicalClaimApprovedEvent                   │
│  ➤ Gửi command xác nhận cấp phát với:                    │
│    - reservationId                                       │
│    - dispenseOrderId: UUID mới                           │
│                                                           │
│  ➤ Validation:                                           │
│    - status phải là "RESERVED"                           │
│                                                           │
│  ➤ Event phát ra: MedicineReservationConfirmedEvent      │
│    - status = "CONFIRMED"                                │
│    - dispenseOrderId được lưu                            │
│    - Thuốc chính thức được cấp phát                      │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 5: Kết Thúc Saga (@EndSaga)                        │
│  ─────────────────────────────────────────────────────   │
│  ➤ Saga nhận MedicineReservationConfirmedEvent           │
│  ➤ Log thành công:                                       │
│    ✅ Medical Treatment Saga hoàn thành!                 │
│    - Claim ID: xxx                                       │
│    - Reservation ID: xxx                                 │
│    - Dispense Order ID: xxx                              │
│  ➤ Saga kết thúc với @EndSaga                            │
└──────────────────────────────────────────────────────────┘

     🎉 HOÀN THÀNH THÀNH CÔNG!
```

---

### ❌ LUỒNG ROLLBACK (Compensating Transactions)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MEDICAL TREATMENT SAGA                        │
│                      (Rollback Flow)                             │
└─────────────────────────────────────────────────────────────────┘

Client Request
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 0: Khởi Tạo Request (giống Success Flow)          │
│  BƯỚC 1: Tạo Claim Bảo Hiểm (SUCCESS ✅)                 │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC 2: Đặt Trước Thuốc - THẤT BẠI ❌                   │
│  ─────────────────────────────────────────────────────   │
│  Service: Inventory Service                              │
│  Command: ReserveMedicineCommand                         │
│                                                           │
│  ➤ Kiểm tra tồn kho:                                     │
│    - medicineId = "medicine-outofstock-fail"             │
│    - checkMedicineAvailability() → FALSE                 │
│                                                           │
│  ➤ Event phát ra: MedicineReservationFailedEvent ⚠️      │
│    - failureReason: "Không đủ thuốc trong kho"          │
│    - status = "FAILED"                                   │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  🔄 ROLLBACK BƯỚC 1: Hủy Claim Bảo Hiểm                  │
│  ─────────────────────────────────────────────────────   │
│  Service: Insurance Service                              │
│  Command: CancelMedicalClaimCommand                      │
│  Aggregate: MedicalClaimAggregate                        │
│                                                           │
│  ➤ Saga nhận MedicineReservationFailedEvent              │
│  ➤ Kiểm tra: claimCreated = true?                        │
│  ➤ Gửi compensating command:                             │
│    - claimId                                             │
│    - cancellationReason: "Hủy do không thể đặt trước    │
│      thuốc: [failureReason]"                             │
│                                                           │
│  ➤ Validation:                                           │
│    - status không thể là "APPROVED"                      │
│                                                           │
│  ➤ Event phát ra: MedicalClaimCancelledEvent             │
│    - status = "CANCELLED"                                │
│    - cancellationReason được lưu                         │
└──────────────────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────────────────────┐
│  BƯỚC CUỐI: Kết Thúc Saga (@EndSaga)                     │
│  ─────────────────────────────────────────────────────   │
│  ➤ Saga nhận MedicineClaimCancelledEvent                 │
│  ➤ Log thất bại:                                         │
│    ❌ Medical Treatment Saga đã thất bại và được         │
│       rollback!                                          │
│  ➤ Saga kết thúc với @EndSaga                            │
└──────────────────────────────────────────────────────────┘

     ⚠️  ROLLBACK HOÀN TẤT
```

---

## 🏗️ Kiến Trúc Components

### 1. **Insurance Service**

#### Aggregates:
- **MedicalClaimAggregate** (insurance-service)
  - Quản lý lifecycle của claim bảo hiểm
  - States: PENDING → APPROVED / CANCELLED

#### Commands:
- `CreateMedicalClaimCommand` - Tạo claim mới
- `ApproveMedicalClaimCommand` - Phê duyệt claim
- `CancelMedicalClaimCommand` - Hủy claim (compensating)

#### Events:
- `MedicalClaimCreatedEvent` - Claim đã được tạo
- `MedicalClaimApprovedEvent` - Claim đã được phê duyệt
- `MedicalClaimCancelledEvent` - Claim đã bị hủy

#### Saga:
- **MedicalTreatmentSaga**
  - Điều phối toàn bộ luồng
  - Xử lý compensating transactions

---

### 2. **Inventory Service**

#### Aggregates:
- **MedicineReservationAggregate** (inventory-service)
  - Quản lý việc đặt trước và cấp phát thuốc
  - States: RESERVED → CONFIRMED / CANCELLED / FAILED

#### Commands:
- `ReserveMedicineCommand` - Đặt trước thuốc
- `ConfirmMedicineReservationCommand` - Xác nhận cấp phát
- `CancelMedicineReservationCommand` - Hủy đặt trước (compensating)

#### Events:
- `MedicineReservedEvent` - Thuốc đã được đặt trước
- `MedicineReservationConfirmedEvent` - Đã xác nhận cấp phát
- `MedicineReservationCancelledEvent` - Đã hủy đặt trước
- `MedicineReservationFailedEvent` - Đặt trước thất bại

---

## 🎯 Các Điểm Quan Trọng

### 1. **Saga Association**
```java
@StartSaga
public void on(MedicalTreatmentRequestedEvent event)

@EventHandler
public void on(MedicalClaimCreatedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return; // ✅ Kiểm tra sagaId
}
```
- Mỗi saga instance được track bằng `sagaId`
- Events từ các aggregates khác nhau được liên kết qua `sagaId`

### 2. **Compensating Transactions**
```java
@EventHandler
@EndSaga
public void on(MedicineReservationFailedEvent event) {
    // Rollback: Hủy claim nếu đã tạo
    if (claimCreated) {
        commandGateway.send(new CancelMedicalClaimCommand(...));
    }
}
```
- Saga tự động rollback các bước đã thực hiện
- Mỗi forward transaction có compensating transaction tương ứng

### 3. **State Management**
```java
private boolean claimCreated = false;
private boolean claimApproved = false;
private boolean medicineReserved = false;
private boolean treatmentCompleted = false;
```
- Saga lưu trạng thái để biết bước nào đã hoàn thành
- Dùng để quyết định compensating actions cần thực hiện

### 4. **End Saga Conditions**
```java
@EndSaga
public void on(MedicineReservationConfirmedEvent event)  // ✅ Success

@EndSaga
public void on(MedicineReservationFailedEvent event)     // ❌ Failure

@EndSaga
public void on(MedicalClaimCancelledEvent event)         // 🔄 Rollback
```

---

## 🧪 Test Scenarios

### Test 1: Success Scenario ✅
```json
{
  "patientId": "patient-001",
  "medicineId": "medicine-available-success",  ← chứa "available"
  "medicineQuantity": 2,
  "claimAmount": 500000
}
```
**Expected**: Saga hoàn thành thành công
- ✅ Claim được tạo và phê duyệt
- ✅ Thuốc được đặt trước và xác nhận cấp phát

### Test 2: Rollback Scenario ❌
```json
{
  "patientId": "patient-002",
  "medicineId": "medicine-outofstock-fail",  ← chứa "outofstock"
  "medicineQuantity": 10,
  "claimAmount": 750000
}
```
**Expected**: Saga thất bại và rollback
- ❌ Đặt trước thuốc thất bại (hết hàng)
- 🔄 Claim được rollback (hủy)

---

## 🔍 Monitoring & Debugging

### Axon Server Dashboard
- URL: http://localhost:8024
- Xem event flow trong real-time
- Track saga instances
- Debug command/event routing

### Log Messages
```
✅ Bắt đầu Medical Treatment Saga với ID: xxx
✅ Claim bảo hiểm đã được tạo: xxx
✅ Thuốc đã được đặt trước thành công: xxx
✅ Claim bảo hiểm đã được phê duyệt: xxx
✅ Medical Treatment Saga hoàn thành thành công!

❌ Không thể đặt trước thuốc: Không đủ thuốc trong kho
🔄 Rollback: Hủy claim bảo hiểm: xxx
❌ Medical Treatment Saga đã thất bại và được rollback!
```

---

## 📊 Sequence Diagram

```
Client          Insurance-Saga       Insurance-Agg      Inventory-Agg
  │                    │                    │                   │
  │─────trigger────────▶│                   │                   │
  │                    │                    │                   │
  │                    │──CreateClaim──────▶│                   │
  │                    │                    │                   │
  │                    │◀─ClaimCreated──────│                   │
  │                    │                    │                   │
  │                    │──────ReserveMedicine──────────────────▶│
  │                    │                    │                   │
  │                    │◀───────MedicineReserved───────────────│
  │                    │                    │                   │
  │                    │──ApproveClaim─────▶│                   │
  │                    │                    │                   │
  │                    │◀─ClaimApproved─────│                   │
  │                    │                    │                   │
  │                    │──────ConfirmReservation───────────────▶│
  │                    │                    │                   │
  │                    │◀───────ReservationConfirmed───────────│
  │                    │                    │                   │
  │◀───response────────│                    │                   │
  │  (SUCCESS)         │                    │                   │
```

---

## 🎓 Kết Luận

Saga này minh họa:
1. ✅ **Distributed Transaction Management** - Quản lý transaction trên 2 services
2. ✅ **Compensating Transactions** - Tự động rollback khi có lỗi
3. ✅ **Event-Driven Architecture** - Communication qua events
4. ✅ **Eventual Consistency** - Đảm bảo consistency cuối cùng
5. ✅ **Saga Pattern Implementation** - Dùng Axon Framework

**Lợi ích:**
- Không cần distributed locks
- Không cần 2PC (Two-Phase Commit)
- Scalable và resilient
- Clear separation of concerns

