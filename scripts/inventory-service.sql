DROP TABLE IF EXISTS dispense_item CASCADE;
DROP TABLE IF EXISTS dispense_order CASCADE;
DROP TABLE IF EXISTS stock_ledger CASCADE;
DROP TABLE IF EXISTS inventory_lot CASCADE;
DROP TABLE IF EXISTS pharmacist CASCADE;
DROP TABLE IF EXISTS medicine CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: medicine
-- Danh mục thuốc (Gốc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine
(
    id          UUID          NOT NULL,
    description VARCHAR(255),
    name        VARCHAR(100)  NOT NULL,
    sale_price  INTEGER,
    unit        VARCHAR(100),

    -- Khóa chính
    CONSTRAINT medicine_pkey PRIMARY KEY (id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: pharmacist
-- Thông tin dược sĩ (Gốc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacist
(
    user_id     UUID NOT NULL,
    certificate VARCHAR(255),
    degree      VARCHAR(255),

    -- Khóa chính
    CONSTRAINT pharmacist_pkey PRIMARY KEY (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 3: inventory_lot
-- Lô thuốc trong kho (Liên kết với Medicine)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_lot
(
    id               UUID         NOT NULL,
    cost_price       INTEGER,
    expire_date      DATE,
    lot_no           VARCHAR(100) NOT NULL,
    quantity_on_hand INTEGER DEFAULT 0,
    medicine_id      UUID,

    -- Khóa chính
    CONSTRAINT inventory_lot_pkey PRIMARY KEY (id),
    -- Ràng buộc duy nhất
    CONSTRAINT uk_lot_no UNIQUE (lot_no),

    -- Khóa ngoại: Liên kết với medicine
    CONSTRAINT fk_inventory_lot_medicine
    FOREIGN KEY (medicine_id)
    REFERENCES public.medicine (id)
    ON DELETE CASCADE
    );

---

-- ---------------------------------------------------------------------
-- Bảng 4: stock_ledger
-- Sổ cái kho - Lịch sử xuất nhập tồn (Liên kết với Inventory Lot)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_ledger
(
    id               UUID NOT NULL,
    type             VARCHAR(255), -- 'IN', 'OUT', 'ADJUST'
    quantity         INTEGER,
    reference_type   VARCHAR(255), -- 'IMPORT', 'DISPENSE', 'ADJUST', etc.
    reference_id     UUID,         -- ID của đối tượng tham chiếu (DispenseItem, etc.)
    create_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at        TIMESTAMP WITH TIME ZONE,
                                   inventory_lot_id UUID,
                                   pharmacist_id    UUID,

                                   CONSTRAINT stock_ledger_pkey PRIMARY KEY (id),

    -- Khóa ngoại tham chiếu đến InventoryLot
    CONSTRAINT fk_stock_ledger_inventory_lot
    FOREIGN KEY (inventory_lot_id)
    REFERENCES public.inventory_lot (id)
                               ON DELETE RESTRICT,

    -- Khóa ngoại tham chiếu đến Pharmacist
    CONSTRAINT fk_stock_ledger_pharmacist
    FOREIGN KEY (pharmacist_id)
    REFERENCES public.pharmacist (user_id)
                               ON DELETE SET NULL
    );



---

-- ---------------------------------------------------------------------
-- Bảng 5: dispense_order
-- Đơn cấp phát thuốc (Liên kết với Pharmacist)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dispense_order
(
    id                 UUID NOT NULL,
    create_at          TIMESTAMP,
    doctor_id          UUID,
    medical_history_id UUID,
    prescription       UUID,
    status             VARCHAR(255),  -- PENDING, COMPLETED, CANCELLED
    update_at          TIMESTAMP,
    pharmacist_id      UUID,

    -- Khóa chính
    CONSTRAINT dispense_order_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với pharmacist
    CONSTRAINT fk_dispense_order_pharmacist
    FOREIGN KEY (pharmacist_id)
    REFERENCES public.pharmacist (user_id)
    ON DELETE SET NULL
    );

---

-- ---------------------------------------------------------------------
-- Bảng 6: dispense_item
-- Chi tiết thuốc trong đơn cấp phát
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dispense_item
(
    id                 UUID NOT NULL,
    dosage             VARCHAR(100), -- Liều lượng (vd: 500mg)
    duration           VARCHAR(50),  -- Thời gian dùng (vd: 5 ngày)
    frequency          VARCHAR(50),  -- Tần suất (vd: 2 lần/ngày)
    price_at_dispense  INTEGER,
    quantity           INTEGER,
    usage_instructions VARCHAR(255),
    dispense_order_id  UUID,
    inventory_lot_id   UUID,

    -- Khóa chính
    CONSTRAINT dispense_item_pkey PRIMARY KEY (id),

    -- Khóa ngoại 1: Liên kết với dispense_order
    CONSTRAINT fk_item_dispense_order
    FOREIGN KEY (dispense_order_id)
    REFERENCES public.dispense_order (id)
    ON DELETE CASCADE,

    -- Khóa ngoại 2: Liên kết với inventory_lot
    CONSTRAINT fk_item_inventory_lot
    FOREIGN KEY (inventory_lot_id)
    REFERENCES public.inventory_lot (id)
    ON DELETE SET NULL
    );


-- ---------------------------------------------------------------------
-- Tạo Index để tối ưu hóa truy vấn
-- ---------------------------------------------------------------------

CREATE INDEX idx_inventory_lot_medicine_id ON public.inventory_lot (medicine_id);
CREATE INDEX idx_stock_ledger_inventory_lot_id ON public.stock_ledger (inventory_lot_id);
CREATE INDEX idx_stock_ledger_pharmacist_id ON public.stock_ledger (pharmacist_id);
CREATE INDEX idx_stock_ledger_reference_id ON public.stock_ledger (reference_id);
CREATE INDEX idx_dispense_order_pharmacist_id ON public.dispense_order (pharmacist_id);
CREATE INDEX idx_dispense_order_prescription ON public.dispense_order (prescription);
CREATE INDEX idx_dispense_item_inventory_lot_id ON public.dispense_item (inventory_lot_id);
CREATE INDEX idx_dispense_item_dispense_order_id ON public.dispense_item (dispense_order_id);


-- =====================================================================
-- INSERT DATA (Dữ liệu mẫu)
-- =====================================================================

-- 1. Insert Medicine (Danh mục thuốc)
INSERT INTO public.medicine (id, name, unit, description, sale_price)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Paracetamol 500mg', 'Viên', 'Thuốc giảm đau hạ sốt', 1000),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Amoxicillin 500mg', 'Viên', 'Thuốc kháng sinh', 2000),
    -- Thuốc bình thường (đủ hàng)
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ibuprofen 400mg', 'Viên', 'Thuốc chống viêm giảm đau', 1500),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Omeprazole 20mg', 'Viên', 'Thuốc điều trị dạ dày', 3000),
    -- Thuốc sắp hết hàng (tổng stock < 20)
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Aspirin 100mg', 'Viên', 'Thuốc chống đông máu', 800),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Metformin 500mg', 'Viên', 'Thuốc điều trị tiểu đường', 2500),
    ('11111111-1111-1111-1111-111111111111', 'Atorvastatin 20mg', 'Viên', 'Thuốc giảm cholesterol', 4000),
    ('22222222-2222-2222-2222-222222222222', 'Amlodipine 5mg', 'Viên', 'Thuốc điều trị cao huyết áp', 3500),
    ('33333333-3333-3333-3333-333333333333', 'Losartan 50mg', 'Viên', 'Thuốc điều trị cao huyết áp', 3200);

-- 2. Insert Inventory Lot (Lô thuốc)
INSERT INTO public.inventory_lot (id, lot_no, expire_date, quantity_on_hand, cost_price, medicine_id)
VALUES
    ('2f989fbe-5479-4d63-a929-1e42833dcbeb', 'LOT2025_A', '2026-12-31', 1000, 800, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('db3ca0f0-9d9a-4664-b8a6-f86e62d98756', 'LOT2025_B', '2026-12-31', 1000, 1500, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    -- Thuốc đủ hàng (Ibuprofen, Omeprazole)
    ('a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7', 'LOT2025_IBUP_001', '2026-12-31', 600, 1200, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
    ('b2c3d4e5-f6a7-4890-b1c2-d3e4f5a6b7c8', 'LOT2025_OMEP_001', '2026-12-31', 500, 2500, 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
    -- Thuốc sắp hết hàng (tổng < 20)
    ('c3d4e5f6-a7b8-4901-c2d3-e4f5a6b7c8d9', 'LOT2025_ASPI_001', '2026-12-31', 15, 600, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), -- Aspirin: 15 viên
    ('d4e5f6a7-b8c9-4012-d3e4-f5a6b7c8d9e0', 'LOT2025_MET_001', '2026-12-31', 8, 2000, 'ffffffff-ffff-ffff-ffff-ffffffffffff'), -- Metformin: 8 viên
    ('e5f6a7b8-c9d0-4123-e4f5-a6b7c8d9e0f1', 'LOT2025_ATOR_001', '2026-12-31', 12, 3200, '11111111-1111-1111-1111-111111111111'), -- Atorvastatin: 12 viên
    ('f6a7b8c9-d0e1-4234-f5a6-b7c8d9e0f1a2', 'LOT2025_AMLO_001', '2026-12-31', 5, 2800, '22222222-2222-2222-2222-222222222222'), -- Amlodipine: 5 viên
    ('a7b8c9d0-e1f2-4345-a6b7-c8d9e0f1a2b3', 'LOT2025_LOS_001', '2026-12-31', 10, 2600, '33333333-3333-3333-3333-333333333333'), -- Losartan: 10 viên
    -- Thuốc sắp hết hạn (trong vòng 60 ngày)
    ('b8c9d0e1-f2a3-4456-b7c8-d9e0f1a2b3c4', 'LOT2024_VITC_001', CURRENT_DATE + INTERVAL '25 days', 200, 500, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), -- Vitamin C: 25 ngày nữa
    ('c9d0e1f2-a3b4-4567-c8d9-e0f1a2b3c4d5', 'LOT2024_CALC_001', CURRENT_DATE + INTERVAL '30 days', 150, 800, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'), -- Calcium: 30 ngày nữa
    ('d0e1f2a3-b4c5-4678-d9e0-f1a2b3c4d5e6', 'LOT2024_MULTI_001', CURRENT_DATE + INTERVAL '45 days', 100, 1200, 'cccccccc-cccc-cccc-cccc-cccccccccccc'), -- Multivitamin: 45 ngày nữa
    ('e1f2a3b4-c5d6-4789-e0f1-a2b3c4d5e6f7', 'LOT2024_VITD_001', CURRENT_DATE + INTERVAL '60 days', 80, 1500, 'dddddddd-dddd-dddd-dddd-dddddddddddd'), -- Vitamin D: 60 ngày nữa
    ('f2a3b4c5-d6e7-4890-f1a2-b3c4d5e6f7a8', 'LOT2024_IRON_001', CURRENT_DATE + INTERVAL '15 days', 120, 1000, 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'); -- Iron: 15 ngày nữa

-- 3. Insert Pharmacist (Dược sĩ)
INSERT INTO public.pharmacist (user_id, certificate, degree)
VALUES (
           '00000000-0000-0000-0000-000000000401',
           'Chứng chỉ A',
           'Bằng cấp A'
       );

INSERT INTO public.stock_ledger (id, type, quantity, reference_type, inventory_lot_id, pharmacist_id, create_at)
VALUES
    -- Thuốc ban đầu (Paracetamol, Amoxicillin)
    (gen_random_uuid(), 'IN', 1000, 'IMPORT', '2f989fbe-5479-4d63-a929-1e42833dcbeb', '00000000-0000-0000-0000-000000000401', NOW()), -- Paracetamol: 1000 viên
    (gen_random_uuid(), 'IN', 1000, 'IMPORT', 'db3ca0f0-9d9a-4664-b8a6-f86e62d98756', '00000000-0000-0000-0000-000000000401', NOW()), -- Amoxicillin: 1000 viên
    -- Thuốc đủ hàng (Ibuprofen, Omeprazole)
    (gen_random_uuid(), 'IN', 600, 'IMPORT', 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7', '00000000-0000-0000-0000-000000000401', NOW()),
    (gen_random_uuid(), 'IN', 500, 'IMPORT', 'b2c3d4e5-f6a7-4890-b1c2-d3e4f5a6b7c8', '00000000-0000-0000-0000-000000000401', NOW()),
    -- Thuốc sắp hết hàng
    (gen_random_uuid(), 'IN', 15, 'IMPORT', 'c3d4e5f6-a7b8-4901-c2d3-e4f5a6b7c8d9', '00000000-0000-0000-0000-000000000401', NOW()), -- Aspirin: 15 viên
    (gen_random_uuid(), 'IN', 8, 'IMPORT', 'd4e5f6a7-b8c9-4012-d3e4-f5a6b7c8d9e0', '00000000-0000-0000-0000-000000000401', NOW()), -- Metformin: 8 viên
    (gen_random_uuid(), 'IN', 12, 'IMPORT', 'e5f6a7b8-c9d0-4123-e4f5-a6b7c8d9e0f1', '00000000-0000-0000-0000-000000000401', NOW()), -- Atorvastatin: 12 viên
    (gen_random_uuid(), 'IN', 5, 'IMPORT', 'f6a7b8c9-d0e1-4234-f5a6-b7c8d9e0f1a2', '00000000-0000-0000-0000-000000000401', NOW()), -- Amlodipine: 5 viên
    (gen_random_uuid(), 'IN', 10, 'IMPORT', 'a7b8c9d0-e1f2-4345-a6b7-c8d9e0f1a2b3', '00000000-0000-0000-0000-000000000401', NOW()), -- Losartan: 10 viên
    -- Thuốc sắp hết hạn
    (gen_random_uuid(), 'IN', 200, 'IMPORT', 'b8c9d0e1-f2a3-4456-b7c8-d9e0f1a2b3c4', '00000000-0000-0000-0000-000000000401', NOW()), -- Vitamin C: 200 viên
    (gen_random_uuid(), 'IN', 150, 'IMPORT', 'c9d0e1f2-a3b4-4567-c8d9-e0f1a2b3c4d5', '00000000-0000-0000-0000-000000000401', NOW()), -- Calcium: 150 viên
    (gen_random_uuid(), 'IN', 100, 'IMPORT', 'd0e1f2a3-b4c5-4678-d9e0-f1a2b3c4d5e6', '00000000-0000-0000-0000-000000000401', NOW()), -- Multivitamin: 100 viên
    (gen_random_uuid(), 'IN', 80, 'IMPORT', 'e1f2a3b4-c5d6-4789-e0f1-a2b3c4d5e6f7', '00000000-0000-0000-0000-000000000401', NOW()), -- Vitamin D: 80 viên
    (gen_random_uuid(), 'IN', 120, 'IMPORT', 'f2a3b4c5-d6e7-4890-f1a2-b3c4d5e6f7a8', '00000000-0000-0000-0000-000000000401', NOW()); -- Iron: 120 viên

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