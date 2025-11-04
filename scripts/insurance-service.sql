CREATE TABLE insurance_policy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_number VARCHAR(255) UNIQUE NOT NULL,
    policy_type VARCHAR(255),
    coverage_amount INT,
    deductible INT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID UNIQUE NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    status VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now(),
    insurance_policy_id UUID REFERENCES insurance_policy(id) -- Khóa ngoại
);
CREATE TABLE insurance_claim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_amount INT,
    approved_amount INT,
    status VARCHAR(255),
    claim_date TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    notes VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now(),
    patient_insurance_id UUID REFERENCES patient_insurance(id) -- Khóa ngoại
);
CREATE TABLE claim_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path VARCHAR(255),
    document_type VARCHAR(255),
    status VARCHAR(255),
    upload_at TIMESTAMPTZ,
    insurance_claim_id UUID REFERENCES insurance_claim(id) -- Khóa ngoại
);

INSERT INTO insurance_policy (id, policy_number, policy_type, coverage_amount, deductible, start_date, end_date, status)
VALUES
('a1a1a1a1-1111-4111-8111-111111111111', 'PVI-GOLD-2025', 'Gold', 100000000, 2000000, '2025-01-01', '2026-01-01', 'ACTIVE'),
('b2b2b2b2-2222-4222-8222-222222222222', 'BAOVIET-SILVER-2025', 'Silver', 50000000, 1000000, '2025-01-01', '2026-01-01', 'ACTIVE');
INSERT INTO patient_insurance (id, patient_id, issue_date, expiry_date, status, insurance_policy_id)
VALUES
('c3c3c3c3-3333-4333-8333-333333333333', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '2025-02-15', '2026-02-15', 'ACTIVE', 'a1a1a1a1-1111-4111-8111-111111111111');
INSERT INTO insurance_claim (id, claim_amount, approved_amount, status, claim_date, notes, patient_insurance_id)
VALUES
('d4d4d4d4-4444-4444-8444-444444444444', 3500000, 0, 'PENDING', '2025-06-10T09:00:00Z', 'Yêu cầu bồi thường chi phí khám răng', 'c3c3c3c3-3333-4333-8333-333333333333');
INSERT INTO claim_document (file_path, document_type, status, upload_at, insurance_claim_id)
VALUES
('/uploads/claims/hoa_don.pdf', 'INVOICE', 'UPLOADED', '2025-06-10T09:05:00Z', 'd4d4d4d4-4444-4444-8444-444444444444'),
('/uploads/claims/don_thuoc.jpg', 'PRESCRIPTION', 'UPLOADED', '2025-06-10T09:06:00Z', 'd4d4d4d4-4444-4444-8444-444444444444');