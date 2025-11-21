-- 1. Bảng medicine (Thuốc)
CREATE TABLE medicine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(100),
    description VARCHAR(255),
    sale_price INT
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
    reference_id VARCHAR(50),    -- ID của phiếu nhập hoặc đơn thuốc liên quan
    inventory_lot_id UUID REFERENCES inventory_lot(id)
);

-- 4. Bảng dispense_order (Đơn cấp phát)
CREATE TABLE dispense_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacist_id INT,
    prescription VARCHAR(255),
    status VARCHAR(255),
    medical_history_id VARCHAR(50), -- Thêm mới theo hình
    doctor_id VARCHAR(50),          -- Thêm mới theo hình
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
-- 1. Thêm thuốc
INSERT INTO medicine (id, name, unit, description, sale_price)
VALUES
('aaaa1111-aaaa-4aaa-8aaa-111111111111', 'Paracetamol 500mg', 'Viên', 'Giảm đau, hạ sốt', 1000);

-- 2. Thêm lô thuốc
INSERT INTO inventory_lot (id, lot_no, expire_date, quantity_on_hand, cost_price, medicine_id)
VALUES
('bbbb2222-bbbb-4bbb-8bbb-222222222222', 'LOTA100-2025', '2027-10-01', 1000, 700, 'aaaa1111-aaaa-4aaa-8aaa-111111111111');

-- 3. Ghi sổ kho (Nhập kho)
-- Cập nhật: Bỏ cột 'lot', thêm 'reference_id' (ví dụ mã phiếu nhập PO-001)
INSERT INTO stock_ledger (type, quantity, reference_type, reference_id, inventory_lot_id)
VALUES
('IN', 1000, 'PURCHASE_ORDER', 'PO-001', 'bbbb2222-bbbb-4bbb-8bbb-222222222222');

-- 4. Tạo đơn cấp phát
-- Cập nhật: Thêm medical_history_id và doctor_id
INSERT INTO dispense_order (id, pharmacist_id, prescription, status, medical_history_id, doctor_id)
VALUES
('cccc3333-cccc-4ccc-8ccc-333333333333', 12, 'PRESCRIPTION-XYZ-789', 'PENDING', 'HIST-001', 'DOC-007');

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