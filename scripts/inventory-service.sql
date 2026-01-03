DROP TABLE IF EXISTS dispense_item CASCADE;
DROP TABLE IF EXISTS dispense_order CASCADE;
DROP TABLE IF EXISTS stock_ledger CASCADE;
DROP TABLE IF EXISTS inventory_lot CASCADE;
DROP TABLE IF EXISTS pharmacist CASCADE;
DROP TABLE IF EXISTS medicine CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: medicine
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine
(
    id          UUID          NOT NULL,
    description VARCHAR(255),
    name        VARCHAR(100)  NOT NULL,
    sale_price  INTEGER,
    unit        VARCHAR(100),

    CONSTRAINT medicine_pkey PRIMARY KEY (id)
    );

-- ---------------------------------------------------------------------
-- Bảng 2: pharmacist
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pharmacist
(
    user_id     UUID NOT NULL,
    certificate VARCHAR(255),
    degree      VARCHAR(255),

    CONSTRAINT pharmacist_pkey PRIMARY KEY (user_id)
    );

-- ---------------------------------------------------------------------
-- Bảng 3: inventory_lot
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_lot
(
    id               UUID         NOT NULL,
    cost_price       INTEGER,
    expire_date      DATE,
    lot_no           VARCHAR(100) NOT NULL,
    quantity_on_hand INTEGER DEFAULT 0,
    medicine_id      UUID,

    CONSTRAINT inventory_lot_pkey PRIMARY KEY (id),
    CONSTRAINT uk_lot_no UNIQUE (lot_no),

    CONSTRAINT fk_inventory_lot_medicine
    FOREIGN KEY (medicine_id)
    REFERENCES public.medicine (id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Bảng 4: stock_ledger
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_ledger
(
    id               UUID NOT NULL,
    type             VARCHAR(255),
    quantity         INTEGER,
    reference_type   VARCHAR(255),
    reference_id     UUID,
    create_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_at        TIMESTAMP WITH TIME ZONE,
    inventory_lot_id UUID,
    pharmacist_id    UUID,

    CONSTRAINT stock_ledger_pkey PRIMARY KEY (id),

    CONSTRAINT fk_stock_ledger_inventory_lot
    FOREIGN KEY (inventory_lot_id)
    REFERENCES public.inventory_lot (id)
    ON DELETE RESTRICT,

    CONSTRAINT fk_stock_ledger_pharmacist
    FOREIGN KEY (pharmacist_id)
    REFERENCES public.pharmacist (user_id)
    ON DELETE SET NULL
    );

-- ---------------------------------------------------------------------
-- Bảng 5: dispense_order
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dispense_order
(
    id                 UUID NOT NULL,
    create_at          TIMESTAMP,
    doctor_id          UUID,
    medical_history_id UUID,
    prescription       UUID,
    status             VARCHAR(255),
    update_at          TIMESTAMP,
    pharmacist_id      UUID,

    CONSTRAINT dispense_order_pkey PRIMARY KEY (id),

    CONSTRAINT fk_dispense_order_pharmacist
    FOREIGN KEY (pharmacist_id)
    REFERENCES public.pharmacist (user_id)
    ON DELETE SET NULL
    );

-- ---------------------------------------------------------------------
-- Bảng 6: dispense_item
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dispense_item
(
    id                 UUID NOT NULL,
    dosage             VARCHAR(100),
    duration           VARCHAR(50),
    frequency          VARCHAR(50),
    price_at_dispense  INTEGER,
    quantity           INTEGER,
    usage_instructions VARCHAR(255),
    dispense_order_id  UUID,
    inventory_lot_id   UUID,

    CONSTRAINT dispense_item_pkey PRIMARY KEY (id),

    CONSTRAINT fk_item_dispense_order
    FOREIGN KEY (dispense_order_id)
    REFERENCES public.dispense_order (id)
    ON DELETE CASCADE,

    CONSTRAINT fk_item_inventory_lot
    FOREIGN KEY (inventory_lot_id)
    REFERENCES public.inventory_lot (id)
    ON DELETE SET NULL
    );

CREATE INDEX idx_inventory_lot_medicine_id ON public.inventory_lot (medicine_id);
CREATE INDEX idx_stock_ledger_inventory_lot_id ON public.stock_ledger (inventory_lot_id);
CREATE INDEX idx_stock_ledger_pharmacist_id ON public.stock_ledger (pharmacist_id);
CREATE INDEX idx_stock_ledger_reference_id ON public.stock_ledger (reference_id);
CREATE INDEX idx_dispense_order_pharmacist_id ON public.dispense_order (pharmacist_id);
CREATE INDEX idx_dispense_order_prescription ON public.dispense_order (prescription);
CREATE INDEX idx_dispense_item_inventory_lot_id ON public.dispense_item (inventory_lot_id);
CREATE INDEX idx_dispense_item_dispense_order_id ON public.dispense_item (dispense_order_id);

-- =========================================================
-- INSERT DATA
-- =========================================================

-- =========================================================
-- 1) PHARMACIST (3 người)
-- =========================================================
INSERT INTO public.pharmacist (user_id, certificate, degree)
VALUES 
('00000000-0000-0000-0000-000000000401', 'Chứng chỉ hành nghề Dược', 'Dược sĩ Đại học'),
('00000000-0000-0000-0000-000000000402', 'Chứng chỉ hành nghề Dược', 'Dược sĩ Đại học'),
('00000000-0000-0000-0000-000000000403', 'Chứng chỉ hành nghề Dược', 'Dược sĩ Cao đẳng');

-- =========================================================
-- 2) MEDICINE (20 loại thuốc nha khoa thường dùng)
-- =========================================================
INSERT INTO public.medicine (id, name, unit, description, sale_price)
VALUES
-- Kháng sinh
('aaaa0000-0000-0000-0000-000000000001', 'Amoxicillin 500mg', 'Viên', 'Kháng sinh nhóm Penicillin điều trị nhiễm trùng răng miệng', 3000),
('aaaa0000-0000-0000-0000-000000000002', 'Augmentin 625mg', 'Viên', 'Amoxicillin + Acid clavulanic, kháng sinh phổ rộng', 8000),
('aaaa0000-0000-0000-0000-000000000003', 'Azithromycin 250mg', 'Viên', 'Kháng sinh nhóm Macrolide, thay thế khi dị ứng Penicillin', 5000),
('aaaa0000-0000-0000-0000-000000000004', 'Metronidazole 250mg', 'Viên', 'Kháng sinh kháng kỵ khí, điều trị nhiễm trùng răng miệng', 2000),

-- Giảm đau - Kháng viêm
('aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg', 'Viên', 'Thuốc giảm đau, hạ sốt', 1000),
('aaaa0000-0000-0000-0000-000000000006', 'Ibuprofen 400mg', 'Viên', 'Thuốc giảm đau, kháng viêm NSAIDs', 3500),
('aaaa0000-0000-0000-0000-000000000007', 'Ketoprofen 100mg', 'Viên', 'Thuốc giảm đau, kháng viêm mạnh', 4500),
('aaaa0000-0000-0000-0000-000000000008', 'Tramadol 50mg', 'Viên', 'Thuốc giảm đau trung ương, dùng sau phẫu thuật', 6000),

-- Thuốc bảo vệ dạ dày
('aaaa0000-0000-0000-0000-000000000009', 'Omeprazole 20mg', 'Viên', 'Thuốc ức chế bơm proton, bảo vệ dạ dày', 3000),
('aaaa0000-0000-0000-0000-000000000010', 'Esomeprazole 40mg', 'Viên', 'Thuốc ức chế bơm proton thế hệ mới', 5000),

-- Thuốc súc miệng - Chống nhiễm trùng
('aaaa0000-0000-0000-0000-000000000011', 'Nước súc miệng Chlorhexidine 0.12%', 'Chai 250ml', 'Nước súc miệng kháng khuẩn sau phẫu thuật', 45000),
('aaaa0000-0000-0000-0000-000000000012', 'Nước súc miệng Betadine', 'Chai 250ml', 'Nước súc miệng sát khuẩn', 60000),

-- Corticoid
('aaaa0000-0000-0000-0000-000000000013', 'Prednisolone 5mg', 'Viên', 'Thuốc chống viêm Corticoid, giảm sưng sau phẫu thuật', 2500),
('aaaa0000-0000-0000-0000-000000000014', 'Dexamethasone 0.5mg', 'Viên', 'Thuốc Corticoid mạnh, giảm sưng nhanh', 3000),

-- Thuốc bôi tại chỗ
('aaaa0000-0000-0000-0000-000000000015', 'Gel bôi Metronidazole', 'Tuýp 15g', 'Gel kháng khuẩn bôi nướu, viêm lợi', 35000),
('aaaa0000-0000-0000-0000-000000000016', 'Gel bôi Lidocaine 2%', 'Tuýp 10g', 'Gel tê tại chỗ, giảm đau nướu', 28000),

-- Vitamin và khoáng chất
('aaaa0000-0000-0000-0000-000000000017', 'Vitamin C 500mg', 'Viên', 'Vitamin C hỗ trợ lành thương', 1500),
('aaaa0000-0000-0000-0000-000000000018', 'Calcium + Vitamin D3', 'Viên', 'Bổ sung canxi cho xương hàm', 4000),

-- Thuốc chống dị ứng
('aaaa0000-0000-0000-0000-000000000019', 'Cetirizine 10mg', 'Viên', 'Thuốc kháng histamin, chống dị ứng', 2000),
('aaaa0000-0000-0000-0000-000000000020', 'Loratadine 10mg', 'Viên', 'Thuốc kháng histamin không gây buồn ngủ', 2500);

-- =========================================================
-- 3) INVENTORY_LOT (Mỗi loại thuốc 1-3 lô)
-- =========================================================
INSERT INTO public.inventory_lot (id, lot_no, expire_date, quantity_on_hand, cost_price, medicine_id)
VALUES
-- Amoxicillin: 2 lô
('11110000-0000-0000-0000-000000000001', 'AMO2026-001', '2027-06-30', 500, 2500, 'aaaa0000-0000-0000-0000-000000000001'),
('11110000-0000-0000-0000-000000000002', 'AMO2026-002', '2027-08-30', 300, 2500, 'aaaa0000-0000-0000-0000-000000000001'),

-- Augmentin: 1 lô
('11110000-0000-0000-0000-000000000003', 'AUG2026-001', '2027-05-30', 200, 7000, 'aaaa0000-0000-0000-0000-000000000002'),

-- Azithromycin: 2 lô
('11110000-0000-0000-0000-000000000004', 'AZI2026-001', '2027-07-30', 150, 4500, 'aaaa0000-0000-0000-0000-000000000003'),
('11110000-0000-0000-0000-000000000005', 'AZI2026-002', '2027-09-30', 200, 4500, 'aaaa0000-0000-0000-0000-000000000003'),

-- Metronidazole: 1 lô
('11110000-0000-0000-0000-000000000006', 'MET2026-001', '2027-04-30', 400, 1800, 'aaaa0000-0000-0000-0000-000000000004'),

-- Paracetamol: 3 lô
('11110000-0000-0000-0000-000000000007', 'PAR2026-001', '2027-12-31', 1000, 800, 'aaaa0000-0000-0000-0000-000000000005'),
('11110000-0000-0000-0000-000000000008', 'PAR2026-002', '2028-02-28', 800, 800, 'aaaa0000-0000-0000-0000-000000000005'),
('11110000-0000-0000-0000-000000000009', 'PAR2026-003', '2028-04-30', 600, 800, 'aaaa0000-0000-0000-0000-000000000005'),

-- Ibuprofen: 2 lô
('11110000-0000-0000-0000-000000000010', 'IBU2026-001', '2027-10-31', 400, 3000, 'aaaa0000-0000-0000-0000-000000000006'),
('11110000-0000-0000-0000-000000000011', 'IBU2026-002', '2027-11-30', 300, 3000, 'aaaa0000-0000-0000-0000-000000000006'),

-- Ketoprofen: 1 lô
('11110000-0000-0000-0000-000000000012', 'KET2026-001', '2027-08-31', 200, 4000, 'aaaa0000-0000-0000-0000-000000000007'),

-- Tramadol: 1 lô
('11110000-0000-0000-0000-000000000013', 'TRA2026-001', '2027-06-30', 150, 5500, 'aaaa0000-0000-0000-0000-000000000008'),

-- Omeprazole: 2 lô
('11110000-0000-0000-0000-000000000014', 'OME2026-001', '2027-09-30', 300, 2500, 'aaaa0000-0000-0000-0000-000000000009'),
('11110000-0000-0000-0000-000000000015', 'OME2026-002', '2027-11-30', 250, 2500, 'aaaa0000-0000-0000-0000-000000000009'),

-- Esomeprazole: 1 lô
('11110000-0000-0000-0000-000000000016', 'ESO2026-001', '2027-07-31', 150, 4500, 'aaaa0000-0000-0000-0000-000000000010'),

-- Nước súc miệng Chlorhexidine: 2 lô
('11110000-0000-0000-0000-000000000017', 'CHL2026-001', '2027-12-31', 100, 40000, 'aaaa0000-0000-0000-0000-000000000011'),
('11110000-0000-0000-0000-000000000018', 'CHL2026-002', '2028-02-28', 80, 40000, 'aaaa0000-0000-0000-0000-000000000011'),

-- Nước súc miệng Betadine: 1 lô
('11110000-0000-0000-0000-000000000019', 'BET2026-001', '2027-06-30', 80, 55000, 'aaaa0000-0000-0000-0000-000000000012'),

-- Prednisolone: 1 lô
('11110000-0000-0000-0000-000000000020', 'PRE2026-001', '2027-10-31', 200, 2200, 'aaaa0000-0000-0000-0000-000000000013'),

-- Dexamethasone: 1 lô
('11110000-0000-0000-0000-000000000021', 'DEX2026-001', '2027-08-31', 150, 2700, 'aaaa0000-0000-0000-0000-000000000014'),

-- Gel Metronidazole: 2 lô
('11110000-0000-0000-0000-000000000022', 'GMET2026-001', '2027-05-31', 60, 32000, 'aaaa0000-0000-0000-0000-000000000015'),
('11110000-0000-0000-0000-000000000023', 'GMET2026-002', '2027-07-31', 50, 32000, 'aaaa0000-0000-0000-0000-000000000015'),

-- Gel Lidocaine: 1 lô
('11110000-0000-0000-0000-000000000024', 'GLID2026-001', '2027-04-30', 70, 25000, 'aaaa0000-0000-0000-0000-000000000016'),

-- Vitamin C: 2 lô
('11110000-0000-0000-0000-000000000025', 'VITC2026-001', '2028-06-30', 500, 1200, 'aaaa0000-0000-0000-0000-000000000017'),
('11110000-0000-0000-0000-000000000026', 'VITC2026-002', '2028-08-31', 400, 1200, 'aaaa0000-0000-0000-0000-000000000017'),

-- Calcium + Vitamin D3: 1 lô
('11110000-0000-0000-0000-000000000027', 'CAL2026-001', '2028-03-31', 300, 3500, 'aaaa0000-0000-0000-0000-000000000018'),

-- Cetirizine: 2 lô
('11110000-0000-0000-0000-000000000028', 'CET2026-001', '2027-11-30', 250, 1800, 'aaaa0000-0000-0000-0000-000000000019'),
('11110000-0000-0000-0000-000000000029', 'CET2026-002', '2028-01-31', 200, 1800, 'aaaa0000-0000-0000-0000-000000000019'),

-- Loratadine: 1 lô
('11110000-0000-0000-0000-000000000030', 'LOR2026-001', '2027-09-30', 180, 2200, 'aaaa0000-0000-0000-0000-000000000020');

-- =========================================================
-- 4) STOCK_LEDGER (Nhập kho cho tất cả lô)
-- =========================================================
INSERT INTO public.stock_ledger (id, type, quantity, reference_type, inventory_lot_id, pharmacist_id, create_at)
SELECT 
    gen_random_uuid(),
    'IN',
    il.quantity_on_hand,
    'IMPORT',
    il.id,
    '00000000-0000-0000-0000-000000000401',
    '2025-12-15 08:00:00+07'
FROM 
    inventory_lot il;

-- =========================================================
-- 5) DISPENSE_ORDER (Tương ứng với các lịch khám)
-- =========================================================
-- Chỉ tạo dispense order cho các lịch khám cần kê đơn thuốc
-- Giả sử các lịch khám sau cần kê đơn:
-- 101: Trám răng (giảm đau)
-- 102: Cạo vôi răng (súc miệng)
-- 104: Điều trị tủy (kháng sinh + giảm đau)
-- 106: Nhổ răng khôn (kháng sinh + giảm đau + chống sưng)
-- 107: Điều trị viêm lợi (súc miệng + gel bôi)
-- 108: Trám răng (giảm đau)
-- 109: Làm răng sứ (giảm đau nhẹ)
-- 112: Cấy ghép Implant (kháng sinh + giảm đau mạnh + chống sưng)
-- 115: Trám răng (giảm đau)
-- 116: Điều trị tủy (kháng sinh + giảm đau)

INSERT INTO public.dispense_order (id, create_at, update_at, status, doctor_id, medical_history_id, pharmacist_id)
VALUES
-- Ngày 4/1: Appointment 101, 102
('90000000-0000-0000-0000-000000000101', '2026-01-04 09:35:00+07', '2026-01-04 09:40:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007001', '00000000-0000-0000-0000-000000000401'),
('90000000-0000-0000-0000-000000000102', '2026-01-04 14:35:00+07', '2026-01-04 14:40:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007002', '00000000-0000-0000-0000-000000000401'),

-- Ngày 5/1: Appointment 103, 104
('90000000-0000-0000-0000-000000000103', '2026-01-05 10:05:00+07', '2026-01-05 10:15:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000203', '70000000-0000-0000-0000-000000007003', '00000000-0000-0000-0000-000000000402'),
('90000000-0000-0000-0000-000000000104', '2026-01-05 15:35:00+07', '2026-01-05 15:40:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007004', '00000000-0000-0000-0000-000000000401'),

-- Ngày 6/1: Appointment 105, 106
('90000000-0000-0000-0000-000000000105', '2026-01-06 10:05:00+07', '2026-01-06 10:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000202', '70000000-0000-0000-0000-000000007005', '00000000-0000-0000-0000-000000000403'),
('90000000-0000-0000-0000-000000000106', '2026-01-06 15:05:00+07', '2026-01-06 15:20:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007006', '00000000-0000-0000-0000-000000000401'),

-- Ngày 7/1: Appointment 107, 108
('90000000-0000-0000-0000-000000000107', '2026-01-07 10:05:00+07', '2026-01-07 10:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000204', '70000000-0000-0000-0000-000000007007', '00000000-0000-0000-0000-000000000402'),
('90000000-0000-0000-0000-000000000108', '2026-01-07 16:05:00+07', '2026-01-07 16:15:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007008', '00000000-0000-0000-0000-000000000401'),

-- Ngày 8/1: Appointment 109, 110
('90000000-0000-0000-0000-000000000109', '2026-01-08 09:05:00+07', '2026-01-08 09:20:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000205', '70000000-0000-0000-0000-000000007009', '00000000-0000-0000-0000-000000000402'),
('90000000-0000-0000-0000-000000000110', '2026-01-08 15:05:00+07', '2026-01-08 15:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007010', '00000000-0000-0000-0000-000000000401'),

-- Ngày 9/1: Appointment 111, 112
('90000000-0000-0000-0000-000000000111', '2026-01-09 10:05:00+07', '2026-01-09 10:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000202', '70000000-0000-0000-0000-000000007011', '00000000-0000-0000-0000-000000000403'),
('90000000-0000-0000-0000-000000000112', '2026-01-09 16:05:00+07', '2026-01-09 16:15:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000203', '70000000-0000-0000-0000-000000007012', '00000000-0000-0000-0000-000000000402'),

-- Ngày 10/1: Appointment 113, 114
('90000000-0000-0000-0000-000000000113', '2026-01-10 10:05:00+07', '2026-01-10 10:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007013', '00000000-0000-0000-0000-000000000401'),
('90000000-0000-0000-0000-000000000114', '2026-01-10 15:05:00+07', '2026-01-10 15:15:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000204', '70000000-0000-0000-0000-000000007014', '00000000-0000-0000-0000-000000000402'),

-- Ngày 11/1: Appointment 115, 116
('90000000-0000-0000-0000-000000000115', '2026-01-11 10:05:00+07', '2026-01-11 10:10:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000205', '70000000-0000-0000-0000-000000007015', '00000000-0000-0000-0000-000000000403'),
('90000000-0000-0000-0000-000000000116', '2026-01-11 16:35:00+07', '2026-01-11 16:40:00+07', 'COMPLETED', '00000000-0000-0000-0000-000000000201', '70000000-0000-0000-0000-000000007016', '00000000-0000-0000-0000-000000000401');

-- =========================================================
-- 6) DISPENSE_ITEM (16 dispense orders)
-- =========================================================
INSERT INTO public.dispense_item (id, dosage, frequency, duration, quantity, usage_instructions, price_at_dispense, dispense_order_id, inventory_lot_id)
VALUES
-- Dispense 101 (4/1 - Trám răng): Paracetamol
('91000000-0000-0000-0000-000000000101', '500mg', '3 lần/ngày', '3 ngày', 9, 'Uống sau ăn', 1000, '90000000-0000-0000-0000-000000000101', '11110000-0000-0000-0000-000000000007'),

-- Dispense 102 (4/1 - Cạo vôi): Nước súc miệng Chlorhexidine
('91000000-0000-0000-0000-000000000102', '10ml', '2 lần/ngày', '7 ngày', 1, 'Súc miệng sau ăn', 45000, '90000000-0000-0000-0000-000000000102', '11110000-0000-0000-0000-000000000017'),

-- Dispense 103 (5/1 - Điều trị tủy): Amoxicillin + Ibuprofen + Omeprazole
('91000000-0000-0000-0000-000000000103', '500mg', '3 lần/ngày', '5 ngày', 15, 'Uống sau ăn', 3000, '90000000-0000-0000-0000-000000000103', '11110000-0000-0000-0000-000000000001'),
('91000000-0000-0000-0000-000000000104', '400mg', '3 lần/ngày', '5 ngày', 15, 'Uống sau ăn', 3500, '90000000-0000-0000-0000-000000000103', '11110000-0000-0000-0000-000000000010'),
('91000000-0000-0000-0000-000000000105', '20mg', '2 lần/ngày', '5 ngày', 10, 'Uống trước ăn 30 phút', 3000, '90000000-0000-0000-0000-000000000103', '11110000-0000-0000-0000-000000000014'),

-- Dispense 104 (5/1 - Chụp răng sứ): Paracetamol
('91000000-0000-0000-0000-000000000106', '500mg', 'Khi cần', '3 ngày', 6, 'Uống khi đau sau làm răng sứ', 1000, '90000000-0000-0000-0000-000000000104', '11110000-0000-0000-0000-000000000008'),

-- Dispense 105 (6/1 - Dán sứ Veneer): Paracetamol
('91000000-0000-0000-0000-000000000107', '500mg', 'Khi cần', '3 ngày', 6, 'Uống khi đau sau làm răng sứ', 1000, '90000000-0000-0000-0000-000000000105', '11110000-0000-0000-0000-000000000008'),

-- Dispense 106 (6/1 - Cấy ghép Implant): Augmentin + Tramadol + Dexamethasone + Omeprazole + Nước súc miệng
('91000000-0000-0000-0000-000000000108', '625mg', '2 lần/ngày', '7 ngày', 14, 'Uống sau ăn', 8000, '90000000-0000-0000-0000-000000000106', '11110000-0000-0000-0000-000000000003'),
('91000000-0000-0000-0000-000000000109', '50mg', '3 lần/ngày', '5 ngày', 15, 'Uống sau ăn khi đau', 6000, '90000000-0000-0000-0000-000000000106', '11110000-0000-0000-0000-000000000013'),
('91000000-0000-0000-0000-000000000110', '0.5mg', '2 lần/ngày', '3 ngày', 6, 'Uống sau ăn', 3000, '90000000-0000-0000-0000-000000000106', '11110000-0000-0000-0000-000000000021'),
('91000000-0000-0000-0000-000000000111', '40mg', '2 lần/ngày', '7 ngày', 14, 'Uống trước ăn 30 phút', 5000, '90000000-0000-0000-0000-000000000106', '11110000-0000-0000-0000-000000000016'),
('91000000-0000-0000-0000-000000000112', '10ml', '3 lần/ngày', '14 ngày', 2, 'Súc miệng sau ăn', 60000, '90000000-0000-0000-0000-000000000106', '11110000-0000-0000-0000-000000000019'),

-- Dispense 107 (7/1 - Tư vấn chỉnh nha): Không cần thuốc (có thể thêm vitamin)
('91000000-0000-0000-0000-000000000113', '1 viên', '1 lần/ngày', '30 ngày', 30, 'Uống sau ăn sáng', 5000, '90000000-0000-0000-0000-000000000107', '11110000-0000-0000-0000-000000000023'),

-- Dispense 108 (7/1 - Điều trị tủy): Amoxicillin + Ibuprofen + Omeprazole
('91000000-0000-0000-0000-000000000114', '500mg', '3 lần/ngày', '7 ngày', 21, 'Uống sau ăn', 3000, '90000000-0000-0000-0000-000000000108', '11110000-0000-0000-0000-000000000002'),
('91000000-0000-0000-0000-000000000115', '400mg', '3 lần/ngày', '5 ngày', 15, 'Uống sau ăn', 3500, '90000000-0000-0000-0000-000000000108', '11110000-0000-0000-0000-000000000011'),
('91000000-0000-0000-0000-000000000116', '20mg', '2 lần/ngày', '7 ngày', 14, 'Uống trước ăn 30 phút', 3000, '90000000-0000-0000-0000-000000000108', '11110000-0000-0000-0000-000000000015'),

-- Dispense 109 (8/1 - Nhổ răng): Augmentin + Ketoprofen + Prednisolone
('91000000-0000-0000-0000-000000000117', '625mg', '2 lần/ngày', '7 ngày', 14, 'Uống sau ăn', 8000, '90000000-0000-0000-0000-000000000109', '11110000-0000-0000-0000-000000000003'),
('91000000-0000-0000-0000-000000000118', '100mg', '2 lần/ngày', '5 ngày', 10, 'Uống sau ăn', 4500, '90000000-0000-0000-0000-000000000109', '11110000-0000-0000-0000-000000000012'),
('91000000-0000-0000-0000-000000000119', '5mg', '2 lần/ngày', '3 ngày', 6, 'Uống sau ăn', 2500, '90000000-0000-0000-0000-000000000109', '11110000-0000-0000-0000-000000000020'),

-- Dispense 110 (8/1 - Điều trị viêm lợi): Gel Metronidazole + Nước súc Chlorhexidine
('91000000-0000-0000-0000-000000000120', 'Bôi mỏng', '3 lần/ngày', '7 ngày', 1, 'Bôi lên vùng viêm lợi', 35000, '90000000-0000-0000-0000-000000000110', '11110000-0000-0000-0000-000000000022'),
('91000000-0000-0000-0000-000000000121', '10ml', '2 lần/ngày', '7 ngày', 1, 'Súc miệng sau ăn', 45000, '90000000-0000-0000-0000-000000000110', '11110000-0000-0000-0000-000000000017'),

-- Dispense 111 (9/1 - Trám răng): Paracetamol
('91000000-0000-0000-0000-000000000122', '500mg', '3 lần/ngày', '3 ngày', 9, 'Uống sau ăn', 1000, '90000000-0000-0000-0000-000000000111', '11110000-0000-0000-0000-000000000007'),

-- Dispense 112 (9/1 - Điều trị tủy): Amoxicillin + Ibuprofen + Omeprazole
('91000000-0000-0000-0000-000000000123', '500mg', '3 lần/ngày', '7 ngày', 21, 'Uống sau ăn', 3000, '90000000-0000-0000-0000-000000000112', '11110000-0000-0000-0000-000000000002'),
('91000000-0000-0000-0000-000000000124', '400mg', '3 lần/ngày', '5 ngày', 15, 'Uống sau ăn', 3500, '90000000-0000-0000-0000-000000000112', '11110000-0000-0000-0000-000000000011'),
('91000000-0000-0000-0000-000000000125', '20mg', '2 lần/ngày', '7 ngày', 14, 'Uống trước ăn 30 phút', 3000, '90000000-0000-0000-0000-000000000112', '11110000-0000-0000-0000-000000000015'),

-- Dispense 113 (10/1 - Cạo vôi): Nước súc miệng Chlorhexidine
('91000000-0000-0000-0000-000000000126', '10ml', '2 lần/ngày', '7 ngày', 1, 'Súc miệng sau ăn', 45000, '90000000-0000-0000-0000-000000000113', '11110000-0000-0000-0000-000000000017'),

-- Dispense 114 (10/1 - Răng hàm sâu): Paracetamol
('91000000-0000-0000-0000-000000000127', '500mg', '3 lần/ngày', '2 ngày', 6, 'Uống sau ăn khi đau', 1000, '90000000-0000-0000-0000-000000000114', '11110000-0000-0000-0000-000000000007'),

-- Dispense 115 (11/1 - Tẩy trắng): Không cần thuốc (có thể thêm gel giảm ê buốt)
('91000000-0000-0000-0000-000000000128', 'Bôi mỏng', 'Khi ê buốt', '7 ngày', 1, 'Bôi lên răng khi ê buốt', 25000, '90000000-0000-0000-0000-000000000115', '11110000-0000-0000-0000-000000000024'),

-- Dispense 116 (11/1 - Khám định kỳ): Không cần thuốc (có thể thêm nước súc miệng)
('91000000-0000-0000-0000-000000000129', '10ml', '2 lần/ngày', '7 ngày', 1, 'Súc miệng sau ăn', 45000, '90000000-0000-0000-0000-000000000116', '11110000-0000-0000-0000-000000000017');

-- Cập nhật stock_ledger cho các lần xuất thuốc (OUT)
INSERT INTO public.stock_ledger (id, type, quantity, reference_type, reference_id, inventory_lot_id, pharmacist_id, create_at)
SELECT 
    gen_random_uuid(),
    'OUT',
    -di.quantity,  -- Số âm để đánh dấu xuất kho
    'DISPENSE',
    di.id,
    di.inventory_lot_id,
    dord.pharmacist_id,
    dord.create_at
FROM 
    dispense_item di
JOIN 
    dispense_order dord ON di.dispense_order_id = dord.id;

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
