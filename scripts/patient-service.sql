DROP TABLE IF EXISTS public.patient_allergy CASCADE;
DROP TABLE IF EXISTS public.allergy CASCADE;
DROP TABLE IF EXISTS public.medical_history CASCADE;
DROP TABLE IF EXISTS public.patient CASCADE;

CREATE TABLE IF NOT EXISTS public.patient
(
    user_id          UUID        NOT NULL, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID
    address          TEXT,
    blood_type       VARCHAR(10),
    contact_phone    VARCHAR(50),
    dob              DATE,
    gender           VARCHAR(50),
    insurance_number VARCHAR(100),

    CONSTRAINT patient_pkey PRIMARY KEY (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: medical_history (Hồ sơ bệnh án)
-- Composition relationship: medical history is managed through patient operations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id                 UUID NOT NULL,
    appointment_id     UUID,
    created_at         TIMESTAMP WITH TIME ZONE,
    diagnosis          VARCHAR(255),
    disease            VARCHAR(255),
    symptoms           VARCHAR(255),
    treatment          VARCHAR(255),
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

-- ---------------------------------------------------------------------
-- Bảng 3: allergy (Danh mục dị ứng - Master Data)
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
-- Bảng 4: patient_allergy (Liên kết bệnh nhân và dị ứng)
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
    INSERT INTO public.patient (user_id, address, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        'd903022a-1000-4001-8001-000000000003',
        '123 Đường Nguyễn Huệ, Quận 1, TP. HCM',
        'A+',
        '0901234567',
        '1990-05-15',
        'Nam',
        'BHXH-900515'
    )
    RETURNING user_id AS patient_id, NOW() AS current_ts
),
InsertPatient2 AS (
    -- 2. Tạo dữ liệu cho Bảng PATIENT (Bệnh nhân 2)
    INSERT INTO public.patient (user_id, address, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        'd903022a-1000-4001-8001-000000000008',
        '456 Đường Lê Lợi, Quận 3, TP. HCM',
        'B-',
        '0987654321',
        '1985-11-20',
        'Nữ',
        'BHXH-851120'
    )
    RETURNING user_id AS patient_id_2, NOW() AS current_ts_2
),
InsertMedicalHistory1 AS (
    -- 3. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 1 - Bệnh nhân 1)
    INSERT INTO public.medical_history (
        id, appointment_id, created_at, diagnosis, disease, symptoms, treatment, updated_at, patient_profile_id
    )
    SELECT
        gen_random_uuid(),
        gen_random_uuid(),
        t1.current_ts - INTERVAL '2 months',
        'Viêm họng cấp',
        'J02.9 - Acute pharyngitis, unspecified',
        'Đau rát họng, sốt nhẹ, ho khan',
        'Kháng sinh, giảm đau, nghỉ ngơi',
        t1.current_ts - INTERVAL '2 months',
        t1.patient_id
    FROM InsertPatient t1
    RETURNING id
)
-- 4. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 2 - Bệnh nhân 2)
INSERT INTO public.medical_history (
    id, appointment_id, created_at, diagnosis, disease, symptoms, treatment, updated_at, patient_profile_id
)
SELECT
    gen_random_uuid(),
    gen_random_uuid(),
    t2.current_ts_2 - INTERVAL '1 month',
    'Đau dạ dày',
    'K29.7 - Gastritis, unspecified',
    'Đau bụng, buồn nôn, khó tiêu',
    'Thuốc giảm acid, chế độ ăn uống',
    t2.current_ts_2 - INTERVAL '1 month',
    t2.patient_id_2
FROM InsertPatient2 t2;

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