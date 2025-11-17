# 🏗️ AXON ARCHITECTURE - VISUAL DIAGRAMS

## 📊 1. FOLDER STRUCTURE & RESPONSIBILITIES

```
insurance-service/axon/
│
├── 📁 config/
│   └── AxonConfig.java
│       └── 🔧 Cấu hình Axon Framework
│
├── 📁 command/                    [WRITE SIDE - CQRS]
│   ├── CreateMedicalClaimCommand
│   ├── ApproveMedicalClaimCommand
│   └── CancelMedicalClaimCommand
│       └── 📝 Yêu cầu thay đổi state
│           └── "Tôi muốn tạo claim"
│
├── 📁 event/                      [FACTS]
│   ├── MedicalTreatmentRequestedEvent  ⭐ SAGA STARTER
│   ├── MedicalClaimCreatedEvent
│   ├── MedicalClaimApprovedEvent
│   └── MedicalClaimCancelledEvent
│       └── ✅ Điều đã xảy ra
│           └── "Claim đã được tạo"
│
├── 📁 aggregate/                  [DOMAIN LOGIC]
│   └── MedicalClaimAggregate
│       └── 🎯 Business Rules
│           └── "Claim chỉ approve được khi PENDING"
│
├── 📁 saga/                       [ORCHESTRATION]
│   └── MedicalTreatmentSaga
│       └── 🎭 Điều phối distributed transaction
│           └── "Nếu claim OK → đặt thuốc → approve"
│
├── 📁 eventhandler/               [SIDE EFFECTS]
│   └── InventoryEventHandler
│       └── 🔔 Xử lý side effects
│           └── "Log, notify, update read model"
│
└── 📁 external/                   [SERVICE BOUNDARY]
    ├── Commands to Inventory:
    │   ├── ReserveMedicineCommand
    │   ├── ConfirmMedicineReservationCommand
    │   └── CancelMedicineReservationCommand
    │
    └── Events from Inventory:
        ├── MedicineReservedEvent
        ├── MedicineReservationConfirmedEvent
        ├── MedicineReservationCancelledEvent
        └── MedicineReservationFailedEvent
            └── 🌐 Cross-service communication
                └── "Gửi/nhận messages từ inventory-service"
```

---

## 🔄 2. COMMAND → EVENT FLOW

```
┌──────────────────────────────────────────────────────────────┐
│                    INSIDE ONE AGGREGATE                       │
└──────────────────────────────────────────────────────────────┘

                    CreateMedicalClaimCommand
                              │
                              ▼
                    ┌─────────────────────┐
                    │  @CommandHandler    │
                    │  Validation Logic   │
                    │  Business Rules     │
                    └─────────────────────┘
                              │
                              ▼
                    if (valid) {
                        AggregateLifecycle.apply(event)
                    } else {
                        throw Exception
                    }
                              │
                              ▼
                    ┌─────────────────────┐
                    │  Event Store        │
                    │  [Event Persisted]  │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │ @EventSourcingHandler│
                    │  Update State       │
                    │  this.status="X"    │
                    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │   Event Bus         │
                    │  [Publish Event]    │
                    └─────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
              [Saga Handler]      [Event Handler]
              Continue flow       Side effects
```

---

## 🎯 3. SAGA ORCHESTRATION FLOW

```
┌────────────────────────────────────────────────────────────────────┐
│                     MEDICAL TREATMENT SAGA                          │
│                    (Insurance Service owns)                         │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    Client       │
│  POST /trigger  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  EventGateway.publish()                     │
│  MedicalTreatmentRequestedEvent             │
└─────────────────────────────────────────────┘
         │
         ▼
╔═════════════════════════════════════════════╗
║  @StartSaga                                 ║
║  MedicalTreatmentSaga.on(                  ║
║    MedicalTreatmentRequestedEvent)         ║
╚═════════════════════════════════════════════╝
         │
         │ Initialize saga state:
         │ - sagaId
         │ - claimId
         │ - reservationId
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 1: Create Insurance Claim            │
│  ────────────────────────────────────────   │
│  commandGateway.send(                       │
│    CreateMedicalClaimCommand)               │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  MedicalClaimAggregate                      │
│  @CommandHandler                            │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│  EVENT: MedicalClaimCreatedEvent            │
│  status = "PENDING"                         │
└─────────────────────────────────────────────┘
         │
         ▼
╔═════════════════════════════════════════════╗
║  Saga.on(MedicalClaimCreatedEvent)         ║
║  claimCreated = true ✅                    ║
╚═════════════════════════════════════════════╝
         │
         ▼
┌─────────────────────────────────────────────┐
│  STEP 2: Reserve Medicine                   │
│  ────────────────────────────────────────   │
│  commandGateway.send(                       │
│    ReserveMedicineCommand) ───┐             │
└───────────────────────────────┼─────────────┘
                                │
                ┌───────────────┘
                │ [Axon Server routes to inventory-service]
                ▼
┌─────────────────────────────────────────────┐
│  📦 INVENTORY SERVICE                        │
│  MedicineReservationAggregate               │
│  @CommandHandler                            │
└─────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
   [Success]        [Failure]
        │                │
        ▼                ▼
MedicineReservedEvent  MedicineReservationFailedEvent
        │                │
        └────────┬───────┘
                 │ [Axon Server routes back]
                 ▼
╔═════════════════════════════════════════════╗
║  Saga receives event                        ║
╚═════════════════════════════════════════════╝
        │
    ┌───┴────┐
    ▼        ▼
SUCCESS   FAILURE
    │        │
    │        └─────────────────────┐
    │                              │
    ▼                              ▼
┌─────────────────────┐  ┌──────────────────────┐
│ STEP 3: Approve     │  │ ROLLBACK:            │
│ medicineReserved=✅ │  │ Cancel Claim         │
│                     │  │                      │
│ commandGateway.send(│  │ if (claimCreated) {  │
│   ApproveClaim)     │  │   send(              │
└─────────────────────┘  │     CancelClaim)     │
    │                    │ }                    │
    ▼                    └──────────────────────┘
┌─────────────────────┐            │
│ ClaimApprovedEvent  │            ▼
└─────────────────────┘  ┌──────────────────────┐
    │                    │ ClaimCancelledEvent  │
    ▼                    └──────────────────────┘
┌─────────────────────┐            │
│ STEP 4: Confirm     │            ▼
│ commandGateway.send(│  ╔═══════════════════════╗
│   ConfirmReserve)   │  ║ @EndSaga (Failure)    ║
└─────────────────────┘  ║ Saga ends with        ║
    │                    ║ rollback complete     ║
    ▼                    ╚═══════════════════════╝
┌─────────────────────┐
│ ReservationConfirmed│
│ Event               │
└─────────────────────┘
    │
    ▼
╔═════════════════════╗
║ @EndSaga (Success)  ║
║ treatmentCompleted  ║
║ = true ✅          ║
╚═════════════════════╝
```

---

## 🔀 4. CROSS-SERVICE COMMUNICATION

```
┌──────────────────────────────────────────────────────────────┐
│          INSURANCE SERVICE ↔️ INVENTORY SERVICE              │
└──────────────────────────────────────────────────────────────┘

Insurance Service                Axon Server              Inventory Service
─────────────────               ─────────────              ─────────────────

┌───────────────┐                                          
│ Saga sends    │──────────────────────┐                  
│ Command       │                      │                  
└───────────────┘                      ▼                  
                              ┌─────────────────┐         
    ReserveMedicine           │  Command Bus    │         
    Command                   │  [Routing]      │         
    {                         └────────┬────────┘         
      reservationId: "R1"              │                  
      medicineId: "M1"                 │                  
      sagaId: "S1"  ◄──────────────────┘                  
    }                                  │                  
                                       ▼                  
                              ┌─────────────────┐         
                              │ Inventory       │         
                              │ CommandHandler  │         
                              └────────┬────────┘         
                                       │                  
                                       ▼                  
                              ┌─────────────────┐         
                              │ Aggregate       │         
                              │ processes       │         
                              └────────┬────────┘         
                                       │                  
                                       ▼                  
                              ┌─────────────────┐         
                              │ Event Store     │         
                              │ saves event     │         
                              └────────┬────────┘         
                                       │                  
                                       ▼                  
                              ┌─────────────────┐         
                              │  Event Bus      │         
                              │  [Broadcast]    │         
                              └────────┬────────┘         
                                       │                  
       ┌───────────────────────────────┘                  
       │                                                   
       ▼                                                   
┌───────────────┐                                         
│ Saga receives │                                         
│ Event         │                                         
└───────────────┘                                         
                                                          
    MedicineReservedEvent                                 
    {                                                     
      reservationId: "R1"                                 
      sagaId: "S1"  ◄──── Saga filters by this!          
    }                                                     
                                                          
    if (sagaId == "S1") {                                 
      // Process event                                    
      // Send next command                                
    }                                                     
```

---

## 🏗️ 5. AGGREGATE LIFECYCLE

```
┌──────────────────────────────────────────────────────────────┐
│              AGGREGATE INSTANCE LIFECYCLE                     │
└──────────────────────────────────────────────────────────────┘

State: NOT EXISTS
─────────────────
         │
         │ CreateMedicalClaimCommand arrives
         │
         ▼
┌──────────────────────────────────────┐
│  Constructor @CommandHandler called  │
│  public MedicalClaimAggregate(       │
│      CreateMedicalClaimCommand cmd)  │
└──────────────────────────────────────┘
         │
         │ Validation
         ▼
      [Valid?]
         │
    ┌────┴────┐
    ▼         ▼
  YES        NO
    │         │
    │         └──► throw Exception
    │              ↓
    │            Command rejected
    │            Aggregate NOT created
    │
    ▼
AggregateLifecycle.apply(
    MedicalClaimCreatedEvent)
    │
    ▼
┌──────────────────────────────────────┐
│  Event stored in Event Store         │
│  claimId: "C1"                       │
│  Event: MedicalClaimCreatedEvent     │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  @EventSourcingHandler called        │
│  public void on(                     │
│    MedicalClaimCreatedEvent event)   │
│  {                                   │
│    this.claimId = event.getClaimId();│
│    this.status = "PENDING";          │
│  }                                   │
└──────────────────────────────────────┘
    │
    ▼
State: AGGREGATE CREATED
claimId = "C1"
status = "PENDING"
─────────────────
    │
    │ ApproveMedicalClaimCommand arrives
    │
    ▼
┌──────────────────────────────────────┐
│  Axon loads aggregate:               │
│  1. Read all events from Event Store │
│  2. Replay events                    │
│  3. Rebuild current state            │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  @CommandHandler called              │
│  public void handle(                 │
│    ApproveMedicalClaimCommand cmd)   │
└──────────────────────────────────────┘
    │
    │ Check current state
    ▼
if (status != "PENDING") {
    throw IllegalStateException
}
    │
    ▼
AggregateLifecycle.apply(
    MedicalClaimApprovedEvent)
    │
    ▼
Event stored → @EventSourcingHandler
    │
    ▼
State: AGGREGATE UPDATED
claimId = "C1"
status = "APPROVED"
approvedAmount = 500000
```

---

## 🎭 6. SAGA STATE MACHINE

```
┌──────────────────────────────────────────────────────────────┐
│              MEDICAL TREATMENT SAGA STATES                    │
└──────────────────────────────────────────────────────────────┘

    [NOT STARTED]
         │
         │ @StartSaga
         │ MedicalTreatmentRequestedEvent
         ▼
    ┌────────────┐
    │  STARTED   │
    │            │
    │ sagaId=S1  │
    │ claimId=""│
    │            │
    └─────┬──────┘
          │
          │ Send CreateClaimCommand
          ▼
    ┌────────────┐
    │ CLAIM      │
    │ CREATING   │
    └─────┬──────┘
          │
          │ MedicalClaimCreatedEvent
          ▼
    ┌──────────────┐
    │ CLAIM CREATED│
    │              │
    │claimCreated=✅│
    │claimId="C1"  │
    └──────┬───────┘
           │
           │ Send ReserveMedicineCommand
           ▼
    ┌──────────────┐
    │ RESERVING    │
    │ MEDICINE     │
    └──────┬───────┘
           │
     ┌─────┴──────┐
     ▼            ▼
[SUCCESS]    [FAILURE]
     │            │
     │            │ MedicineReservationFailedEvent
     │            ▼
     │       ┌──────────────┐
     │       │ ROLLING BACK │
     │       │              │
     │       │ Send Cancel  │
     │       │ ClaimCommand │
     │       └──────┬───────┘
     │              │
     │              │ MedicalClaimCancelledEvent
     │              ▼
     │       ┌──────────────┐
     │       │   @EndSaga   │
     │       │   FAILED ❌  │
     │       └──────────────┘
     │
     │ MedicineReservedEvent
     ▼
┌─────────────────┐
│ MEDICINE        │
│ RESERVED        │
│                 │
│medicineReserved=✅│
│reservationId="R1"│
└────────┬────────┘
         │
         │ Send ApproveClaimCommand
         ▼
┌─────────────────┐
│ APPROVING CLAIM │
└────────┬────────┘
         │
         │ MedicalClaimApprovedEvent
         ▼
┌─────────────────┐
│ CLAIM APPROVED  │
│                 │
│claimApproved=✅ │
└────────┬────────┘
         │
         │ Send ConfirmReservationCommand
         ▼
┌─────────────────┐
│ CONFIRMING      │
│ DISPENSE        │
└────────┬────────┘
         │
         │ MedicineReservationConfirmedEvent
         ▼
┌─────────────────┐
│    @EndSaga     │
│  COMPLETED ✅   │
│                 │
│treatmentComplete│
│    = true       │
└─────────────────┘
```

---

## 📦 7. PACKAGE ORGANIZATION RATIONALE

```
WHY THIS STRUCTURE?
═══════════════════

aggregate/
  └─ Domain logic tách biệt
     └─ Single Responsibility: Chỉ lo business rules

command/
  └─ Clear intent của actions
     └─ Type-safe: Compiler check tham số

event/
  └─ Immutable facts
     └─ History log: Debug dễ dàng

saga/
  └─ Complex flow tách khỏi aggregates
     └─ Long-running: Có thể pause/resume

external/
  └─ Service boundary rõ ràng
     └─ Loose coupling: Services độc lập

eventhandler/
  └─ Side effects tách riêng
     └─ Read model: Query performance tốt

config/
  └─ Infrastructure concerns
     └─ Clean architecture: Domain không biết infrastructure
```

---

## 🔄 8. EVENT SOURCING RECONSTRUCTION

```
┌──────────────────────────────────────────────────────────────┐
│         HOW AGGREGATE STATE IS RECONSTRUCTED                  │
└──────────────────────────────────────────────────────────────┘

Command arrives: ApproveMedicalClaimCommand(claimId="C1")
                              │
                              ▼
                 ┌────────────────────────┐
                 │  Axon Framework        │
                 │  "I need aggregate C1" │
                 └────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │  Event Store Query     │
                 │  "Give me all events   │
                 │   for aggregate C1"    │
                 └────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Event Stream for C1:               │
        │                                     │
        │  1. MedicalClaimCreatedEvent {      │
        │       claimId: "C1"                 │
        │       patientId: "P1"               │
        │       claimAmount: 500000           │
        │       timestamp: T1                 │
        │     }                               │
        │                                     │
        │  2. ... (other events if any)       │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Axon creates empty aggregate       │
        │  new MedicalClaimAggregate()        │
        │                                     │
        │  State: {}                          │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Apply Event #1                     │
        │  @EventSourcingHandler              │
        │  on(MedicalClaimCreatedEvent)       │
        │                                     │
        │  State: {                           │
        │    claimId: "C1"                    │
        │    patientId: "P1"                  │
        │    claimAmount: 500000              │
        │    status: "PENDING"                │
        │  }                                  │
        └─────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────┐
        │  Aggregate ready!                   │
        │  Now execute @CommandHandler        │
        │                                     │
        │  handle(ApproveMedicalClaimCommand) │
        │  {                                  │
        │    // Can access current state:     │
        │    if (this.status == "PENDING") {  │
        │      // ... approve logic           │
        │    }                                │
        │  }                                  │
        └─────────────────────────────────────┘
```

---

## 🎯 9. KEY ANNOTATIONS CHEAT SHEET

```
╔═══════════════════════════════════════════════════════════════╗
║                    AXON ANNOTATIONS                            ║
╚═══════════════════════════════════════════════════════════════╝

AGGREGATE SIDE:
───────────────
@Aggregate
  └─ Class level: Đánh dấu class là aggregate
  
@AggregateIdentifier
  └─ Field level: Unique ID của aggregate instance
  
@CommandHandler
  └─ Method level: Xử lý command (có thể reject)
     └─ Constructor: Tạo mới aggregate
     └─ Method: Update existing aggregate
  
@EventSourcingHandler
  └─ Method level: Update state từ event (không reject)
     └─ Called khi: Event được apply hoặc replay

SAGA SIDE:
──────────
@Saga
  └─ Class level: Đánh dấu class là saga
  
@StartSaga
  └─ Method level: Entry point, tạo saga instance
  
@EndSaga
  └─ Method level: Exit point, cleanup saga
  
@SagaEventHandler(associationProperty = "sagaId")
  └─ Alternative to manual sagaId checking

GENERAL:
────────
@EventHandler
  └─ Method level: Listen và xử lý events
     └─ In Aggregate: NO (dùng @EventSourcingHandler)
     └─ In Saga: YES
     └─ In Event Handler: YES

COMMAND:
────────
@TargetAggregateIdentifier
  └─ Field level: Route command tới aggregate instance

SPRING:
───────
@Component
  └─ Event Handlers cần @Component để Spring scan
```

---

## 🚀 10. MESSAGE ROUTING MECHANISM

```
┌──────────────────────────────────────────────────────────────┐
│            HOW AXON SERVER ROUTES MESSAGES                    │
└──────────────────────────────────────────────────────────────┘

COMMAND ROUTING:
════════════════

Insurance Service sends:
  ReserveMedicineCommand {
    @TargetAggregateIdentifier
    reservationId: "R-123"
    ...
  }
              │
              ▼
      ┌───────────────┐
      │ Axon Server   │
      │               │
      │ 1. Serializes │
      │ 2. Looks for  │
      │    "Reserve   │
      │    Medicine   │
      │    Command"   │
      │    handler    │
      └───────┬───────┘
              │
              │ Which service has this handler?
              ▼
      ┌───────────────┐
      │ Inventory     │
      │ Service       │
      │               │
      │ Has:          │
      │ @CommandHandler│
      │ ReserveMedicine│
      │ Command        │
      └───────┬───────┘
              │
              ▼
      ┌───────────────┐
      │ Deserialize   │
      │ Find aggregate│
      │ R-123         │
      │ Execute       │
      │ handler       │
      └───────────────┘

EVENT ROUTING:
══════════════

Inventory Service emits:
  MedicineReservedEvent {
    reservationId: "R-123"
    sagaId: "S-456"
    ...
  }
              │
              ▼
      ┌───────────────┐
      │ Axon Server   │
      │               │
      │ 1. Store event│
      │ 2. Broadcast  │
      │    to ALL     │
      │    subscribers│
      └───────┬───────┘
              │
      ┌───────┴────────┐
      ▼                ▼
  Insurance      Inventory
  Service        Service
  (Saga)         (Event Handler)
      │                │
      │                │
      ▼                ▼
  @EventHandler    @EventHandler
  if sagaId ==     (logging)
    "S-456"
    process
```

Tôi đã tạo **2 documents cực kỳ chi tiết**:

## 📚 Documents Created:

### 1. **AXON-CODE-EXPLANATION.md** (79KB)
Chi tiết từng file, từng dòng code:
- ✅ **7 folders** được giải thích kỹ
- ✅ **18 files** với code examples
- ✅ **Annotations** và cách dùng
- ✅ **Best practices** và debugging tips
- ✅ **Flow diagrams** trong text

### 2. **AXON-ARCHITECTURE-DIAGRAM.md** (Just created)
Visual diagrams dễ hiểu:
- ✅ **10 diagrams** trực quan
- ✅ Folder structure với emoji
- ✅ Message flow với arrows
- ✅ State machines
- ✅ Cheat sheets

---

## 🎯 TÓM TẮT NHANH:

### **7 THƯ MỤC CHÍNH:**

1. **`config/`** - Cấu hình Axon (hiện tại empty, dùng defaults)

2. **`command/`** - Intentions (Muốn làm gì?)
   - `CreateMedicalClaimCommand`
   - `ApproveMedicalClaimCommand`  
   - `CancelMedicalClaimCommand`

3. **`event/`** - Facts (Đã xảy ra gì?)
   - `MedicalTreatmentRequestedEvent` ⭐ Start saga
   - `MedicalClaimCreatedEvent`
   - `MedicalClaimApprovedEvent`
   - `MedicalClaimCancelledEvent`

4. **`aggregate/`** - Business Logic
   - `MedicalClaimAggregate` - Quản lý claim lifecycle

5. **`saga/`** - Orchestration
   - `MedicalTreatmentSaga` - Điều phối toàn bộ flow

6. **`external/`** - Cross-service contracts
   - Commands gửi đến inventory-service
   - Events nhận từ inventory-service

7. **`eventhandler/`** - Side effects
   - `InventoryEventHandler` - Logging, notifications, read models

---

## 💡 KEY CONCEPTS:

### **Command vs Event:**
- **Command**: "Tạo claim" (có thể fail)
- **Event**: "Claim đã được tạo" (đã xảy ra, immutable)

### **Aggregate vs Saga:**
- **Aggregate**: Single entity (MedicalClaim)
- **Saga**: Distributed process (Treatment flow)

### **Internal vs External:**
- **Internal**: Trong insurance-service
- **External**: Từ/đến inventory-service

---

Bạn muốn tôi giải thích thêm phần nào chi tiết hơn không? 🤔
