# scripts/get-ngrok-url.ps1
# Script PowerShell để lấy public URL từ ngrok API

Write-Host "Waiting for ngrok to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxRetries = 30
$retryCount = 0

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction SilentlyContinue
        
        if ($response.tunnels -and $response.tunnels.Count -gt 0) {
            # Tìm tunnel có tên payment-service hoặc lấy tunnel đầu tiên
            $tunnel = $response.tunnels | Where-Object { $_.name -eq "payment-service" } | Select-Object -First 1
            if (-not $tunnel) {
                $tunnel = $response.tunnels[0]
            }
            
            $publicUrl = $tunnel.public_url
            
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host "Ngrok Public URL: $publicUrl" -ForegroundColor Green
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Webhook URL for PayOS:" -ForegroundColor Cyan
            Write-Host "$publicUrl/api/payments/webhook/payos" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "==========================================" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
    } catch {
        # Ignore errors and retry
    }
    
    $retryCount++
    Write-Host "Waiting for ngrok... ($retryCount/$maxRetries)" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

Write-Host "❌ Failed to get ngrok URL after $maxRetries retries" -ForegroundColor Red
exit 1

