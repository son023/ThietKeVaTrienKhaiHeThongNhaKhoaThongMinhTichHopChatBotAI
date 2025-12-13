
DROP TABLE IF EXISTS claim_document CASCADE;
DROP TABLE IF EXISTS claim_item CASCADE;
DROP TABLE IF EXISTS insurance_claim CASCADE;
DROP TABLE IF EXISTS patient_insurance CASCADE;
DROP TABLE IF EXISTS bhyt_catalogue CASCADE;
DROP TABLE IF EXISTS insurance_policy CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: insurance_policy
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_policy
(
    id              UUID         NOT NULL,
    coverage_amount INTEGER,
    create_at       TIMESTAMP,
    deductible      INTEGER,
    end_date        DATE,
    policy_number   VARCHAR(255) NOT NULL,
    policy_type     VARCHAR(255),
    start_date      DATE,
    status          VARCHAR(255),
    update_at       TIMESTAMP,

-- Khóa chính
    CONSTRAINT insurance_policy_pkey PRIMARY KEY (id),
    -- Ràng buộc duy nhất
    CONSTRAINT uk_policy_number UNIQUE (policy_number)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: bhyt_catalogue
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bhyt_catalogue
(
    id                  UUID NOT NULL,
    is_covered          BOOLEAN,
    max_coverage_amount INTEGER,
    service_code        VARCHAR(50),
    service_name        VARCHAR(255),
    service_type        VARCHAR(50),

    -- Khóa chính
    CONSTRAINT bhyt_catalogue_pkey PRIMARY KEY (id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 3: patient_insurance
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_insurance
(
    id                  UUID NOT NULL,
    create_at           TIMESTAMP,
    expiry_date         DATE,
    issue_date          DATE,
    patient_id          UUID NOT NULL,
    status              VARCHAR(255),
    update_at           TIMESTAMP,
    insurance_policy_id UUID,

    -- Khóa chính
    CONSTRAINT patient_insurance_pkey PRIMARY KEY (id),
    -- Ràng buộc duy nhất
    CONSTRAINT uk_patient_id UNIQUE (patient_id),

    -- Khóa ngoại
    CONSTRAINT fk_patient_insurance_policy
    FOREIGN KEY (insurance_policy_id)
    REFERENCES public.insurance_policy (id)
    ON DELETE CASCADE
    );

---

-- ---------------------------------------------------------------------
-- Bảng 4: insurance_claim
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_claim
(
    id                   UUID NOT NULL,
    approval_date        TIMESTAMP,
    claim_date           TIMESTAMP,
    create_at            TIMESTAMP,
    notes                TEXT,
    patient_pay_amount   INTEGER,
    status               VARCHAR(255),
    total_claim_amount   INTEGER,
    total_insurance_pay  INTEGER,
    update_at            TIMESTAMP,
    patient_insurance_id UUID,

    -- Khóa chính
    CONSTRAINT insurance_claim_pkey PRIMARY KEY (id),

    -- Khóa ngoại
    CONSTRAINT fk_claim_patient_insurance
    FOREIGN KEY (patient_insurance_id)
    REFERENCES public.patient_insurance (id)
    ON DELETE CASCADE
    );

---

-- ---------------------------------------------------------------------
-- Bảng 5: claim_item
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claim_item
(
    id                   UUID NOT NULL,
    insurance_pay_amount INTEGER,
    insurance_pay_ratio  REAL,
    patient_pay_amount   INTEGER,
    quantity             INTEGER,
    total_amount         INTEGER,
    unit_price           INTEGER,
    bhyt_catalogue_id    UUID,
    insurance_claim_id   UUID,

    -- Khóa chính
    CONSTRAINT claim_item_pkey PRIMARY KEY (id),

    -- Khóa ngoại 1
    CONSTRAINT fk_item_claim
    FOREIGN KEY (insurance_claim_id)
    REFERENCES public.insurance_claim (id)
    ON DELETE CASCADE,

    -- Khóa ngoại 2
    CONSTRAINT fk_item_catalogue
    FOREIGN KEY (bhyt_catalogue_id)
    REFERENCES public.bhyt_catalogue (id)
    ON DELETE SET NULL
    );

---

-- ---------------------------------------------------------------------
-- Bảng 6: claim_document
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.claim_document
(
    id                 UUID NOT NULL,
    document_type      VARCHAR(255),
    file_path          VARCHAR(255),
    status             VARCHAR(255),
    upload_at          TIMESTAMP,
    insurance_claim_id UUID,

    -- Khóa chính
    CONSTRAINT claim_document_pkey PRIMARY KEY (id),

    -- Khóa ngoại
    CONSTRAINT fk_document_claim
    FOREIGN KEY (insurance_claim_id)
    REFERENCES public.insurance_claim (id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Tạo Index
-- ---------------------------------------------------------------------
CREATE INDEX idx_patient_insurance_policy_id ON public.patient_insurance (insurance_policy_id);
CREATE INDEX idx_claim_patient_insurance_id ON public.insurance_claim (patient_insurance_id);
CREATE INDEX idx_item_claim_id ON public.claim_item (insurance_claim_id);
CREATE INDEX idx_item_catalogue_id ON public.claim_item (bhyt_catalogue_id);
CREATE INDEX idx_document_claim_id ON public.claim_document (insurance_claim_id);


-- =====================================================================
-- INSERT DATA (Dữ liệu mẫu)
-- =====================================================================

-- 1. Insert Insurance Policy
INSERT INTO public.insurance_policy
(coverage_amount, deductible, end_date, start_date, create_at, update_at, id, policy_number, policy_type, status)
VALUES
    (95, 2000000, '2026-01-01', '2025-01-01', NULL, NULL, 'a1a1a1a1-1111-4111-8111-111111111111', 'PVI-GOLD-2025', 'Gold', 'ACTIVE'),
    (80, 1000000, '2026-01-01', '2025-01-01', NULL, NULL, 'b2b2b2b2-2222-4222-8222-222222222222', 'BAOVIET-SILVER-2025', 'Silver', 'ACTIVE'),
    (100, 0, '2026-12-31', '2024-01-01', '2025-11-23 08:51:04.15516+00', '2025-11-23 08:51:04.15516+00', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'POL-2025-TEST', 'FULL', 'ACTIVE');


-- 2. Insert Bhyt Catalogue
INSERT INTO public.bhyt_catalogue
(is_covered, max_coverage_amount, id, service_code, service_type, service_name)
VALUES
    (true, 10000, '5473aed8-4c33-48b4-a01e-415e3ce75bd6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MEDICINE', 'Paracetamol BHYT'),
    (true, 20000, '59ae9a49-8d32-41ee-bcb7-c5da19ffc01d', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'MEDICINE', 'Amoxicillin BHYT'),
    (true, 30000, 'f5f5f5f5-5555-4555-8555-555555555555', 'f5f5f5f5-5555-4555-8555-555555555556', 'DENTAL', 'Nhổ răng khôn'),
    (true, 40000, 'f6f6f6f6-6666-4666-8666-666666666666', 'f6f6f6f6-6666-4666-8666-666666666667', 'DENTAL', 'Trám răng composite');


-- 3. Insert Patient Insurance
INSERT INTO public.patient_insurance
(expiry_date, issue_date, create_at, update_at, id, insurance_policy_id, patient_id, status)
VALUES
    ('2026-02-15', '2025-02-15', NULL, NULL, 'c3c3c3c3-3333-4333-8333-333333333333', 'a1a1a1a1-1111-4111-8111-111111111111', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'ACTIVE'),
    ('2026-12-31', '2024-01-01', '2025-11-23 08:51:39.841424+00', '2025-11-23 08:51:39.841424+00', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'ACTIVE');

