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
    img_url      VARCHAR(255),
    description  TEXT,

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
    CHECK (status IN ('CHECKED', 'CONFIRMED', 'CANCELLED','IN_PROGRESS', 'COMPLETED','COMPLETED_INVOICE'))
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

-- =========================================================
-- 1) MEDICAL_SERVICE (20 dịch vụ nha khoa)
-- =========================================================
INSERT INTO public.medical_service (id, price, service_name, service_time, service_type, status, img_url, description)
VALUES 
-- Dịch vụ 1: Chụp phim Xquang
('33000000-0000-0000-0000-000000000001', 5000000, 'Chụp phim Xquang, chụp ảnh, lấy mẫu lập kế hoạch điều trị chỉnh nha hoặc thiết kế nụ cười (Smile Design)', 30, 'ORTHO', 'ACTIVE', 'uploads/images/xquang.jpg', 'Chụp phim toàn cảnh, chụp ảnh nội ngoại răng miệng, lấy dấu hàm để lập kế hoạch điều trị chỉnh nha hoặc thiết kế nụ cười thẩm mỹ.'),

-- Dịch vụ 2-4: Chỉnh nha
('33000000-0000-0000-0000-000000000002', 100000000, 'Chỉnh nha hai hàm bằng khay trong suốt Invisalign', 60, 'ORTHO', 'ACTIVE', 'uploads/images/invisalign.jpg', 'Chỉnh nha bằng khay trong suốt Invisalign cao cấp từ Mỹ, thời gian điều trị 12-18 tháng.'),
('33000000-0000-0000-0000-000000000003', 60000000, 'Chỉnh nha hai hàm bằng khay trong suốt Việt Nam', 60, 'ORTHO', 'ACTIVE', 'uploads/images/khay-trong-suot.jpg', 'Chỉnh nha bằng khay trong suốt sản xuất tại Việt Nam, thời gian điều trị 15-24 tháng.'),
('33000000-0000-0000-0000-000000000004', 40000000, 'Chỉnh nha cố định hai hàm với mắc cài', 60, 'ORTHO', 'ACTIVE', 'uploads/images/nieng-rang-mac-cai.png', 'Chỉnh nha cố định bằng mắc cài kim loại hoặc sứ, thời gian điều trị 18-24 tháng.'),

-- Dịch vụ 5-6: Chỉnh nha khác
('33000000-0000-0000-0000-000000000005', 7500000, 'Chỉnh nha giai đoạn tăng trưởng hoặc phục vụ cho các dịch vụ khác', 45, 'ORTHO', 'ACTIVE', 'uploads/images/chinh-nha-tre-em.jpg', 'Chỉnh nha cho trẻ em đang trong giai đoạn phát triển xương hàm.'),
('33000000-0000-0000-0000-000000000006', 5000000, 'Chỉnh nha hàm tháo lắp (một hàm)', 30, 'ORTHO', 'ACTIVE', 'uploads/images/ham-thao-lap.jpg', 'Khí cụ chỉnh nha tháo lắp cho một hàm, phù hợp các trường hợp đơn giản.'),

-- Dịch vụ 7-9: Răng sứ thẩm mỹ
('33000000-0000-0000-0000-000000000007', 9000000, 'Mặt dán một răng sứ Veneer', 45, 'COS', 'ACTIVE', 'uploads/images/dan-su-veneer.png', 'Dán sứ Veneer siêu mỏng giúp cải thiện màu sắc và hình dáng răng mà không cần mài nhiều.'),
('33000000-0000-0000-0000-000000000008', 6000000, 'Chụp một răng toàn sứ cao cấp', 60, 'COS', 'ACTIVE', 'uploads/images/rang-su-cao-cap.jpg', 'Mão sứ toàn diện làm từ sứ cao cấp, độ thẩm mỹ cao, bền vững.'),
('33000000-0000-0000-0000-000000000009', 3500000, 'Chụp một răng sứ kim loại', 45, 'COS', 'ACTIVE', 'uploads/images/rang-su-kim-loai.jpg', 'Mão sứ kim loại có độ bền cao, phù hợp cho răng hàm.'),

-- Dịch vụ 10-11: Implant
('33000000-0000-0000-0000-000000000010', 18000000, 'Cắm ghép một Implant cao cấp Hàn Quốc', 90, 'IMPL', 'ACTIVE', 'uploads/images/cay-ghep-implant.jpg', 'Cấy ghép trụ Implant titanium Hàn Quốc (Osstem, Dentium) vào xương hàm.'),
('33000000-0000-0000-0000-000000000011', 30000000, 'Cắm ghép một Implant cao cấp Mỹ hoặc Đức', 90, 'IMPL', 'ACTIVE', 'uploads/images/implant-cao-cap.jpg', 'Cấy ghép trụ Implant cao cấp từ Mỹ (Nobel Biocare) hoặc Đức (Straumann).'),

-- Dịch vụ 12: Ghép xương
('33000000-0000-0000-0000-000000000012', 3500000, 'Ghép xương hoặc nâng xoang một vị trí', 60, 'IMPL', 'ACTIVE', 'uploads/images/ghep-xuong.jpg', 'Ghép xương hoặc nâng xoang hàm trên để tạo nền cho cấy ghép Implant.'),

-- Dịch vụ 12A-12B: Nhổ răng và điều trị tủy
('33000000-0000-0000-0000-000000000013', 1500000, 'Nhổ một răng', 30, 'GEN', 'ACTIVE', 'uploads/images/nho-rang.jpg', 'Nhổ răng thường hoặc răng khôn.'),
('33000000-0000-0000-0000-000000000014', 1200000, 'Chữa tủy một răng bằng Laser và/hoặc máy', 90, 'ENDO', 'ACTIVE', 'uploads/images/dieu-tri-tuy-rang.jpg', 'Điều trị tủy răng bằng công nghệ Laser và máy xoay Rotary hiện đại.'),

-- Dịch vụ 15-16: Điều trị Laser
('33000000-0000-0000-0000-000000000015', 3000000, 'Điều trị viêm lợi hai hàm bằng Laser', 45, 'PERIO', 'ACTIVE', 'uploads/images/dieu-tri-loi-laser.jpg', 'Điều trị viêm lợi, viêm nha chu bằng công nghệ Laser không đau.'),
('33000000-0000-0000-0000-000000000016', 7500000, 'Phẫu thuật làm dài thân răng bằng Laser điều trị cười hở lợi', 60, 'PERIO', 'ACTIVE', 'uploads/images/pttm-loi.jpg', 'Phẫu thuật thẩm mỹ nướu để cải thiện tình trạng cười hở lợi.'),

-- Dịch vụ 17: Tẩy trắng
('33000000-0000-0000-0000-000000000017', 3000000, 'Tẩy trắng răng bằng ánh sáng lạnh tại phòng khám', 60, 'COS', 'ACTIVE', 'uploads/images/tay-trang-rang.jpg', 'Tẩy trắng răng bằng công nghệ ánh sáng lạnh Whitening, hiệu quả ngay sau 1 buổi.'),

-- Dịch vụ 18-19: Hàn trám và vệ sinh
('33000000-0000-0000-0000-000000000018', 350000, 'Hàn một răng', 30, 'GEN', 'ACTIVE', 'uploads/images/tram-rang-tham-my.jpg', 'Trám răng sâu bằng vật liệu composite thẩm mỹ.'),
('33000000-0000-0000-0000-000000000019', 350000, 'Lấy cao răng, đánh bóng hai hàm', 30, 'GEN', 'ACTIVE', 'uploads/images/cao-voi-rang.jpg', 'Cạo vôi răng và đánh bóng răng cho cả hai hàm.'),

-- Dịch vụ 20: Chụp phim
('33000000-0000-0000-0000-000000000020', 100000, 'Chụp phim Xquang Panorama hoặc Cephalometric', 15, 'GEN', 'ACTIVE', 'uploads/images/xquang-rang.jpg', 'Chụp phim toàn cảnh hoặc phim sọ nghiêng để chẩn đoán.');

-- =========================================================
-- 2) APPOINTMENT (16 lịch hẹn từ 4/1-11/1, mỗi ngày 2 appointments)
-- Tất cả đều COMPLETED và có dispense_order
-- =========================================================
INSERT INTO public.appointment (id, doctor_id, patient_id, appointment_start_time, appointment_end_time, status, created_at, updated_at)
VALUES
-- Ngày 4/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '2026-01-04 09:00:00+07', '2026-01-04 09:30:00+07', 'COMPLETED', '2026-01-03 10:00:00+07', '2026-01-04 09:30:00+07'),
('44000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', '2026-01-04 14:00:00+07', '2026-01-04 14:30:00+07', 'COMPLETED', '2026-01-03 11:00:00+07', '2026-01-04 14:30:00+07'),

-- Ngày 5/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000103', '2026-01-05 09:00:00+07', '2026-01-05 10:00:00+07', 'COMPLETED', '2026-01-04 10:00:00+07', '2026-01-05 10:00:00+07'),
('44000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000104', '2026-01-05 14:30:00+07', '2026-01-05 15:30:00+07', 'COMPLETED', '2026-01-04 11:00:00+07', '2026-01-05 15:30:00+07'),

-- Ngày 6/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000105', '2026-01-06 09:00:00+07', '2026-01-06 10:00:00+07', 'COMPLETED', '2026-01-05 10:00:00+07', '2026-01-06 10:00:00+07'),
('44000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000106', '2026-01-06 14:00:00+07', '2026-01-06 15:00:00+07', 'COMPLETED', '2026-01-05 11:00:00+07', '2026-01-06 15:00:00+07'),

-- Ngày 7/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000107', '2026-01-07 09:00:00+07', '2026-01-07 10:00:00+07', 'COMPLETED', '2026-01-06 10:00:00+07', '2026-01-07 10:00:00+07'),
('44000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000108', '2026-01-07 14:30:00+07', '2026-01-07 16:00:00+07', 'COMPLETED', '2026-01-06 11:00:00+07', '2026-01-07 16:00:00+07'),

-- Ngày 8/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000109', '2026-01-08 09:00:00+07', '2026-01-08 10:00:00+07', 'COMPLETED', '2026-01-07 10:00:00+07', '2026-01-08 10:00:00+07'),
('44000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000110', '2026-01-08 14:00:00+07', '2026-01-08 15:00:00+07', 'COMPLETED', '2026-01-07 11:00:00+07', '2026-01-08 15:00:00+07'),

-- Ngày 9/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', '2026-01-09 09:00:00+07', '2026-01-09 10:00:00+07', 'COMPLETED', '2026-01-08 10:00:00+07', '2026-01-09 10:00:00+07'),
('44000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000102', '2026-01-09 14:30:00+07', '2026-01-09 16:00:00+07', 'COMPLETED', '2026-01-08 11:00:00+07', '2026-01-09 16:00:00+07'),

-- Ngày 10/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000103', '2026-01-10 09:00:00+07', '2026-01-10 10:00:00+07', 'COMPLETED', '2026-01-09 10:00:00+07', '2026-01-10 10:00:00+07'),
('44000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000204', '00000000-0000-0000-0000-000000000104', '2026-01-10 14:00:00+07', '2026-01-10 15:00:00+07', 'COMPLETED', '2026-01-09 11:00:00+07', '2026-01-10 15:00:00+07'),

-- Ngày 11/1/2026: 2 appointments
('44000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000205', '00000000-0000-0000-0000-000000000105', '2026-01-11 09:00:00+07', '2026-01-11 10:00:00+07', 'COMPLETED', '2026-01-10 10:00:00+07', '2026-01-11 10:00:00+07'),
('44000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000106', '2026-01-11 14:30:00+07', '2026-01-11 16:00:00+07', 'COMPLETED', '2026-01-10 11:00:00+07', '2026-01-11 16:00:00+07');

-- =========================================================
-- 3) APPOINTMENT_MEDICAL_SERVICE (16 appointments)
-- =========================================================
INSERT INTO public.appointment_medical_service (appointment_id, medical_service_id)
VALUES
-- Ngày 4/1: Appointment 101, 102
('44000000-0000-0000-0000-000000000101', '33000000-0000-0000-0000-000000000018'), -- Trám răng
('44000000-0000-0000-0000-000000000102', '33000000-0000-0000-0000-000000000019'), -- Cạo vôi răng

-- Ngày 5/1: Appointment 103, 104
('44000000-0000-0000-0000-000000000103', '33000000-0000-0000-0000-000000000014'), -- Điều trị tủy
('44000000-0000-0000-0000-000000000104', '33000000-0000-0000-0000-000000000008'), -- Chụp răng sứ

-- Ngày 6/1: Appointment 105, 106
('44000000-0000-0000-0000-000000000105', '33000000-0000-0000-0000-000000000007'), -- Dán sứ Veneer
('44000000-0000-0000-0000-000000000106', '33000000-0000-0000-0000-000000000010'), -- Cấy ghép Implant

-- Ngày 7/1: Appointment 107, 108
('44000000-0000-0000-0000-000000000107', '33000000-0000-0000-0000-000000000001'), -- Tư vấn chỉnh nha + chụp phim
('44000000-0000-0000-0000-000000000108', '33000000-0000-0000-0000-000000000014'), -- Điều trị tủy

-- Ngày 8/1: Appointment 109, 110
('44000000-0000-0000-0000-000000000109', '33000000-0000-0000-0000-000000000013'), -- Nhổ răng
('44000000-0000-0000-0000-000000000110', '33000000-0000-0000-0000-000000000015'), -- Điều trị viêm lợi

-- Ngày 9/1: Appointment 111, 112
('44000000-0000-0000-0000-000000000111', '33000000-0000-0000-0000-000000000018'), -- Trám răng
('44000000-0000-0000-0000-000000000112', '33000000-0000-0000-0000-000000000014'), -- Điều trị tủy

-- Ngày 10/1: Appointment 113, 114
('44000000-0000-0000-0000-000000000113', '33000000-0000-0000-0000-000000000019'), -- Cạo vôi răng
('44000000-0000-0000-0000-000000000114', '33000000-0000-0000-0000-000000000017'), -- Tẩy trắng răng

-- Ngày 11/1: Appointment 115, 116
('44000000-0000-0000-0000-000000000115', '33000000-0000-0000-0000-000000000018'), -- Trám răng
('44000000-0000-0000-0000-000000000116', '33000000-0000-0000-0000-000000000020'); -- Chụp phim Xquang

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
