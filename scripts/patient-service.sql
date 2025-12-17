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
    updated_at         TIMESTAMP WITH TIME ZONE,
                                     patient_profile_id UUID NOT NULL, -- Khóa ngoại tham chiếu đến patient

                                     CONSTRAINT medical_history_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_medical_history_patient
    FOREIGN KEY (patient_profile_id)
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
WITH InsertPatient AS (
-- 1. Tạo dữ liệu cho Bảng PATIENT (Bệnh nhân 1)
INSERT INTO public.patient (user_id, dob, gender, address, contact_phone, blood_type, insurance_number)
VALUES (
    'd903022a-1000-4001-8001-000000000003',
    '1990-05-15T00:00:00+07:00'::TIMESTAMP WITH TIME ZONE,
    'MALE',
    '123 Đường Nguyễn Huệ, Quận 1, TP. HCM',
    '0901234567',
    'A_POSITIVE',
    'BHXH-900515'
    )
    RETURNING user_id AS patient_id, NOW() AS current_ts
    ),
    InsertPatient2 AS (
-- 2. Tạo dữ liệu cho Bảng PATIENT (Bệnh nhân 2)
INSERT INTO public.patient (user_id, dob, gender, address, contact_phone, blood_type, insurance_number)
VALUES (
    'd903022a-1000-4001-8001-000000000008',
    '1985-11-20T00:00:00+07:00'::TIMESTAMP WITH TIME ZONE,
    'FEMALE',
    '456 Đường Lê Lợi, Quận 3, TP. HCM',
    '0987654321',
    'B_NEGATIVE',
    'BHXH-851120'
    )
    RETURNING user_id AS patient_id_2, NOW() AS current_ts_2
    ),
    InsertMedicalHistory1 AS (
-- 3. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 1 - Bệnh nhân 1)
INSERT INTO public.medical_history (
    id, appointment_id, created_at, symptoms, updated_at, patient_profile_id
)
SELECT
    '11111111-1111-1111-1111-111111111111'::UUID,
    gen_random_uuid(),
    t1.current_ts - INTERVAL '2 months',
    'Đau rát họng, sốt nhẹ, ho khan',
    t1.current_ts - INTERVAL '2 months',
    t1.patient_id
FROM InsertPatient t1
    RETURNING id
    )
-- 4. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 2 - Bệnh nhân 2)
INSERT INTO public.medical_history (
    id, appointment_id, created_at, symptoms, updated_at, patient_profile_id
)
SELECT
    '22222222-2222-2222-2222-222222222222'::UUID,
    gen_random_uuid(),
    t2.current_ts_2 - INTERVAL '1 month',
    'Đau bụng, buồn nôn, khó tiêu',
    t2.current_ts_2 - INTERVAL '1 month',
    t2.patient_id_2
FROM InsertPatient2 t2;

-- -------------------------
-- Insert sample data for condition
-- -------------------------
-- Condition for Medical History 1 (Patient 1)
INSERT INTO public.condition (id, medical_history_id, tooth_number, name, status, treatment, surface) VALUES
    ('b1111111-1111-1111-1111-111111111111'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 18, 'Sâu răng', 'ACTIVE', 'Trám răng composite', 'Mặt nhai'),
    ('b2222222-2222-2222-2222-222222222222'::UUID, '11111111-1111-1111-1111-111111111111'::UUID, 25, 'Viêm tủy răng', 'TREATED', 'Điều trị tủy răng', 'Toàn bộ răng');

-- Condition for Medical History 2 (Patient 2)
INSERT INTO public.condition (id, medical_history_id, tooth_number, name, status, treatment, surface) VALUES
    ('b3333333-3333-3333-3333-333333333333'::UUID, '22222222-2222-2222-2222-222222222222'::UUID, 14, 'Viêm nướu', 'ACTIVE', 'Làm sạch răng, điều trị viêm nướu', NULL),
    ('b4444444-4444-4444-4444-444444444444'::UUID, '22222222-2222-2222-2222-222222222222'::UUID, 32, 'Răng khôn mọc lệch', 'PENDING', 'Nhổ răng khôn', NULL);

-- -------------------------
-- Insert sample data for tooth_issue
-- -------------------------
-- Patient 1 has tooth issues
INSERT INTO public.tooth_issue (id, tooth_number, status, description, diagnosed_date, note, patient_id) VALUES
                                                                                                             (gen_random_uuid(), 18, 'ACTIVE', 'Cavity on upper right molar', '2024-10-15', 'Requires filling treatment', 'd903022a-1000-4001-8001-000000000003'),
                                                                                                             (gen_random_uuid(), 25, 'TREATED', 'Root canal completed', '2024-08-20', 'Follow-up checkup needed in 6 months', 'd903022a-1000-4001-8001-000000000003');

-- Patient 2 has tooth issues
INSERT INTO public.tooth_issue (id, tooth_number, status, description, diagnosed_date, note, patient_id) VALUES
    (gen_random_uuid(), 14, 'PENDING', 'Wisdom tooth extraction needed', '2024-11-01', 'Scheduled for next month', 'd903022a-1000-4001-8001-000000000008');

-- -------------------------
-- Insert sample data for underlying_disease
-- -------------------------
-- Patient 1 has underlying diseases
INSERT INTO public.underlying_disease (id, name, status, severity, is_verified, note, patient_id) VALUES
                                                                                                      (gen_random_uuid(), 'Diabetes Type 2', 'CONTROLLED', 'MODERATE', true, 'Requires regular blood sugar monitoring', 'd903022a-1000-4001-8001-000000000003'),
                                                                                                      (gen_random_uuid(), 'Hypertension', 'ACTIVE', 'MILD', true, 'Taking medication daily', 'd903022a-1000-4001-8001-000000000003');

-- Patient 2 has underlying diseases
INSERT INTO public.underlying_disease (id, name, status, severity, is_verified, note, patient_id) VALUES
    (gen_random_uuid(), 'Asthma', 'CONTROLLED', 'MODERATE', true, 'Has rescue inhaler', 'd903022a-1000-4001-8001-000000000008');

-- -------------------------
-- Insert sample data for allergy (master data)
-- -------------------------
INSERT INTO public.allergy (id, name, type, description) VALUES
                                                             ('a1111111-1111-1111-1111-111111111111', 'Penicillin', 'DRUG', 'Antibiotic medication - can cause severe allergic reactions'),
                                                             ('a2222222-2222-2222-2222-222222222222', 'Peanuts', 'FOOD', 'Common food allergen - can cause anaphylaxis'),
                                                             ('a3333333-3333-3333-3333-333333333333', 'Pollen', 'ENVIRONMENTAL', 'Seasonal allergen - causes hay fever'),
                                                             ('a4444444-4444-4444-4444-444444444444', 'Latex', 'ENVIRONMENTAL', 'Natural rubber latex - common in medical settings'),
                                                             ('a5555555-5555-5555-5555-555555555555', 'Shellfish', 'FOOD', 'Seafood allergen - can cause severe reactions');

-- -------------------------
-- Insert sample data for patient_allergy
-- -------------------------
-- Patient 1 allergic to Penicillin (as mentioned in old data)
INSERT INTO public.patient_allergy (id, patient_id, allergy_id, severity, reaction, note) VALUES
                                                                                              (gen_random_uuid(), 'd903022a-1000-4001-8001-000000000003', 'a1111111-1111-1111-1111-111111111111', 'SEVERE', 'Rash, difficulty breathing', 'Patient reported severe reaction in 2015'),
                                                                                              (gen_random_uuid(), 'd903022a-1000-4001-8001-000000000003', 'a3333333-3333-3333-3333-333333333333', 'MILD', 'Sneezing, watery eyes', 'Seasonal allergy');

-- Patient 2 has peanut allergy
INSERT INTO public.patient_allergy (id, patient_id, allergy_id, severity, reaction, note) VALUES
    (gen_random_uuid(), 'd903022a-1000-4001-8001-000000000008', 'a2222222-2222-2222-2222-222222222222', 'MODERATE', 'Hives, swelling', 'Avoid all peanut products');