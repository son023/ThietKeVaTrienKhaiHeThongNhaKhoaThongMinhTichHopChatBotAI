# Inventory Service Test Script
$baseUrl = "http://localhost:8084"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Inventory Service APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test 1: Get all Medicines
Write-Host "`n[TEST 1] GET /inventory-service/medicines" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines" -Method Get
    Write-Host "Success: Found $($response.Count) medicines" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get specific Medicine
Write-Host "`n[TEST 2] GET /inventory-service/medicines/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines/aaaa1111-aaaa-4aaa-8aaa-111111111111" -Method Get
    Write-Host "Success: Medicine = $($response.name)" -ForegroundColor Green
    Write-Host "  - Unit: $($response.unit)" -ForegroundColor Cyan
    Write-Host "  - Sale Price: $($response.salePrice)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Create new Medicine
Write-Host "`n[TEST 3] POST /inventory-service/medicines" -ForegroundColor Yellow
$newMedicine = @{
    name = "Test Medicine $(Get-Date -Format 'HHmmss')"
    unit = "Vien"
    description = "Test medication"
    salePrice = 2000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines" -Method Post -Body $newMedicine -ContentType "application/json"
    Write-Host "Success: Created medicine with ID = $($response.id)" -ForegroundColor Green
    $createdMedicineId = $response.id
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Get all Inventory Lots
Write-Host "`n[TEST 4] GET /inventory-service/inventory-lots" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots" -Method Get
    Write-Host "Success: Found $($response.Count) inventory lots" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Get specific Inventory Lot
Write-Host "`n[TEST 5] GET /inventory-service/inventory-lots/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots/bbbb2222-bbbb-4bbb-8bbb-222222222222" -Method Get
    Write-Host "Success: Lot Number = $($response.lotNo)" -ForegroundColor Green
    Write-Host "  - Quantity on Hand: $($response.quantityOnHand)" -ForegroundColor Cyan
    Write-Host "  - Cost Price: $($response.costPrice)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get all Stock Ledgers (with updated fields)
Write-Host "`n[TEST 6] GET /inventory-service/stock-ledgers" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/stock-ledgers" -Method Get
    Write-Host "Success: Found $($response.Count) stock ledger entries" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create Stock Ledger with new referenceId field
Write-Host "`n[TEST 7] POST /inventory-service/stock-ledgers (with referenceId)" -ForegroundColor Yellow
$newStockLedger = @{
    type = "IN"
    quantity = 100
    referenceType = "PURCHASE_ORDER"
    referenceId = "PO-TEST-$(Get-Date -Format 'HHmmss')"
    inventoryLotId = "bbbb2222-bbbb-4bbb-8bbb-222222222222"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/stock-ledgers" -Method Post -Body $newStockLedger -ContentType "application/json"
    Write-Host "Success: Created stock ledger with ID = $($response.id)" -ForegroundColor Green
    Write-Host "  - Reference ID: $($response.referenceId)" -ForegroundColor Cyan
    $createdStockLedgerId = $response.id
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get all Dispense Orders (with new fields)
Write-Host "`n[TEST 8] GET /inventory-service/dispense-orders" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders" -Method Get
    Write-Host "Success: Found $($response.Count) dispense orders" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Get specific Dispense Order
Write-Host "`n[TEST 9] GET /inventory-service/dispense-orders/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders/cccc3333-cccc-4ccc-8ccc-333333333333" -Method Get
    Write-Host "Success: Prescription = $($response.prescription)" -ForegroundColor Green
    Write-Host "  - Medical History ID: $($response.medicalHistoryId)" -ForegroundColor Cyan
    Write-Host "  - Doctor ID: $($response.doctorId)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Create Dispense Order with new fields
Write-Host "`n[TEST 10] POST /inventory-service/dispense-orders (with new fields)" -ForegroundColor Yellow
$newDispenseOrder = @{
    pharmacistId = 15
    prescription = "TEST-PRESCRIPTION-$(Get-Date -Format 'HHmmss')"
    status = "PENDING"
    medicalHistoryId = "HIST-TEST-001"
    doctorId = "DOC-TEST-001"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders" -Method Post -Body $newDispenseOrder -ContentType "application/json"
    Write-Host "Success: Created dispense order with ID = $($response.id)" -ForegroundColor Green
    Write-Host "  - Medical History ID: $($response.medicalHistoryId)" -ForegroundColor Cyan
    Write-Host "  - Doctor ID: $($response.doctorId)" -ForegroundColor Cyan
    $createdDispenseOrderId = $response.id
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Get all Dispense Items (with new fields)
Write-Host "`n[TEST 11] GET /inventory-service/dispense-items" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-items" -Method Get
    Write-Host "Success: Found $($response.Count) dispense items" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 12: Create Dispense Item with new fields
Write-Host "`n[TEST 12] POST /inventory-service/dispense-items (with new fields)" -ForegroundColor Yellow
$newDispenseItem = @{
    quantity = 30
    priceAtDispense = 1200
    dosage = "2 vien"
    frequency = "3 lan/ngay"
    duration = "10 ngay"
    usageInstructions = "Uong sau bua an, cach bua an 30 phut"
    inventoryLotId = "bbbb2222-bbbb-4bbb-8bbb-222222222222"
    dispenseOrderId = "cccc3333-cccc-4ccc-8ccc-333333333333"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-items" -Method Post -Body $newDispenseItem -ContentType "application/json"
    Write-Host "Success: Created dispense item with ID = $($response.id)" -ForegroundColor Green
    Write-Host "  - Dosage: $($response.dosage)" -ForegroundColor Cyan
    Write-Host "  - Frequency: $($response.frequency)" -ForegroundColor Cyan
    Write-Host "  - Duration: $($response.duration)" -ForegroundColor Cyan
    Write-Host "  - Usage Instructions: $($response.usageInstructions)" -ForegroundColor Cyan
    $createdDispenseItemId = $response.id
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 13: Update Dispense Item
Write-Host "`n[TEST 13] PUT /inventory-service/dispense-items/{id}" -ForegroundColor Yellow
if ($createdDispenseItemId) {
    $updateDispenseItem = @{
        quantity = 40
        priceAtDispense = 1200
        dosage = "2 vien"
        frequency = "2 lan/ngay"
        duration = "14 ngay"
        usageInstructions = "Uong truoc bua an 15 phut"
        inventoryLotId = "bbbb2222-bbbb-4bbb-8bbb-222222222222"
        dispenseOrderId = "cccc3333-cccc-4ccc-8ccc-333333333333"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-items/$createdDispenseItemId" -Method Put -Body $updateDispenseItem -ContentType "application/json"
        Write-Host "Success: Updated dispense item" -ForegroundColor Green
        Write-Host "  - New Frequency: $($response.frequency)" -ForegroundColor Cyan
        Write-Host "  - New Duration: $($response.duration)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No dispense item was created to update" -ForegroundColor Yellow
}

# Test 14: Update Dispense Order
Write-Host "`n[TEST 14] PUT /inventory-service/dispense-orders/{id}" -ForegroundColor Yellow
if ($createdDispenseOrderId) {
    $updateDispenseOrder = @{
        pharmacistId = 15
        prescription = "TEST-PRESCRIPTION-UPDATED"
        status = "COMPLETED"
        medicalHistoryId = "HIST-TEST-001-UPDATED"
        doctorId = "DOC-TEST-002"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders/$createdDispenseOrderId" -Method Put -Body $updateDispenseOrder -ContentType "application/json"
        Write-Host "Success: Updated dispense order" -ForegroundColor Green
        Write-Host "  - New Status: $($response.status)" -ForegroundColor Cyan
        Write-Host "  - New Doctor ID: $($response.doctorId)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No dispense order was created to update" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All inventory-service tests completed!" -ForegroundColor Green
Write-Host "Check the results above for any failures." -ForegroundColor Yellow
