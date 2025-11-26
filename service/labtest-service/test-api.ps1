# LabTest Service API Test Script
# PowerShell script to test all LabTest Service APIs
# Set UTF-8 encoding for proper Vietnamese character handling
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Add System.Web for URL encoding
Add-Type -AssemblyName System.Web

$baseUrl = "http://localhost:8088"
$token = "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwOTgxMDcyNzczIiwiZnVsbF9uYW1lIjoiTmd1eWVuIFZhbiBTb24iLCJ1c2VyX2lkIjoiNTJkZGQ1NGQtNGM2My00NzE5LWJiZDAtZGFhNDE5N2NjNDMyIiwicGhvbmUiOiIwOTgxMDcyNzczIiwicHJpbWFyeV9yb2xlIjoiUEFUSUVOVCIsInJvbGVzIjpbIlBBVElFTlQiXSwiaXNzIjoiZGV2IiwiZXhwIjoxNzY0MTMzMDQ5LCJpYXQiOjE3NjQwNDY2NDksImp0aSI6ImJiOGQ0MThjLWE5YWQtNGFjMi05YjA2LTI2NTE2YzRlZDdjMiJ9.bz3wT7wQVapP-ZSWvEF7A8KMCaL0N0LupvvIPZW41H-D8MtRilDzDC9yU-NK4gQ-GosTIxdXErOqLbXScYUuLbihhlibla3Cn8RCYC6Et-teg1L6ImuhBYrGpC0FLYGGCd3qHJRnHlaIwl1Yx5kCZLK9DQxu35fU7_slkhzgF5QUlAlunTC94Z8cGo5H0Tw4hF5L86ReD_YT9BY5biQeqTLoHsEQg-4xToNR87izwdskUNnnxpe6SNhKEWv9sbJftqjH62vb3hs0l8mWr_61GkWWtE2Cq7jyauiGt1XVpVgrdsn-IJwPdwK9r5wMSqNR1a192sd6MwxHLsGq89DtMg"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Variables to store created IDs for testing
$labTestTypeId = $null
$labTechnicianId = $null
$labTestId = $null
$medicalAttachmentId = $null

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "LabTest Service API Test Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# 1. LAB TEST TYPE APIs
# ============================================
Write-Host "1. Testing Lab Test Type APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# 1.1 Create Lab Test Type
Write-Host "1.1 Creating Lab Test Type..." -ForegroundColor Green
$labTestTypeBody = @'
{"name":"Xét nghiệm Huyết học","description":"Phân tích tế bào máu ngoại vi, đếm hồng cầu, bạch cầu, tiểu cầu"}
'@

try {
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($labTestTypeBody)
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types" -Method Post -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
    $labTestTypeId = $response.id
    Write-Host "   [OK] Created Lab Test Type with ID: $labTestTypeId" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    # Try to get existing lab test type if create failed
    try {
        $allTypes = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types" -Method Get -Headers $headers
        if ($allTypes.Count -gt 0) {
            $labTestTypeId = $allTypes[0].id
            Write-Host "   [INFO] Using existing Lab Test Type ID: $labTestTypeId" -ForegroundColor Yellow
        }
    } catch {
        # Ignore
    }
}
Write-Host ""

# 1.2 Get All Lab Test Types
Write-Host "1.2 Getting All Lab Test Types..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab test types" -ForegroundColor Green
    # If we don't have labTestTypeId yet, use the first one
    if (-not $labTestTypeId -and $response.Count -gt 0) {
        $labTestTypeId = $response[0].id
        Write-Host "   [INFO] Using Lab Test Type ID: $labTestTypeId" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 1.3 Get Lab Test Type By ID
if ($labTestTypeId) {
    Write-Host "1.3 Getting Lab Test Type By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types/$labTestTypeId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Lab Test Type: $($response.name)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 1.4 Search Lab Test Type By Name
Write-Host "1.4 Searching Lab Test Type By Name..." -ForegroundColor Green
try {
    $searchTerm = [System.Web.HttpUtility]::UrlEncode("Huyết")
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types/search?name=$searchTerm" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab test types matching 'Huyết'" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 1.5 Update Lab Test Type
if ($labTestTypeId) {
    Write-Host "1.5 Updating Lab Test Type..." -ForegroundColor Green
    $updateBody = @'
{"name":"Xét nghiệm Huyết học (Updated)","description":"Phân tích tế bào máu ngoại vi - Updated description"}
'@
    
    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($updateBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-test-types/$labTestTypeId" -Method Put -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        Write-Host "   [OK] Updated Lab Test Type" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# 2. LAB TECHNICIAN APIs
# ============================================
Write-Host "2. Testing Lab Technician APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# 2.1 Create Lab Technician
Write-Host "2.1 Creating Lab Technician..." -ForegroundColor Green
$labTechnicianBody = @{
    userId = "52ddd54d-4c63-4719-bbd0-daa4197cc432"
    licenseNumber = "LCN-KTV-001"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-technicians" -Method Post -Headers $headers -Body $labTechnicianBody
    $labTechnicianId = $response.userId
    Write-Host "   [OK] Created Lab Technician with User ID: $labTechnicianId" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    # If already exists, use the existing ID
    $labTechnicianId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
}
Write-Host ""

# 2.2 Get All Lab Technicians
Write-Host "2.2 Getting All Lab Technicians..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-technicians" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab technicians" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 2.3 Get Lab Technician By ID
if ($labTechnicianId) {
    Write-Host "2.3 Getting Lab Technician By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-technicians/$labTechnicianId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Lab Technician: $($response.licenseNumber)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 2.4 Update Lab Technician
if ($labTechnicianId) {
    Write-Host "2.4 Updating Lab Technician..." -ForegroundColor Green
    $updateBody = @{
        userId = $labTechnicianId
        licenseNumber = "LCN-KTV-001-UPDATED"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-technicians/$labTechnicianId" -Method Put -Headers $headers -Body $updateBody
        Write-Host "   [OK] Updated Lab Technician" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# 3. LAB TEST APIs
# ============================================
Write-Host "3. Testing Lab Test APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# 3.1 Create Lab Test
Write-Host "3.1 Creating Lab Test..." -ForegroundColor Green
if ($labTestTypeId -and $labTechnicianId) {
    $structureJsonObj = @{
        WBC = $null
        RBC = $null
        HGB = $null
        HCT = $null
    }
    $structureJsonString = $structureJsonObj | ConvertTo-Json -Compress
    $labTestBodyObj = @{
        medicalHistoryId = "550e8400-e29b-41d4-a716-446655440000"
        doctorId = "660e8400-e29b-41d4-a716-446655440001"
        labTechnicianId = $labTechnicianId
        labTestTypeId = $labTestTypeId
        price = 250000
        status = "PENDING"
        instructions = "Nhin an 8 tieng truoc khi xet nghiem"
        abnormalFlag = ""
        units = "K/uL"
        structureJson = $structureJsonString
        referenceRange = 'WBC (4-10 K/uL), RBC (4.5-5.5 M/uL)'
    }
    $labTestBody = $labTestBodyObj | ConvertTo-Json -Compress
    
    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($labTestBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests" -Method Post -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        $labTestId = $response.id
        Write-Host "   [OK] Created Lab Test with ID: $labTestId" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   [DETAIL] Response: $responseBody" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   [SKIP] Skipping - Need Lab Test Type and Lab Technician IDs" -ForegroundColor Yellow
}
Write-Host ""

# 3.2 Get All Lab Tests
Write-Host "3.2 Getting All Lab Tests..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab tests" -ForegroundColor Green
    if ($response.Count -gt 0 -and -not $labTestId) {
        $labTestId = $response[0].id
    }
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3.3 Get Lab Test By ID
if ($labTestId) {
    Write-Host "3.3 Getting Lab Test By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/$labTestId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Lab Test: $($response.status)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 3.4 Get Lab Tests By Doctor ID
Write-Host "3.4 Getting Lab Tests By Doctor ID..." -ForegroundColor Green
try {
    $doctorId = "660e8400-e29b-41d4-a716-446655440001"
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/doctor/$doctorId" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab tests for doctor" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3.5 Get Lab Tests By Technician ID
if ($labTechnicianId) {
    Write-Host "3.5 Getting Lab Tests By Technician ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/technician/$labTechnicianId" -Method Get -Headers $headers
        Write-Host "   [OK] Found $($response.Count) lab tests for technician" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 3.6 Get Lab Tests By Status
Write-Host "3.6 Getting Lab Tests By Status..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/status/PENDING" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) lab tests with status PENDING" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3.7 Update Lab Test
if ($labTestId) {
    Write-Host "3.7 Updating Lab Test..." -ForegroundColor Green
    $resultDateStr = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    $structureJsonObj = @{
        WBC = 12.5
        RBC = 4.8
        HGB = 14.5
        HCT = 45.0
    }
    $structureJsonString = $structureJsonObj | ConvertTo-Json -Compress
    $updateBodyObj = @{
        medicalHistoryId = "550e8400-e29b-41d4-a716-446655440000"
        doctorId = "660e8400-e29b-41d4-a716-446655440001"
        labTechnicianId = $labTechnicianId
        labTestTypeId = $labTestTypeId
        price = 300000
        status = "COMPLETED"
        resultDate = $resultDateStr
        instructions = "Nhin an 8 tieng - Updated"
        abnormalFlag = "WBC_HIGH"
        units = "K/uL"
        structureJson = $structureJsonString
        referenceRange = 'WBC (4-10 K/uL)'
    }
    $updateBody = $updateBodyObj | ConvertTo-Json -Compress
    
    try {
        $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($updateBody)
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/$labTestId" -Method Put -Headers $headers -Body $bodyBytes -ContentType "application/json; charset=utf-8"
        Write-Host "   [OK] Updated Lab Test" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "   [DETAIL] Response: $responseBody" -ForegroundColor Yellow
        }
    }
    Write-Host ""
}

# ============================================
# 4. MEDICAL ATTACHMENT APIs
# ============================================
Write-Host "4. Testing Medical Attachment APIs..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# 4.1 Create Medical Attachment
Write-Host "4.1 Creating Medical Attachment..." -ForegroundColor Green
if ($labTestId) {
    $attachmentBody = @{
        labTestId = $labTestId
        filePath = "/uploads/reports/2025/huyet_hoc_001.pdf"
        type = "application/pdf"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments" -Method Post -Headers $headers -Body $attachmentBody
        $medicalAttachmentId = $response.id
        Write-Host "   [OK] Created Medical Attachment with ID: $medicalAttachmentId" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "   [SKIP] Skipping - Need Lab Test ID" -ForegroundColor Yellow
}
Write-Host ""

# 4.2 Get All Medical Attachments
Write-Host "4.2 Getting All Medical Attachments..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) medical attachments" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4.3 Get Medical Attachment By ID
if ($medicalAttachmentId) {
    Write-Host "4.3 Getting Medical Attachment By ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments/$medicalAttachmentId" -Method Get -Headers $headers
        Write-Host "   [OK] Retrieved Medical Attachment: $($response.type)" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 4.4 Get Medical Attachments By Lab Test ID
if ($labTestId) {
    Write-Host "4.4 Getting Medical Attachments By Lab Test ID..." -ForegroundColor Green
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments/labtest/$labTestId" -Method Get -Headers $headers
        Write-Host "   [OK] Found $($response.Count) medical attachments for lab test" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# 4.5 Search Medical Attachments By Type
Write-Host "4.5 Searching Medical Attachments By Type..." -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments/search?type=pdf" -Method Get -Headers $headers
    Write-Host "   [OK] Found $($response.Count) medical attachments with type containing 'pdf'" -ForegroundColor Green
} catch {
    Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 4.6 Update Medical Attachment
if ($medicalAttachmentId) {
    Write-Host "4.6 Updating Medical Attachment..." -ForegroundColor Green
    $updateBody = @{
        labTestId = $labTestId
        filePath = "/uploads/reports/2025/huyet_hoc_001_updated.pdf"
        type = "application/pdf"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments/$medicalAttachmentId" -Method Put -Headers $headers -Body $updateBody
        Write-Host "   [OK] Updated Medical Attachment" -ForegroundColor Green
    } catch {
        Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# CLEANUP (Optional - Comment out if you want to keep test data)
# ============================================
Write-Host "5. Cleanup (Optional)..." -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Uncomment the following lines if you want to delete test data
# if ($medicalAttachmentId) {
#     Write-Host "5.1 Deleting Medical Attachment..." -ForegroundColor Green
#     try {
#         Invoke-RestMethod -Uri "$baseUrl/labtest-service/medical-attachments/$medicalAttachmentId" -Method Delete -Headers $headers
#         Write-Host "   [OK] Deleted Medical Attachment" -ForegroundColor Green
#     } catch {
#         Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
#     }
# }

# if ($labTestId) {
#     Write-Host "5.2 Deleting Lab Test..." -ForegroundColor Green
#     try {
#         Invoke-RestMethod -Uri "$baseUrl/labtest-service/lab-tests/$labTestId" -Method Delete -Headers $headers
#         Write-Host "   [OK] Deleted Lab Test" -ForegroundColor Green
#     } catch {
#         Write-Host "   [ERROR] Error: $($_.Exception.Message)" -ForegroundColor Red
#     }
# }

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Script Completed!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

