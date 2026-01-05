DROP TABLE IF EXISTS invoice_item CASCADE;
DROP TABLE IF EXISTS invoice CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: invoice
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
    status              VARCHAR(50),
    total_amount        INTEGER,
    update_at           TIMESTAMP,

    CONSTRAINT invoice_pkey PRIMARY KEY (id)
    );

-- ---------------------------------------------------------------------
-- Bảng 2: invoice_item
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
    service_type         VARCHAR(50),
    unit_price           INTEGER,
    invoice_id           UUID NOT NULL,

    CONSTRAINT invoice_item_pkey PRIMARY KEY (id),
    CONSTRAINT fk_invoice_item_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_invoice_appointment_id ON public.invoice (appointment_id);
CREATE INDEX idx_invoice_receptionist_id ON public.invoice (receptionist_id);
CREATE INDEX idx_invoice_item_invoice_id ON public.invoice_item (invoice_id);

-- =========================================================
-- INSERT DATA - INVOICES FOR ALL 16 APPOINTMENTS (4/1-11/1)
-- =========================================================
-- Invoice cho các appointment có BHYT (101, 102, 103, 108, 112, 116)
-- Invoice cho các appointment không có BHYT (104-107, 109-111, 113-115)

INSERT INTO public.invoice (id, appointment_id, receptionist_id, insurance_claim_id, total_amount, insurance_total_pay, patient_total_pay, status, issue_at, paid_at, update_at, currency)
VALUES
-- Ngày 4/1: Invoice 101, 102
('f1f1f1f1-1111-1111-1111-111111111101', '44000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000301', 'd1d1d1d1-1111-1111-1111-111111111101', 359000, 280000, 79000, 'PAID', '2026-01-04 09:30:00+07', '2026-01-04 09:45:00+07', '2026-01-04 09:45:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111102', '44000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000301', 'd1d1d1d1-1111-1111-1111-111111111102', 395000, 200000, 195000, 'PAID', '2026-01-04 14:30:00+07', '2026-01-04 14:45:00+07', '2026-01-04 14:45:00+07', 'VND'),

-- Ngày 5/1: Invoice 103, 104
('f1f1f1f1-1111-1111-1111-111111111103', '44000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000302', 'd1d1d1d1-1111-1111-1111-111111111103', 1327500, 902000, 425500, 'PAID', '2026-01-05 10:00:00+07', '2026-01-05 10:30:00+07', '2026-01-05 10:30:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111104', '44000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000301', NULL, 12006000, 0, 12006000, 'PAID', '2026-01-05 15:30:00+07', '2026-01-05 16:00:00+07', '2026-01-05 16:00:00+07', 'VND'),

-- Ngày 6/1: Invoice 105, 106
('f1f1f1f1-1111-1111-1111-111111111105', '44000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000302', NULL, 18006000, 0, 18006000, 'PAID', '2026-01-06 10:00:00+07', '2026-01-06 10:30:00+07', '2026-01-06 10:30:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111106', '44000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000301', NULL, 18385000, 0, 18385000, 'PAID', '2026-01-06 15:00:00+07', '2026-01-06 15:30:00+07', '2026-01-06 15:30:00+07', 'VND'),

-- Ngày 7/1: Invoice 107, 108
('f1f1f1f1-1111-1111-1111-111111111107', '44000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000303', NULL, 5000000, 0, 5000000, 'PAID', '2026-01-07 10:00:00+07', '2026-01-07 10:30:00+07', '2026-01-07 10:30:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111108', '44000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000301', 'd1d1d1d1-1111-1111-1111-111111111108', 1357500, 926000, 431500, 'PAID', '2026-01-07 16:00:00+07', '2026-01-07 16:30:00+07', '2026-01-07 16:30:00+07', 'VND'),

-- Ngày 8/1: Invoice 109, 110
('f1f1f1f1-1111-1111-1111-111111111109', '44000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000302', NULL, 1732000, 0, 1732000, 'PAID', '2026-01-08 10:00:00+07', '2026-01-08 10:30:00+07', '2026-01-08 10:30:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111110', '44000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000301', NULL, 3080000, 0, 3080000, 'PAID', '2026-01-08 15:00:00+07', '2026-01-08 15:30:00+07', '2026-01-08 15:30:00+07', 'VND'),

-- Ngày 9/1: Invoice 111, 112
('f1f1f1f1-1111-1111-1111-111111111111', '44000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000301', NULL, 359000, 0, 359000, 'PAID', '2026-01-09 10:00:00+07', '2026-01-09 10:15:00+07', '2026-01-09 10:15:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111112', '44000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000302', 'd1d1d1d1-1111-1111-1111-111111111112', 1357500, 926000, 431500, 'PAID', '2026-01-09 16:00:00+07', '2026-01-09 16:30:00+07', '2026-01-09 16:30:00+07', 'VND'),

-- Ngày 10/1: Invoice 113, 114
('f1f1f1f1-1111-1111-1111-111111111113', '44000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000303', NULL, 395000, 0, 395000, 'PAID', '2026-01-10 10:00:00+07', '2026-01-10 10:15:00+07', '2026-01-10 10:15:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111114', '44000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000301', NULL, 356000, 0, 356000, 'PAID', '2026-01-10 15:00:00+07', '2026-01-10 15:15:00+07', '2026-01-10 15:15:00+07', 'VND'),

-- Ngày 11/1: Invoice 115, 116
('f1f1f1f1-1111-1111-1111-111111111115', '44000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000302', NULL, 3025000, 0, 3025000, 'PAID', '2026-01-11 10:00:00+07', '2026-01-11 10:30:00+07', '2026-01-11 10:30:00+07', 'VND'),
('f1f1f1f1-1111-1111-1111-111111111116', '44000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000301', NULL, 145000, 0, 145000, 'PAID', '2026-01-11 16:00:00+07', '2026-01-11 16:15:00+07', '2026-01-11 16:15:00+07', 'VND');

-- =========================================================
-- INSERT INVOICE_ITEMS (16 invoices)
-- =========================================================
INSERT INTO public.invoice_item (id, invoice_id, service_type, reference_id, description, quantity, unit_price, patient_pay_amount, insurance_pay_amount)
VALUES
-- Invoice 101 (4/1 - Trám răng): Trám răng + Paracetamol
('a1010101-0101-0101-0101-010101010101', 'f1f1f1f1-1111-1111-1111-111111111101', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000018', 'Hàn răng', 1, 350000, 70000, 280000),
('a1010101-0101-0101-0101-010101010102', 'f1f1f1f1-1111-1111-1111-111111111101', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg x9 viên', 9, 1000, 9000, 0),

-- Invoice 102 (4/1 - Cạo vôi): Cạo vôi răng + Nước súc miệng
('a1020202-0202-0202-0202-020202020201', 'f1f1f1f1-1111-1111-1111-111111111102', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000019', 'Lấy cao răng', 1, 350000, 150000, 200000),
('a1020202-0202-0202-0202-020202020202', 'f1f1f1f1-1111-1111-1111-111111111102', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000011', 'Nước súc miệng Chlorhexidine', 1, 45000, 45000, 0),

-- Invoice 103 (5/1 - Điều trị tủy): Điều trị tủy + thuốc
('a1030303-0303-0303-0303-030303030301', 'f1f1f1f1-1111-1111-1111-111111111103', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000014', 'Điều trị tủy răng', 1, 1200000, 400000, 800000),
('a1030303-0303-0303-0303-030303030302', 'f1f1f1f1-1111-1111-1111-111111111103', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000001', 'Amoxicillin 500mg x15 viên', 15, 3000, 9000, 36000),
('a1030303-0303-0303-0303-030303030303', 'f1f1f1f1-1111-1111-1111-111111111103', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000006', 'Ibuprofen 400mg x15 viên', 15, 3500, 10500, 42000),
('a1030303-0303-0303-0303-030303030304', 'f1f1f1f1-1111-1111-1111-111111111103', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000009', 'Omeprazole 20mg x10 viên', 10, 3000, 6000, 24000),

-- Invoice 104 (5/1 - Chụp răng sứ): Răng sứ x2 + Paracetamol
('a1040404-0404-0404-0404-040404040401', 'f1f1f1f1-1111-1111-1111-111111111104', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000008', 'Chụp răng sứ cao cấp (2 răng)', 2, 6000000, 12000000, 0),
('a1040404-0404-0404-0404-040404040402', 'f1f1f1f1-1111-1111-1111-111111111104', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg x6 viên', 6, 1000, 6000, 0),

-- Invoice 105 (6/1 - Dán sứ Veneer): Dán sứ Veneer x2
('a1050505-0505-0505-0505-050505050501', 'f1f1f1f1-1111-1111-1111-111111111105', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000007', 'Dán sứ Veneer (2 răng)', 2, 9000000, 18000000, 0),

-- Invoice 106 (6/1 - Cấy ghép Implant): Implant + thuốc
('a1060606-0606-0606-0606-060606060601', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000010', 'Cấy ghép Implant Hàn Quốc', 1, 18000000, 18000000, 0),
('a1060606-0606-0606-0606-060606060602', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000002', 'Augmentin 625mg x14 viên', 14, 8000, 112000, 0),
('a1060606-0606-0606-0606-060606060603', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000008', 'Tramadol 50mg x15 viên', 15, 6000, 90000, 0),
('a1060606-0606-0606-0606-060606060604', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000014', 'Dexamethasone 0.5mg x6 viên', 6, 3000, 18000, 0),
('a1060606-0606-0606-0606-060606060605', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000010', 'Esomeprazole 40mg x14 viên', 14, 5000, 70000, 0),
('a1060606-0606-0606-0606-060606060606', 'f1f1f1f1-1111-1111-1111-111111111106', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000012', 'Nước súc miệng Betadine x2', 2, 60000, 120000, 0),

-- Invoice 107 (7/1 - Tư vấn chỉnh nha): Tư vấn chỉnh nha + chụp phim
('a1070707-0707-0707-0707-070707070701', 'f1f1f1f1-1111-1111-1111-111111111107', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000001', 'Tư vấn chỉnh nha + chụp phim', 1, 5000000, 5000000, 0),

-- Invoice 108 (7/1 - Điều trị tủy): Điều trị tủy + thuốc
('a1080808-0808-0808-0808-080808080801', 'f1f1f1f1-1111-1111-1111-111111111108', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000014', 'Điều trị tủy răng', 1, 1200000, 400000, 800000),
('a1080808-0808-0808-0808-080808080802', 'f1f1f1f1-1111-1111-1111-111111111108', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000001', 'Amoxicillin 500mg x21 viên', 21, 3000, 12600, 50400),
('a1080808-0808-0808-0808-080808080803', 'f1f1f1f1-1111-1111-1111-111111111108', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000006', 'Ibuprofen 400mg x15 viên', 15, 3500, 10500, 42000),
('a1080808-0808-0808-0808-080808080804', 'f1f1f1f1-1111-1111-1111-111111111108', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000009', 'Omeprazole 20mg x14 viên', 14, 3000, 8400, 33600),

-- Invoice 109 (8/1 - Nhổ răng): Nhổ răng + thuốc
('a1090909-0909-0909-0909-090909090901', 'f1f1f1f1-1111-1111-1111-111111111109', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000013', 'Nhổ răng khôn', 1, 1500000, 1500000, 0),
('a1090909-0909-0909-0909-090909090902', 'f1f1f1f1-1111-1111-1111-111111111109', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000002', 'Augmentin 625mg x14 viên', 14, 8000, 112000, 0),
('a1090909-0909-0909-0909-090909090903', 'f1f1f1f1-1111-1111-1111-111111111109', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000007', 'Ketoprofen 100mg x10 viên', 10, 4500, 45000, 0),
('a1090909-0909-0909-0909-090909090904', 'f1f1f1f1-1111-1111-1111-111111111109', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000013', 'Prednisolone 5mg x6 viên', 6, 2500, 15000, 0),

-- Invoice 110 (8/1 - Điều trị viêm lợi): Điều trị viêm lợi + gel + nước súc
('a1101010-1010-1010-1010-101010101001', 'f1f1f1f1-1111-1111-1111-111111111110', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000015', 'Điều trị viêm lợi bằng Laser', 1, 3000000, 3000000, 0),
('a1101010-1010-1010-1010-101010101002', 'f1f1f1f1-1111-1111-1111-111111111110', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000015', 'Gel Metronidazole', 1, 35000, 35000, 0),
('a1101010-1010-1010-1010-101010101003', 'f1f1f1f1-1111-1111-1111-111111111110', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000011', 'Nước súc miệng Chlorhexidine', 1, 45000, 45000, 0),

-- Invoice 111 (9/1 - Trám răng): Trám răng + Paracetamol
('a1111111-1111-1111-1111-111111111101', 'f1f1f1f1-1111-1111-1111-111111111111', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000018', 'Hàn răng', 1, 350000, 350000, 0),
('a1111111-1111-1111-1111-111111111102', 'f1f1f1f1-1111-1111-1111-111111111111', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg x9 viên', 9, 1000, 9000, 0),

-- Invoice 112 (9/1 - Điều trị tủy): Điều trị tủy + thuốc
('a1121212-1212-1212-1212-121212121201', 'f1f1f1f1-1111-1111-1111-111111111112', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000014', 'Điều trị tủy răng', 1, 1200000, 400000, 800000),
('a1121212-1212-1212-1212-121212121202', 'f1f1f1f1-1111-1111-1111-111111111112', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000001', 'Amoxicillin 500mg x21 viên', 21, 3000, 12600, 50400),
('a1121212-1212-1212-1212-121212121203', 'f1f1f1f1-1111-1111-1111-111111111112', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000006', 'Ibuprofen 400mg x15 viên', 15, 3500, 10500, 42000),
('a1121212-1212-1212-1212-121212121204', 'f1f1f1f1-1111-1111-1111-111111111112', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000009', 'Omeprazole 20mg x14 viên', 14, 3000, 8400, 33600),

-- Invoice 113 (10/1 - Cạo vôi): Cạo vôi răng + Nước súc miệng
('a1131313-1313-1313-1313-131313131301', 'f1f1f1f1-1111-1111-1111-111111111113', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000019', 'Lấy cao răng', 1, 350000, 350000, 0),
('a1131313-1313-1313-1313-131313131302', 'f1f1f1f1-1111-1111-1111-111111111113', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000011', 'Nước súc miệng Chlorhexidine', 1, 45000, 45000, 0),

-- Invoice 114 (10/1 - Răng hàm sâu): Trám răng
('a1141414-1414-1414-1414-141414141401', 'f1f1f1f1-1111-1111-1111-111111111114', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000018', 'Hàn răng', 1, 350000, 350000, 0),
('a1141414-1414-1414-1414-141414141402', 'f1f1f1f1-1111-1111-1111-111111111114', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000005', 'Paracetamol 500mg x6 viên', 6, 1000, 6000, 0),

-- Invoice 115 (11/1 - Tẩy trắng): Tẩy trắng răng + Gel giảm ê buốt
('a1151515-1515-1515-1515-151515151501', 'f1f1f1f1-1111-1111-1111-111111111115', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000017', 'Tẩy trắng răng', 1, 3000000, 3000000, 0),
('a1151515-1515-1515-1515-151515151502', 'f1f1f1f1-1111-1111-1111-111111111115', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000016', 'Gel giảm ê buốt', 1, 25000, 25000, 0),

-- Invoice 116 (11/1 - Khám định kỳ): Chụp phim Xquang + Nước súc miệng
('a1161616-1616-1616-1616-161616161601', 'f1f1f1f1-1111-1111-1111-111111111116', 'MEDICAL_SERVICE', '33000000-0000-0000-0000-000000000020', 'Chụp phim Xquang', 1, 100000, 100000, 0),
('a1161616-1616-1616-1616-161616161602', 'f1f1f1f1-1111-1111-1111-111111111116', 'MEDICINE', 'aaaa0000-0000-0000-0000-000000000011', 'Nước súc miệng Chlorhexidine', 1, 45000, 45000, 0);

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
