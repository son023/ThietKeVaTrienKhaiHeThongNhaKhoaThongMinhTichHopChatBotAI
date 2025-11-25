CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE lab_technician (
    user_id        UUID PRIMARY KEY,
    license_number VARCHAR(100)
);

CREATE TABLE lab_test_type (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE lab_test (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    medical_history_id UUID,
    doctor_id          UUID,

    lab_technician_id  UUID,
    lab_test_type_id   UUID,

    price              INTEGER NOT NULL,
    status             VARCHAR(50),
    result_date        TIMESTAMPTZ,

    instructions       VARCHAR(255),
    abnormal_flag      VARCHAR(255),
    units              VARCHAR(50),
    reference_range    VARCHAR(255),

    structure_json     VARCHAR(255),

    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_lab_test_type
        FOREIGN KEY (lab_test_type_id)
        REFERENCES lab_test_type (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_lab_test_lab_technician
        FOREIGN KEY (lab_technician_id)
        REFERENCES lab_technician (user_id)
        ON DELETE SET NULL
);

CREATE TABLE medical_attachment (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_test_id UUID NOT NULL,
    file_path   VARCHAR(500),
    type        VARCHAR(50),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_medical_attachment_lab_test
        FOREIGN KEY (lab_test_id)
        REFERENCES lab_test (id)
        ON DELETE CASCADE
);

CREATE INDEX idx_lab_test_type ON lab_test(lab_test_type_id);
CREATE INDEX idx_lab_test_technician ON lab_test(lab_technician_id);
CREATE INDEX idx_attachment_test ON medical_attachment(lab_test_id);

WITH InsertTechnician AS (
    INSERT INTO lab_technician (user_id, license_number)
    VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'LCN-KTV-001') -- ID KTV cố định
    RETURNING user_id AS tech_id
),
InsertTypeBlood AS (
    INSERT INTO lab_test_type (name, description)
    VALUES ('Huyết học', 'Phân tích tế bào máu ngoại vi')
    RETURNING id AS type_blood_id
),
InsertTypeLiver AS (
    INSERT INTO lab_test_type (name, description)
    VALUES ('Chức năng Gan', 'Đánh giá men gan (AST, ALT)')
    RETURNING id AS type_liver_id
)
,
InsertLabTestBlood AS (
    INSERT INTO lab_test (
        id, medical_history_id, doctor_id, lab_technician_id, lab_test_type_id,
        price, status, result_date, instructions, units, structure_json, abnormal_flag, reference_range
    )
    SELECT
        'b1c1d1e1-1f2f-3000-4444-555566667777', -- ID Phiếu XN 1 cố định
        gen_random_uuid(), -- ID Lịch sử Y tế giả lập
        gen_random_uuid(), -- ID Bác sĩ giả lập
        (SELECT tech_id FROM InsertTechnician),
        (SELECT type_blood_id FROM InsertTypeBlood),
        250000,
        'COMPLETED',
        NOW() - INTERVAL '3 days',
        'Nhịn ăn 8 tiếng',
        'K/uL',
        '{"WBC": 12.5, "RBC": 4.8, "HGB": 14.5, "HCT": 45.0}',
        'WBC_HIGH',
        'WBC (4-10 K/uL)'
    RETURNING id AS test_blood_id
)
INSERT INTO medical_attachment (lab_test_id, file_path, type)
SELECT
    (SELECT test_blood_id FROM InsertLabTestBlood),
    '/uploads/reports/2025/huyoet_hoc_001.pdf',
    'application/pdf'
;