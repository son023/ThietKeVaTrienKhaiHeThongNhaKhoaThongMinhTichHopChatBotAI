# Inventory Service Test Script
$baseUrl = "http://localhost:8084"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Inventory Service APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Global variables to store created IDs for testing relationships
$createdPharmacistId = $null
$createdMedicineId = $null
$createdInventoryLotId = $null
$createdStockLedgerId = $null
$createdDispenseOrderId = $null
$createdDispenseItemId = $null

# Test 1: Get all Pharmacists
Write-Host "`n[TEST 1] GET /inventory-service/pharmacists" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/pharmacists" -Method Get
    Write-Host "Success: Found $($response.Count) pharmacists" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Create new Pharmacist
Write-Host "`n[TEST 2] POST /inventory-service/pharmacists" -ForegroundColor Yellow

# Try with a fresh UUID first, if it fails, fallback to creating with the known test UUID
$attemptCount = 0
$maxAttempts = 2
$createdPharmacist = $false

do {
    $attemptCount++
    if ($attemptCount -eq 1) {
         $testUserId = "4c84022a-1111-4001-8001-000000000005"  
        Write-Host "  - Attempt ${attemptCount}: Using new UUID: $testUserId" -ForegroundColor Cyan
    } else {
        $testUserId = "4c84022a-1111-4001-8001-000000000005"  # Use different test ID
        Write-Host "  - Attempt ${attemptCount}: Using test UUID: $testUserId" -ForegroundColor Cyan
    }

    $newPharmacist = @{
        userId = $testUserId
        degree = "Cử nhân Dược1"
        certificate = "Chứng chỉ hành nghề Dược"
    } | ConvertTo-Json
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($newPharmacist)
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/pharmacists" -Method Post -Body $bodyBytes -ContentType "application/json" 
        Write-Host "Success: Created pharmacist with ID = $($response.userId)" -ForegroundColor Green
        $createdPharmacistId = $response.userId
        $createdPharmacist = $true
        Write-Host "  - Degree: $($response.degree)" -ForegroundColor Cyan
        Write-Host "  - Certificate: $($response.certificate)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
        break
    } catch {
        Write-Host "Attempt ${attemptCount} Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Host "  - Error Details: $errorContent" -ForegroundColor Red
            } catch {
                Write-Host "  - Could not read error details" -ForegroundColor Red
            }
        }
    }
} while ($attemptCount -lt $maxAttempts -and -not $createdPharmacist)

if (-not $createdPharmacist) {
    # Fallback to using existing pharmacist from database
    $createdPharmacistId = "4c84022a-1111-4001-8001-000000000004"
    Write-Host "  - Fallback: Will use existing pharmacist ID: $createdPharmacistId" -ForegroundColor Yellow
}

# Test 3: Get specific Pharmacist
Write-Host "`n[TEST 3] GET /inventory-service/pharmacists/{userId}" -ForegroundColor Yellow
if ($createdPharmacistId) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/pharmacists/$createdPharmacistId" -Method Get
        Write-Host "Success: Pharmacist = $($response.degree)" -ForegroundColor Green
        Write-Host "  - User ID: $($response.userId)" -ForegroundColor Cyan
        Write-Host "  - Certificate: $($response.certificate)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No pharmacist ID available" -ForegroundColor Yellow
}

# Test 4: Update Pharmacist
Write-Host "`n[TEST 4] PUT /inventory-service/pharmacists/{userId}" -ForegroundColor Yellow
if ($createdPharmacistId) {
    $updatePharmacist = @{
        userId = $createdPharmacistId
        degree = "Thạc sĩ Dược"
        certificate = "Chứng chỉ hành nghề Dược nâng cao"
    } | ConvertTo-Json

    Write-Host "  - Updating pharmacist: $createdPharmacistId" -ForegroundColor Gray
    Write-Host "  - Request Body: $updatePharmacist" -ForegroundColor Gray

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/pharmacists/$createdPharmacistId" -Method Put -Body $updatePharmacist -ContentType "application/json"
        Write-Host "Success: Updated pharmacist" -ForegroundColor Green
        Write-Host "  - New Degree: $($response.degree)" -ForegroundColor Cyan
        Write-Host "  - New Certificate: $($response.certificate)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "  - Error Details: $errorContent" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Skipped: No pharmacist ID available" -ForegroundColor Yellow
}

# Test 5: Get all Medicines
Write-Host "`n[TEST 5] GET /inventory-service/medicines" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines" -Method Get
    Write-Host "Success: Found $($response.Count) medicines" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get specific Medicine
Write-Host "`n[TEST 6] GET /inventory-service/medicines/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines/aaaa1111-aaaa-4aaa-8aaa-111111111111" -Method Get
    Write-Host "Success: Medicine = $($response.name)" -ForegroundColor Green
    Write-Host "  - Unit: $($response.unit)" -ForegroundColor Cyan
    Write-Host "  - Sale Price: $($response.salePrice)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Create new Medicine
Write-Host "`n[TEST 7] POST /inventory-service/medicines" -ForegroundColor Yellow
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

# Test 8: Get all Inventory Lots
Write-Host "`n[TEST 8] GET /inventory-service/inventory-lots" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots" -Method Get
    Write-Host "Success: Found $($response.Count) inventory lots" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Get specific Inventory Lot
Write-Host "`n[TEST 9] GET /inventory-service/inventory-lots/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots/bbbb2222-bbbb-4bbb-8bbb-222222222222" -Method Get
    Write-Host "Success: Lot Number = $($response.lotNo)" -ForegroundColor Green
    Write-Host "  - Quantity on Hand: $($response.quantityOnHand)" -ForegroundColor Cyan
    Write-Host "  - Cost Price: $($response.costPrice)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 10: Get all Stock Ledgers (with updated fields)
Write-Host "`n[TEST 10] GET /inventory-service/stock-ledgers" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/stock-ledgers" -Method Get
    Write-Host "Success: Found $($response.Count) stock ledger entries" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 11: Create Stock Ledger with new referenceId field
Write-Host "`n[TEST 11] POST /inventory-service/stock-ledgers (with referenceId)" -ForegroundColor Yellow
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

# Test 12: Get all Dispense Orders (with new fields)
Write-Host "`n[TEST 12] GET /inventory-service/dispense-orders" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders" -Method Get
    Write-Host "Success: Found $($response.Count) dispense orders" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 13: Get specific Dispense Order
Write-Host "`n[TEST 13] GET /inventory-service/dispense-orders/{id}" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders/cccc3333-cccc-4ccc-8ccc-333333333333" -Method Get
    Write-Host "Success: Prescription = $($response.prescription)" -ForegroundColor Green
    Write-Host "  - Medical History ID: $($response.medicalHistoryId)" -ForegroundColor Cyan
    Write-Host "  - Doctor ID: $($response.doctorId)" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 14: Create Dispense Order with new fields
Write-Host "`n[TEST 14] POST /inventory-service/dispense-orders (with new fields)" -ForegroundColor Yellow
$newDispenseOrder = @{
    pharmacistId = $createdPharmacistId
    prescription = "TEST-PRESCRIPTION-$(Get-Date -Format 'HHmmss')"
    status = "PENDING"
    medicalHistoryId = "HIST-TEST-001"
    doctorId = "DOC-TEST-001"
} | ConvertTo-Json

if (-not $createdPharmacistId) {
    Write-Host "Warning: No pharmacist ID available, using default" -ForegroundColor Yellow
    $newDispenseOrder = $newDispenseOrder -replace '"pharmacistId":null', '"pharmacistId":"4c84022a-1111-4001-8001-000000000004"'
}

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

# Test 15: Get all Dispense Items (with new fields)
Write-Host "`n[TEST 15] GET /inventory-service/dispense-items" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-items" -Method Get
    Write-Host "Success: Found $($response.Count) dispense items" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 16: Create Dispense Item with new fields
Write-Host "`n[TEST 16] POST /inventory-service/dispense-items (with new fields)" -ForegroundColor Yellow
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

# Test 17: Update Dispense Item
Write-Host "`n[TEST 17] PUT /inventory-service/dispense-items/{id}" -ForegroundColor Yellow
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

# Test 18: Update Dispense Order
Write-Host "`n[TEST 18] PUT /inventory-service/dispense-orders/{id}" -ForegroundColor Yellow
if ($createdDispenseOrderId) {
    $updateDispenseOrder = @{
        pharmacistId = if ($createdPharmacistId) { $createdPharmacistId } else { "4c84022a-1111-4001-8001-000000000004" }
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

# Test 19: Create Inventory Lot (if we have a created medicine)
Write-Host "`n[TEST 19] POST /inventory-service/inventory-lots" -ForegroundColor Yellow
if ($createdMedicineId) {
    $newInventoryLot = @{
        lotNo = "TEST-LOT-$(Get-Date -Format 'HHmmss')"
        expireDate = "2026-12-31"
        quantityOnHand = 500
        costPrice = 800
        medicineId = $createdMedicineId
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots" -Method Post -Body $newInventoryLot -ContentType "application/json"
        Write-Host "Success: Created inventory lot with ID = $($response.id)" -ForegroundColor Green
        Write-Host "  - Lot No: $($response.lotNo)" -ForegroundColor Cyan
        Write-Host "  - Quantity: $($response.quantityOnHand)" -ForegroundColor Cyan
        $createdInventoryLotId = $response.id
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No medicine ID available" -ForegroundColor Yellow
}

# Test 20: Update Inventory Lot
Write-Host "`n[TEST 20] PUT /inventory-service/inventory-lots/{id}" -ForegroundColor Yellow
if ($createdInventoryLotId) {
    $updateInventoryLot = @{
        lotNo = "TEST-LOT-UPDATED"
        expireDate = "2026-12-31"
        quantityOnHand = 600
        costPrice = 850
        medicineId = $createdMedicineId
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots/$createdInventoryLotId" -Method Put -Body $updateInventoryLot -ContentType "application/json"
        Write-Host "Success: Updated inventory lot" -ForegroundColor Green
        Write-Host "  - New Quantity: $($response.quantityOnHand)" -ForegroundColor Cyan
        Write-Host "  - New Cost Price: $($response.costPrice)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No inventory lot ID available" -ForegroundColor Yellow
}

# Test 21: Update Medicine
Write-Host "`n[TEST 21] PUT /inventory-service/medicines/{id}" -ForegroundColor Yellow
if ($createdMedicineId) {
    $updateMedicine = @{
        name = "Updated Test Medicine"
        unit = "Vien"
        description = "Updated test medication"
        salePrice = 2500
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines/$createdMedicineId" -Method Put -Body $updateMedicine -ContentType "application/json"
        Write-Host "Success: Updated medicine" -ForegroundColor Green
        Write-Host "  - New Name: $($response.name)" -ForegroundColor Cyan
        Write-Host "  - New Price: $($response.salePrice)" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped: No medicine ID available" -ForegroundColor Yellow
}

# Test 22: Delete Tests (Clean up created resources)
Write-Host "`n[TEST 22] DELETE Operations" -ForegroundColor Yellow

# Delete Dispense Item
if ($createdDispenseItemId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-items/$createdDispenseItemId" -Method Delete
        Write-Host "Success: Deleted dispense item $createdDispenseItemId" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete dispense item: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Delete Dispense Order
if ($createdDispenseOrderId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/inventory-service/dispense-orders/$createdDispenseOrderId" -Method Delete
        Write-Host "Success: Deleted dispense order $createdDispenseOrderId" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete dispense order: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Delete Stock Ledger
if ($createdStockLedgerId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/inventory-service/stock-ledgers/$createdStockLedgerId" -Method Delete
        Write-Host "Success: Deleted stock ledger $createdStockLedgerId" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete stock ledger: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Delete Inventory Lot
if ($createdInventoryLotId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/inventory-service/inventory-lots/$createdInventoryLotId" -Method Delete
        Write-Host "Success: Deleted inventory lot $createdInventoryLotId" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete inventory lot: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Delete Medicine
if ($createdMedicineId) {
    try {
        Invoke-RestMethod -Uri "$baseUrl/inventory-service/medicines/$createdMedicineId" -Method Delete
        Write-Host "Success: Deleted medicine $createdMedicineId" -ForegroundColor Green
    } catch {
        Write-Host "Failed to delete medicine: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Note: We don't delete the pharmacist as it might be used by other tests
Write-Host "Note: Pharmacist $createdPharmacistId kept for other tests" -ForegroundColor Cyan

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All inventory-service tests completed (22 test scenarios)!" -ForegroundColor Green
Write-Host "API Coverage:" -ForegroundColor Yellow
Write-Host "  - Pharmacists: GET, POST, PUT (CRUD)" -ForegroundColor White
Write-Host "  - Medicines: GET, POST, PUT, DELETE (CRUD)" -ForegroundColor White
Write-Host "  - Inventory Lots: GET, POST, PUT, DELETE (CRUD)" -ForegroundColor White
Write-Host "  - Stock Ledgers: GET, POST, DELETE" -ForegroundColor White
Write-Host "  - Dispense Orders: GET, POST, PUT, DELETE (CRUD)" -ForegroundColor White
Write-Host "  - Dispense Items: GET, POST, PUT, DELETE (CRUD)" -ForegroundColor White
Write-Host "Check the results above for any failures." -ForegroundColor Yellow
