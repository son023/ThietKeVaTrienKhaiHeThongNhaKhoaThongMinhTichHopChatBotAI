
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

    CONSTRAINT insurance_policy_pkey PRIMARY KEY (id),
    CONSTRAINT uk_policy_number UNIQUE (policy_number)
    );

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

    CONSTRAINT bhyt_catalogue_pkey PRIMARY KEY (id)
    );

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

    CONSTRAINT patient_insurance_pkey PRIMARY KEY (id),
    CONSTRAINT uk_patient_id UNIQUE (patient_id),

    CONSTRAINT fk_patient_insurance_policy
    FOREIGN KEY (insurance_policy_id)
    REFERENCES public.insurance_policy (id)
    ON DELETE CASCADE
    );

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

    CONSTRAINT insurance_claim_pkey PRIMARY KEY (id),

    CONSTRAINT fk_claim_patient_insurance
    FOREIGN KEY (patient_insurance_id)
    REFERENCES public.patient_insurance (id)
    ON DELETE CASCADE
    );

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

    CONSTRAINT claim_item_pkey PRIMARY KEY (id),

    CONSTRAINT fk_item_claim
    FOREIGN KEY (insurance_claim_id)
    REFERENCES public.insurance_claim (id)
    ON DELETE CASCADE,

    CONSTRAINT fk_item_catalogue
    FOREIGN KEY (bhyt_catalogue_id)
    REFERENCES public.bhyt_catalogue (id)
    ON DELETE SET NULL
    );

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

    CONSTRAINT claim_document_pkey PRIMARY KEY (id),

    CONSTRAINT fk_document_claim
    FOREIGN KEY (insurance_claim_id)
    REFERENCES public.insurance_claim (id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_patient_insurance_policy_id ON public.patient_insurance (insurance_policy_id);
CREATE INDEX idx_claim_patient_insurance_id ON public.insurance_claim (patient_insurance_id);
CREATE INDEX idx_item_claim_id ON public.claim_item (insurance_claim_id);
CREATE INDEX idx_item_catalogue_id ON public.claim_item (bhyt_catalogue_id);
CREATE INDEX idx_document_claim_id ON public.claim_document (insurance_claim_id);

-- =========================================================
-- INSERT DATA
-- =========================================================

-- =========================================================
-- 1) INSURANCE_POLICY
-- =========================================================
INSERT INTO public.insurance_policy (id, policy_number, policy_type, coverage_amount, deductible, start_date, end_date, status, create_at, update_at)
VALUES
('a1a1a1a1-1111-4111-8111-111111111111', 'BHYT-2026-GOLD', 'BHYT', 80, 0, '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-01 08:00:00+07', '2025-12-01 08:00:00+07'),
('b2b2b2b2-2222-4222-8222-222222222222', 'BHYT-2026-STANDARD', 'BHYT', 80, 0, '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-01 08:00:00+07', '2025-12-01 08:00:00+07'),
('c3c3c3c3-3333-4333-8333-333333333333', 'BHYT-2026-BASIC', 'BHYT', 80, 0, '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-01 08:00:00+07', '2025-12-01 08:00:00+07');

-- =========================================================
-- 2) BHYT_CATALOGUE
-- Tạo catalogue cho Medical Services, Lab Test Types, và Medicines
-- =========================================================

-- BHYT cho Medical Services (service_code = medical_service_id, type = MEDICAL_SERVICE)
INSERT INTO public.bhyt_catalogue (id, service_code, service_name, service_type, is_covered, max_coverage_amount)
VALUES
-- Các dịch vụ cơ bản được BHYT chi trả
('bb000000-0000-0000-0000-000000000013', '33000000-0000-0000-0000-000000000013', 'Nhổ răng', 'MEDICAL_SERVICE', true, 1000000),
('bb000000-0000-0000-0000-000000000014', '33000000-0000-0000-0000-000000000014', 'Điều trị tủy răng', 'MEDICAL_SERVICE', true, 800000),
('bb000000-0000-0000-0000-000000000018', '33000000-0000-0000-0000-000000000018', 'Hàn răng', 'MEDICAL_SERVICE', true, 250000),
('bb000000-0000-0000-0000-000000000019', '33000000-0000-0000-0000-000000000019', 'Lấy cao răng', 'MEDICAL_SERVICE', true, 200000),
('bb000000-0000-0000-0000-000000000020', '33000000-0000-0000-0000-000000000020', 'Chụp phim Xquang', 'MEDICAL_SERVICE', true, 80000);

-- BHYT cho Lab Test Types (service_code = lab_test_type_id, type = LAB_TEST)
INSERT INTO public.bhyt_catalogue (id, service_code, service_name, service_type, is_covered, max_coverage_amount)
VALUES
('bb000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Công thức máu (CBC)', 'LAB_TEST', true, 150000),
('bb000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002', 'Đông máu (PT, APTT)', 'LAB_TEST', true, 200000),
('bb000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'Glucose máu', 'LAB_TEST', true, 50000),
('bb000000-0000-0000-0000-000000000012', '50000000-0000-0000-0000-000000000012', 'X-quang Panorama', 'LAB_TEST', true, 100000),
('bb000000-0000-0000-0000-000000000021', '50000000-0000-0000-0000-000000000013', 'X-quang Periapical', 'LAB_TEST', true, 50000);

-- BHYT cho Medicines (service_code = medicine_id, type = MEDICINE)
INSERT INTO public.bhyt_catalogue (id, service_code, service_name, service_type, is_covered, max_coverage_amount)
VALUES
('bb000000-0000-0000-0000-000000000101', 'aaaa0000-0000-0000-0000-000000000001', 'Amoxicillin 500mg', 'MEDICINE', true, 2500),
('bb000000-0000-0000-0000-000000000102', 'aaaa0000-0000-0000-0000-000000000002', 'Augmentin 625mg', 'MEDICINE', true, 7000),
('bb000000-0000-0000-0000-000000000103', 'aaaa0000-0000-0000-0000-000000000003', 'Azithromycin 250mg', 'MEDICINE', true, 4500),
('bb000000-0000-0000-0000-000000000104', 'aaaa0000-0000-0000-0000-000000000004', 'Metronidazole 250mg', 'MEDICINE', true, 1800),
('bb000000-0000-0000-0000-000000000105', 'aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg', 'MEDICINE', true, 800),
('bb000000-0000-0000-0000-000000000106', 'aaaa0000-0000-0000-0000-000000000006', 'Ibuprofen 400mg', 'MEDICINE', true, 3000),
('bb000000-0000-0000-0000-000000000109', 'aaaa0000-0000-0000-0000-000000000009', 'Omeprazole 20mg', 'MEDICINE', true, 2500),
('bb000000-0000-0000-0000-000000000110', 'aaaa0000-0000-0000-0000-000000000010', 'Esomeprazole 40mg', 'MEDICINE', true, 4500),
('bb000000-0000-0000-0000-000000000113', 'aaaa0000-0000-0000-0000-000000000013', 'Prednisolone 5mg', 'MEDICINE', true, 2200),
('bb000000-0000-0000-0000-000000000117', 'aaaa0000-0000-0000-0000-000000000017', 'Vitamin C 500mg', 'MEDICINE', true, 1200);

-- =========================================================
-- 3) PATIENT_INSURANCE
-- Giả sử 5 bệnh nhân có BHYT
-- =========================================================
INSERT INTO public.patient_insurance (id, patient_id, insurance_policy_id, issue_date, expiry_date, status, create_at, update_at)
VALUES
('c1c1c1c1-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000101', 'a1a1a1a1-1111-4111-8111-111111111111', '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-20 08:00:00+07', '2025-12-20 08:00:00+07'),
('c1c1c1c1-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000102', 'b2b2b2b2-2222-4222-8222-222222222222', '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-20 08:00:00+07', '2025-12-20 08:00:00+07'),
('c1c1c1c1-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000103', 'c3c3c3c3-3333-4333-8333-333333333333', '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-20 08:00:00+07', '2025-12-20 08:00:00+07'),
('c1c1c1c1-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000106', 'a1a1a1a1-1111-4111-8111-111111111111', '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-20 08:00:00+07', '2025-12-20 08:00:00+07'),
('c1c1c1c1-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000108', 'b2b2b2b2-2222-4222-8222-222222222222', '2026-01-01', '2026-12-31', 'ACTIVE', '2025-12-20 08:00:00+07', '2025-12-20 08:00:00+07');

-- =========================================================
-- 4) INSURANCE_CLAIM
-- Tạo claim cho các lịch khám có BHYT
-- =========================================================
-- Giả sử các lịch khám có claim: 101, 102, 104, 106, 108, 115, 116
INSERT INTO public.insurance_claim (id, patient_insurance_id, claim_date, approval_date, status, total_claim_amount, total_insurance_pay, patient_pay_amount, notes, create_at, update_at)
VALUES
-- Claim cho appointment 101 (Patient 101 - trám răng)
('d1d1d1d1-1111-1111-1111-111111111101', 'c1c1c1c1-1111-1111-1111-111111111101', '2026-01-05 09:30:00+07', '2026-01-05 10:00:00+07', 'APPROVED', 350000, 280000, 70000, 'Đã duyệt BHYT cho trám răng', '2026-01-05 09:35:00+07', '2026-01-05 10:00:00+07'),

-- Claim cho appointment 102 (Patient 101 - cạo vôi răng)
('d1d1d1d1-1111-1111-1111-111111111102', 'c1c1c1c1-1111-1111-1111-111111111101', '2026-01-12 11:00:00+07', '2026-01-12 11:30:00+07', 'APPROVED', 350000, 200000, 150000, 'BHYT chi trả một phần cạo vôi răng', '2026-01-12 11:05:00+07', '2026-01-12 11:30:00+07'),

-- Claim cho appointment 104 (Patient 102 - điều trị tủy)
('d1d1d1d1-1111-1111-1111-111111111104', 'c1c1c1c1-1111-1111-1111-111111111102', '2026-01-06 11:00:00+07', '2026-01-06 12:00:00+07', 'APPROVED', 1200000, 800000, 400000, 'BHYT chi trả điều trị tủy và thuốc', '2026-01-06 11:05:00+07', '2026-01-06 12:00:00+07'),

-- Claim cho appointment 106 (Patient 103 - nhổ răng khôn)
('d1d1d1d1-1111-1111-1111-111111111106', 'c1c1c1c1-1111-1111-1111-111111111103', '2026-01-07 09:00:00+07', '2026-01-07 09:30:00+07', 'APPROVED', 1500000, 1000000, 500000, 'BHYT chi trả nhổ răng và một phần thuốc', '2026-01-07 09:05:00+07', '2026-01-07 09:30:00+07'),

-- Claim cho appointment 108 (Patient 103 - trám răng)
('d1d1d1d1-1111-1111-1111-111111111108', 'c1c1c1c1-1111-1111-1111-111111111103', '2026-01-22 10:30:00+07', '2026-01-22 11:00:00+07', 'APPROVED', 350000, 250000, 100000, 'BHYT chi trả trám răng', '2026-01-22 10:35:00+07', '2026-01-22 11:00:00+07'),

-- Claim cho appointment 115 (Patient 108 - trám răng)
('d1d1d1d1-1111-1111-1111-111111111115', 'c1c1c1c1-1111-1111-1111-111111111105', '2026-01-13 08:30:00+07', '2026-01-13 09:00:00+07', 'APPROVED', 350000, 250000, 100000, 'BHYT chi trả trám răng', '2026-01-13 08:35:00+07', '2026-01-13 09:00:00+07'),

-- Claim cho appointment 116 (Patient 108 - điều trị tủy)
('d1d1d1d1-1111-1111-1111-111111111116', 'c1c1c1c1-1111-1111-1111-111111111105', '2026-01-18 16:00:00+07', '2026-01-18 16:30:00+07', 'APPROVED', 1200000, 800000, 400000, 'BHYT chi trả điều trị tủy và thuốc', '2026-01-18 16:05:00+07', '2026-01-18 16:30:00+07');

-- =========================================================
-- 5) CLAIM_ITEM
-- =========================================================
-- Claim 101 items
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111101', 'd1d1d1d1-1111-1111-1111-111111111101', 'bb000000-0000-0000-0000-000000000018', 1, 350000, 350000, 0.8, 280000, 70000);

-- Claim 102 items
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111102', 'd1d1d1d1-1111-1111-1111-111111111102', 'bb000000-0000-0000-0000-000000000019', 1, 350000, 350000, 0.57, 200000, 150000);

-- Claim 104 items (điều trị tủy + thuốc)
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111104', 'd1d1d1d1-1111-1111-1111-111111111104', 'bb000000-0000-0000-0000-000000000014', 1, 1200000, 1200000, 0.67, 800000, 400000),
-- Thuốc Amoxicillin
('e1e1e1e1-1111-1111-1111-111111111105', 'd1d1d1d1-1111-1111-1111-111111111104', 'bb000000-0000-0000-0000-000000000101', 15, 3000, 45000, 0.8, 36000, 9000),
-- Thuốc Ibuprofen
('e1e1e1e1-1111-1111-1111-111111111106', 'd1d1d1d1-1111-1111-1111-111111111104', 'bb000000-0000-0000-0000-000000000106', 15, 3500, 52500, 0.8, 42000, 10500),
-- Thuốc Omeprazole
('e1e1e1e1-1111-1111-1111-111111111107', 'd1d1d1d1-1111-1111-1111-111111111104', 'bb000000-0000-0000-0000-000000000109', 10, 3000, 30000, 0.8, 24000, 6000);

-- Claim 106 items (nhổ răng + thuốc)
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111108', 'd1d1d1d1-1111-1111-1111-111111111106', 'bb000000-0000-0000-0000-000000000013', 1, 1500000, 1500000, 0.67, 1000000, 500000),
-- Thuốc Augmentin
('e1e1e1e1-1111-1111-1111-111111111109', 'd1d1d1d1-1111-1111-1111-111111111106', 'bb000000-0000-0000-0000-000000000102', 14, 8000, 112000, 0.8, 89600, 22400);

-- Claim 108 items
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111110', 'd1d1d1d1-1111-1111-1111-111111111108', 'bb000000-0000-0000-0000-000000000018', 1, 350000, 350000, 0.71, 250000, 100000);

-- Claim 115 items
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111111', 'd1d1d1d1-1111-1111-1111-111111111115', 'bb000000-0000-0000-0000-000000000018', 1, 350000, 350000, 0.71, 250000, 100000);

-- Claim 116 items (điều trị tủy + thuốc)
INSERT INTO public.claim_item (id, insurance_claim_id, bhyt_catalogue_id, quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount)
VALUES
('e1e1e1e1-1111-1111-1111-111111111112', 'd1d1d1d1-1111-1111-1111-111111111116', 'bb000000-0000-0000-0000-000000000014', 1, 1200000, 1200000, 0.67, 800000, 400000),
-- Thuốc Amoxicillin
('e1e1e1e1-1111-1111-1111-111111111113', 'd1d1d1d1-1111-1111-1111-111111111116', 'bb000000-0000-0000-0000-000000000101', 21, 3000, 63000, 0.8, 50400, 12600),
-- Thuốc Ibuprofen
('e1e1e1e1-1111-1111-1111-111111111114', 'd1d1d1d1-1111-1111-1111-111111111116', 'bb000000-0000-0000-0000-000000000106', 15, 3500, 52500, 0.8, 42000, 10500),
-- Thuốc Omeprazole
('e1e1e1e1-1111-1111-1111-111111111115', 'd1d1d1d1-1111-1111-1111-111111111116', 'bb000000-0000-0000-0000-000000000109', 14, 3000, 42000, 0.8, 33600, 8400);

-- =========================================================
-- AXON FRAMEWORK TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS public.token_entry
(
    processor_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    segment integer NOT NULL,
    owner character varying(255) COLLATE pg_catalog."default",
    "timestamp" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token oid,
    token_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT token_entry_pkey PRIMARY KEY (processor_name, segment)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.saga_entry
(
    saga_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    revision character varying(255) COLLATE pg_catalog."default",
    saga_type character varying(255) COLLATE pg_catalog."default",
    serialized_saga oid,
    CONSTRAINT saga_entry_pkey PRIMARY KEY (saga_id)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.dead_letter_entry
(
    dead_letter_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    cause_message character varying(1023) COLLATE pg_catalog."default",
    cause_type character varying(255) COLLATE pg_catalog."default",
    diagnostics oid,
    enqueued_at timestamp(6) with time zone NOT NULL,
    last_touched timestamp(6) with time zone,
    aggregate_identifier character varying(255) COLLATE pg_catalog."default",
    event_identifier character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    meta_data oid,
    payload oid NOT NULL,
    payload_revision character varying(255) COLLATE pg_catalog."default",
    payload_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sequence_number bigint,
    time_stamp character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token oid,
    token_type character varying(255) COLLATE pg_catalog."default",
    type character varying(255) COLLATE pg_catalog."default",
    processing_group character varying(255) COLLATE pg_catalog."default" NOT NULL,
    processing_started timestamp(6) with time zone,
    sequence_identifier character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sequence_index bigint NOT NULL,
    CONSTRAINT dead_letter_entry_pkey PRIMARY KEY (dead_letter_id),
    CONSTRAINT ukhlr8io86j74qy298xf720n16v UNIQUE (processing_group, sequence_identifier, sequence_index)
)

TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS idxe67wcx5fiq9hl4y4qkhlcj9cg
    ON public.dead_letter_entry USING btree
    (processing_group COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idxrwucpgs6sn93ldgoeh2q9k6bn
    ON public.dead_letter_entry USING btree
    (processing_group COLLATE pg_catalog."default" ASC NULLS LAST, sequence_identifier COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.association_value_entry
(
    id bigint NOT NULL,
    association_key character varying(255) COLLATE pg_catalog."default" NOT NULL,
    association_value character varying(255) COLLATE pg_catalog."default",
    saga_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    saga_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT association_value_entry_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS idxgv5k1v2mh6frxuy5c0hgbau94
    ON public.association_value_entry USING btree
    (saga_id COLLATE pg_catalog."default" ASC NULLS LAST, saga_type COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idxk45eqnxkgd8hpdn6xixn8sgft
    ON public.association_value_entry USING btree
    (saga_type COLLATE pg_catalog."default" ASC NULLS LAST, association_key COLLATE pg_catalog."default" ASC NULLS LAST, association_value COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
