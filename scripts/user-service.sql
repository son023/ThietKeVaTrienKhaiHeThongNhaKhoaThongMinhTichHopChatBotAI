DROP TABLE IF EXISTS user_role CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    image_url VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

CREATE TABLE IF NOT EXISTS role (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE
    );

CREATE TABLE IF NOT EXISTS user_role (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
    );

-- =========================================================
-- 1) ROLES
-- =========================================================
INSERT INTO role (id, role_name) VALUES
('00000000-0000-0000-0000-000000000001', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'PATIENT'),
('00000000-0000-0000-0000-000000000003', 'DOCTOR'),
('00000000-0000-0000-0000-000000000004', 'RECEPTIONIST'),
('00000000-0000-0000-0000-000000000005', 'PHARMACIST'),
('00000000-0000-0000-0000-000000000006', 'LAB_TECHNICIAN');

-- =========================================================
-- 2) USERS
-- =========================================================

-- ADMIN (1 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000001', '$2a$10$N9qo8uLOickgx2ZMRZoMy.bIynm67a/NYMX4KcPVqAqXsVvTLKaGa', 'admin@clinic.com', '0900000000', 'System Admin', true, '2025-01-01 08:00:00+07', '2025-01-01 08:00:00+07');

-- RECEPTIONIST (3 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000301', '12345678', 'thu.recep@clinic.com', '0900000301', 'Đặng Minh Thu', true, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
('00000000-0000-0000-0000-000000000302', '12345678', 'linh.recep@clinic.com', '0900000302', 'Trần Bảo Linh', true, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07'),
('00000000-0000-0000-0000-000000000303', '12345678', 'hoa.recep@clinic.com', '0900000303', 'Nguyễn Thu Hoa', true, '2025-01-05 08:00:00+07', '2025-01-05 08:00:00+07');

-- LAB_TECHNICIAN (3 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000501', '12345678', 'vy.lab@clinic.com', '0900000501', 'Phan Bảo Vy', true, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07'),
('00000000-0000-0000-0000-000000000502', '12345678', 'nam.lab@clinic.com', '0900000502', 'Lê Hoàng Nam', true, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07'),
('00000000-0000-0000-0000-000000000503', '12345678', 'tuan.lab@clinic.com', '0900000503', 'Võ Anh Tuấn', true, '2025-01-10 08:00:00+07', '2025-01-10 08:00:00+07');

-- PHARMACIST (3 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000401', '12345678', 'khoa.pharm@clinic.com', '0900000401', 'Vũ Quốc Khoa', true, '2025-01-08 08:00:00+07', '2025-01-08 08:00:00+07'),
('00000000-0000-0000-0000-000000000402', '12345678', 'hien.pharm@clinic.com', '0900000402', 'Đỗ Thị Hiền', true, '2025-01-08 08:00:00+07', '2025-01-08 08:00:00+07'),
('00000000-0000-0000-0000-000000000403', '12345678', 'long.pharm@clinic.com', '0900000403', 'Phạm Thành Long', true, '2025-01-08 08:00:00+07', '2025-01-08 08:00:00+07');

-- DOCTOR (5 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000201', '12345678', 'dr.hung.pham@clinic.com', '0900000201', 'Bác sĩ Phạm Quang Hùng', true, '2024-12-01 08:00:00+07', '2024-12-01 08:00:00+07'),
('00000000-0000-0000-0000-000000000202', '12345678', 'dr.ha.nguyen@clinic.com', '0900000202', 'Bác sĩ Nguyễn Thu Hà', true, '2024-12-01 08:00:00+07', '2024-12-01 08:00:00+07'),
('00000000-0000-0000-0000-000000000203', '12345678', 'dr.minh.tran@clinic.com', '0900000203', 'Bác sĩ Trần Văn Minh', true, '2024-12-01 08:00:00+07', '2024-12-01 08:00:00+07'),
('00000000-0000-0000-0000-000000000204', '12345678', 'dr.linh.le@clinic.com', '0900000204', 'Bác sĩ Lê Thị Linh', true, '2024-12-01 08:00:00+07', '2024-12-01 08:00:00+07'),
('00000000-0000-0000-0000-000000000205', '12345678', 'dr.khang.vo@clinic.com', '0900000205', 'Bác sĩ Võ Đức Khang', true, '2024-12-01 08:00:00+07', '2024-12-01 08:00:00+07');

-- PATIENT (10 người)
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000101', '12345678', 'mai.pham01@gmail.com', '0900000101', 'Phạm Thị Ngọc Mai', true, '2025-11-20 08:10:00+07', '2025-12-10 09:15:00+07'),
('00000000-0000-0000-0000-000000000102', '12345678', 'tuan.le02@gmail.com', '0900000102', 'Lê Anh Tuấn', true, '2025-11-21 10:00:00+07', '2025-12-11 14:00:00+07'),
('00000000-0000-0000-0000-000000000103', '12345678', 'linh.tran03@gmail.com', '0900000103', 'Trần Thị Linh', true, '2025-11-22 09:30:00+07', '2025-12-12 11:20:00+07'),
('00000000-0000-0000-0000-000000000104', '12345678', 'hieu.nguyen04@gmail.com', '0900000104', 'Nguyễn Trung Hiếu', true, '2025-11-23 08:20:00+07', '2025-12-13 10:30:00+07'),
('00000000-0000-0000-0000-000000000105', '12345678', 'thao.pham05@gmail.com', '0900000105', 'Phạm Thu Thảo', true, '2025-11-24 09:00:00+07', '2025-12-14 11:00:00+07'),
('00000000-0000-0000-0000-000000000106', '12345678', 'duc.tran06@gmail.com', '0900000106', 'Trần Minh Đức', true, '2025-11-25 10:15:00+07', '2025-12-15 12:20:00+07'),
('00000000-0000-0000-0000-000000000107', '12345678', 'hoa.le07@gmail.com', '0900000107', 'Lê Thu Hoa', true, '2025-11-26 11:30:00+07', '2025-12-16 13:40:00+07'),
('00000000-0000-0000-0000-000000000108', '12345678', 'khanh.vo08@gmail.com', '0900000108', 'Võ Minh Khánh', true, '2025-11-27 12:45:00+07', '2025-12-17 14:50:00+07'),
('00000000-0000-0000-0000-000000000109', '12345678', 'my.do09@gmail.com', '0900000109', 'Đỗ Thanh Mỹ', true, '2025-11-28 13:00:00+07', '2025-12-18 15:10:00+07'),
('00000000-0000-0000-0000-000000000110', '12345678', 'quan.hoang10@gmail.com', '0900000110', 'Hoàng Minh Quân', true, '2025-11-29 14:20:00+07', '2025-12-19 16:30:00+07');

-- =========================================================
-- 3) USER_ROLE
-- =========================================================
-- Admin
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001');

-- Receptionist (3)
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000004');

-- Lab Technician (3)
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000006'),
('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000006');

-- Pharmacist (3)
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000005');

-- Doctor (5)
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000003');

-- Patient (10)
INSERT INTO user_role (user_id, role_id) VALUES
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000002');

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
