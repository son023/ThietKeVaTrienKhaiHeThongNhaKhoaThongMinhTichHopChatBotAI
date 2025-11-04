-- 1. Bảng Medicine (Thuốc)
CREATE TABLE Medicine (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(100),
    description VARCHAR(255),
    salePrice INT
);

-- 2. Bảng InventoryLot (Lô thuốc trong kho)
CREATE TABLE InventoryLot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lotNo VARCHAR(100) UNIQUE NOT NULL,
    expireDate DATE,
    quantityOnHand INT DEFAULT 0,
    costPrice INT,
    medicineId UUID REFERENCES Medicine(id) -- Khóa ngoại UUID
);

-- 3. Bảng StockLedger (Sổ kho)
CREATE TABLE StockLedger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lot VARCHAR(255),
    type VARCHAR(255), -- 'IN', 'OUT', 'ADJUST'
    quantity INT,
    referenceType VARCHAR(255),
    inventoryLotId UUID REFERENCES InventoryLot(id) -- Khóa ngoại UUID
);

-- 4. Bảng DispenseOrder (Đơn cấp phát)
CREATE TABLE DispenseOrder (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pharmacistId INT, -- "pharmacitsId" đã sửa lại
    prescription VARCHAR(255),
    status VARCHAR(255),
    createAt TIMESTAMPTZ DEFAULT now(),
    updateAt TIMESTAMPTZ DEFAULT now()
);

-- 5. Bảng DispenseItem (Chi tiết đơn cấp phát)
CREATE TABLE DispenseItem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quantity INT,
    priceAtDispense INT,
    inventoryLotId UUID REFERENCES InventoryLot(id), -- Khóa ngoại UUID
    dispenseOrderId UUID REFERENCES DispenseOrder(id) -- Khóa ngoại UUID
);
-- 1. Thêm thuốc
-- Giả sử ID là: 'med_para_uuid'
INSERT INTO Medicine (id, name, unit, description, salePrice)
VALUES 
('aaaa1111-aaaa-4aaa-8aaa-111111111111', 'Paracetamol 500mg', 'Viên', 'Giảm đau, hạ sốt', 1000);

-- 2. Thêm lô thuốc
-- Giả sử ID là: 'lot_para_A100_uuid'
INSERT INTO InventoryLot (id, lotNo, expireDate, quantityOnHand, costPrice, medicineId)
VALUES 
('bbbb2222-bbbb-4bbb-8bbb-222222222222', 'LOTA100-2025', '2027-10-01', 1000, 700, 'aaaa1111-aaaa-4aaa-8aaa-111111111111'); -- link tới Paracetamol

-- 3. Ghi sổ kho (Nhập kho)
INSERT INTO StockLedger (lot, type, quantity, referenceType, inventoryLotId)
VALUES 
('LOTA100-2025', 'IN', 1000, 'PURCHASE_ORDER', 'bbbb2222-bbbb-4bbb-8bbb-222222222222'); -- link tới lô A100

-- 4. Tạo đơn cấp phát
-- Giả sử ID là: 'disp_ord_01_uuid'
INSERT INTO DispenseOrder (id, pharmacistId, prescription, status)
VALUES 
('cccc3333-cccc-4ccc-8ccc-333333333333', 12, 'PRESCRIPTION-XYZ-789', 'PENDING');

-- 5. Thêm chi tiết cấp phát (lấy 20 viên từ lô A100 cho đơn 01)
INSERT INTO DispenseItem (quantity, priceAtDispense, inventoryLotId, dispenseOrderId)
VALUES 
(20, 1000, 'bbbb2222-bbbb-4bbb-8bbb-222222222222', 'cccc3333-cccc-4ccc-8ccc-333333333333'); -- link tới lô A100 và đơn 01
