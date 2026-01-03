DROP TABLE IF EXISTS public.patient_allergy CASCADE;
DROP TABLE IF EXISTS public.tooth_issue CASCADE;
DROP TABLE IF EXISTS public.underlying_disease CASCADE;
DROP TABLE IF EXISTS public.allergy CASCADE;
DROP TABLE IF EXISTS public.medical_history CASCADE;
DROP TABLE IF EXISTS public.patient CASCADE;
DROP TABLE IF EXISTS public.condition CASCADE;

CREATE TABLE IF NOT EXISTS public.patient
(
    user_id          UUID NOT NULL,
    dob              DATE,
    gender           VARCHAR(50),
    address          TEXT,
    contact_phone    VARCHAR(50),
    blood_type       VARCHAR(20),
    insurance_number VARCHAR(100),

    CONSTRAINT patient_pkey PRIMARY KEY (user_id)
    );

-- ---------------------------------------------------------------------
-- Bảng 2: tooth_issue (Vấn đề răng miệng)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tooth_issue
(
    id             UUID NOT NULL,
    tooth_number   INTEGER NOT NULL,
    status         VARCHAR(50),
    description    TEXT,
    diagnosed_date DATE,
    note           TEXT,
    patient_id     UUID NOT NULL,

    CONSTRAINT tooth_issue_pkey PRIMARY KEY (id),
    CONSTRAINT fk_tooth_issue_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_tooth_issue_patient_id ON public.tooth_issue (patient_id);

-- ---------------------------------------------------------------------
-- Bảng 3: underlying_disease (Bệnh nền)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.underlying_disease
(
    id          UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    status      VARCHAR(50),
    severity    VARCHAR(50),
    is_verified BOOLEAN,
    note        TEXT,
    patient_id  UUID NOT NULL,

    CONSTRAINT underlying_disease_pkey PRIMARY KEY (id),
    CONSTRAINT fk_underlying_disease_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_underlying_disease_patient_id ON public.underlying_disease (patient_id);

-- ---------------------------------------------------------------------
-- Bảng 4: medical_history (Hồ sơ bệnh án)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id                 UUID NOT NULL,
    appointment_id     UUID,
    created_at         TIMESTAMP WITH TIME ZONE,
    symptoms           VARCHAR(255),
    updated_at         TIMESTAMP WITH TIME ZONE,
    patient_profile_id UUID NOT NULL,

    CONSTRAINT medical_history_pkey PRIMARY KEY (id),
    CONSTRAINT fk_medical_history_patient
    FOREIGN KEY (patient_profile_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE
    );

CREATE INDEX idx_medical_history_patient_id ON public.medical_history (patient_profile_id);

-- ---------------------------------------------------------------------
-- Tạo Bảng condition
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.condition
(
    id                 UUID PRIMARY KEY,
    medical_history_id UUID NOT NULL,
    tooth_number        INT,
    name               VARCHAR(255),
    status             VARCHAR(50),
    treatment          VARCHAR(255),
    surface            VARCHAR(255),

    CONSTRAINT fk_condition_medical_history
    FOREIGN KEY (medical_history_id)
    REFERENCES public.medical_history (id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Bảng 5: allergy (Danh mục dị ứng - Master Data)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.allergy
(
    id          UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(100),
    description TEXT,

    CONSTRAINT allergy_pkey PRIMARY KEY (id)
    );

-- ---------------------------------------------------------------------
-- Bảng 6: patient_allergy (Liên kết bệnh nhân và dị ứng)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_allergy
(
    id         UUID NOT NULL,
    patient_id UUID NOT NULL,
    allergy_id UUID NOT NULL,
    severity   VARCHAR(50),
    reaction   VARCHAR(255),
    note       TEXT,

    CONSTRAINT patient_allergy_pkey PRIMARY KEY (id),
    CONSTRAINT fk_patient_allergy_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE,
    CONSTRAINT fk_patient_allergy_allergy
    FOREIGN KEY (allergy_id)
    REFERENCES public.allergy (id)
    ON DELETE RESTRICT
    );

CREATE INDEX idx_patient_allergy_patient_id ON public.patient_allergy (patient_id);
CREATE INDEX idx_patient_allergy_allergy_id ON public.patient_allergy (allergy_id);

-- =========================================================
-- INSERT DATA
-- =========================================================

-- =========================================================
-- 1) PATIENT (10 người)
-- =========================================================
INSERT INTO patient (user_id, dob, gender, address, contact_phone, blood_type, insurance_number) VALUES
('00000000-0000-0000-0000-000000000101', DATE '1995-03-18', 'FEMALE', '12 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM', '0905123456', 'O_POSITIVE', 'HS4520950318001'),
('00000000-0000-0000-0000-000000000102', DATE '1992-11-02', 'MALE', '85 Lê Lợi, Q. Hải Châu, Đà Nẵng', '0912345678', 'A_POSITIVE', 'DN4520921102002'),
('00000000-0000-0000-0000-000000000103', DATE '1998-07-25', 'FEMALE', '220 Cầu Giấy, Q. Cầu Giấy, Hà Nội', '0987654321', 'B_POSITIVE', 'HN4520980725003'),
('00000000-0000-0000-0000-000000000104', DATE '1990-05-14', 'MALE', '45 Trần Hưng Đạo, Q.5, TP.HCM', '0901234567', 'AB_POSITIVE', 'HS4520900514004'),
('00000000-0000-0000-0000-000000000105', DATE '1996-09-30', 'FEMALE', '78 Lý Thường Kiệt, Q. Hoàn Kiếm, Hà Nội', '0923456789', 'O_POSITIVE', 'HN4520960930005'),
('00000000-0000-0000-0000-000000000106', DATE '1993-12-08', 'MALE', '156 Hai Bà Trưng, Q.1, TP.HCM', '0934567890', 'A_POSITIVE', 'HS4520931208006'),
('00000000-0000-0000-0000-000000000107', DATE '1997-04-22', 'FEMALE', '90 Nguyễn Trãi, Q. Thanh Xuân, Hà Nội', '0945678901', 'B_POSITIVE', 'HN4520970422007'),
('00000000-0000-0000-0000-000000000108', DATE '1991-08-16', 'MALE', '234 Lê Lợi, Q.3, TP.HCM', '0956789012', 'O_POSITIVE', 'HS4520910816008'),
('00000000-0000-0000-0000-000000000109', DATE '1994-02-11', 'FEMALE', '67 Phan Đình Phùng, Q. Ba Đình, Hà Nội', '0967890123', 'AB_POSITIVE', 'HN4520940211009'),
('00000000-0000-0000-0000-000000000110', DATE '1999-10-05', 'MALE', '123 Điện Biên Phủ, Q. Bình Thạnh, TP.HCM', '0978901234', 'A_POSITIVE', 'HS4520991005010');

-- =========================================================
-- 2) ALLERGY (Tất cả các loại dị ứng có thể)
-- =========================================================
INSERT INTO allergy (id, name, type, description) VALUES
('00000000-0000-0000-0000-000000006101', 'Penicillin', 'DRUG', 'Dị ứng kháng sinh nhóm penicillin'),
('00000000-0000-0000-0000-000000006102', 'Amoxicillin', 'DRUG', 'Dị ứng kháng sinh amoxicillin'),
('00000000-0000-0000-0000-000000006103', 'Lidocaine', 'DRUG', 'Dị ứng thuốc tê lidocaine'),
('00000000-0000-0000-0000-000000006104', 'Articaine', 'DRUG', 'Dị ứng thuốc tê articaine'),
('00000000-0000-0000-0000-000000006105', 'NSAIDs', 'DRUG', 'Dị ứng thuốc giảm đau kháng viêm NSAIDs'),
('00000000-0000-0000-0000-000000006106', 'Ibuprofen', 'DRUG', 'Dị ứng ibuprofen'),
('00000000-0000-0000-0000-000000006107', 'Aspirin', 'DRUG', 'Dị ứng aspirin'),
('00000000-0000-0000-0000-000000006108', 'Latex', 'MATERIAL', 'Dị ứng cao su latex (găng tay)'),
('00000000-0000-0000-0000-000000006109', 'Acrylic', 'MATERIAL', 'Dị ứng nhựa acrylic (hàm tạm)'),
('00000000-0000-0000-0000-000000006110', 'Nickel', 'MATERIAL', 'Dị ứng kim loại nickel'),
('00000000-0000-0000-0000-000000006111', 'Chromium', 'MATERIAL', 'Dị ứng kim loại chromium'),
('00000000-0000-0000-0000-000000006112', 'Hải sản', 'FOOD', 'Dị ứng hải sản'),
('00000000-0000-0000-0000-000000006113', 'Sữa', 'FOOD', 'Dị ứng lactose/sữa'),
('00000000-0000-0000-0000-000000006114', 'Đậu phộng', 'FOOD', 'Dị ứng đậu phộng'),
('00000000-0000-0000-0000-000000006115', 'Bụi nhà', 'ENV', 'Dị ứng bụi nhà'),
('00000000-0000-0000-0000-000000006116', 'Phấn hoa', 'ENV', 'Dị ứng phấn hoa'),
('00000000-0000-0000-0000-000000006117', 'Lông thú', 'ENV', 'Dị ứng lông chó mèo'),
('00000000-0000-0000-0000-000000006118', 'Nấm mốc', 'ENV', 'Dị ứng nấm mốc');

-- =========================================================
-- 3) PATIENT_ALLERGY (Mỗi bệnh nhân 0-2 dị ứng)
-- =========================================================
INSERT INTO patient_allergy (id, severity, reaction, note, patient_id, allergy_id) VALUES
-- Patient 101: 2 dị ứng
('10000000-0000-0000-0000-000000006301', 'HIGH', 'Nổi mề đay, khó thở', 'Tránh tuyệt đối penicillin', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000006101'),
('10000000-0000-0000-0000-000000006302', 'MEDIUM', 'Kích ứng da', 'Thay găng nitrile', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000006108'),

-- Patient 102: 1 dị ứng
('10000000-0000-0000-0000-000000006303', 'LOW', 'Ngứa nhẹ', 'Có thể sử dụng thuốc khác', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000006105'),

-- Patient 103: 2 dị ứng
('10000000-0000-0000-0000-000000006304', 'MEDIUM', 'Sưng môi, ngứa', 'Tránh hải sản trước thủ thuật', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000006112'),
('10000000-0000-0000-0000-000000006305', 'HIGH', 'Hắt hơi, sổ mũi', 'Dùng khẩu trang khi làm việc', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000006115'),

-- Patient 104: 1 dị ứng
('10000000-0000-0000-0000-000000006306', 'HIGH', 'Phù nề, khó thở', 'Chỉ dùng thuốc tê không có lidocaine', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000006103'),

-- Patient 105: 0 dị ứng

-- Patient 106: 2 dị ứng
('10000000-0000-0000-0000-000000006307', 'LOW', 'Ngứa nhẹ vùng kim loại', 'Ưu tiên sử dụng sứ toàn phần', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000006110'),
('10000000-0000-0000-0000-000000006308', 'MEDIUM', 'Đau bụng, buồn nôn', 'Tránh aspirin', '00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000006107'),

-- Patient 107: 1 dị ứng
('10000000-0000-0000-0000-000000006309', 'LOW', 'Hắt hơi, chảy nước mũi', 'Dị ứng theo mùa', '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000006116'),

-- Patient 108: 0 dị ứng

-- Patient 109: 1 dị ứng
('10000000-0000-0000-0000-000000006310', 'MEDIUM', 'Nổi mẩn đỏ', 'Dùng kháng sinh nhóm khác', '00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000006102'),

-- Patient 110: 2 dị ứng
('10000000-0000-0000-0000-000000006311', 'LOW', 'Kích ứng nhẹ', 'Tránh hàm tạm acrylic', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000006109'),
('10000000-0000-0000-0000-000000006312', 'LOW', 'Đau bụng', 'Tránh sữa trước thủ thuật', '00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000006113');

-- =========================================================
-- 4) UNDERLYING_DISEASE (Mỗi bệnh nhân 0-1 bệnh nền)
-- =========================================================
INSERT INTO underlying_disease (id, name, status, severity, is_verified, note, patient_id) VALUES
-- Patient 101: Tiểu đường
('20000000-0000-0000-0000-000000006201', 'Tiểu đường type 2', 'ACTIVE', 'MODERATE', true, 'Kiểm soát đường huyết trước thủ thuật', '00000000-0000-0000-0000-000000000101'),

-- Patient 102: Tăng huyết áp
('20000000-0000-0000-0000-000000006202', 'Tăng huyết áp', 'ACTIVE', 'MILD', true, 'Theo dõi huyết áp trước phẫu thuật', '00000000-0000-0000-0000-000000000102'),

-- Patient 103: Hen suyễn
('20000000-0000-0000-0000-000000006203', 'Hen phế quản', 'ACTIVE', 'MODERATE', true, 'Chuẩn bị thuốc xịt khi cần', '00000000-0000-0000-0000-000000000103'),

-- Patient 104: Không có bệnh nền

-- Patient 105: Viêm gan B
('20000000-0000-0000-0000-000000006204', 'Viêm gan B mạn tính', 'ACTIVE', 'MILD', true, 'Tuân thủ khử trùng nghiêm ngặt', '00000000-0000-0000-0000-000000000105'),

-- Patient 106: Rối loạn đông máu
('20000000-0000-0000-0000-000000006205', 'Giảm tiểu cầu', 'ACTIVE', 'MODERATE', true, 'Cần xét nghiệm đông máu trước phẫu thuật', '00000000-0000-0000-0000-000000000106'),

-- Patient 107: Không có bệnh nền

-- Patient 108: Bệnh tim
('20000000-0000-0000-0000-000000006206', 'Rối loạn nhịp tim', 'ACTIVE', 'MILD', true, 'Tránh thuốc co mạch quá mức', '00000000-0000-0000-0000-000000000108'),

-- Patient 109: Không có bệnh nền

-- Patient 110: Dạ dày
('20000000-0000-0000-0000-000000006207', 'Viêm loét dạ dày', 'ACTIVE', 'MILD', false, 'Tránh thuốc kích ứng dạ dày', '00000000-0000-0000-0000-000000000110');

-- =========================================================
-- 5) MEDICAL_HISTORY (16 lần khám tương ứng với 16 appointments từ 4/1-11/1)
-- =========================================================
INSERT INTO medical_history (id, symptoms, created_at, updated_at, appointment_id, patient_profile_id) VALUES
-- Ngày 4/1: Appointment 101, 102
('70000000-0000-0000-0000-000000007001', 'Đau răng hàm dưới khi nhai', '2026-01-04 09:00:00+07', '2026-01-04 09:00:00+07', '44000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101'),
('70000000-0000-0000-0000-000000007002', 'Chảy máu chân răng', '2026-01-04 14:00:00+07', '2026-01-04 14:00:00+07', '44000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102'),

-- Ngày 5/1: Appointment 103, 104
('70000000-0000-0000-0000-000000007003', 'Đau nhức răng kéo dài', '2026-01-05 09:00:00+07', '2026-01-05 09:00:00+07', '44000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103'),
('70000000-0000-0000-0000-000000007004', 'Muốn làm răng sứ thẩm mỹ', '2026-01-05 14:30:00+07', '2026-01-05 14:30:00+07', '44000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104'),

-- Ngày 6/1: Appointment 105, 106
('70000000-0000-0000-0000-000000007005', 'Răng cửa xấu, muốn dán sứ', '2026-01-06 09:00:00+07', '2026-01-06 09:00:00+07', '44000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000105'),
('70000000-0000-0000-0000-000000007006', 'Mất răng hàm, muốn cấy ghép', '2026-01-06 14:00:00+07', '2026-01-06 14:00:00+07', '44000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000106'),

-- Ngày 7/1: Appointment 107, 108
('70000000-0000-0000-0000-000000007007', 'Tư vấn niềng răng', '2026-01-07 09:00:00+07', '2026-01-07 09:00:00+07', '44000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000107'),
('70000000-0000-0000-0000-000000007008', 'Đau tủy răng', '2026-01-07 14:30:00+07', '2026-01-07 14:30:00+07', '44000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000108'),

-- Ngày 8/1: Appointment 109, 110
('70000000-0000-0000-0000-000000007009', 'Răng khôn mọc lệch, đau', '2026-01-08 09:00:00+07', '2026-01-08 09:00:00+07', '44000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000109'),
('70000000-0000-0000-0000-000000007010', 'Viêm lợi chảy máu', '2026-01-08 14:00:00+07', '2026-01-08 14:00:00+07', '44000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000110'),

-- Ngày 9/1: Appointment 111, 112
('70000000-0000-0000-0000-000000007011', 'Sâu răng nhiều vị trí', '2026-01-09 09:00:00+07', '2026-01-09 09:00:00+07', '44000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000101'),
('70000000-0000-0000-0000-000000007012', 'Đau nhức răng kéo dài', '2026-01-09 14:30:00+07', '2026-01-09 14:30:00+07', '44000000-0000-0000-0000-000000000112', '00000000-0000-0000-0000-000000000102'),

-- Ngày 10/1: Appointment 113, 114
('70000000-0000-0000-0000-000000007013', 'Cạo vôi răng định kỳ', '2026-01-10 09:00:00+07', '2026-01-10 09:00:00+07', '44000000-0000-0000-0000-000000000113', '00000000-0000-0000-0000-000000000103'),
('70000000-0000-0000-0000-000000007014', 'Răng hàm sâu', '2026-01-10 14:00:00+07', '2026-01-10 14:00:00+07', '44000000-0000-0000-0000-000000000114', '00000000-0000-0000-0000-000000000104'),

-- Ngày 11/1: Appointment 115, 116
('70000000-0000-0000-0000-000000007015', 'Răng vàng, muốn tẩy trắng', '2026-01-11 09:00:00+07', '2026-01-11 09:00:00+07', '44000000-0000-0000-0000-000000000115', '00000000-0000-0000-0000-000000000105'),
('70000000-0000-0000-0000-000000007016', 'Khám tổng quát định kỳ', '2026-01-11 14:30:00+07', '2026-01-11 14:30:00+07', '44000000-0000-0000-0000-000000000116', '00000000-0000-0000-0000-000000000106');

-- =========================================================
-- 6) CONDITION (Mỗi medical_history có 1-3 condition)
-- =========================================================
INSERT INTO condition (id, tooth_number, name, status, treatment, surface, medical_history_id) VALUES
-- Medical history 7001 (4/1 - Trám răng): 2 conditions
('60000000-0000-0000-0000-000000006001', 36, 'Sâu răng mặt nhai', 'ACTIVE', 'Trám composite', 'Mặt nhai', '70000000-0000-0000-0000-000000007001'),
('60000000-0000-0000-0000-000000006002', 46, 'Sâu răng gần nướu', 'ACTIVE', 'Trám GIC', 'Mặt cổ răng', '70000000-0000-0000-0000-000000007001'),

-- Medical history 7002 (4/1 - Cạo vôi): 1 condition
('60000000-0000-0000-0000-000000006003', 0, 'Viêm lợi toàn hàm', 'ACTIVE', 'Cạo vôi răng', 'Toàn bộ', '70000000-0000-0000-0000-000000007002'),

-- Medical history 7003 (5/1 - Điều trị tủy): 2 conditions
('60000000-0000-0000-0000-000000006004', 26, 'Viêm tủy cấp', 'ACTIVE', 'Điều trị tủy', 'Ống tủy', '70000000-0000-0000-0000-000000007003'),
('60000000-0000-0000-0000-000000006005', 27, 'Sâu răng sâu', 'ACTIVE', 'Trám tạm', 'Mặt nhai', '70000000-0000-0000-0000-000000007003'),

-- Medical history 7004 (5/1 - Chụp răng sứ): 2 conditions
('60000000-0000-0000-0000-000000006006', 11, 'Răng xỉn màu', 'ACTIVE', 'Mão sứ', 'Toàn bộ', '70000000-0000-0000-0000-000000007004'),
('60000000-0000-0000-0000-000000006007', 21, 'Răng xỉn màu', 'ACTIVE', 'Mão sứ', 'Toàn bộ', '70000000-0000-0000-0000-000000007004'),

-- Medical history 7005 (6/1 - Dán sứ Veneer): 2 conditions
('60000000-0000-0000-0000-000000006008', 11, 'Răng xấu', 'ACTIVE', 'Dán sứ Veneer', 'Mặt ngoài', '70000000-0000-0000-0000-000000007005'),
('60000000-0000-0000-0000-000000006009', 21, 'Răng thưa', 'ACTIVE', 'Dán sứ Veneer', 'Mặt ngoài', '70000000-0000-0000-0000-000000007005'),

-- Medical history 7006 (6/1 - Cấy ghép Implant): 1 condition
('60000000-0000-0000-0000-000000006010', 36, 'Mất răng', 'ACTIVE', 'Cấy ghép Implant', 'Toàn bộ', '70000000-0000-0000-0000-000000007006'),

-- Medical history 7007 (7/1 - Tư vấn chỉnh nha): 1 condition
('60000000-0000-0000-0000-000000006011', 0, 'Răng chen chúc', 'ACTIVE', 'Niềng răng mắc cài', 'Toàn hàm', '70000000-0000-0000-0000-000000007007'),

-- Medical history 7008 (7/1 - Điều trị tủy): 1 condition
('60000000-0000-0000-0000-000000006012', 36, 'Viêm tủy cấp', 'ACTIVE', 'Điều trị tủy', 'Ống tủy', '70000000-0000-0000-0000-000000007008'),

-- Medical history 7009 (8/1 - Nhổ răng): 1 condition
('60000000-0000-0000-0000-000000006013', 48, 'Răng khôn mọc lệch', 'ACTIVE', 'Nhổ răng', 'Toàn bộ', '70000000-0000-0000-0000-000000007009'),

-- Medical history 7010 (8/1 - Điều trị viêm lợi): 1 condition
('60000000-0000-0000-0000-000000006014', 0, 'Viêm lợi quanh răng', 'ACTIVE', 'Vệ sinh quanh răng', 'Toàn bộ', '70000000-0000-0000-0000-000000007010'),

-- Medical history 7011 (9/1 - Trám răng): 2 conditions
('60000000-0000-0000-0000-000000006015', 16, 'Sâu răng sâu', 'ACTIVE', 'Trám', 'Mặt nhai', '70000000-0000-0000-0000-000000007011'),
('60000000-0000-0000-0000-000000006016', 26, 'Sâu răng', 'ACTIVE', 'Trám', 'Mặt nhai', '70000000-0000-0000-0000-000000007011'),

-- Medical history 7012 (9/1 - Điều trị tủy): 1 condition
('60000000-0000-0000-0000-000000006017', 26, 'Viêm tủy cấp', 'ACTIVE', 'Điều trị tủy', 'Ống tủy', '70000000-0000-0000-0000-000000007012'),

-- Medical history 7013 (10/1 - Cạo vôi): 1 condition
('60000000-0000-0000-0000-000000006018', 0, 'Cao răng nhiều', 'ACTIVE', 'Cạo vôi răng', 'Toàn bộ', '70000000-0000-0000-0000-000000007013'),

-- Medical history 7014 (10/1 - Răng hàm sâu): 3 conditions
('60000000-0000-0000-0000-000000006019', 16, 'Sâu răng hàm', 'ACTIVE', 'Trám composite', 'Mặt nhai', '70000000-0000-0000-0000-000000007014'),
('60000000-0000-0000-0000-000000006020', 17, 'Sâu răng hàm', 'ACTIVE', 'Trám composite', 'Mặt gần', '70000000-0000-0000-0000-000000007014'),
('60000000-0000-0000-0000-000000006021', 46, 'Sâu răng nhẹ', 'ACTIVE', 'Trám', 'Mặt xa', '70000000-0000-0000-0000-000000007014'),

-- Medical history 7015 (11/1 - Tẩy trắng): 1 condition
('60000000-0000-0000-0000-000000006022', 0, 'Răng xỉn màu', 'ACTIVE', 'Tẩy trắng răng', 'Toàn hàm', '70000000-0000-0000-0000-000000007015'),

-- Medical history 7016 (11/1 - Khám định kỳ): 1 condition
('60000000-0000-0000-0000-000000006023', 0, 'Tình trạng răng tốt', 'RESOLVED', 'Không cần điều trị', 'Toàn bộ', '70000000-0000-0000-0000-000000007016');

-- =========================================================
-- 7) TOOTH_ISSUE (Vấn đề răng hiện tại của bệnh nhân)
-- =========================================================
INSERT INTO tooth_issue (id, tooth_number, status, description, diagnosed_date, note, patient_id) VALUES
-- Patient 101
('80000000-0000-0000-0000-000000006401', 36, 'CLOSED', 'Sâu răng đã trám', '2026-01-05', 'Đã điều trị xong', '00000000-0000-0000-0000-000000000101'),
('80000000-0000-0000-0000-000000006402', 46, 'CLOSED', 'Sâu răng đã trám', '2026-01-05', 'Đã điều trị xong', '00000000-0000-0000-0000-000000000101'),
('80000000-0000-0000-0000-000000006403', 11, 'CLOSED', 'Mẻ răng đã trám', '2026-01-20', 'Đã phục hồi thẩm mỹ', '00000000-0000-0000-0000-000000000101'),

-- Patient 102
('80000000-0000-0000-0000-000000006404', 26, 'OPEN', 'Đang điều trị tủy', '2026-01-06', 'Cần 2-3 buổi nữa', '00000000-0000-0000-0000-000000000102'),
('80000000-0000-0000-0000-000000006405', 14, 'OPEN', 'Tụt lợi', '2026-01-15', 'Theo dõi', '00000000-0000-0000-0000-000000000102'),

-- Patient 103
('80000000-0000-0000-0000-000000006406', 48, 'CLOSED', 'Răng khôn đã nhổ', '2026-01-07', 'Đã lành', '00000000-0000-0000-0000-000000000103'),
('80000000-0000-0000-0000-000000006407', 16, 'CLOSED', 'Sâu răng đã trám', '2026-01-22', 'Hoàn thành', '00000000-0000-0000-0000-000000000103'),

-- Patient 104
('80000000-0000-0000-0000-000000006408', 11, 'OPEN', 'Đang làm mão sứ', '2026-01-08', 'Chờ gắn mão', '00000000-0000-0000-0000-000000000104'),
('80000000-0000-0000-0000-000000006409', 21, 'OPEN', 'Đang làm mão sứ', '2026-01-08', 'Chờ gắn mão', '00000000-0000-0000-0000-000000000104'),

-- Patient 105
('80000000-0000-0000-0000-000000006410', 11, 'OPEN', 'Đang làm veneer', '2026-01-09', 'Chờ dán sứ', '00000000-0000-0000-0000-000000000105'),
('80000000-0000-0000-0000-000000006411', 21, 'OPEN', 'Đang làm veneer', '2026-01-09', 'Chờ dán sứ', '00000000-0000-0000-0000-000000000105'),

-- Patient 106
('80000000-0000-0000-0000-000000006412', 36, 'OPEN', 'Đang cấy ghép implant', '2026-01-10', 'Chờ tích hợp xương', '00000000-0000-0000-0000-000000000106'),

-- Patient 107
('80000000-0000-0000-0000-000000006413', 0, 'OPEN', 'Đang niềng răng', '2026-01-11', 'Dự kiến 18 tháng', '00000000-0000-0000-0000-000000000107'),

-- Patient 108
('80000000-0000-0000-0000-000000006414', 36, 'CLOSED', 'Điều trị tủy hoàn thành', '2026-01-18', 'Tái khám sau 6 tháng', '00000000-0000-0000-0000-000000000108'),
('80000000-0000-0000-0000-000000006415', 16, 'CLOSED', 'Sâu răng đã trám', '2026-01-13', 'Hoàn thành', '00000000-0000-0000-0000-000000000108'),

-- Patient 109
('80000000-0000-0000-0000-000000006416', 0, 'CLOSED', 'Răng tốt', '2026-01-14', 'Không vấn đề', '00000000-0000-0000-0000-000000000109'),

-- Patient 110
('80000000-0000-0000-0000-000000006417', 0, 'CLOSED', 'Đã tẩy trắng', '2026-01-19', 'Kết quả tốt', '00000000-0000-0000-0000-000000000110');

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
