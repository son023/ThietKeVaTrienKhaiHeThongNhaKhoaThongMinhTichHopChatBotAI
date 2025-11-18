# Core API - Shared Commands & Events

## Mô tả

Module `core-api` là thư viện chung chứa tất cả **Commands** và **Events** được sử dụng bởi các microservices trong hệ thống Medical Treatment Saga.

## Mục đích

- **Tránh duplicate code**: Các Commands và Events được định nghĩa một lần duy nhất
- **Đảm bảo consistency**: Tất cả services sử dụng cùng một định nghĩa
- **Dễ bảo trì**: Thay đổi một lần, áp dụng cho tất cả services
- **Type safety**: Đảm bảo type-safe communication giữa các services

## Cấu trúc

```
core-api/
├── src/main/java/com/main_project/coreapi/
│   ├── insurance/
│   │   ├── commands/
│   │   │   ├── CreateMedicalClaimCommand.java
│   │   │   ├── ApproveMedicalClaimCommand.java
│   │   │   └── CancelMedicalClaimCommand.java
│   │   └── events/
│   │       ├── MedicalClaimCreatedEvent.java
│   │       ├── MedicalClaimApprovedEvent.java
│   │       └── MedicalClaimCancelledEvent.java
│   └── inventory/
│       ├── commands/
│       │   ├── ReserveMedicineCommand.java
│       │   ├── ConfirmMedicineReservationCommand.java
│       │   └── CancelMedicineReservationCommand.java
│       └── events/
│           ├── MedicineReservedEvent.java
│           ├── MedicineReservationConfirmedEvent.java
│           ├── MedicineReservationCancelledEvent.java
│           └── MedicineReservationFailedEvent.java
└── build.gradle
```

## Sử dụng

### 1. Build module

```bash
cd service/core-api
./gradlew build
```

### 2. Import vào các services

Trong `build.gradle` của mỗi service:

```gradle
dependencies {
    // Core API - Shared Commands & Events
    implementation project(':service:core-api')
    
    // ... other dependencies
}
```

### 3. Sử dụng trong code

```java
import com.main_project.coreapi.insurance.commands.CreateMedicalClaimCommand;
import com.main_project.coreapi.insurance.events.MedicalClaimCreatedEvent;
import com.main_project.coreapi.inventory.commands.ReserveMedicineCommand;
import com.main_project.coreapi.inventory.events.MedicineReservedEvent;

// ... use commands and events
```

## Services sử dụng Core-API

1. **auth-service**: Saga Orchestrator chính
2. **insurance-service**: Xử lý Medical Claims
3. **inventory-service**: Xử lý Medicine Reservations

## Lưu ý

- **KHÔNG** chứa business logic trong module này
- **KHÔNG** có dependencies đến database
- **KHÔNG** có dependencies đến Spring Boot starters
- **CHỈ** chứa Plain Old Java Objects (POJOs) với Lombok annotations
- **CHỈ** phụ thuộc vào Axon Framework core APIs

