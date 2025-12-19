#!/usr/bin/env bash
create_database() {
    local db_name=$1
    echo "[INFO] Creating database: $db_name"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "CREATE DATABASE \"$db_name\";" 2>&1
    if [ $? -eq 0 ]; then
        echo "[SUCCESS] Database '$db_name' created successfully"
    else
        echo "[WARN] Database '$db_name' might already exist or creation failed (continuing...)"
    fi
}

run_sql_script() {
    local service_name=$1
    local db_name=$2
    local script_path=$3
    
    if [ -f "$script_path" ]; then
        echo ""
        echo "----------------------------------------"
        echo "[INFO] Processing service: $service_name"
        echo "[INFO] Database: $db_name"
        echo "[INFO] Running script: $script_path"
        echo "----------------------------------------"
        
        # Run script and capture exit code, but don't stop on error
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db_name" -f "$script_path" 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo "[SUCCESS] Script executed successfully for $service_name"
            echo "[INFO] Tables created in '$db_name':"
            psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db_name" -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>/dev/null | sed 's/^[[:space:]]*//' | grep -v '^$' | while read table; do
                if [ ! -z "$table" ]; then
                    echo "  ✓ $table"
                fi
            done
        else
            echo "[ERROR] Failed to execute script for $service_name (exit code: $exit_code)"
            echo "[WARN] Continuing with next service..."
        fi
    else
        echo "[WARN] Script file not found: $script_path (skipping $service_name)"
    fi
}

# Create all databases
echo ""
echo "=========================================="
echo "Step 1: Creating databases..."
echo "=========================================="

create_database "user-service"
create_database "patient-service"
create_database "doctor-service"
create_database "appointment-service"
create_database "payment-service"
create_database "labtest-service"
create_database "invoice-service"
create_database "inventory-service"
create_database "insurance-service"
create_database "clinical-service"
create_database "prescription-service"
create_database "notification-service"

echo ""
echo "=========================================="
echo "Step 2: Running SQL scripts..."
echo "=========================================="

run_sql_script "user-service" "user-service" "/scripts/user-service.sql"
run_sql_script "patient-service" "patient-service" "/scripts/patient-service.sql"
run_sql_script "doctor-service" "doctor-service" "/scripts/doctor-service.sql"
run_sql_script "appointment-service" "appointment-service" "/scripts/appointment-service.sql"
run_sql_script "payment-service" "payment-service" "/scripts/payment-service.sql"
run_sql_script "labtest-service" "labtest-service" "/scripts/labtest-service.sql"
run_sql_script "invoice-service" "invoice-service" "/scripts/invoice-service.sql"
run_sql_script "inventory-service" "inventory-service" "/scripts/inventory-service.sql"
run_sql_script "insurance-service" "insurance-service" "/scripts/insurance-service.sql"
run_sql_script "prescription" "prescription" "/scripts/axon.sql"
echo ""
echo "=========================================="
echo "Database initialization completed!"
echo "=========================================="