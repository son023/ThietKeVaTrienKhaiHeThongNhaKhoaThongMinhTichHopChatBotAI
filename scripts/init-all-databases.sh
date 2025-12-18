#!/bin/bash
set -e

# Create all databases
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "user-service";
    CREATE DATABASE "patient-service";
    CREATE DATABASE "doctor-service";
    CREATE DATABASE "appointment-service";
    CREATE DATABASE "payment-service";
    CREATE DATABASE "labtest-service";
    CREATE DATABASE "invoice-service";
    CREATE DATABASE "inventory-service";
    CREATE DATABASE "insurance-service";
    CREATE DATABASE "clinical-service";
    CREATE DATABASE "prescription-service";
    CREATE DATABASE "notification-service";
EOSQL

# Run schema scripts for each database (only if file exists)
if [ -f /scripts/user-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "user-service" -f /scripts/user-service.sql
fi

if [ -f /scripts/patient-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "patient-service" -f /scripts/patient-service.sql
fi

if [ -f /scripts/doctor-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "doctor-service" -f /scripts/doctor-service.sql
fi

if [ -f /scripts/appointment-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "appointment-service" -f /scripts/appointment-service.sql
fi

if [ -f /scripts/payment-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "payment-service" -f /scripts/payment-service.sql
fi

if [ -f /scripts/labtest-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "labtest-service" -f /scripts/labtest-service.sql
fi

if [ -f /scripts/invoice-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "invoice-service" -f /scripts/invoice-service.sql
fi

if [ -f /scripts/inventory-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "inventory-service" -f /scripts/inventory-service.sql
fi

if [ -f /scripts/insurance-service.sql ]; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "insurance-service" -f /scripts/insurance-service.sql
fi

