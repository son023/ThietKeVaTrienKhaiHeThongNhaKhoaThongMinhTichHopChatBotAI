DROP TABLE IF EXISTS invoice_item CASCADE;
DROP TABLE IF EXISTS invoice CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: invoice
-- Lưu trữ thông tin hóa đơn tổng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice
(
    id                  UUID NOT NULL,
    appointment_id      UUID,
    currency            VARCHAR(10) DEFAULT 'VND',
    insurance_claim_id  UUID,
    insurance_total_pay INTEGER,
    issue_at            TIMESTAMP,
    paid_at             TIMESTAMP,
    patient_total_pay   INTEGER,
    receptionist_id     UUID,
    status              VARCHAR(50), -- PENDING, PAID, CANCELLED
    total_amount        INTEGER,
    update_at           TIMESTAMP,

-- Khóa chính
    CONSTRAINT invoice_pkey PRIMARY KEY (id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: invoice_item
-- Chi tiết từng mục trong hóa đơn (Liên kết N-1 với Invoice)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_item
(
    id                   UUID NOT NULL,
    claim_item_id        UUID,
    description          VARCHAR(255),
    insurance_pay_amount INTEGER,
    patient_pay_amount   INTEGER,
    quantity             INTEGER,
    reference_id         UUID,
    service_type         VARCHAR(50),   -- SERVICE, MEDICINE
    unit_price           INTEGER,
    invoice_id           UUID NOT NULL,

-- Khóa chính
    CONSTRAINT invoice_item_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng invoice
    CONSTRAINT fk_invoice_item_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Tạo Index để tối ưu hóa truy vấn
-- ---------------------------------------------------------------------
CREATE INDEX idx_invoice_appointment_id ON public.invoice (appointment_id);
CREATE INDEX idx_invoice_receptionist_id ON public.invoice (receptionist_id);
CREATE INDEX idx_invoice_item_invoice_id ON public.invoice_item (invoice_id);


-- =====================================================================
-- INSERT DATA (Dữ liệu mẫu)
-- =====================================================================

-- 1. Insert Invoice (Hóa đơn)
INSERT INTO public.invoice (
    id,
    receptionist_id,
    appointment_id,
    total_amount,
    currency,
    status,
    issue_at,
    paid_at,
    insurance_total_pay,
    patient_total_pay,
    insurance_claim_id,
    update_at
)
VALUES ('3fa85f64-5717-4562-b3fc-2c963f66afa6', -- id
        'd903022a-1000-4001-8001-000000000004', -- receptionist_id
        '44444444-0000-0000-0000-000000000001', -- appointment_id
        6000, -- total_amount
        'VND', -- currency
        'PAID', -- status
        NULL, -- issue_at (trong dump là \N)
        '2025-12-08 17:44:47.151374', -- paid_at
        2850, -- insurance_total_pay
        3150, -- patient_total_pay
        'a42319f1-9e54-43fe-98d4-aae2264c030c', -- insurance_claim_id
        '2025-12-08 17:44:47.154003' -- update_at
       ),
    (
        '4ca85f64-5717-4562-b3fc-2c963f66afa6', -- id
        NULL,
        '44444444-0000-0000-0000-000000000002', -- appointment_id
        NULL,
        'VND',
        'PENDING',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL

    );

-- 2. Insert Invoice Item (Chi tiết hóa đơn)
INSERT INTO public.invoice_item (
    id,
    invoice_id,
    reference_id,
    service_type,
    quantity,
    description,
    unit_price,
    insurance_pay_amount,
    patient_pay_amount,
    claim_item_id
)
VALUES
-- Item 1: Thuốc Paracetamol
(
    '919cd127-f919-46d2-a121-3e73f05a9381', -- id
    '3fa85f64-5717-4562-b3fc-2c963f66afa6', -- invoice_id
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- reference_id
    'MEDICINE',                             -- service_type
    1,                                      -- quantity
    'Paracetamol 500mg',                    -- description
    1000,                                   -- unit_price
    950,                                    -- insurance_pay_amount
    50,                                     -- patient_pay_amount
    '574c2f51-9934-4704-9c29-3ce24bd8b660'  -- claim_item_id
),
-- Item 2: Thuốc Amoxicillin
(
    '15ef2fe1-23ad-451c-9e88-8157580207c9', -- id
    '3fa85f64-5717-4562-b3fc-2c963f66afa6', -- invoice_id
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- reference_id
    'MEDICINE',                             -- service_type
    1,                                      -- quantity
    'Amoxicillin 500mg',                    -- description
    2000,                                   -- unit_price
    1900,                                   -- insurance_pay_amount
    100,                                    -- patient_pay_amount
    'db96c281-6f68-4b27-bf7f-5deea15bec69'  -- claim_item_id
),
-- Item 3: Dịch vụ Nhổ răng khôn
(
    'a01a692e-5d00-4c3a-9d28-d7d0df4462cc', -- id
    '3fa85f64-5717-4562-b3fc-2c963f66afa6', -- invoice_id
    'f5f5f5f5-5555-4555-8555-555555555556', -- reference_id
    'DENTAL',                               -- service_type
    1,                                      -- quantity
    'Nhổ răng khôn',                        -- description
    3000,                                   -- unit_price
    0,                                      -- insurance_pay_amount
    3000,                                   -- patient_pay_amount
    NULL                                    -- claim_item_id (trong dump là \N)
);