# Patient Service API Test Script
# PowerShell script to exercise all Patient Service endpoints

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Web

$baseUrl = "http://localhost:8089"
$token = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwOTgxMDcyNzczIiwiZnVsbF9uYW1lIjoiTmd1eWVuIFZhbiBTb24iLCJ1c2VyX2lkIjoiNTJkZGQ1NGQtNGM2My00NzE5LWJiZDAtZGFhNDE5N2NjNDMyIiwicGhvbmUiOiIwOTgxMDcyNzczIiwicHJpbWFyeV9yb2xlIjoiUEFUSUVOVCIsInJvbGVzIjpbIlBBVElFTlQiXSwiaXNzIjoiZGV2IiwiZXhwIjoxNzY0MTMzMDQ5LCJpYXQiOjE3NjQwNDY2NDksImp0aSI6ImJiOGQ0MThjLWE5YWQtNGFjMi05YjA2LTI2NTE2YzRlZDdjMiJ9.bz3wT7wQVapP-ZSWvEF7A8KMCaL0N0LupvvIPZW41H-D8MtRilDzDC9yU-NK4gQ-GosTIxdXErOqLbXScYUuLbihhlibla3Cn8RCYC6Et-teg1L6ImuhBYrGpC0FLYGGCd3qHJRnHlaIwl1Yx5kCZLK9DQxu35fU7_slkhzgF5QUlAlunTC94Z8cGo5H0Tw4hF5L86ReD_YT9BY5biQeqTLoHsEQg-4xToNR87izwdskUNnnxpe6SNhKEWv9sbJftqjH62vb3hs0l8mWr_61GkWWtE2Cq7jyauiGt1XVpVgrdsn-IJwPdwK9r5wMSqNR1a192sd6MwxHLsGq89DtMg"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

function Show-ErrorDetail {
    param([System.Exception]$ex)
    if ($ex -and $ex.Response) {
        try {
            $reader = New-Object System.IO.StreamReader($ex.Response.GetResponseStream())
            $body = $reader.ReadToEnd()
            if ($body) {
                Write-Host "   [DETAIL] $body" -ForegroundColor Yellow
            }
        } catch {
            # ignore secondary errors
        }
    }
}

$patientId = $null
$medicalHistoryId = $null
$appointmentId = "550e8400-e29b-41d4-a716-446655440000"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Patient Service API Test Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. PATIENT APIs
# ============================================
Write-Host "1. Testing Patient APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# 1.1 Create Patient
Write-Host "1.1 Creating Patient..." -ForegroundColor Green
$patientBody = @{
    userId = "52ddd54d-4c63-4719-bbd0-daa4197cc432"
    dob = "1995-05-15"
    gender = "MALE"
    address = "123 Nguyen Trai, District 5, HCMC"
    contactPhone = "0901234567"
    bloodType = "O+"
    allergy = "Penicillin"
    insuranceNumber = "INS-2025-0001"
} | ConvertTo-Json -Depth 3

try {
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($patientBody)
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients" -Method Post -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
    $patientId = $response.userId
    Write-Host "   [OK] Created Patient with User ID: $patientId" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
    # Fallback to existing patient ID if create failed
    $patientId = "52ddd54d-4c63-4719-bbd0-daa4197cc432"
}
Write-Host ""

# 1.2 Get All Patients
Write-Host "1.2 Getting All Patients..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) patients" -ForegroundColor Green
    if (-not $patientId -and $response.Count -gt 0) {
        $patientId = $response[0].userId
        Write-Host "   [INFO] Using Patient ID: $patientId" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 1.3 Get Patient By ID
if ($patientId) {
    Write-Host "1.3 Getting Patient By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients/$patientId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Patient: $($response.contactPhone)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
}

# 1.4 Get Patients By Gender
Write-Host "1.4 Getting Patients By Gender..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients/gender/MALE" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) male patients" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 1.5 Get Patients By Blood Type
Write-Host "1.5 Getting Patients By Blood Type..." -ForegroundColor Green
try {
    $encodedBloodType = [System.Web.HttpUtility]::UrlEncode("O+")
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients/blood-type/$encodedBloodType" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) patients with blood type O+" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 1.6 Update Patient
if ($patientId) {
    Write-Host "1.6 Updating Patient..." -ForegroundColor Green
    $updateBody = @{
        userId = $patientId
        dob = "1995-05-15"
        gender = "MALE"
        address = "456 Le Loi, District 1, HCMC"
        contactPhone = "0909998888"
        bloodType = "O+"
        allergy = "None"
        insuranceNumber = "INS-2025-0001-UPDATED"
    } | ConvertTo-Json -Depth 3

    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($updateBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/patients/$patientId" -Method Put -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        Write-Host "   [OK] Updated Patient" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
}

# ============================================
# 2. MEDICAL HISTORY APIs
# ============================================
Write-Host "2. Testing Medical History APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

if ($patientId) {
    # 2.1 Create Medical History
    Write-Host "2.1 Creating Medical History..." -ForegroundColor Green
    $medicalHistoryBody = @{
        appointmentId = $appointmentId
        symptoms = "Ho khan, sot nhe"
        treatment = "Uong thuoc giam ho"
        diagnosis = "Viêm họng"
        disease = "Benh ho hap tren"
        patientId = $patientId
    } | ConvertTo-Json -Depth 3

    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($medicalHistoryBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories" -Method Post -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        $medicalHistoryId = $response.id
        Write-Host "   [OK] Created Medical History with ID: $medicalHistoryId" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
} else {
    Write-Host "   [SKIP] Need a patient ID before creating medical history" -ForegroundColor Yellow
}

# 2.2 Get All Medical Histories
Write-Host "2.2 Getting All Medical Histories..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) medical histories" -ForegroundColor Green
    if (-not $medicalHistoryId -and $response.Count -gt 0) {
        $medicalHistoryId = $response[0].id
    }
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 2.3 Get Medical History By ID
if ($medicalHistoryId) {
    Write-Host "2.3 Getting Medical History By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/$medicalHistoryId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Medical History for Disease: $($response.disease)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
}

# 2.4 Get Medical Histories By Patient ID
if ($patientId) {
    Write-Host "2.4 Getting Medical Histories By Patient ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/patient/$patientId" -Method Get -Headers $headers
        Write-Host "   [OK] Found $($response.Count) medical histories for patient" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
}

# 2.5 Get Medical Histories By Appointment ID
Write-Host "2.5 Getting Medical Histories By Appointment ID..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/appointment/$appointmentId" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) medical histories for appointment" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 2.6 Search Medical Histories By Disease
Write-Host "2.6 Searching Medical Histories By Disease..." -ForegroundColor Green
try {
    $searchTerm = [System.Web.HttpUtility]::UrlEncode("viem")
    $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/disease?q=$searchTerm" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) medical histories matching keyword" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Show-ErrorDetail $_.Exception
}
Write-Host ""

# 2.7 Update Medical History
if ($medicalHistoryId -and $patientId) {
    Write-Host "2.7 Updating Medical History..." -ForegroundColor Green
    $updateBody = @{
        appointmentId = $appointmentId
        symptoms = "Ho khan giam dan"
        treatment = "Tiep tuc uong thuoc giam ho"
        diagnosis = "Viêm họng - giai doan hoi phuc"
        disease = "Benh ho hap tren"
        patientId = $patientId
    } | ConvertTo-Json -Depth 3

    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($updateBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/$medicalHistoryId" -Method Put -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        Write-Host "   [OK] Updated Medical History" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        Show-ErrorDetail $_.Exception
    }
    Write-Host ""
}

# ============================================
# 3. CLEANUP (Optional)
# ============================================
Write-Host "3. Cleanup (Optional)..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Uncomment to delete test data
# if ($medicalHistoryId) {
#     Write-Host "3.1 Deleting Medical History..." -ForegroundColor Green
#     try {
#         Invoke-RestMethod -Uri "$baseUrl/patient-service/medical-histories/$medicalHistoryId" -Method Delete -Headers $headers
#         Write-Host "   [OK] Deleted Medical History" -ForegroundColor Green
#     } catch {
#         Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
#     }
# }
#
# if ($patientId) {
#     Write-Host "3.2 Deleting Patient..." -ForegroundColor Green
#     try {
#         Invoke-RestMethod -Uri "$baseUrl/patient-service/patients/$patientId" -Method Delete -Headers $headers
#         Write-Host "   [OK] Deleted Patient" -ForegroundColor Green
#     } catch {
#         Write-Host "   [ERROR] $($_.Exception.Message)" -ForegroundColor Red
#     }
# }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Script Completed!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan


