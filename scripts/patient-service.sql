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
    dob              TIMESTAMP WITH TIME ZONE,
    gender           VARCHAR(50),
    address          TEXT,
    contact_phone    VARCHAR(50),
    blood_type       VARCHAR(10),
    insurance_number VARCHAR(100),

    CONSTRAINT patient_pkey PRIMARY KEY (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: tooth_issue (Vấn đề răng miệng)
-- Child entity of Patient aggregate - managed through Patient only
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tooth_issue
(
    id             UUID NOT NULL,
    tooth_number   INTEGER NOT NULL,
    status         VARCHAR(50),       -- e.g., "ACTIVE", "TREATED", "PENDING"
    description    TEXT,               -- e.g., "Cavity", "Root canal needed"
    diagnosed_date DATE,
    note           TEXT,
    patient_id     UUID NOT NULL,      -- Khóa ngoại tham chiếu đến patient

    CONSTRAINT tooth_issue_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_tooth_issue_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Thêm Index
-- ---------------------------------------------------------------------
CREATE INDEX idx_tooth_issue_patient_id ON public.tooth_issue (patient_id);

-- ---------------------------------------------------------------------
-- Bảng 3: underlying_disease (Bệnh nền)
-- Child entity of Patient aggregate - managed through Patient only
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.underlying_disease
(
    id          UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,  -- e.g., "Diabetes Type 2", "Hypertension"
    status      VARCHAR(50),            -- e.g., "ACTIVE", "CONTROLLED", "RESOLVED"
    severity    VARCHAR(50),            -- e.g., "MILD", "MODERATE", "SEVERE"
    is_verified BOOLEAN,                -- Whether clinically verified
    note        TEXT,
    patient_id  UUID NOT NULL,          -- Khóa ngoại tham chiếu đến patient

    CONSTRAINT underlying_disease_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_underlying_disease_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Thêm Index
-- ---------------------------------------------------------------------
CREATE INDEX idx_underlying_disease_patient_id ON public.underlying_disease (patient_id);

-- ---------------------------------------------------------------------
-- Bảng 4: medical_history (Hồ sơ bệnh án)
-- Composition relationship: medical history is managed through patient operations
-- Kept for backward compatibility
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id                 UUID NOT NULL,
    appointment_id     UUID,
    created_at         TIMESTAMP WITH TIME ZONE,
    symptoms           VARCHAR(255),
    treatment          VARCHAR(255),
    diagnosis          VARCHAR(255),
    disease            VARCHAR(255),
    updated_at         TIMESTAMP WITH TIME ZONE,
                                     patient_user_id UUID NOT NULL, -- Khóa ngoại tham chiếu đến patient

                                     CONSTRAINT medical_history_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_medical_history_patient
    FOREIGN KEY (patient_user_id)
    REFERENCES public.patient (user_id)
                                 ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Thêm Index
-- ---------------------------------------------------------------------
CREATE INDEX idx_medical_history_patient_id ON public.medical_history (patient_profile_id);


--- Tạo Bảng condition
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
-- Independent catalog of allergens
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.allergy
(
    id          UUID         NOT NULL,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(100),           -- e.g., "FOOD", "DRUG", "ENVIRONMENTAL"
    description TEXT,

    CONSTRAINT allergy_pkey PRIMARY KEY (id)
    );

-- ---------------------------------------------------------------------
-- Bảng 6: patient_allergy (Liên kết bệnh nhân và dị ứng)
-- Join table with additional fields (severity, reaction, note)
-- Part of Patient aggregate
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.patient_allergy
(
    id         UUID NOT NULL,
    patient_id UUID NOT NULL,        -- Khóa ngoại tham chiếu đến patient
    allergy_id UUID NOT NULL,        -- Khóa ngoại tham chiếu đến allergy
    severity   VARCHAR(50),           -- e.g., "MILD", "MODERATE", "SEVERE"
    reaction   VARCHAR(255),          -- e.g., "Rash", "Difficulty breathing"
    note       TEXT,

    CONSTRAINT patient_allergy_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_patient_allergy_patient
    FOREIGN KEY (patient_id)
    REFERENCES public.patient (user_id)
    ON DELETE CASCADE,

    -- Khóa ngoại: Liên kết với bảng allergy
    CONSTRAINT fk_patient_allergy_allergy
    FOREIGN KEY (allergy_id)
    REFERENCES public.allergy (id)
    ON DELETE RESTRICT
    );

-- ---------------------------------------------------------------------
-- Thêm Index cho allergy và patient_allergy
-- ---------------------------------------------------------------------
CREATE INDEX idx_patient_allergy_patient_id ON public.patient_allergy (patient_id);
CREATE INDEX idx_patient_allergy_allergy_id ON public.patient_allergy (allergy_id);

-- -------------------------
-- Insert sample data
-- -------------------------
INSERT INTO patient (user_id, dob, gender, address, contact_phone, blood_type, insurance_number) VALUES
('00000000-0000-0000-0000-000000000101', '2002-03-18', 'FEMALE', '12 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM', '0905123456', 'O+', 'HS-790123456'),
('00000000-0000-0000-0000-000000000102', '2001-11-02', 'MALE',   '85 Lê Lợi, Q. Hải Châu, Đà Nẵng',          '0912345678', 'A+', 'HS-790223344'),
('00000000-0000-0000-0000-000000000103', '2003-07-25', 'FEMALE', '220 Cầu Giấy, Q. Cầu Giấy, Hà Nội',         '0987654321', 'B+', 'HS-790998877');

-- =========================================================
-- 10) MEDICAL_HISTORY  (gắn appointment + patient + condition)
-- =========================================================
INSERT INTO medical_history (id, symptoms, treatment, diagnosis, disease, created_at, updated_at, appointment_id, patient_user_id) VALUES
('00000000-0000-0000-0000-000000007001', 'Đau răng khi nhai', 'Trám composite', 'Sâu răng r16', 'Caries', '2025-12-16 09:20:00', '2025-12-16 09:20:00', '00000000-0000-0000-0000-000000005001', '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000007002', 'Đau nhức kéo dài',  'Điều trị tủy',  'Viêm tủy r36', 'Pulpitis','2025-12-17 10:40:00','2025-12-17 10:40:00', '00000000-0000-0000-0000-000000005002', '00000000-0000-0000-0000-000000000102'),
('00000000-0000-0000-0000-000000007003', 'Chảy máu chân răng', 'Cạo vôi',      'Viêm lợi',     'Gingivitis','2025-12-16 15:00:00','2025-12-16 15:00:00', '00000000-0000-0000-0000-000000005003', '00000000-0000-0000-0000-000000000103'),
('00000000-0000-0000-0000-000000007004', 'Răng mẻ, ê nhẹ',     'Trám phục hồi', 'Mẻ răng',      'Chipped tooth','2025-12-18 16:40:00','2025-12-18 16:40:00','00000000-0000-0000-0000-000000005004','00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000007005', 'Đau vùng răng khôn', 'Nhổ răng',      'Răng khôn mọc lệch','Impacted tooth','2025-12-19 11:10:00','2025-12-19 11:10:00','00000000-0000-0000-0000-000000005005','00000000-0000-0000-0000-000000000103');


-- =========================================================
-- 9) CONDITION + ALLERGY + UNDERLYING_DISEASE + PATIENT_ALLERGY + TOOTH_ISSUE
-- =========================================================
INSERT INTO condition (id, tooth_number, name, status, treatment, surface, medical_history_id) VALUES
('00000000-0000-0000-0000-000000006001', 16, 'Sâu răng',        'ACTIVE', 'Trám composite',     'Mặt nhai', '00000000-0000-0000-0000-000000007001'),
('00000000-0000-0000-0000-000000006002', 26, 'Viêm lợi',        'ACTIVE', 'Cạo vôi - vệ sinh',  'Quanh cổ răng', '00000000-0000-0000-0000-000000007001'),
('00000000-0000-0000-0000-000000006003', 11, 'Mẻ răng',         'ACTIVE', 'Trám/Phục hình',     'Mặt ngoài', '00000000-0000-0000-0000-000000007002'),
('00000000-0000-0000-0000-000000006004', 36, 'Viêm tủy',        'ACTIVE', 'Điều trị tủy',       'Mặt nhai', '00000000-0000-0000-0000-000000007003'),
('00000000-0000-0000-0000-000000006005', 48, 'Răng khôn mọc lệch','ACTIVE','Nhổ răng',          'Mặt xa', '00000000-0000-0000-0000-000000007004');

INSERT INTO allergy (id, name, type, description) VALUES
('00000000-0000-0000-0000-000000006101', 'Penicillin', 'DRUG',  'Dị ứng kháng sinh nhóm penicillin.'),
('00000000-0000-0000-0000-000000006102', 'Hải sản',    'FOOD',  'Ngứa/ mẩn đỏ khi ăn hải sản.'),
('00000000-0000-0000-0000-000000006103', 'Latex',      'OTHER', 'Kích ứng với găng tay latex.'),
('00000000-0000-0000-0000-000000006104', 'NSAIDs',     'DRUG',  'Dị ứng thuốc giảm đau NSAIDs.'),
('00000000-0000-0000-0000-000000006105', 'Bụi mịn',    'ENV',   'Hắt hơi, chảy nước mũi theo mùa.');

INSERT INTO underlying_disease (id, name, status, severity, is_verified, note, patient_id) VALUES
('00000000-0000-0000-0000-000000006201', 'Tăng huyết áp', 'ACTIVE', 'MILD',   'true', 'Theo dõi huyết áp trước thủ thuật.', '00000000-0000-0000-0000-000000000102'),
('00000000-0000-0000-0000-000000006202', 'Tiểu đường type 2', 'ACTIVE', 'MODERATE', 'true', 'Cần kiểm soát đường huyết.',        '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000006203', 'Hen suyễn',   'ACTIVE', 'MILD',   'false', 'Có tiền sử, chưa có hồ sơ xác nhận.', '00000000-0000-0000-0000-000000000103'),
('00000000-0000-0000-0000-000000006204', 'Viêm dạ dày', 'ACTIVE', 'MILD',   'false', 'Tránh thuốc kích ứng dạ dày.',        '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000006205', 'Rối loạn đông máu', 'INACTIVE', 'SEVERE', 'true', 'Đã điều trị ổn định.',              '00000000-0000-0000-0000-000000000102');

INSERT INTO patient_allergy (id, severity, reaction, note, patient_id, allergy_id) VALUES
('00000000-0000-0000-0000-000000006301', 'HIGH',   'Nổi mề đay', 'Tránh dùng penicillin', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000006101'),
('00000000-0000-0000-0000-000000006302', 'LOW',    'Ngứa',      'Dị ứng nhẹ',             '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000006102'),
('00000000-0000-0000-0000-000000006303', 'MEDIUM', 'Kích ứng',  'Đổi găng nitrile',       '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000006103'),
('00000000-0000-0000-0000-000000006304', 'LOW',    'Hắt hơi',   'Theo mùa',               '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000006105'),
('00000000-0000-0000-0000-000000006305', 'MEDIUM', 'Đau bụng',  'Cẩn trọng khi kê thuốc', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000006104');

INSERT INTO tooth_issue (id, tooth_number, status, description, diagnosed_date, note, patient_id) VALUES
('00000000-0000-0000-0000-000000006401', 16, 'OPEN', 'Sâu răng mặt nhai',       '2025-12-16', 'Cần trám',              '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000006402', 26, 'OPEN', 'Viêm lợi - chảy máu',     '2025-12-16', 'Vệ sinh định kỳ',       '00000000-0000-0000-0000-000000000103'),
('00000000-0000-0000-0000-000000006403', 36, 'OPEN', 'Đau nhức nghi viêm tủy',  '2025-12-17', 'Chụp X-quang kiểm tra', '00000000-0000-0000-0000-000000000102'),
('00000000-0000-0000-0000-000000006404', 11, 'CLOSED', 'Mẻ răng nhẹ',            '2025-11-28', 'Đã xử lý trám',         '00000000-0000-0000-0000-000000000101'),
('00000000-0000-0000-0000-000000006405', 48, 'OPEN', 'Răng khôn mọc lệch',      '2025-12-19', 'Có chỉ định nhổ',       '00000000-0000-0000-0000-000000000103'),
('00000000-0000-0000-0000-000000006406', 21, 'OPEN', 'Ê buốt khi ăn lạnh',      '2025-12-18', 'Theo dõi thêm',         '00000000-0000-0000-0000-000000000102');

