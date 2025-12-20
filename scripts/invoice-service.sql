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

