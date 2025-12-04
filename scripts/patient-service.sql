DROP TABLE IF EXISTS public.medical_history CASCADE;
DROP TABLE IF EXISTS public.patient CASCADE;

CREATE TABLE IF NOT EXISTS public.patient
(
    user_id          UUID        NOT NULL, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID
    address          TEXT,
    allergy          TEXT,
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

-- -------------------------
-- Insert sample data
-- -------------------------
WITH InsertPatient AS (
    -- 1. Tạo dữ liệu cho Bảng PATIENT (Bệnh nhân 1)
    INSERT INTO public.patient (user_id, address, allergy, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        'd903022a-1000-4001-8001-000000000003',
        '123 Đường Nguyễn Huệ, Quận 1, TP. HCM',
        'Thuốc kháng sinh Penicillin',
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
    INSERT INTO public.patient (user_id, address, allergy, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        'd903022a-1000-4001-8001-000000000008',
        '456 Đường Lê Lợi, Quận 3, TP. HCM',
        'Không rõ',
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