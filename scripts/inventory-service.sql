DROP TABLE IF EXISTS public.dispense_item CASCADE;
DROP TABLE IF EXISTS public.dispense_order CASCADE;
DROP TABLE IF EXISTS public.stock_ledger CASCADE;
DROP TABLE IF EXISTS public.inventory_lot CASCADE;
DROP TABLE IF EXISTS public.medicine CASCADE;
DROP TABLE IF EXISTS public.pharmacist CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: medicine
-- Danh mục thuốc (Gốc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine
(
    id          UUID NOT NULL,
    name        VARCHAR(100) NOT NULL,
    unit        VARCHAR(100),
    description VARCHAR(255),
    sale_price  INTEGER,

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
    degree      VARCHAR(255),
    certificate VARCHAR(255),

    CONSTRAINT pharmacist_pkey PRIMARY KEY (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 3: inventory_lot
-- Lô thuốc trong kho (Liên kết với Medicine)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_lot
(
    id               UUID NOT NULL,
    lot_no           VARCHAR(100) NOT NULL,
    expire_date      DATE,
    quantity_on_hand INTEGER DEFAULT 0,
    cost_price       INTEGER,
    medicine_id      UUID,

    CONSTRAINT inventory_lot_pkey PRIMARY KEY (id),
    CONSTRAINT uk_inventory_lot_no UNIQUE (lot_no),

    -- Khóa ngoại tham chiếu đến Medicine
    CONSTRAINT fk_inventory_lot_medicine
    FOREIGN KEY (medicine_id)
    REFERENCES public.medicine (id)
    ON DELETE RESTRICT
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
    prescription       UUID,          -- ID đơn thuốc từ Service khám bệnh
    medical_history_id UUID,          -- ID lịch sử khám
    doctor_id          UUID,          -- ID bác sĩ kê đơn
    status             VARCHAR(255),  -- 'PENDING', 'COMPLETED', 'CANCELLED'
    create_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at          TIMESTAMP WITH TIME ZONE,
                                     pharmacist_id      UUID,

                                     CONSTRAINT dispense_order_pkey PRIMARY KEY (id),

    -- Khóa ngoại tham chiếu đến Pharmacist
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
    quantity           INTEGER,
    price_at_dispense  INTEGER,
    dosage             VARCHAR(100),
    frequency          VARCHAR(50),
    duration           VARCHAR(50),
    usage_instructions VARCHAR(255),
    inventory_lot_id   UUID,
    dispense_order_id  UUID,

    CONSTRAINT dispense_item_pkey PRIMARY KEY (id),

    -- Khóa ngoại tham chiếu đến InventoryLot
    CONSTRAINT fk_dispense_item_inventory_lot
    FOREIGN KEY (inventory_lot_id)
    REFERENCES public.inventory_lot (id)
    ON DELETE RESTRICT,

    -- Khóa ngoại tham chiếu đến DispenseOrder
    CONSTRAINT fk_dispense_item_dispense_order
    FOREIGN KEY (dispense_order_id)
    REFERENCES public.dispense_order (id)
    ON DELETE CASCADE
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
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Amoxicillin 500mg', 'Viên', 'Thuốc kháng sinh', 2000);

-- 2. Insert Inventory Lot (Lô thuốc)
INSERT INTO public.inventory_lot (id, lot_no, expire_date, quantity_on_hand, cost_price, medicine_id)
VALUES
    ('2f989fbe-5479-4d63-a929-1e42833dcbeb', 'LOT2025_A', '2026-12-31', 1000, 800, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('db3ca0f0-9d9a-4664-b8a6-f86e62d98756', 'LOT2025_B', '2026-12-31', 1000, 1500, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

