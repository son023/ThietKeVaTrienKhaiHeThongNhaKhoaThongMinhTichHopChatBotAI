DROP TABLE IF EXISTS claim_item CASCADE;
DROP TABLE IF EXISTS bhyt_catalogue CASCADE;

DROP TABLE IF EXISTS claim_document CASCADE;
DROP TABLE IF EXISTS insurance_claim CASCADE;

DROP TABLE IF EXISTS patient_insurance CASCADE;
DROP TABLE IF EXISTS insurance_policy CASCADE;

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
    status VARCHAR(255),
    claim_date TIMESTAMPTZ,
    approval_date TIMESTAMPTZ,
    notes VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now(),

    patient_pay_amount INT,    -- Số tiền bệnh nhân phải trả
    total_claim_amount INT,    -- Tổng số tiền yêu cầu bồi thường
    total_insurance_pay INT,   -- Tổng số tiền bảo hiểm trả

    patient_insurance_id UUID REFERENCES patient_insurance(id)
);
CREATE TABLE claim_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_path VARCHAR(255),
    document_type VARCHAR(255),
    status VARCHAR(255),
    upload_at TIMESTAMPTZ,
    insurance_claim_id UUID REFERENCES insurance_claim(id)
);

CREATE TABLE bhyt_catalogue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(50),
    service_name VARCHAR(255),
    service_type VARCHAR(50),
    is_covered BOOLEAN,
    max_coverage_amount INT
);

CREATE TABLE claim_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INT,
    unit_price INT,
    total_amount INT,
    insurance_pay_ratio FLOAT,
    insurance_pay_amount INT,
    patient_pay_amount INT,
    insurance_claim_id UUID REFERENCES insurance_claim(id),
    bhyt_catalogue_id UUID REFERENCES bhyt_catalogue(id)
);

-- 1. Thêm chính sách
INSERT INTO insurance_policy (id, policy_number, policy_type, coverage_amount, deductible, start_date, end_date, status)
VALUES
('a1a1a1a1-1111-4111-8111-111111111111', 'PVI-GOLD-2025', 'Gold', 95, 2000000, '2025-01-01', '2026-01-01', 'ACTIVE'),
('b2b2b2b2-2222-4222-8222-222222222222', 'BAOVIET-SILVER-2025', 'Silver', 80, 1000000, '2025-01-01', '2026-01-01', 'ACTIVE');

-- 2. Thêm bảo hiểm bệnh nhân
INSERT INTO patient_insurance (id, patient_id, issue_date, expiry_date, status, insurance_policy_id)
VALUES
('c3c3c3c3-3333-4333-8333-333333333333', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', '2025-02-15', '2026-02-15', 'ACTIVE', 'a1a1a1a1-1111-4111-8111-111111111111');

-- 3. Thêm yêu cầu bồi thường (Cập nhật thêm các field tiền mới)
INSERT INTO insurance_claim (id, patient_pay_amount, total_claim_amount, total_insurance_pay, status, claim_date, notes, patient_insurance_id)
VALUES
('d4d4d4d4-4444-4444-8444-444444444444', 500000, 3500000, 3000000, 'PENDING', '2025-06-10T09:00:00Z', 'Yêu cầu bồi thường chi phí khám răng', 'c3c3c3c3-3333-4333-8333-333333333333');

-- 4. Thêm tài liệu
INSERT INTO claim_document (file_path, document_type, status, upload_at, insurance_claim_id)
VALUES
('/uploads/claims/hoa_don.pdf', 'INVOICE', 'UPLOADED', '2025-06-10T09:05:00Z', 'd4d4d4d4-4444-4444-8444-444444444444'),
('/uploads/claims/don_thuoc.jpg', 'PRESCRIPTION', 'UPLOADED', '2025-06-10T09:06:00Z', 'd4d4d4d4-4444-4444-8444-444444444444');

-- 5. Thêm danh mục BHYT (Dữ liệu mẫu)
INSERT INTO bhyt_catalogue (id, service_code, service_name, service_type, is_covered, max_coverage_amount)
VALUES
('f5f5f5f5-5555-4555-8555-555555555555', 'f5f5f5f5-5555-4555-8555-555555555556', 'Nhổ răng khôn', 'DENTAL', true, 200000000),
('f6f6f6f6-6666-4666-8666-666666666666', 'f6f6f6f6-6666-4666-8666-666666666667', 'Trám răng composite', 'DENTAL', true, 200000000);

-- 6. Thêm chi tiết claim (Claim Item)
-- Ví dụ: Claim 2 mục, 1 cái nhổ răng và 2 cái trám răng
INSERT INTO claim_item (quantity, unit_price, total_amount, insurance_pay_ratio, insurance_pay_amount, patient_pay_amount, insurance_claim_id, bhyt_catalogue_id)
VALUES
-- Item 1: Nhổ răng khôn
(1, 2500000, 2500000, 0.8, 2000000, 500000, 'd4d4d4d4-4444-4444-8444-444444444444', 'f5f5f5f5-5555-4555-8555-555555555555'),
-- Item 2: Trám răng
(2, 500000, 1000000, 1.0, 1000000, 0, 'd4d4d4d4-4444-4444-8444-444444444444', 'f6f6f6f6-6666-4666-8666-666666666666');
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