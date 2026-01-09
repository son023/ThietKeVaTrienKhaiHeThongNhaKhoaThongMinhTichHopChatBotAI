CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DROP TABLE IF EXISTS medical_attachment CASCADE;
DROP TABLE IF EXISTS lab_test CASCADE;
DROP TABLE IF EXISTS lab_test_type CASCADE;
DROP TABLE IF EXISTS lab_technician CASCADE;

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
    appointment_id     UUID,
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

    structure_json     TEXT,

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

-- =========================================================
-- 1) LAB_TECHNICIAN (3 người)
-- =========================================================
INSERT INTO lab_technician (user_id, license_number)
VALUES 
('00000000-0000-0000-0000-000000000501', 'KTV-RHM-001234'),
('00000000-0000-0000-0000-000000000502', 'KTV-RHM-005678'),
('00000000-0000-0000-0000-000000000503', 'KTV-RHM-009012');

-- =========================================================
-- 2) LAB_TEST_TYPE (Các loại xét nghiệm nha khoa)
-- =========================================================
INSERT INTO lab_test_type (id, name, description)
VALUES
-- Xét nghiệm máu cơ bản
('50000000-0000-0000-0000-000000000001', 'Công thức máu (CBC)', 'Xét nghiệm số lượng hồng cầu, bạch cầu, tiểu cầu'),
('50000000-0000-0000-0000-000000000002', 'Đông máu (PT, APTT)', 'Xét nghiệm thời gian đông máu trước phẫu thuật'),
('50000000-0000-0000-0000-000000000003', 'Glucose máu', 'Xét nghiệm đường huyết đối với bệnh nhân tiểu đường'),

-- Xét nghiệm sinh hóa
('50000000-0000-0000-0000-000000000004', 'Chức năng gan (AST, ALT)', 'Xét nghiệm men gan'),
('50000000-0000-0000-0000-000000000005', 'Chức năng thận (Creatinine, Urea)', 'Xét nghiệm chức năng thận'),
('50000000-0000-0000-0000-000000000006', 'Điện giải đồ (Na, K, Cl)', 'Xét nghiệm điện giải máu'),

-- Xét nghiệm vi sinh
('50000000-0000-0000-0000-000000000007', 'Cấy khuẩn răng miệng', 'Xác định vi khuẩn gây nhiễm trùng răng miệng'),
('50000000-0000-0000-0000-000000000008', 'Kháng sinh đồ', 'Xác định kháng sinh nhạy cảm với vi khuẩn'),

-- Xét nghiệm miễn dịch
('50000000-0000-0000-0000-000000000009', 'HBsAg (Viêm gan B)', 'Sàng lọc viêm gan B'),
('50000000-0000-0000-0000-000000000010', 'Anti-HCV (Viêm gan C)', 'Sàng lọc viêm gan C'),
('50000000-0000-0000-0000-000000000011', 'HIV Rapid Test', 'Sàng lọc HIV'),

-- Xét nghiệm chẩn đoán hình ảnh
('50000000-0000-0000-0000-000000000012', 'X-quang Panorama', 'Chụp phim toàn cảnh răng hàm mặt'),
('50000000-0000-0000-0000-000000000013', 'X-quang Periapical', 'Chụp phim quanh chóp răng'),
('50000000-0000-0000-0000-000000000014', 'X-quang Cephalometric', 'Chụp phim sọ nghiêng cho chỉnh nha'),
('50000000-0000-0000-0000-000000000015', 'CBCT (Cone Beam CT)', 'Chụp CT cone beam 3D cho Implant'),

-- Xét nghiệm mô bệnh học
('50000000-0000-0000-0000-000000000016', 'Sinh thiết mô mềm', 'Xét nghiệm mô học tổn thương niêm mạc miệng'),
('50000000-0000-0000-0000-000000000017', 'Sinh thiết mô xương hàm', 'Xét nghiệm mô học tổn thương xương hàm'),

-- Xét nghiệm khác
('50000000-0000-0000-0000-000000000018', 'Test dị ứng thuốc', 'Test dị ứng với các loại thuốc nha khoa'),
('50000000-0000-0000-0000-000000000019', 'Test dị ứng vật liệu', 'Test dị ứng với vật liệu nha khoa (latex, acrylic, nickel)'),
('50000000-0000-0000-0000-000000000020', 'Nước bọt pH Test', 'Đo pH nước bọt đánh giá nguy cơ sâu răng');

-- LƯU Ý: Không thêm bản ghi lab_test và medical_attachment theo yêu cầu

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
