# Test Medical Treatment Saga Orchestrator

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MEDICAL TREATMENT SAGA - TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Success Scenario
Write-Host "TEST 1: SUCCESS SCENARIO" -ForegroundColor Green
Write-Host "Medicine ID: medicine-available-success" -ForegroundColor Yellow
Write-Host ""

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8099/api/medical-treatment/test/success" -Method Post -ContentType "application/json"
    Write-Host "Response received:" -ForegroundColor Green
    Write-Host "  Treatment ID: $($response1.treatmentId)" -ForegroundColor White
    Write-Host "  Status: $($response1.status)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Waiting 5 seconds for saga to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "-----------------------------------------" -ForegroundColor Cyan

# Test 2: Rollback Scenario
Write-Host "TEST 2: ROLLBACK SCENARIO" -ForegroundColor Red
Write-Host "Medicine ID: medicine-outofstock-fail" -ForegroundColor Yellow
Write-Host ""

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8099/api/medical-treatment/test/rollback" -Method Post -ContentType "application/json"
    Write-Host "Response received:" -ForegroundColor Green
    Write-Host "  Treatment ID: $($response2.treatmentId)" -ForegroundColor White
    Write-Host "  Status: $($response2.status)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Waiting 5 seconds for saga rollback to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "-----------------------------------------" -ForegroundColor Cyan

# Test 3: Custom Request
Write-Host "TEST 3: CUSTOM REQUEST" -ForegroundColor Blue
Write-Host "Medicine ID: custom-medicine-001" -ForegroundColor Yellow
Write-Host ""

$body = @{
    patientId = "patient-custom-123"
    patientInsuranceId = "policy-custom-456"
    medicineId = "custom-medicine-001"
    medicineQuantity = 2
    claimAmount = 500000
    treatmentDescription = "Custom test - Treatment for flu"
}

try {
    $response3 = Invoke-RestMethod -Uri "http://localhost:8099/api/medical-treatment/initiate" `
        -Method Post `
        -ContentType "application/json" `
        -Body ($body | ConvertTo-Json)
    
    Write-Host "Response received:" -ForegroundColor Green
    Write-Host "  Treatment ID: $($response3.treatmentId)" -ForegroundColor White
    Write-Host "  Status: $($response3.status)" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "TESTING COMPLETED!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check logs in PowerShell windows:" -ForegroundColor Yellow
Write-Host "  1. Insurance Service (port 8086)" -ForegroundColor White
Write-Host "  2. Inventory Service (port 8082)" -ForegroundColor White
Write-Host "  3. Auth Service - Orchestrator (port 8099)" -ForegroundColor White
Write-Host ""
