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
    CHECK (status IN ('CHECKED', 'CONFIRMED', 'CANCELLED', 'FAILED','IN_PROGRESS', 'COMPLETED'))
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

INSERT INTO public.medical_service (
    id, price, service_name, service_time, service_type, status, img_url, description
)
VALUES (
           '33333333-0000-0000-0000-000000000001',
           300000,
           'Cạo vôi răng',
           30,
           'GEN',
           'ACTIVE',
           'uploads/images/cao-voi-rang.jpg',
           'Cạo vôi răng là phương pháp làm sạch cao răng, mảng bám và vi khuẩn bám chặt trên bề mặt răng và dưới nướu – những nguyên nhân chính dẫn đến viêm nướu và hôi miệng.
           Quy trình bao gồm:
           • Kiểm tra tổng quát tình trạng răng miệng;
           • Dùng máy siêu âm để làm sạch cao răng;
           • Đánh bóng răng giúp bề mặt răng mịn màng, giảm bám mảng sau này.
           Lợi ích:
           • Ngăn ngừa viêm nướu, chảy máu chân răng;
           • Hơi thở thơm tho hơn;
           • Hạn chế nguy cơ viêm nha chu.
           Khuyến nghị thực hiện mỗi 6 tháng một lần.'
       ),
       (
           '33333333-0000-0000-0000-000000000002',
           500000,
           'Trám răng thẩm mỹ',
           40,
           'GEN',
           'ACTIVE',
           'uploads/images/tram-rang-tham-my.jpg',
           'Trám răng thẩm mỹ là kỹ thuật phục hồi răng bị sâu, mẻ hoặc nứt bằng vật liệu composite có màu sắc giống hệt răng thật.
           Quy trình:
           • Làm sạch vùng sâu hoặc tổn thương;
           • Tạo hình khoang trám phù hợp;
           • Đặt vật liệu composite và chiếu đèn đông cứng;
           • Điều chỉnh khớp cắn và đánh bóng.
           Lợi ích:
           • Khôi phục hình dạng và chức năng của răng;
           • Mang lại tính thẩm mỹ cao mà không gây đau;
           • Chi phí hợp lý, thực hiện nhanh.
           Thích hợp cho các trường hợp sâu răng nhẹ – trung bình hoặc răng mẻ nhỏ.'
       ),
       (
           '33333333-0000-0000-0000-000000000003',
           1500000,
           'Điều trị tủy răng',
           90,
           'ENDO',
           'ACTIVE',
           'uploads/images/dieu-tri-tuy-1.jpg',
           'Điều trị tủy răng (Root Canal Treatment) là phương pháp loại bỏ phần tủy răng bị viêm hoặc nhiễm trùng nhằm bảo tồn răng thật.
           Quy trình:
           • Chụp X-quang để đánh giá tình trạng ống tủy;
           • Gây tê và mở đường vào ống tủy;
           • Làm sạch và tạo hình ống tủy bằng hệ thống file xoay;
           • Khử trùng ống tủy bằng dung dịch chuyên dụng;
           • Trám bít ống tủy và phục hồi thân răng bằng vật liệu composite hoặc mão sứ.
           Khi nào cần điều trị tủy:
           • Đau nhức kéo dài, đau khi nhai;
           • Răng nhạy cảm với nóng lạnh;
           • Răng bị sâu lớn, viêm tủy, áp xe.
           Đây là phương pháp giúp giữ lại răng thật, tránh phải nhổ răng.'
       ),
       (
           '33333333-0000-0000-0000-000000000004',
           30000000,
           'Niềng răng mắc cài kim loại',
           120,
           'ORTHO',
           'ACTIVE',
           'uploads/images/nieng-rang-mac-cai.png',
           'Niềng răng mắc cài kim loại là phương pháp chỉnh nha sử dụng hệ thống mắc cài và dây cung để điều chỉnh vị trí răng về đúng chuẩn khớp cắn.
           Quy trình:
           • Khám và chụp X-quang, Scan 3D;
           • Lập phác đồ điều trị riêng cho từng bệnh nhân;
           • Gắn mắc cài và dây cung;
           • Tái khám định kỳ mỗi 4–6 tuần để siết răng;
           • Kết thúc điều trị và đeo hàm duy trì.
           Phù hợp với:
           • Răng hô, móm, lệch lạc, chen chúc;
           • Khớp cắn sâu, khớp cắn hở.
           Đây là phương pháp hiệu quả, chi phí hợp lý và áp dụng phổ biến cho cả trẻ em và người lớn.'
       ),
       (
           '33333333-0000-0000-0000-000000000005',
           18000000,
           'Cấy ghép Implant',
           120,
           'IMPL',
           'ACTIVE',
           'uploads/images/cay-ghep-implant.jpg',
           'Cấy ghép Implant là phương pháp phục hồi răng mất bằng cách đặt một trụ titanium vào xương hàm, sau đó gắn răng sứ lên trên. Đây là giải pháp hiện đại nhất hiện nay giúp khôi phục khả năng ăn nhai và thẩm mỹ.
           Quy trình:
           • Thăm khám, chụp CT ConeBeam đánh giá mật độ xương;
           • Cấy trụ Implant vào xương hàm;
           • Chờ tích hợp xương 2–3 tháng;
           • Gắn Abutment và mão sứ hoàn thiện.
           Lợi ích:
           • Ăn nhai chắc chắn như răng thật;
           • Không mài răng kế bên;
           • Ngăn tiêu xương hàm sau khi mất răng.
           Phù hợp cho người mất 1 hoặc nhiều răng, mất răng lâu năm.'
       ),
       (
           '33333333-0000-0000-0000-000000000006',
           6000000,
           'Dán sứ Veneer',
           75,
           'COS',
           'ACTIVE',
           'uploads/images/dan-su-veneer.jpg',
           'Dán sứ Veneer là kỹ thuật thẩm mỹ sử dụng miếng sứ siêu mỏng 0.3–0.5mm dán lên mặt ngoài răng nhằm cải thiện màu sắc và hình dáng răng mà gần như không phải mài nhỏ răng.
           Quy trình:
           • Kiểm tra tổng quát và tư vấn thiết kế nụ cười (Smile Design);
           • Mài cực mỏng bề mặt răng (nếu cần);
           • Lấy dấu răng hoặc scan 3D;
           • Chế tác miếng sứ Veneer tại labo;
           • Dán Veneer bằng keo chuyên dụng.
           Lợi ích:
           • Màu sắc trắng tự nhiên, bền màu;
           • Ít xâm lấn, bảo tồn mô răng thật tối đa;
           • Khắc phục răng xỉn màu, thưa, ngắn hoặc không đều.
           Phù hợp với nhu cầu thẩm mỹ nụ cười cao.'
       );

-- Lịch hẹn 1: Đã xác nhận (CONFIRMED)
INSERT INTO public.appointment (id, doctor_id, patient_id, appointment_start_time, appointment_end_time, status)
VALUES (
           '44444444-0000-0000-0000-000000000001', -- ID Lịch hẹn 1
           '99999999-0000-0000-0000-000000000012',
           'd903022a-1000-4001-8001-000000000003',
           NOW() + INTERVAL '1 hour',
           NOW() + INTERVAL '1 hour 30 minutes',
           'CHECKED'
       );
-- Lịch hẹn 2: Đang chờ (PENDING)
INSERT INTO public.appointment (id, doctor_id, patient_id, appointment_start_time, appointment_end_time, status)
VALUES (
           '44444444-0000-0000-0000-000000000002', -- ID Lịch hẹn 2
           '99999999-0000-0000-0000-000000000012',
           'd903022a-1000-4001-8001-000000000008',
           NOW() + INTERVAL '3 days 10 hours',
           NOW() + INTERVAL '3 days 10 hours 45 minutes',
           'IN_PROGRESS'
       );

INSERT INTO public.appointment_medical_service (appointment_id, medical_service_id)
VALUES
    -- Dịch vụ 1 & 2 cho Lịch hẹn 1
    ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001'),
    ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000002'),

    -- Dịch vụ 3 cho Lịch hẹn 2
    ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000003'); -- Tư vấn dinh dưỡng
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