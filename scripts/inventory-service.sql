DROP TABLE IF EXISTS dispense_item CASCADE;
DROP TABLE IF EXISTS dispense_order CASCADE;
DROP TABLE IF EXISTS stock_ledger CASCADE;
DROP TABLE IF EXISTS inventory_lot CASCADE;
DROP TABLE IF EXISTS pharmacist CASCADE;
DROP TABLE IF EXISTS medicine CASCADE;

-- 1. Bảng medicine (Thuốc)
CREATE TABLE medicine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(100),
    description VARCHAR(255),
    sale_price INT
);

CREATE TABLE pharmacist (
    user_id UUID PRIMARY KEY,
    degree VARCHAR(255),
    certificate VARCHAR(255)
);

-- 2. Bảng inventory_lot (Lô thuốc trong kho)
CREATE TABLE inventory_lot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_no VARCHAR(100) UNIQUE NOT NULL,
    expire_date DATE,
    quantity_on_hand INT DEFAULT 0,
    cost_price INT,
    medicine_id UUID REFERENCES medicine(id)
);

-- 3. Bảng stock_ledger (Sổ kho)
CREATE TABLE stock_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255), -- 'IN', 'OUT', 'ADJUST'
    quantity INT,
    reference_type VARCHAR(255), -- Ví dụ: 'PURCHASE_ORDER', 'DISPENSE'
    reference_id UUID,    -- ID của phiếu nhập hoặc đơn thuốc liên quan
    inventory_lot_id UUID REFERENCES inventory_lot(id),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dispense_order (
    id UUID PRIMARY KEY,
    pharmacist_id UUID REFERENCES pharmacist(user_id),
    prescription UUID,
    status VARCHAR(255),
    medical_history_id UUID,
    doctor_id UUID,
    create_at TIMESTAMPTZ DEFAULT now(),
    update_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng dispense_item (Chi tiết đơn cấp phát)
CREATE TABLE dispense_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INT,
    price_at_dispense INT,
    dosage VARCHAR(100),            -- Thêm mới: Liều lượng (VD: 1 viên)
    frequency VARCHAR(50),          -- Thêm mới: Tần suất (VD: 2 lần/ngày)
    duration VARCHAR(50),           -- Thêm mới: Thời gian (VD: 5 ngày)
    usage_instructions VARCHAR(255),-- Thêm mới: Hướng dẫn (VD: Uống sau ăn)
    inventory_lot_id UUID REFERENCES inventory_lot(id),
    dispense_order_id UUID REFERENCES dispense_order(id)
);
INSERT INTO pharmacist (user_id, degree, certificate)
VALUES
('4c84022a-1111-4001-8001-000000000004', 'Cử nhân Dược', 'Chứng chỉ hành nghề Dược');

-- 1. Thêm thuốc
INSERT INTO medicine (id, name, unit, description, sale_price)
VALUES
('aaaa1111-aaaa-4aaa-8aaa-111111111111', 'Paracetamol 500mg', 'Viên', 'Giảm đau, hạ sốt', 1000);

-- 2. Thêm lô thuốc
INSERT INTO inventory_lot (id, lot_no, expire_date, quantity_on_hand, cost_price, medicine_id)
VALUES
('bbbb2222-bbbb-4bbb-8bbb-222222222222', 'LOTA100-2025', '2027-10-01', 1000, 700, 'aaaa1111-aaaa-4aaa-8aaa-111111111111');

-- 3. Ghi sổ kho (Nhập kho)
-- Cập nhật: Bỏ cột 'lot', thêm 'reference_id' (ví dụ mã phiếu nhập)
INSERT INTO stock_ledger (type, quantity, reference_type, reference_id, inventory_lot_id)
VALUES
('IN', 1000, 'PURCHASE_ORDER', 'dddd4444-dddd-4ddd-8ddd-444444444444', 'bbbb2222-bbbb-4bbb-8bbb-222222222222');

-- 4. Tạo đơn cấp phát
-- Cập nhật: Thêm medical_history_id và doctor_id
INSERT INTO dispense_order (id, pharmacist_id, prescription, status, medical_history_id, doctor_id)
VALUES
('cccc3333-cccc-4ccc-8ccc-333333333333', '4c84022a-1111-4001-8001-000000000004', 'eeee5555-eeee-4eee-8eee-555555555555', 'PENDING', 'ffff6666-ffff-4fff-8fff-666666666666', 'aaaa7777-aaaa-4aaa-8aaa-777777777777');

-- 5. Thêm chi tiết cấp phát
-- Cập nhật: Thêm dosage, frequency, duration, usage_instructions
INSERT INTO dispense_item (quantity, price_at_dispense, dosage, frequency, duration, usage_instructions, inventory_lot_id, dispense_order_id)
VALUES
(
    20,
    1000,
    '1 viên',
    '2 lần/ngày',
    '5 ngày',
    'Uống sau khi ăn no',
    'bbbb2222-bbbb-4bbb-8bbb-222222222222',
    'cccc3333-cccc-4ccc-8ccc-333333333333'
);
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