# 🎭 SAGA ORCHESTRATOR vs CLIENT SERVICE - CẤU TRÚC CODE CHI TIẾT

## 📊 TỔNG QUAN SO SÁNH

```
┌─────────────────────────────────────────────────────────────────────┐
│              SERVICE ROLES IN SAGA PATTERN                           │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────┐       ┌───────────────────────────┐
│   SERVICE ORCHESTRATOR    │       │     SERVICE CLIENT        │
│   (Insurance Service)     │       │   (Inventory Service)     │
├───────────────────────────┤       ├───────────────────────────┤
│                           │       │                           │
│  ✅ Chứa SAGA            │       │  ❌ KHÔNG có SAGA        │
│  ✅ Điều phối flow       │       │  ✅ Nhận commands         │
│  ✅ Gửi commands         │       │  ✅ Phát events          │
│  ✅ Nhận events          │       │  ✅ Business logic       │
│  ✅ Quản lý rollback     │       │  ❌ Không biết saga      │
│  ✅ Có external/ folder  │       │  ❌ Không cần external/  │
│                           │       │                           │
└───────────────────────────┘       └───────────────────────────┘
```

---

## 📂 1. CẤU TRÚC THƯ MỤC SO SÁNH

### INSURANCE SERVICE (Orchestrator - Có Saga)

```
insurance-service/
└── axon/
    ├── aggregate/              ✅ Có
    │   └── MedicalClaimAggregate.java
    │
    ├── command/                ✅ Có (Internal)
    │   ├── CreateMedicalClaimCommand.java
    │   ├── ApproveMedicalClaimCommand.java
    │   └── CancelMedicalClaimCommand.java
    │
    ├── event/                  ✅ Có (Internal + Trigger)
    │   ├── MedicalTreatmentRequestedEvent.java  ⭐ SAGA TRIGGER
    │   ├── MedicalClaimCreatedEvent.java
    │   ├── MedicalClaimApprovedEvent.java
    │   └── MedicalClaimCancelledEvent.java
    │
    ├── saga/                   ⭐ ĐẶC BIỆT - CHỈ CÓ Ở ORCHESTRATOR
    │   └── MedicalTreatmentSaga.java
    │
    ├── external/               ⭐ ĐẶC BIỆT - CHỈ CÓ Ở ORCHESTRATOR
    │   ├── Commands to send:
    │   │   ├── ReserveMedicineCommand.java
    │   │   ├── ConfirmMedicineReservationCommand.java
    │   │   └── CancelMedicineReservationCommand.java
    │   │
    │   └── Events to receive:
    │       ├── MedicineReservedEvent.java
    │       ├── MedicineReservationConfirmedEvent.java
    │       ├── MedicineReservationCancelledEvent.java
    │       └── MedicineReservationFailedEvent.java
    │
    ├── eventhandler/           ✅ Có (Optional)
    │   └── InventoryEventHandler.java
    │
    └── config/                 ✅ Có
        └── AxonConfig.java
```

### INVENTORY SERVICE (Client - Nhận Commands)

```
inventory-service/
└── axon/
    ├── aggregate/              ✅ Có
    │   └── MedicineReservationAggregate.java
    │
    ├── command/                ✅ Có (Receive from Saga)
    │   ├── ReserveMedicineCommand.java
    │   ├── ConfirmMedicineReservationCommand.java
    │   └── CancelMedicineReservationCommand.java
    │
    ├── event/                  ✅ Có (Publish to Saga)
    │   ├── MedicineReservedEvent.java
    │   ├── MedicineReservationConfirmedEvent.java
    │   ├── MedicineReservationCancelledEvent.java
    │   └── MedicineReservationFailedEvent.java
    │
    ├── saga/                   ❌ KHÔNG CÓ
    │
    ├── external/               ❌ KHÔNG CẦN
    │
    ├── eventhandler/           ✅ Có (Optional - listen insurance events)
    │   └── MedicalTreatmentEventHandler.java
    │
    └── config/                 ✅ Có
        └── AxonConfig.java
```

---

## 🔑 2. SỰ KHÁC BIỆT CHỦ YẾU

### Folder `saga/` - CHỈ CÓ Ở ORCHESTRATOR

**Insurance Service (Orchestrator):**

```java
@Saga
@Data
@Slf4j
public class MedicalTreatmentSaga {
    
    @Autowired
    private transient CommandGateway commandGateway;
    
    // Saga state
    private String sagaId;
    private String claimId;
    private String reservationId;
    private boolean claimCreated = false;
    private boolean medicineReserved = false;
    
    @StartSaga  // ⭐ Entry point
    public void on(MedicalTreatmentRequestedEvent event) {
        // Initialize saga
        this.sagaId = event.getSagaId();
        
        // Send first command
        commandGateway.send(new CreateMedicalClaimCommand(...));
    }
    
    @EventHandler
    public void on(MedicalClaimCreatedEvent event) {
        this.claimCreated = true;
        
        // Send command to ANOTHER service (inventory)
        commandGateway.send(new ReserveMedicineCommand(...));
    }
    
    @EventHandler
    public void on(MedicineReservedEvent event) {  // ⭐ From external service
        this.medicineReserved = true;
        
        // Continue flow
        commandGateway.send(new ApproveMedicalClaimCommand(...));
    }
    
    @EventHandler
    @EndSaga
    public void on(MedicineReservationFailedEvent event) {  // ⭐ Rollback
        if (claimCreated) {
            commandGateway.send(new CancelMedicalClaimCommand(...));
        }
    }
}
```

**Inventory Service (Client):**
```
❌ KHÔNG CÓ SAGA FOLDER
Inventory service không biết về saga
Nó chỉ nhận commands và phát events
```

---

### Folder `external/` - CHỈ CÓ Ở ORCHESTRATOR

**Tại sao cần external/?**
- Orchestrator cần gửi commands tới services khác
- Orchestrator cần nhận events từ services khác
- Copy contracts từ các services khác vào đây

**Insurance Service (Orchestrator):**

```
external/
├── ReserveMedicineCommand.java          ⭐ Copy từ inventory-service
├── ConfirmMedicineReservationCommand    ⭐ Copy từ inventory-service
├── CancelMedicineReservationCommand     ⭐ Copy từ inventory-service
├── MedicineReservedEvent.java           ⭐ Copy từ inventory-service
├── MedicineReservationConfirmedEvent    ⭐ Copy từ inventory-service
├── MedicineReservationCancelledEvent    ⭐ Copy từ inventory-service
└── MedicineReservationFailedEvent       ⭐ Copy từ inventory-service
```

**Inventory Service (Client):**
```
❌ KHÔNG CÓ EXTERNAL FOLDER
Không cần vì:
- Không gửi commands tới services khác
- Có thể nhận events nhưng qua EventHandler thông thường
```

---

## 📝 3. CODE SO SÁNH CHI TIẾT

### 3.1. AGGREGATE COMPARISON

#### Insurance Service - MedicalClaimAggregate

```java
@Aggregate
public class MedicalClaimAggregate {
    
    @AggregateIdentifier
    private String claimId;
    
    // State
    private String patientId;
    private BigDecimal claimAmount;
    private String status;  // PENDING, APPROVED, CANCELLED
    private String sagaId;  // ⭐ Track saga
    
    // Constructor Command Handler
    @CommandHandler
    public MedicalClaimAggregate(CreateMedicalClaimCommand cmd) {
        // Validation
        if (cmd.getClaimAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be > 0");
        }
        
        // Apply event
        AggregateLifecycle.apply(new MedicalClaimCreatedEvent(
            cmd.getClaimId(),
            cmd.getPatientId(),
            cmd.getPatientInsuranceId(),
            cmd.getClaimAmount(),
            cmd.getTreatmentDescription(),
            cmd.getSagaId(),  // ⭐ Propagate sagaId
            Instant.now()
        ));
    }
    
    // Update Command Handler
    @CommandHandler
    public void handle(ApproveMedicalClaimCommand cmd) {
        // Validation
        if (!"PENDING".equals(this.status)) {
            throw new IllegalStateException("Can only approve PENDING claims");
        }
        
        // Apply event
        AggregateLifecycle.apply(new MedicalClaimApprovedEvent(
            cmd.getClaimId(),
            cmd.getApprovedAmount(),
            cmd.getApprovalNotes(),
            Instant.now()
        ));
    }
    
    // Compensating Command Handler
    @CommandHandler
    public void handle(CancelMedicalClaimCommand cmd) {
        if ("APPROVED".equals(this.status)) {
            throw new IllegalStateException("Cannot cancel approved claim");
        }
        
        AggregateLifecycle.apply(new MedicalClaimCancelledEvent(
            cmd.getClaimId(),
            cmd.getCancellationReason(),
            Instant.now()
        ));
    }
    
    // Event Sourcing Handlers
    @EventSourcingHandler
    public void on(MedicalClaimCreatedEvent event) {
        this.claimId = event.getClaimId();
        this.patientId = event.getPatientId();
        this.claimAmount = event.getClaimAmount();
        this.sagaId = event.getSagaId();  // ⭐ Store sagaId
        this.status = "PENDING";
    }
    
    @EventSourcingHandler
    public void on(MedicalClaimApprovedEvent event) {
        this.status = "APPROVED";
    }
    
    @EventSourcingHandler
    public void on(MedicalClaimCancelledEvent event) {
        this.status = "CANCELLED";
    }
}
```

**Đặc điểm:**
- ✅ Có field `sagaId` để track saga
- ✅ Commands từ saga (không từ client trực tiếp)
- ✅ Events chứa `sagaId` để saga routing

---

#### Inventory Service - MedicineReservationAggregate

```java
@Aggregate
public class MedicineReservationAggregate {
    
    @AggregateIdentifier
    private String reservationId;
    
    // State
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;  // ⭐ Track saga (nhưng không quản lý)
    private String status;  // RESERVED, CONFIRMED, CANCELLED, FAILED
    
    // Constructor Command Handler
    @CommandHandler
    public MedicineReservationAggregate(ReserveMedicineCommand command) {
        log.info("Processing reserve medicine: {}", command.getMedicineId());
        
        // Validation
        if (command.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be > 0");
        }
        
        // Business logic - Check availability
        try {
            if (!checkMedicineAvailability(command.getMedicineId(), 
                                          command.getQuantity())) {
                // ⭐ FAIL CASE - Phát Failed Event
                AggregateLifecycle.apply(new MedicineReservationFailedEvent(
                    command.getReservationId(),
                    command.getMedicineId(),
                    command.getQuantity(),
                    "Not enough medicine in stock",
                    command.getSagaId(),  // ⭐ Saga cần biết để rollback
                    Instant.now()
                ));
                return;
            }
            
            // ⭐ SUCCESS CASE - Phát Success Event
            AggregateLifecycle.apply(new MedicineReservedEvent(
                command.getReservationId(),
                command.getMedicineId(),
                command.getQuantity(),
                command.getPatientId(),
                command.getClaimId(),
                command.getSagaId(),  // ⭐ Saga cần biết để continue
                Instant.now()
            ));
            
        } catch (Exception e) {
            // Exception handling - Phát Failed Event
            AggregateLifecycle.apply(new MedicineReservationFailedEvent(
                command.getReservationId(),
                command.getMedicineId(),
                command.getQuantity(),
                "System error: " + e.getMessage(),
                command.getSagaId(),
                Instant.now()
            ));
        }
    }
    
    // Update Command Handler
    @CommandHandler
    public void handle(ConfirmMedicineReservationCommand command) {
        if (!"RESERVED".equals(this.status)) {
            throw new IllegalStateException(
                "Can only confirm RESERVED reservations");
        }
        
        AggregateLifecycle.apply(new MedicineReservationConfirmedEvent(
            command.getReservationId(),
            command.getDispenseOrderId(),
            Instant.now()
        ));
    }
    
    // Compensating Command Handler
    @CommandHandler
    public void handle(CancelMedicineReservationCommand command) {
        if ("CONFIRMED".equals(this.status)) {
            throw new IllegalStateException(
                "Cannot cancel confirmed reservation");
        }
        
        AggregateLifecycle.apply(new MedicineReservationCancelledEvent(
            command.getReservationId(),
            command.getCancellationReason(),
            Instant.now()
        ));
    }
    
    // Business Logic Helper
    private boolean checkMedicineAvailability(String medicineId, 
                                             Integer requestedQuantity) {
        // Mock logic for demo
        if (medicineId.toLowerCase().contains("available")) {
            return true;  // ✅ Success path
        }
        if (medicineId.toLowerCase().contains("outofstock")) {
            return false; // ❌ Trigger rollback
        }
        return true; // Default success
    }
    
    // Event Sourcing Handlers
    @EventSourcingHandler
    public void on(MedicineReservedEvent event) {
        this.reservationId = event.getReservationId();
        this.medicineId = event.getMedicineId();
        this.quantity = event.getQuantity();
        this.sagaId = event.getSagaId();
        this.status = "RESERVED";
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationFailedEvent event) {
        this.reservationId = event.getReservationId();
        this.medicineId = event.getMedicineId();
        this.sagaId = event.getSagaId();
        this.status = "FAILED";
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationConfirmedEvent event) {
        this.status = "CONFIRMED";
    }
    
    @EventSourcingHandler
    public void on(MedicineReservationCancelledEvent event) {
        this.status = "CANCELLED";
    }
}
```

**Đặc điểm:**
- ✅ Có field `sagaId` để events có thể route về saga
- ✅ Phát **BOTH success và failure events**
- ✅ Business logic quyết định success/fail
- ❌ KHÔNG biết về saga, chỉ xử lý commands và phát events

---

### 3.2. COMMAND COMPARISON

#### Insurance Service - CreateMedicalClaimCommand

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMedicalClaimCommand {
    
    @TargetAggregateIdentifier
    private String claimId;
    
    private String patientId;
    private String patientInsuranceId;
    private BigDecimal claimAmount;
    private String treatmentDescription;
    private String sagaId;  // ⭐ To track saga
}
```

**Origin:** Được tạo và gửi bởi **Saga trong cùng service**

```java
// In MedicalTreatmentSaga
@StartSaga
public void on(MedicalTreatmentRequestedEvent event) {
    this.claimId = UUID.randomUUID().toString();
    
    commandGateway.send(new CreateMedicalClaimCommand(
        claimId,
        event.getPatientId(),
        event.getPatientInsuranceId(),
        event.getClaimAmount(),
        event.getTreatmentDescription(),
        sagaId  // ⭐ Saga's own ID
    ));
}
```

---

#### Inventory Service - ReserveMedicineCommand

```java
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
    private String sagaId;  // ⭐ From saga in insurance service
}
```

**Origin:** Được tạo và gửi bởi **Saga từ insurance service**

```java
// In MedicalTreatmentSaga (Insurance Service)
@EventHandler
public void on(MedicalClaimCreatedEvent event) {
    this.reservationId = UUID.randomUUID().toString();
    
    // ⭐ Send command to ANOTHER service
    commandGateway.send(new ReserveMedicineCommand(
        reservationId,
        medicineId,
        medicineQuantity,
        patientId,
        claimId,
        sagaId  // ⭐ Pass saga ID for tracking
    ));
}
```

**Nhận ở đâu:** Aggregate trong **inventory service**

```java
// In MedicineReservationAggregate (Inventory Service)
@CommandHandler
public MedicineReservationAggregate(ReserveMedicineCommand command) {
    // Process command
    // Không biết command từ saga, chỉ xử lý business logic
}
```

---

### 3.3. EVENT COMPARISON

#### Insurance Service - MedicalClaimCreatedEvent

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
    private String sagaId;  // ⭐ For saga routing
    private Instant createdAt;
}
```

**Phát ra từ:** `MedicalClaimAggregate` (same service)

**Nhận bởi:**
1. **Chính aggregate đó** (@EventSourcingHandler) - update state
2. **Saga trong cùng service** (@EventHandler) - continue flow

```java
// In MedicalTreatmentSaga
@EventHandler
public void on(MedicalClaimCreatedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;  // ⭐ Routing check
    
    // Continue saga flow
    commandGateway.send(new ReserveMedicineCommand(...));
}
```

---

#### Inventory Service - MedicineReservedEvent

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedicineReservedEvent {
    
    private String reservationId;
    private String medicineId;
    private Integer quantity;
    private String patientId;
    private String claimId;
    private String sagaId;  // ⭐ Critical for cross-service saga
    private Instant reservedAt;
}
```

**Phát ra từ:** `MedicineReservationAggregate` (inventory service)

**Nhận bởi:**
1. **Chính aggregate đó** (@EventSourcingHandler) - update state
2. **Saga ở insurance service** (@EventHandler) - continue flow ⭐

```java
// In MedicalTreatmentSaga (Insurance Service)
@EventHandler
public void on(MedicineReservedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;  // ⭐ Critical check
    
    log.info("Medicine reserved successfully");
    this.medicineReserved = true;
    
    // Continue flow - Approve claim
    commandGateway.send(new ApproveMedicalClaimCommand(...));
}
```

**Đặc biệt:** Event này phải chứa `sagaId` để:
- Axon Server route về đúng saga instance
- Saga biết event này thuộc về nó
- **Cross-service communication works**

---

## 🔄 4. MESSAGE FLOW - STEP BY STEP

```
┌──────────────────────────────────────────────────────────────────┐
│              COMPLETE CROSS-SERVICE FLOW                          │
└──────────────────────────────────────────────────────────────────┘

STEP 1: WITHIN INSURANCE SERVICE
═════════════════════════════════

Client → Insurance Service
    │
    ▼
EventGateway.publish(MedicalTreatmentRequestedEvent)
    │
    ▼
╔═══════════════════════════════════════╗
║ @StartSaga                            ║
║ MedicalTreatmentSaga.on()            ║
║ [Insurance Service]                   ║
╚═══════════════════════════════════════╝
    │
    │ sagaId = "S-123"
    │ claimId = "C-456"
    │
    ▼
CommandGateway.send(CreateMedicalClaimCommand {
    claimId: "C-456",
    sagaId: "S-123"  // ⭐
})
    │
    ▼
┌───────────────────────────────────────┐
│ MedicalClaimAggregate                 │
│ @CommandHandler                       │
│ [Insurance Service]                   │
└───────────────────────────────────────┘
    │
    ▼
AggregateLifecycle.apply(MedicalClaimCreatedEvent {
    claimId: "C-456",
    sagaId: "S-123"  // ⭐
})
    │
    ▼
╔═══════════════════════════════════════╗
║ Saga.on(MedicalClaimCreatedEvent)    ║
║ if (sagaId == "S-123") ✅            ║
║   claimCreated = true                 ║
╚═══════════════════════════════════════╝


STEP 2: CROSS-SERVICE (Insurance → Inventory)
══════════════════════════════════════════════

╔═══════════════════════════════════════╗
║ Saga [Insurance Service]              ║
╚═══════════════════════════════════════╝
    │
    │ reservationId = "R-789"
    │
    ▼
CommandGateway.send(ReserveMedicineCommand {
    reservationId: "R-789",
    medicineId: "M-001",
    sagaId: "S-123"  // ⭐ Pass saga ID
})
    │
    │ ⚡ AXON SERVER ROUTING
    │
    ▼
┌───────────────────────────────────────┐
│ MedicineReservationAggregate          │
│ @CommandHandler                       │
│ [Inventory Service]                   │
│                                       │
│ ❌ KHÔNG BIẾT SAGA                   │
│ ❌ KHÔNG BIẾT INSURANCE SERVICE      │
│ ✅ CHỈ XỬ LÝ BUSINESS LOGIC         │
└───────────────────────────────────────┘
    │
    │ Check stock...
    │
    ▼
if (available) {
    AggregateLifecycle.apply(MedicineReservedEvent {
        reservationId: "R-789",
        sagaId: "S-123"  // ⭐ Echo back
    })
} else {
    AggregateLifecycle.apply(MedicineReservationFailedEvent {
        reservationId: "R-789",
        sagaId: "S-123",  // ⭐ Echo back
        failureReason: "Out of stock"
    })
}
    │
    │ ⚡ AXON SERVER BROADCAST
    │
    ▼
╔═══════════════════════════════════════╗
║ Saga.on(MedicineReservedEvent)       ║
║ [Insurance Service]                   ║
║                                       ║
║ if (sagaId == "S-123") ✅            ║
║   medicineReserved = true             ║
║   Continue flow...                    ║
╚═══════════════════════════════════════╝
```

---

## 🎯 5. KEY DIFFERENCES SUMMARY

| Aspect | Insurance (Orchestrator) | Inventory (Client) |
|--------|-------------------------|-------------------|
| **Có Saga?** | ✅ YES | ❌ NO |
| **Folder saga/** | ✅ MedicalTreatmentSaga | ❌ Không có |
| **Folder external/** | ✅ Copy từ inventory | ❌ Không cần |
| **Gửi commands cross-service?** | ✅ YES (qua saga) | ❌ NO |
| **Nhận commands cross-service?** | ❌ NO | ✅ YES |
| **Phát events cross-service?** | ❌ NO (chỉ internal) | ✅ YES |
| **Nhận events cross-service?** | ✅ YES (trong saga) | ❌ Không cần |
| **Biết về saga?** | ✅ Quản lý saga | ❌ Chỉ propagate sagaId |
| **Rollback logic?** | ✅ Có (compensating) | ❌ Không (chỉ phát events) |
| **@StartSaga** | ✅ Có | ❌ Không |
| **@EndSaga** | ✅ Có | ❌ Không |
| **CommandGateway trong Saga** | ✅ Sử dụng | ❌ Không có saga |

---

## 📋 6. CHECKLIST - KHI NÀO LÀ ORCHESTRATOR?

### Service NÊN là Orchestrator nếu:

- ✅ Service này **khởi tạo** business process
- ✅ Service này cần **điều phối** nhiều services khác
- ✅ Service này cần **quyết định** flow dựa trên kết quả
- ✅ Service này cần **rollback** khi có lỗi
- ✅ Service này là **entry point** của transaction

**Ví dụ:** Insurance Service
- Nhận request điều trị
- Tạo claim
- Gọi inventory để đặt thuốc
- Nếu OK → approve claim
- Nếu fail → cancel claim

### Service NÊN là Client nếu:

- ✅ Service này **nhận commands** từ services khác
- ✅ Service này **thực hiện** business logic cụ thể
- ✅ Service này **phát events** về kết quả
- ✅ Service này **không cần biết** về larger flow
- ✅ Service này là **participant** không phải coordinator

**Ví dụ:** Inventory Service
- Nhận command đặt thuốc
- Kiểm tra tồn kho
- Phát event thành công/thất bại
- Không biết claim ở insurance service

---

## 🔧 7. CODE STRUCTURE BEST PRACTICES

### Orchestrator Service (Insurance):

```java
// Folder structure
axon/
├── aggregate/              // Own aggregates
├── command/                // Own commands
├── event/                  // Own events + saga triggers
├── saga/                   // ⭐ Saga orchestration
│   └── XxxSaga.java
├── external/               // ⭐ External contracts
│   ├── CommandsToSend/
│   └── EventsToReceive/
├── eventhandler/           // Side effects
└── config/                 // Configuration

// Saga structure
@Saga
public class MedicalTreatmentSaga {
    
    // Injections
    @Autowired
    private transient CommandGateway commandGateway;
    
    // State (serializable)
    private String sagaId;
    private String claimId;
    private boolean claimCreated = false;
    
    // Entry
    @StartSaga
    public void on(TriggerEvent event) {
        // Initialize
        // Send first command
    }
    
    // Internal events
    @EventHandler
    public void on(InternalEvent event) {
        // Check sagaId
        // Update state
        // Send cross-service command
    }
    
    // External events
    @EventHandler
    public void on(ExternalEvent event) {
        // Check sagaId
        // Continue flow
    }
    
    // Failure handling
    @EventHandler
    @EndSaga
    public void on(FailureEvent event) {
        // Rollback logic
        // Send compensating commands
    }
    
    // Success ending
    @EventHandler
    @EndSaga
    public void on(SuccessEvent event) {
        // Cleanup
        // Log completion
    }
}
```

### Client Service (Inventory):

```java
// Folder structure
axon/
├── aggregate/              // Own aggregates
├── command/                // Commands to receive
├── event/                  // Events to publish
├── saga/                   // ❌ KHÔNG CÓ
├── external/               // ❌ KHÔNG CẦN
├── eventhandler/           // Optional: listen to orchestrator
└── config/                 // Configuration

// Aggregate structure
@Aggregate
public class MedicineReservationAggregate {
    
    @AggregateIdentifier
    private String reservationId;
    
    // State
    private String sagaId;  // ⭐ Store but don't manage
    
    // Constructor - Receive cross-service command
    @CommandHandler
    public MedicineReservationAggregate(ReserveMedicineCommand cmd) {
        // Business logic
        // Validation
        
        if (success) {
            AggregateLifecycle.apply(new SuccessEvent(
                cmd.getReservationId(),
                cmd.getSagaId()  // ⭐ Echo back sagaId
            ));
        } else {
            AggregateLifecycle.apply(new FailureEvent(
                cmd.getReservationId(),
                cmd.getSagaId(),  // ⭐ Echo back sagaId
                reason
            ));
        }
    }
    
    // Update handlers - Receive follow-up commands
    @CommandHandler
    public void handle(ConfirmCommand cmd) {
        // Process
        // Apply event
    }
    
    // Event sourcing handlers
    @EventSourcingHandler
    public void on(SuccessEvent event) {
        this.reservationId = event.getReservationId();
        this.sagaId = event.getSagaId();
        this.status = "RESERVED";
    }
}
```

---

## 🚀 8. IMPLEMENTATION GUIDE

### Bước 1: Xác định Service Role

**Questions:**
1. Service này có khởi tạo distributed transaction không?
   - YES → Orchestrator
   - NO → Client

2. Service này cần điều phối nhiều services không?
   - YES → Orchestrator
   - NO → Client

3. Service này chỉ thực hiện một task cụ thể?
   - YES → Client
   - NO → Orchestrator

### Bước 2: Setup Orchestrator

```java
// 1. Create trigger event
public class TriggerEvent {
    private String sagaId;
    // ... other fields
}

// 2. Create saga
@Saga
public class XxxSaga {
    @Autowired
    private transient CommandGateway commandGateway;
    
    @StartSaga
    public void on(TriggerEvent event) {
        // Start orchestration
    }
}

// 3. Create external/ folder
// Copy commands/events từ client services

// 4. Implement saga flow
@EventHandler
public void on(EventFromClientService event) {
    // Continue flow
}
```

### Bước 3: Setup Client

```java
// 1. Expose commands
@Data
public class DoSomethingCommand {
    @TargetAggregateIdentifier
    private String id;
    private String sagaId;  // ⭐ Important
}

// 2. Implement aggregate
@Aggregate
public class XxxAggregate {
    @CommandHandler
    public XxxAggregate(DoSomethingCommand cmd) {
        // Business logic
        // Apply event with sagaId
    }
}

// 3. Ensure events contain sagaId
public class SomethingDoneEvent {
    private String id;
    private String sagaId;  // ⭐ Echo back
}
```

---

## 💡 COMMON PITFALLS & SOLUTIONS

### ❌ Pitfall 1: Client Service tries to orchestrate

**Wrong:**
```java
// In Inventory Service (Client)
@EventHandler
public void on(MedicineReservedEvent event) {
    // ❌ Trying to continue saga flow
    commandGateway.send(new ApproveMedicalClaimCommand(...));
}
```

**Right:**
```java
// In Inventory Service (Client)
// Just publish event, let orchestrator decide
AggregateLifecycle.apply(new MedicineReservedEvent(...));

// In Insurance Service (Orchestrator)
@EventHandler
public void on(MedicineReservedEvent event) {
    // ✅ Orchestrator decides next step
    commandGateway.send(new ApproveMedicalClaimCommand(...));
}
```

### ❌ Pitfall 2: Missing sagaId in events

**Wrong:**
```java
public class MedicineReservedEvent {
    private String reservationId;
    // ❌ Missing sagaId
}
```

**Right:**
```java
public class MedicineReservedEvent {
    private String reservationId;
    private String sagaId;  // ✅ Critical for routing
}
```

### ❌ Pitfall 3: Orchestrator doesn't check sagaId

**Wrong:**
```java
@EventHandler
public void on(MedicineReservedEvent event) {
    // ❌ Processes all events
    this.medicineReserved = true;
}
```

**Right:**
```java
@EventHandler
public void on(MedicineReservedEvent event) {
    if (!sagaId.equals(event.getSagaId())) return;  // ✅ Filter
    this.medicineReserved = true;
}
```

---

## 🎓 CONCLUSION

### Orchestrator (Insurance Service):
- 🎭 **Điều phối** distributed transaction
- 📤 **Gửi** commands tới client services
- 📥 **Nhận** events từ client services
- 🔄 **Quản lý** rollback và compensating transactions
- 🗂️ **Có** folder `saga/` và `external/`

### Client (Inventory Service):
- 🎯 **Thực hiện** business logic cụ thể
- 📥 **Nhận** commands từ orchestrator
- 📤 **Phát** events về kết quả
- ❌ **Không biết** về saga flow
- 🗂️ **Không có** folder `saga/` và `external/`

**Remember:** 
- Orchestrator = Conductor (chỉ huy dàn nhạc)
- Client = Musician (chơi nhạc cụ theo chỉ huy)

