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
    id          UUID         NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
    );

DO $$
DECLARE
    -- Định nghĩa Role IDs cố định
admin_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000001';
    doctor_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000002';
    patient_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000003';
    pharmacist_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000004';
    recept_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000006'; -- ID Lễ tân

    -- Định nghĩa User IDs cố định
    user_admin CONSTANT UUID := 'd903022a-1000-4001-8001-000000000001';
    user_doc_hieu CONSTANT UUID := 'd903022a-1000-4001-8001-000000000002';
    user_doc_mai CONSTANT UUID := 'd903022a-1000-4001-8001-000000000007';
    user_pat_an CONSTANT UUID := 'd903022a-1000-4001-8001-000000000003';
    user_pat_minh CONSTANT UUID := 'd903022a-1000-4001-8001-000000000008';
    user_pharma_hoa CONSTANT UUID := 'd903022a-1000-4001-8001-000000000004';
    user_recept_linh CONSTANT UUID := 'd903022a-1000-4001-8001-000000000006';

BEGIN

INSERT INTO role (id, role_name) VALUES
('00000000-0000-0000-0000-000000000001', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'PATIENT'),
('00000000-0000-0000-0000-000000000003', 'DOCTOR'),
('00000000-0000-0000-0000-000000000004', 'RECEPTIONIST'),
('00000000-0000-0000-0000-000000000005', 'PHARMACIST'),
('00000000-0000-0000-0000-000000000006', 'LAB_TECHNICIAN');

-- =========================================================
-- 2) USER
-- =========================================================
INSERT INTO users (id, password, email, phone, full_name, is_active, create_at, update_at) VALUES
('00000000-0000-0000-0000-000000000101', '12345678', 'mai.pham01@gmail.com', '0900000001', 'Phạm Thị Ngọc Mai', 'true', '2025-11-20 08:10:00', '2025-12-10 09:15:00'),
('00000000-0000-0000-0000-000000000102', '12345678', 'tuan.le02@gmail.com',    '0900000002', 'Lê Anh Tuấn',     'true', '2025-11-21 10:00:00', '2025-12-11 14:00:00'),
('00000000-0000-0000-0000-000000000103', '12345678', 'linh.tran03@gmail.com',  '0900000003', 'Trần Thị Linh',   'true', '2025-11-22 09:30:00', '2025-12-12 11:20:00'),

('00000000-0000-0000-0000-000000000201', '12345678', 'dr.hung.pham@gmail.com', '0900000004', 'Phạm Quang Hùng', 'true', '2025-10-10 08:00:00', '2025-12-10 08:30:00'),
('00000000-0000-0000-0000-000000000202', '12345678', 'dr.ha.nguyen@gmail.com', '0900000005', 'Nguyễn Thu Hà',   'true', '2025-10-12 08:00:00', '2025-12-10 08:35:00'),

('00000000-0000-0000-0000-000000000301', '12345678', 'thu.recep@gmail.com',    '0900000006', 'Đặng Minh Thu',   'true', '2025-09-01 08:00:00', '2025-12-10 09:00:00'),

('00000000-0000-0000-0000-000000000401', '12345678', 'khoa.pharm@gmail.com',   '0900000007', 'Vũ Quốc Khoa',    'true', '2025-09-05 08:00:00', '2025-12-10 09:05:00'),
('00000000-0000-0000-0000-000000000501', '12345678', 'vy.lab@gmail.com',       '0900000008', 'Phan Bảo Vy',     'true', '2025-09-07 08:00:00', '2025-12-10 09:10:00');

-- =========================================================
-- 3) USER_ROLE
-- =========================================================
INSERT INTO user_role (id, user_id, role_id) VALUES
('00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000001003', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000001004', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000001005', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000003'),
('00000000-0000-0000-0000-000000001006', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000001007', '00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000001008', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000006');

END $$;
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