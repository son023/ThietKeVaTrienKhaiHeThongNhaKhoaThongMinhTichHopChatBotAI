CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DROP TABLE IF EXISTS public.appointment_medical_service CASCADE;
DROP TABLE IF EXISTS public.appointment CASCADE;
DROP TABLE IF EXISTS public.medical_service CASCADE;

CREATE TABLE public.medical_service
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    price        REAL NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_time INTEGER NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    status       VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT medical_service_status_check
    CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE public.appointment
(
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id          UUID NOT NULL, -- Tham chiếu tới Doctor Service
    patient_id         UUID NOT NULL, -- Tham chiếu tới Patient Service (KHÔNG CÓ FK CỨNG)
    appointment_start_time TIMESTAMPTZ NOT NULL,
    appointment_end_time   TIMESTAMPTZ NOT NULL,
    status             VARCHAR(50) NOT NULL,
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT appointment_status_check
    CHECK (status IN ('CHECKED', 'CONFIRMED', 'CANCELLED', 'FAILED','PROGRESSING'))
);

CREATE TABLE public.appointment_medical_service
(
    appointment_id     UUID NOT NULL,
    medical_service_id UUID NOT NULL,

    CONSTRAINT appointment_medical_service_pkey PRIMARY KEY (appointment_id, medical_service_id),

    CONSTRAINT fk_ams_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id)
    ON DELETE CASCADE,

    CONSTRAINT fk_ams_medical_service
    FOREIGN KEY (medical_service_id)
    REFERENCES public.medical_service (id)
    ON DELETE RESTRICT
);

INSERT INTO public.medical_service (id, price, service_name, service_time, service_type, status)
VALUES
    ('33333333-0000-0000-0000-000000000001', 150000.50, 'Khám Nội Tổng Quát', 30, 'Consultation', 'ACTIVE'),
    ('33333333-0000-0000-0000-000000000002', 80000.00, 'Lấy mẫu xét nghiệm máu', 15, 'Testing', 'ACTIVE'),
    ('33333333-0000-0000-0000-000000000003', 50000.00, 'Tư vấn dinh dưỡng', 45, 'Consultation', 'ACTIVE');

    -- Lịch hẹn 1: Đã xác nhận (CONFIRMED)
    INSERT INTO public.appointment (id, doctor_id, patient_id, appointment_start_time, appointment_end_time, status)
    VALUES (
        '44444444-0000-0000-0000-000000000001', -- ID Lịch hẹn 1
        '99999999-0000-0000-0000-000000000001',
        '11111111-0000-0000-0000-000000000001',
        NOW() + INTERVAL '1 hour',
        NOW() + INTERVAL '1 hour 30 minutes',
        'CONFIRMED'
    );

    -- Lịch hẹn 2: Đang chờ (PENDING)
    INSERT INTO public.appointment (id, doctor_id, patient_id, appointment_start_time, appointment_end_time, status)
    VALUES (
        '44444444-0000-0000-0000-000000000002', -- ID Lịch hẹn 2
        '99999999-0000-0000-0000-000000000002',
        '22222222-0000-0000-0000-000000000002',
        NOW() + INTERVAL '3 days 10 hours',
        NOW() + INTERVAL '3 days 10 hours 45 minutes',
        'PROGRESSING'
    );

INSERT INTO public.appointment_medical_service (appointment_id, medical_service_id)
VALUES
    -- Dịch vụ 1 & 2 cho Lịch hẹn 1
    ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001'), -- Khám Nội TQ
    ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002'), -- Xét nghiệm máu

    -- Dịch vụ 3 cho Lịch hẹn 2
    ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000003'); -- Tư vấn dinh dưỡng