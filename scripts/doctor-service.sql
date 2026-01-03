DROP TABLE IF EXISTS doctor_work_schedule CASCADE;
DROP TABLE IF EXISTS doctor_degree CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: doctor
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor
(
    user_id                 UUID NOT NULL,
    consultation_fee_amount INTEGER,
    license_number          VARCHAR(100),
    specialization_code     VARCHAR(50) NOT NULL,
    working_hospital        VARCHAR(255),

    CONSTRAINT doctor_pkey PRIMARY KEY (user_id)
    );

-- ---------------------------------------------------------------------
-- Bảng 2: work_schedule
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_schedule
(
    id         UUID NOT NULL,
    end_time   TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    work_date  DATE,

    CONSTRAINT work_schedule_pkey PRIMARY KEY (id)
    );

-- ---------------------------------------------------------------------
-- Bảng 3: doctor_degree
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_degree
(
    id            UUID NOT NULL,
    degree_name   VARCHAR(255),
    institution   VARCHAR(255),
    year_obtained INTEGER,
    doctor_id     UUID NOT NULL,

    CONSTRAINT doctor_degree_pkey PRIMARY KEY (id),
    CONSTRAINT fk_doctor_degree_doctor
    FOREIGN KEY (doctor_id)
    REFERENCES public.doctor (user_id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Bảng 4: doctor_work_schedule
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_work_schedule
(
    id               UUID NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE,
    status           VARCHAR(255),
    updated_at       TIMESTAMP WITH TIME ZONE,
    doctor_id        UUID,
    work_schedule_id UUID,

    CONSTRAINT doctor_work_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT fk_dws_doctor
    FOREIGN KEY (doctor_id)
    REFERENCES public.doctor (user_id)
    ON DELETE CASCADE,
    CONSTRAINT fk_dws_work_schedule
    FOREIGN KEY (work_schedule_id)
    REFERENCES public.work_schedule (id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_doctor_degree_doctor_id ON public.doctor_degree (doctor_id);
CREATE INDEX idx_dws_doctor_id ON public.doctor_work_schedule (doctor_id);
CREATE INDEX idx_dws_work_schedule_id ON public.doctor_work_schedule (work_schedule_id);

-- =========================================================
-- INSERT DATA
-- =========================================================

-- =========================================================
-- 1) DOCTOR (5 bác sĩ)
-- =========================================================
INSERT INTO doctor (user_id, specialization_code, working_hospital, license_number, consultation_fee_amount) VALUES
('00000000-0000-0000-0000-000000000201', 'GEN', 'Bệnh viện Răng Hàm Mặt TP.HCM', 'BS-RHM-001234', 300000),
('00000000-0000-0000-0000-000000000202', 'PEDO', 'Bệnh viện Răng Hàm Mặt Trung ương', 'BS-RHM-005678', 350000),
('00000000-0000-0000-0000-000000000203', 'ENDO', 'Bệnh viện Răng Hàm Mặt Hà Nội', 'BS-RHM-009012', 320000),
('00000000-0000-0000-0000-000000000204', 'ORTHO', 'Phòng khám Răng Hàm Mặt Quốc tế', 'BS-RHM-003456', 400000),
('00000000-0000-0000-0000-000000000205', 'IMPL', 'Bệnh viện Răng Hàm Mặt TP.HCM', 'BS-RHM-007890', 450000);

-- =========================================================
-- 2) DOCTOR_DEGREE (Mỗi bác sĩ 1-2 bằng cấp)
-- =========================================================
INSERT INTO doctor_degree (id, degree_name, institution, year_obtained, doctor_id) VALUES
-- Doctor 201: 2 bằng
('20000000-0000-0000-0000-000000002001', 'Bác sĩ Răng Hàm Mặt', 'Đại học Y Dược TP.HCM', 2010, '00000000-0000-0000-0000-000000000201'),
('20000000-0000-0000-0000-000000002002', 'Chuyên khoa I Răng Hàm Mặt', 'Đại học Y Dược TP.HCM', 2015, '00000000-0000-0000-0000-000000000201'),

-- Doctor 202: 2 bằng
('20000000-0000-0000-0000-000000002003', 'Bác sĩ Răng Hàm Mặt', 'Đại học Y Hà Nội', 2012, '00000000-0000-0000-0000-000000000202'),
('20000000-0000-0000-0000-000000002004', 'Chuyên khoa II Nha khoa Trẻ em', 'Đại học Y Hà Nội', 2019, '00000000-0000-0000-0000-000000000202'),

-- Doctor 203: 2 bằng
('20000000-0000-0000-0000-000000002005', 'Bác sĩ Răng Hàm Mặt', 'Đại học Y Hải Phòng', 2011, '00000000-0000-0000-0000-000000000203'),
('20000000-0000-0000-0000-000000002006', 'Chứng chỉ Nội nha cao cấp', 'Viện Đào tạo RHM Quốc tế', 2017, '00000000-0000-0000-0000-000000000203'),

-- Doctor 204: 2 bằng
('20000000-0000-0000-0000-000000002007', 'Bác sĩ Răng Hàm Mặt', 'Đại học Y Dược TP.HCM', 2009, '00000000-0000-0000-0000-000000000204'),
('20000000-0000-0000-0000-000000002008', 'Thạc sĩ Chỉnh hình răng mặt', 'Đại học Y Dược TP.HCM', 2014, '00000000-0000-0000-0000-000000000204'),

-- Doctor 205: 2 bằng
('20000000-0000-0000-0000-000000002009', 'Bác sĩ Răng Hàm Mặt', 'Đại học Y Dược TP.HCM', 2008, '00000000-0000-0000-0000-000000000205'),
('20000000-0000-0000-0000-000000002010', 'Chứng chỉ Cấy ghép Implant cao cấp', 'American Academy of Implant Dentistry', 2016, '00000000-0000-0000-0000-000000000205');

-- =========================================================
-- 3) WORK_SCHEDULE (Thứ 2-7, 8h-17h, tháng 01/2026)
-- =========================================================
-- Tạo lịch làm việc từ 06/01/2026 đến 01/02/2026
-- Mỗi ngày: 8:00-12:00 và 13:00-17:00

-- Tuần 1: 06/01 - 11/01/2026 (Thứ 2 đến Thứ 7)
INSERT INTO work_schedule (id, work_date, start_time, end_time) VALUES
-- Thứ 2 (06/01)
('30000000-0000-0000-0000-000000003001', '2026-01-06', '2026-01-06 08:00:00+07', '2026-01-06 12:00:00+07'),
('30000000-0000-0000-0000-000000003002', '2026-01-06', '2026-01-06 13:00:00+07', '2026-01-06 17:00:00+07'),
-- Thứ 3 (07/01)
('30000000-0000-0000-0000-000000003003', '2026-01-07', '2026-01-07 08:00:00+07', '2026-01-07 12:00:00+07'),
('30000000-0000-0000-0000-000000003004', '2026-01-07', '2026-01-07 13:00:00+07', '2026-01-07 17:00:00+07'),
-- Thứ 4 (08/01)
('30000000-0000-0000-0000-000000003005', '2026-01-08', '2026-01-08 08:00:00+07', '2026-01-08 12:00:00+07'),
('30000000-0000-0000-0000-000000003006', '2026-01-08', '2026-01-08 13:00:00+07', '2026-01-08 17:00:00+07'),
-- Thứ 5 (09/01)
('30000000-0000-0000-0000-000000003007', '2026-01-09', '2026-01-09 08:00:00+07', '2026-01-09 12:00:00+07'),
('30000000-0000-0000-0000-000000003008', '2026-01-09', '2026-01-09 13:00:00+07', '2026-01-09 17:00:00+07'),
-- Thứ 6 (10/01)
('30000000-0000-0000-0000-000000003009', '2026-01-10', '2026-01-10 08:00:00+07', '2026-01-10 12:00:00+07'),
('30000000-0000-0000-0000-000000003010', '2026-01-10', '2026-01-10 13:00:00+07', '2026-01-10 17:00:00+07'),
-- Thứ 7 (11/01)
('30000000-0000-0000-0000-000000003011', '2026-01-11', '2026-01-11 08:00:00+07', '2026-01-11 12:00:00+07'),
('30000000-0000-0000-0000-000000003012', '2026-01-11', '2026-01-11 13:00:00+07', '2026-01-11 17:00:00+07'),

-- Tuần 2: 13/01 - 18/01/2026
-- Thứ 2 (13/01)
('30000000-0000-0000-0000-000000003013', '2026-01-13', '2026-01-13 08:00:00+07', '2026-01-13 12:00:00+07'),
('30000000-0000-0000-0000-000000003014', '2026-01-13', '2026-01-13 13:00:00+07', '2026-01-13 17:00:00+07'),
-- Thứ 3 (14/01)
('30000000-0000-0000-0000-000000003015', '2026-01-14', '2026-01-14 08:00:00+07', '2026-01-14 12:00:00+07'),
('30000000-0000-0000-0000-000000003016', '2026-01-14', '2026-01-14 13:00:00+07', '2026-01-14 17:00:00+07'),
-- Thứ 4 (15/01)
('30000000-0000-0000-0000-000000003017', '2026-01-15', '2026-01-15 08:00:00+07', '2026-01-15 12:00:00+07'),
('30000000-0000-0000-0000-000000003018', '2026-01-15', '2026-01-15 13:00:00+07', '2026-01-15 17:00:00+07'),
-- Thứ 5 (16/01)
('30000000-0000-0000-0000-000000003019', '2026-01-16', '2026-01-16 08:00:00+07', '2026-01-16 12:00:00+07'),
('30000000-0000-0000-0000-000000003020', '2026-01-16', '2026-01-16 13:00:00+07', '2026-01-16 17:00:00+07'),
-- Thứ 6 (17/01)
('30000000-0000-0000-0000-000000003021', '2026-01-17', '2026-01-17 08:00:00+07', '2026-01-17 12:00:00+07'),
('30000000-0000-0000-0000-000000003022', '2026-01-17', '2026-01-17 13:00:00+07', '2026-01-17 17:00:00+07'),
-- Thứ 7 (18/01)
('30000000-0000-0000-0000-000000003023', '2026-01-18', '2026-01-18 08:00:00+07', '2026-01-18 12:00:00+07'),
('30000000-0000-0000-0000-000000003024', '2026-01-18', '2026-01-18 13:00:00+07', '2026-01-18 17:00:00+07'),

-- Tuần 3: 20/01 - 25/01/2026
-- Thứ 2 (20/01)
('30000000-0000-0000-0000-000000003025', '2026-01-20', '2026-01-20 08:00:00+07', '2026-01-20 12:00:00+07'),
('30000000-0000-0000-0000-000000003026', '2026-01-20', '2026-01-20 13:00:00+07', '2026-01-20 17:00:00+07'),
-- Thứ 3 (21/01)
('30000000-0000-0000-0000-000000003027', '2026-01-21', '2026-01-21 08:00:00+07', '2026-01-21 12:00:00+07'),
('30000000-0000-0000-0000-000000003028', '2026-01-21', '2026-01-21 13:00:00+07', '2026-01-21 17:00:00+07'),
-- Thứ 4 (22/01)
('30000000-0000-0000-0000-000000003029', '2026-01-22', '2026-01-22 08:00:00+07', '2026-01-22 12:00:00+07'),
('30000000-0000-0000-0000-000000003030', '2026-01-22', '2026-01-22 13:00:00+07', '2026-01-22 17:00:00+07'),
-- Thứ 5 (23/01)
('30000000-0000-0000-0000-000000003031', '2026-01-23', '2026-01-23 08:00:00+07', '2026-01-23 12:00:00+07'),
('30000000-0000-0000-0000-000000003032', '2026-01-23', '2026-01-23 13:00:00+07', '2026-01-23 17:00:00+07'),
-- Thứ 6 (24/01)
('30000000-0000-0000-0000-000000003033', '2026-01-24', '2026-01-24 08:00:00+07', '2026-01-24 12:00:00+07'),
('30000000-0000-0000-0000-000000003034', '2026-01-24', '2026-01-24 13:00:00+07', '2026-01-24 17:00:00+07'),
-- Thứ 7 (25/01)
('30000000-0000-0000-0000-000000003035', '2026-01-25', '2026-01-25 08:00:00+07', '2026-01-25 12:00:00+07'),
('30000000-0000-0000-0000-000000003036', '2026-01-25', '2026-01-25 13:00:00+07', '2026-01-25 17:00:00+07'),

-- Tuần 4: 27/01 - 01/02/2026
-- Thứ 2 (27/01)
('30000000-0000-0000-0000-000000003037', '2026-01-27', '2026-01-27 08:00:00+07', '2026-01-27 12:00:00+07'),
('30000000-0000-0000-0000-000000003038', '2026-01-27', '2026-01-27 13:00:00+07', '2026-01-27 17:00:00+07'),
-- Thứ 3 (28/01)
('30000000-0000-0000-0000-000000003039', '2026-01-28', '2026-01-28 08:00:00+07', '2026-01-28 12:00:00+07'),
('30000000-0000-0000-0000-000000003040', '2026-01-28', '2026-01-28 13:00:00+07', '2026-01-28 17:00:00+07'),
-- Thứ 4 (29/01)
('30000000-0000-0000-0000-000000003041', '2026-01-29', '2026-01-29 08:00:00+07', '2026-01-29 12:00:00+07'),
('30000000-0000-0000-0000-000000003042', '2026-01-29', '2026-01-29 13:00:00+07', '2026-01-29 17:00:00+07'),
-- Thứ 5 (30/01)
('30000000-0000-0000-0000-000000003043', '2026-01-30', '2026-01-30 08:00:00+07', '2026-01-30 12:00:00+07'),
('30000000-0000-0000-0000-000000003044', '2026-01-30', '2026-01-30 13:00:00+07', '2026-01-30 17:00:00+07'),
-- Thứ 6 (31/01)
('30000000-0000-0000-0000-000000003045', '2026-01-31', '2026-01-31 08:00:00+07', '2026-01-31 12:00:00+07'),
('30000000-0000-0000-0000-000000003046', '2026-01-31', '2026-01-31 13:00:00+07', '2026-01-31 17:00:00+07'),
-- Thứ 7 (01/02)
('30000000-0000-0000-0000-000000003047', '2026-02-01', '2026-02-01 08:00:00+07', '2026-02-01 12:00:00+07'),
('30000000-0000-0000-0000-000000003048', '2026-02-01', '2026-02-01 13:00:00+07', '2026-02-01 17:00:00+07');

-- =========================================================
-- 4) DOCTOR_WORK_SCHEDULE
-- Gắn tất cả các lịch làm việc cho 5 bác sĩ
-- =========================================================
-- Để đơn giản, tất cả 5 bác sĩ làm việc tất cả các ca
INSERT INTO doctor_work_schedule (id, status, created_at, updated_at, doctor_id, work_schedule_id)
SELECT 
    gen_random_uuid(),
    'ACTIVE',
    '2025-12-20 09:00:00+07',
    '2025-12-20 09:00:00+07',
    d.user_id,
    w.id
FROM 
    doctor d
CROSS JOIN 
    work_schedule w;

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
