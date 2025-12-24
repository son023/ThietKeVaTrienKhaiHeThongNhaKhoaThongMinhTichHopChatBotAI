$Databases = @(
    "user-service",
    "patient-service",
    "doctor-service",
    "appointment-service",
    "payment-service",
    "labtest-service",
    "invoice-service",
    "inventory-service",
    "insurance-service",
    "clinical-service",
    "prescription-service",
    "notification-service"
)

Write-Host "--- START RESET AXON ---"

foreach ($DB in $Databases) {

    $CheckSql = "SELECT 1 FROM information_schema.tables WHERE table_name='token_entry';"

    $hasAxon = docker exec -i postgres psql -U postgres -d $DB -t -c $CheckSql 2>$null

    if (-not $hasAxon -or -not $hasAxon.Trim()) {
        Write-Host "$DB : No Axon tables -> Skip"
        continue
    }

    Write-Host "$DB : Resetting Axon..."

    $TruncateSql = "TRUNCATE TABLE token_entry, saga_entry, association_value_entry, dead_letter_entry CASCADE;"

    docker exec -i postgres psql -U postgres -d $DB -c $TruncateSql 2>$null | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Done"
    } else {
        Write-Host "  Error"
    }
}

Write-Host "--- RESET AXON FINISHED ---"
