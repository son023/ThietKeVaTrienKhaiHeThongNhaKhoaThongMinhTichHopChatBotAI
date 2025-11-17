# 📚 GIẢI THÍCH CHI TIẾT CODE AXON - INSURANCE SERVICE

## 📂 CẤU TRÚC THƯ MỤC

```
axon/
├── aggregate/           # Domain Aggregates - Trung tâm của business logic
├── command/            # Commands - Yêu cầu thay đổi state
├── event/              # Events - Kết quả sau khi thay đổi state
├── saga/               # Saga - Điều phối distributed transactions
├── eventhandler/       # Event Handlers - Xử lý side effects
├── external/           # External Commands/Events - Giao tiếp với services khác
└── config/             # Configuration - Cấu hình Axon
```

---

## 1️⃣ FOLDER: `config/` - CẤU HÌNH AXON

### 📄 `AxonConfig.java`

```java
@Configuration
public class AxonConfig {
    // Axon configuration if needed
}
```

**Mục đích:**
- File cấu hình cho Axon Framework
- Hiện tại để trống vì dùng auto-configuration mặc định
- Có thể thêm custom beans như:
  - Custom Serializer
  - Event Store configuration  
  - Snapshot configuration
  - Transaction Manager

**Khi nào cần sử dụng:**
- Khi cần override default Axon configuration
- Custom event serialization
- Configure retry policies
- Setup custom aggregate lifecycle

---

## 2️⃣ FOLDER: `command/` - COMMANDS (Yêu Cầu Hành Động)

### 📐 CQRS Pattern - Command Side

Trong CQRS (Command Query Responsibility Segregation):
- **Commands** = Write operations (thay đổi state)
- **Queries** = Read operations (đọc data)

Commands đại diện cho **ý định** (intention) thay đổi state của system.

---

### 📄 `CreateMedicalClaimCommand.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMedicalClaimCommand {
    
    @TargetAggregateIdentifier  // ⭐ QUAN TRỌNG
    private String claimId;
    
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String sagaId; // Để theo dõi saga transaction
}
```

**Giải thích chi tiết:**

#### `@TargetAggregateIdentifier`
- **Vai trò**: Cho Axon biết command này target vào aggregate nào
- **Hoạt động**: Axon sẽ tìm (hoặc tạo mới) aggregate với ID này
- **Ví dụ**: `claimId = "claim-123"` → Axon tìm `MedicalClaimAggregate` với ID "claim-123"

#### Các fields:
- `claimId`: UUID unique cho mỗi claim
- `patientId`: Bệnh nhân nào tạo claim
- `patientInsuranceId`: Policy bảo hiểm nào được sử dụng
- `claimAmount`: Số tiền yêu cầu bảo hiểm
- `treatmentDescription`: Mô tả điều trị
- `sagaId`: **QUAN TRỌNG** - Link command với saga instance

**Flow:**
```
Saga → send(CreateMedicalClaimCommand)
      ↓
CommandGateway (Axon Server)
      ↓
MedicalClaimAggregate @CommandHandler
      ↓
Apply MedicalClaimCreatedEvent
```

---

### 📄 `ApproveMedicalClaimCommand.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApproveMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private BigDecimal approvedAmount;
    private String approvalNotes;
}
```

**Mục đích:**
- Phê duyệt một claim đã tồn tại
- **Không tạo mới** aggregate, chỉ update state

**Validation logic (trong Aggregate):**
- Claim phải ở trạng thái `PENDING`
- `approvedAmount` <= `claimAmount` (không phê duyệt quá số tiền yêu cầu)

**Khi nào gửi:**
- Sau khi thuốc được đặt trước thành công (`MedicineReservedEvent`)
- Saga gửi command này để approve claim

---

### 📄 `CancelMedicalClaimCommand.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private String cancellationReason;
}
```

**Mục đích:**
- **Compensating Transaction** - Rollback claim khi có lỗi
- Hủy claim đã tạo khi không thể tiếp tục saga

**Khi nào gửi:**
- Khi đặt trước thuốc thất bại (`MedicineReservationFailedEvent`)
- Khi có bất kỳ lỗi nào trong saga flow
- **Đây là phần quan trọng của Saga Pattern**

**Validation:**
- Không thể cancel claim đã `APPROVED`
- Chỉ cancel được claim ở trạng thái `PENDING`

---

## 3️⃣ FOLDER: `event/` - EVENTS (Kết Quả Đã Xảy Ra)

### 📐 Event Sourcing Pattern

**Events = Facts that happened in the past**
- Events là immutable (không thay đổi)
- Events là source of truth
- Aggregate state được rebuild từ events

---

### 📄 `MedicalTreatmentRequestedEvent.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalTreatmentRequestedEvent {
    
    private String sagaId;
    private String patientId;
    private String patientInsuranceId;
    private String medicineId;
    private Integer medicineQuantity;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private Instant requestedAt;
}
```

**Đặc biệt:**
- Đây là **event khởi tạo Saga** (không phải từ aggregate)
- Được publish từ `SagaTestController` qua `EventGateway`
- Annotation: `@StartSaga` trong `MedicalTreatmentSaga`

**Flow:**
```
Client POST /saga-test/trigger
      ↓
EventGateway.publish(MedicalTreatmentRequestedEvent)
      ↓
Axon Server broadcast event
      ↓
@StartSaga on(MedicalTreatmentRequestedEvent)
      ↓
Saga instance được tạo với sagaId
```

**Tại sao không dùng Command?**
- Event này không target một aggregate cụ thể
- Nó trigger một orchestration process (saga)
- Có thể có nhiều sagas listen cùng event này

---

### 📄 `MedicalClaimCreatedEvent.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimCreatedEvent {
    
    private String claimId;
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String sagaId;      // ⭐ Để saga tracking
    private Instant createdAt;
}
```

**Được phát ra khi:**
- `CreateMedicalClaimCommand` được xử lý thành công
- Trong `MedicalClaimAggregate`:
  ```java
  @CommandHandler
  public MedicalClaimAggregate(CreateMedicalClaimCommand cmd) {
      // Validation...
      AggregateLifecycle.apply(new MedicalClaimCreatedEvent(...));
  }
  ```

**Ai listen event này:**
1. **Chính aggregate đó** - Update state:
   ```java
   @EventSourcingHandler
   public void on(MedicalClaimCreatedEvent event) {
       this.claimId = event.getClaimId();
       this.status = "PENDING";
       // ...
   }
   ```

2. **Saga** - Tiếp tục flow:
   ```java
   @EventHandler
   public void on(MedicalClaimCreatedEvent event) {
       // Gửi ReserveMedicineCommand
   }
   ```

3. **Read Model** (nếu có) - Update projection cho queries

**Tại sao có `sagaId`?**
- Để saga biết event này thuộc về saga instance nào
- Check: `if (!sagaId.equals(event.getSagaId())) return;`
- **Critical** cho distributed saga tracking

---

### 📄 `MedicalClaimApprovedEvent.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimApprovedEvent {
    
    private String claimId;
    private BigDecimal approvedAmount;
    private String approvalNotes;
    private Instant approvedAt;
}
```

**Được phát ra khi:**
- `ApproveMedicalClaimCommand` được xử lý
- Claim chuyển từ `PENDING` → `APPROVED`

**Saga reaction:**
```java
@EventHandler
public void on(MedicalClaimApprovedEvent event) {
    // Claim đã được approve
    // → Xác nhận cấp phát thuốc
    commandGateway.send(new ConfirmMedicineReservationCommand(...));
}
```

---

### 📄 `MedicalClaimCancelledEvent.java`

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicalClaimCancelledEvent {
    
    private String claimId;
    private String cancellationReason;
    private Instant cancelledAt;
}
```

**Được phát ra khi:**
- `CancelMedicalClaimCommand` được xử lý
- Compensating transaction trong saga rollback

**Saga reaction:**
```java
@EventHandler
@EndSaga  // ⭐ Kết thúc saga
public void on(MedicalClaimCancelledEvent event) {
    log.error("Claim cancelled: {}", event.getCancellationReason());
    // Có thể cancel medicine reservation nếu cần
}
```

**Lưu ý `@EndSaga`:**
- Đánh dấu saga instance kết thúc
- Axon sẽ cleanup saga state
- Không handle thêm events sau đó

---

## 4️⃣ FOLDER: `aggregate/` - DOMAIN AGGREGATE

### 📐 Aggregate Pattern (DDD)

**Aggregate = Transaction Boundary**
- Một aggregate = một consistency boundary
- Mọi thay đổi phải đi qua aggregate
- Aggregate đảm bảo business rules

### 📄 `MedicalClaimAggregate.java` (Đã đọc từ trước)

**Anatomy của một Aggregate:**

```java
@Aggregate
public class MedicalClaimAggregate {
    
    @AggregateIdentifier  // ⭐ ID của aggregate
    private String claimId;
    
    // State fields
    private String patientId;
    private BigDecimal claimAmount;
    private String status;
    
    // Constructor Command Handler
    @CommandHandler
    public MedicalClaimAggregate(CreateMedicalClaimCommand cmd) {
        // Validation
        // Apply event
    }
    
    // Update Command Handler
    @CommandHandler
    public void handle(ApproveMedicalClaimCommand cmd) {
        // Validation
        // Apply event
    }
    
    // Event Sourcing Handler
    @EventSourcingHandler
    public void on(MedicalClaimCreatedEvent event) {
        // Update state
    }
}
```

**Lifecycle:**

```
1. Command arrives → @CommandHandler
2. Business logic validation
3. AggregateLifecycle.apply(event)
4. Event stored in Event Store
5. @EventSourcingHandler updates aggregate state
6. Event published to Event Bus
```

**Tại sao có 2 loại handlers?**
- `@CommandHandler`: Decision logic - "Can I do this?"
- `@EventSourcingHandler`: State update - "This happened, update state"

**Separation of concerns:**
- Command Handler có thể throw exception → command rejected
- Event Handler KHÔNG thể throw exception → event đã xảy ra rồi

---

## 5️⃣ FOLDER: `saga/` - SAGA ORCHESTRATION

### 📄 `MedicalTreatmentSaga.java` (Đã đọc từ trước)

**Saga = Long-running Transaction Coordinator**

### Anatomy của Saga:

```java
@Saga
@Data
@Slf4j
public class MedicalTreatmentSaga {
    
    @Autowired
    private transient CommandGateway commandGateway;
    
    // Saga state (serialized)
    private String sagaId;
    private String claimId;
    private boolean claimCreated = false;
    private boolean medicineReserved = false;
    
    @StartSaga  // ⭐ Entry point
    public void on(MedicalTreatmentRequestedEvent event) {
        // Initialize saga state
        // Send first command
    }
    
    @EventHandler  // Continue saga
    public void on(MedicalClaimCreatedEvent event) {
        // Check sagaId
        // Send next command
    }
    
    @EventHandler
    @EndSaga  // ⭐ Exit point (success)
    public void on(MedicineReservationConfirmedEvent event) {
        // Log success
        // Saga ends
    }
    
    @EventHandler
    @EndSaga  // ⭐ Exit point (failure)
    public void on(MedicineReservationFailedEvent event) {
        // Rollback logic
        // Saga ends
    }
}
```

### Saga State Management:

**Serializable fields:**
```java
private String sagaId;          // ✅ Serialized
private String claimId;         // ✅ Serialized
private boolean claimCreated;   // ✅ Serialized
```

**Transient fields:**
```java
@Autowired
private transient CommandGateway commandGateway;  // ❌ Not serialized
```

**Tại sao transient?**
- `CommandGateway` là Spring bean
- Không thể serialize beans
- Axon sẽ re-inject khi deserialize saga

### Saga Association (Event Routing):

**Problem**: Làm sao saga biết event nào thuộc về nó?

**Solution**: Check `sagaId` trong event
```java
@EventHandler
public void on(MedicalClaimCreatedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;  // ⭐ Critical check
    // Process event
}
```

**Alternative**: Sử dụng `@SagaEventHandler` với `associationProperty`
```java
@SagaEventHandler(associationProperty = "sagaId")
public void on(MedicalClaimCreatedEvent event) {
    // Automatic association by Axon
}
```

### Compensating Transactions:

```java
@EventHandler
@EndSaga
public void on(MedicineReservationFailedEvent event) {
    log.error("Medicine reservation failed: {}", event.getFailureReason());
    
    // Rollback: Cancel claim if created
    if (claimCreated) {  // ⭐ Check saga state
        commandGateway.send(new CancelMedicalClaimCommand(
            claimId,
            "Hủy do không thể đặt trước thuốc: " + event.getFailureReason()
        ));
    }
}
```

**Key Points:**
- Check state trước khi rollback: `if (claimCreated)`
- Gửi compensating commands ngược lại flow
- `@EndSaga` đảm bảo saga kết thúc

---

## 6️⃣ FOLDER: `external/` - EXTERNAL SERVICE CONTRACTS

### Tại sao cần folder này?

**Problem**: 
- Insurance Service cần giao tiếp với Inventory Service
- Không thể import trực tiếp code của service khác (tightly coupled)

**Solution**:
- Copy interface contracts (Commands/Events) từ service khác
- Axon Server làm message broker
- Services communicate qua events/commands

### Commands to Inventory Service:

#### 📄 `ReserveMedicineCommand.java`

```java
/**
 * External command để gửi đến Inventory Service
 * Đây là copy của ReserveMedicineCommand từ inventory-service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReserveMedicineCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;
}
```

**Flow:**
```
Insurance Saga
      ↓
commandGateway.send(new ReserveMedicineCommand(...))
      ↓
Axon Server (routing)
      ↓
Inventory Service - MedicineReservationAggregate
      ↓
@CommandHandler handles command
```

**Lưu ý:**
- Class này **phải giống hệt** với class trong inventory-service
- Package name khác nhau OK (Axon serialize theo class structure)
- Nếu thay đổi field → cả 2 services phải update

#### 📄 `ConfirmMedicineReservationCommand.java`

```java
/**
 * External command để gửi đến Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConfirmMedicineReservationCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String dispenseOrderId;
}
```

**Khi nào gửi:**
- Sau khi claim được approve
- Xác nhận cấp phát thuốc đã đặt trước

#### 📄 `CancelMedicineReservationCommand.java`

```java
/**
 * External command để gửi đến Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CancelMedicineReservationCommand {
    
    @TargetAggregateIdentifier
    private String reservationId;
    
    private String cancellationReason;
}
```

**Compensating Command:**
- Hủy reservation khi saga rollback
- Giải phóng thuốc đã đặt trước

---

### Events from Inventory Service:

#### 📄 `MedicineReservedEvent.java`

```java
/**
 * External event từ Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservedEvent {
    
    private String reservationId;
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;      // ⭐ For saga routing
    private Instant reservedAt;
}
```

**Được phát ra từ:** `MedicineReservationAggregate` trong inventory-service

**Insurance Saga nhận:**
```java
@EventHandler
public void on(MedicineReservedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;
    
    // Medicine reserved → Approve claim
    commandGateway.send(new ApproveMedicalClaimCommand(...));
}
```

#### 📄 `MedicineReservationFailedEvent.java`

```java
/**
 * External event từ Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationFailedEvent {
    
    private String reservationId;
    private String medicineId;
    private Integer requestedQuantity;
    private String failureReason;
    private String sagaId;
    private Instant failedAt;
}
```

**Trigger Rollback:**
```java
@EventHandler
@EndSaga
public void on(MedicineReservationFailedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;
    
    // Failed → Cancel claim
    if (claimCreated) {
        commandGateway.send(new CancelMedicalClaimCommand(...));
    }
}
```

#### 📄 `MedicineReservationConfirmedEvent.java`

```java
/**
 * External event từ Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationConfirmedEvent {
    
    private String reservationId;
    private String dispenseOrderId;
    private Instant confirmedAt;
}
```

**Success Endpoint:**
```java
@EventHandler
@EndSaga  // ⭐ Saga ends successfully
public void on(MedicineReservationConfirmedEvent event) {
    log.info("✅ Medical Treatment Saga completed!");
    treatmentCompleted = true;
}
```

#### 📄 `MedicineReservationCancelledEvent.java`

```java
/**
 * External event từ Inventory Service
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservationCancelledEvent {
    
    private String reservationId;
    private String cancellationReason;
    private Instant cancelledAt;
}
```

**Confirmation của rollback:**
- Inventory service đã cancel reservation
- Saga có thể log hoặc cleanup

---

## 7️⃣ FOLDER: `eventhandler/` - EVENT HANDLERS

### 📄 `InventoryEventHandler.java`

```java
@Component
@Slf4j
public class InventoryEventHandler {
    
    // Event handlers for inventory events will be added here
    // This ensures insurance service can respond to inventory events
}
```

**Mục đích:**
- Listen events từ inventory service
- Update read models (projections)
- Trigger side effects (notifications, logging, etc.)

**Example usage:**
```java
@Component
@Slf4j
public class InventoryEventHandler {
    
    @EventHandler
    public void on(MedicineReservedEvent event) {
        log.info("Medicine reserved: {} - Quantity: {}", 
                 event.getMedicineId(), event.getQuantity());
        // Update read model
        // Send notification
    }
    
    @EventHandler
    public void on(MedicineReservationFailedEvent event) {
        log.error("Medicine reservation failed: {}", 
                  event.getFailureReason());
        // Alert admin
        // Update dashboard
    }
}
```

**Khác biệt với Saga:**
- **Saga**: Orchestration logic, gửi commands
- **Event Handler**: Side effects, read model updates

---

## 🎯 TỔNG KẾT - MESSAGE FLOW

### Success Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE MESSAGE FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. EVENT: MedicalTreatmentRequestedEvent
   Source: SagaTestController
   Target: @StartSaga in MedicalTreatmentSaga
   
2. COMMAND: CreateMedicalClaimCommand
   Source: MedicalTreatmentSaga
   Target: MedicalClaimAggregate @CommandHandler
   
3. EVENT: MedicalClaimCreatedEvent
   Source: MedicalClaimAggregate
   Target: MedicalTreatmentSaga @EventHandler
   
4. COMMAND: ReserveMedicineCommand (External)
   Source: MedicalTreatmentSaga
   Target: MedicineReservationAggregate (inventory-service)
   
5. EVENT: MedicineReservedEvent (External)
   Source: MedicineReservationAggregate (inventory-service)
   Target: MedicalTreatmentSaga @EventHandler
   
6. COMMAND: ApproveMedicalClaimCommand
   Source: MedicalTreatmentSaga
   Target: MedicalClaimAggregate @CommandHandler
   
7. EVENT: MedicalClaimApprovedEvent
   Source: MedicalClaimAggregate
   Target: MedicalTreatmentSaga @EventHandler
   
8. COMMAND: ConfirmMedicineReservationCommand (External)
   Source: MedicalTreatmentSaga
   Target: MedicineReservationAggregate (inventory-service)
   
9. EVENT: MedicineReservationConfirmedEvent (External)
   Source: MedicineReservationAggregate (inventory-service)
   Target: MedicalTreatmentSaga @EventHandler @EndSaga
```

---

## 🔑 KEY CONCEPTS RECAP

### 1. Commands vs Events

| Aspect | Command | Event |
|--------|---------|-------|
| Tense | Present/Future | Past |
| Example | `CreateClaim` | `ClaimCreated` |
| Can fail? | Yes | No (already happened) |
| Mutable? | Mutable | Immutable |
| Single handler? | Yes | No (many handlers) |

### 2. Aggregate vs Saga

| Aspect | Aggregate | Saga |
|--------|-----------|------|
| Scope | Single entity | Multiple aggregates |
| Transaction | Atomic | Distributed |
| State | Entity state | Process state |
| Example | MedicalClaim | Treatment Process |

### 3. Internal vs External

| Aspect | Internal | External |
|--------|----------|----------|
| Location | Same service | Different service |
| Package | `command/`, `event/` | `external/` |
| Coupling | Direct | Loose (via Axon Server) |

### 4. Annotations Summary

```java
// Aggregate
@Aggregate                          // Marks class as aggregate
@AggregateIdentifier               // Aggregate's unique ID
@CommandHandler                    // Handles commands
@EventSourcingHandler              // Updates aggregate state from events

// Saga
@Saga                              // Marks class as saga
@StartSaga                         // Entry point
@EndSaga                           // Exit point
@SagaEventHandler                  // Auto-associate by property

// General
@EventHandler                      // Handles events
@TargetAggregateIdentifier         // Routes command to aggregate
```

---

## 💡 BEST PRACTICES

### 1. Command Naming
✅ **Good**: `CreateMedicalClaimCommand`, `ApproveMedicalClaimCommand`
❌ **Bad**: `ClaimCommand`, `ProcessCommand`

### 2. Event Naming
✅ **Good**: `MedicalClaimCreatedEvent`, `ClaimApprovedEvent`
❌ **Bad**: `CreateClaimEvent`, `ApproveEvent`

### 3. Saga State
✅ **Good**: Track what steps completed
```java
private boolean claimCreated = false;
private boolean medicineReserved = false;
```
❌ **Bad**: No state tracking, can't rollback properly

### 4. SagaId Propagation
✅ **Good**: Include `sagaId` in all commands/events
```java
private String sagaId;
if (!sagaId.equals(event.getSagaId())) return;
```
❌ **Bad**: No saga tracking, events route to wrong saga

### 5. External Contracts
✅ **Good**: Keep external folder in sync with source
❌ **Bad**: Outdated external contracts → serialization errors

---

## 🔍 DEBUGGING TIPS

### 1. Saga Not Triggering?
- Check `@StartSaga` annotation
- Verify event is published via `EventGateway`
- Check Axon Server dashboard for events

### 2. Command Not Routing?
- Verify `@TargetAggregateIdentifier`
- Check aggregate exists with that ID
- Ensure command structure matches

### 3. Event Not Received?
- Check `sagaId` matching
- Verify event is published (check Event Store)
- Look for serialization errors in logs

### 4. Rollback Not Working?
- Ensure state flags are set (`claimCreated`)
- Check compensating commands are sent
- Verify `@EndSaga` on failure handlers

---

## 📚 FURTHER READING

- [Axon Framework Reference Guide](https://docs.axoniq.io/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Saga Pattern](https://microservices.io/patterns/data/saga.html)

