# Quick Start - Medical Treatment Saga Orchestrator

## 🚀 Khởi động Hệ thống

### Bước 1: Start Axon Server
```bash
docker run -d --name axonserver -p 8024:8024 -p 8124:8124 axoniq/axonserver:latest
```

Hoặc nếu đã có sẵn, chỉ cần start:
```bash
docker start axonserver
```

### Bước 2: Build Core-API
```bash
cd C:\Users\Admin\Desktop\test-saga\doantotnghiep2025\doantotnghiep2025
.\gradlew :service:core-api:build -x test
```

### Bước 3: Build All Services
```bash
.\gradlew :service:insurance-service:build -x test
.\gradlew :service:inventory-service:build -x test
.\gradlew :service:auth-service:build -x test
```

### Bước 4: Start Services (trong thứ tự)

**Terminal 1 - Insurance Service:**
```bash
cd service\insurance-service
java -jar build\libs\insurance-service-0.0.1-SNAPSHOT.jar
```

**Terminal 2 - Inventory Service:**
```bash
cd service\inventory-service
java -jar build\libs\inventory-service-0.0.1-SNAPSHOT.jar
```

**Terminal 3 - Auth Service (Orchestrator):**
```bash
cd service\auth-service
java -jar build\libs\auth-service-0.0.1-SNAPSHOT.jar
```

## 🧪 Testing

### Cách 1: Sử dụng Test Script
```bash
.\test-saga.ps1
```

### Cách 2: Manual Testing

**Success Scenario:**
```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/success
```

**Rollback Scenario:**
```bash
curl -X POST http://localhost:8099/api/medical-treatment/test/rollback
```

**Custom Request:**
```bash
curl -X POST http://localhost:8099/api/medical-treatment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "patientInsuranceId": "policy-456",
    "medicineId": "medicine-available-success",
    "medicineQuantity": 2,
    "claimAmount": 500000,
    "treatmentDescription": "Dieu tri cam cum"
  }'
```

## 📊 Service Ports

| Service | Port | Role |
|---------|------|------|
| Axon Server | 8124 | Event Store & Message Bus |
| Auth Service | 8099 | **Saga Orchestrator** |
| Insurance Service | 8086 | Medical Claims Handler |
| Inventory Service | 8082 | Medicine Inventory Handler |
| Eureka Registry | 8761 | Service Discovery |

## 🔍 Kiểm tra Logs

### Success Logs (Auth-Service):
```
✅✅✅ SAGA HOÀN THÀNH THÀNH CÔNG ✅✅✅
```

### Rollback Logs (Auth-Service):
```
❌ ROLLBACK: Không thể đặt trước thuốc
```

## 🎯 Medicine ID Rules

- Chứa `"available"` → Success ✅
- Chứa `"outofstock"` → Rollback ❌
- Bất kỳ ID nào khác → Success (mặc định) ✅

## 🔄 Luồng Saga

```
1. Client → Auth-Service: Initiate Treatment
2. Auth-Service → Insurance-Service: Create Claim
3. Auth-Service → Inventory-Service: Reserve Medicine
4. Auth-Service → Insurance-Service: Approve Claim
5. Auth-Service → Inventory-Service: Confirm Reservation
6. Auth-Service: Complete Treatment ✅
```

## ❌ Rollback Flow

```
1. Create Claim ✅
2. Reserve Medicine ❌ (Failed)
3. ROLLBACK: Cancel Claim
4. Fail Treatment
```

## 🛠️ Troubleshooting

### Lỗi: Cannot connect to Axon Server
- Kiểm tra Axon Server đang chạy: `docker ps`
- Kiểm tra port 8124: `netstat -an | findstr 8124`

### Lỗi: Service không start
- Kiểm tra port đã bị chiếm: `netstat -ano | findstr :8099`
- Build lại service: `.\gradlew :service:auth-service:clean build`

### Lỗi: Core-API not found
- Build core-api trước: `.\gradlew :service:core-api:build`
- Kiểm tra settings.gradle đã include core-api chưa

## 📁 Kiến trúc

```
auth-service (ORCHESTRATOR)
    ↓ Commands & Events via Axon Server
    ├─→ insurance-service (Claims)
    └─→ inventory-service (Inventory)

All using shared: core-api (Commands & Events)
```

## 🎉 Test Results

Sau khi chạy test script, bạn sẽ thấy 3 treatments:
1. ✅ Success: Saga hoàn thành
2. ❌ Rollback: Saga rollback do hết thuốc
3. ✅ Custom: Saga hoàn thành với params tùy chỉnh

## 📚 Tài liệu Chi tiết

Xem thêm:
- `SAGA_ARCHITECTURE.md` - Kiến trúc chi tiết
- `service/core-api/README.md` - Core-API documentation

