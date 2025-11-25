DROP TABLE IF EXISTS public.medical_history CASCADE;
DROP TABLE IF EXISTS public.patient CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: patient (Bệnh nhân)
-- ---------------------------------------------------------------------
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
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id                 UUID NOT NULL, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID
    appointment_id     UUID, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID (Dự kiến tham chiếu đến bảng appointment)
    created_at         TIMESTAMP WITH TIME ZONE,
    diagnosis          VARCHAR(255),
    disease            VARCHAR(255),
    symptoms           VARCHAR(255),
    treatment          VARCHAR(255),
    updated_at         TIMESTAMP WITH TIME ZONE,
    patient_profile_id UUID, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID (Khóa ngoại tham chiếu đến patient)

    CONSTRAINT medical_history_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_medical_history_patient
    FOREIGN KEY (patient_profile_id)
    REFERENCES public.patient (user_id)
);

-- ---------------------------------------------------------------------
-- Thêm Index
-- ---------------------------------------------------------------------
CREATE INDEX idx_medical_history_patient_id ON public.medical_history (patient_profile_id);

WITH InsertPatient AS (
    -- 1. Tạo dữ liệu cho Bảng PATIENT
    INSERT INTO public.patient (user_id, address, allergy, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        '1a2b3c4d-5e6f-4000-8000-000000000001', -- ID Bệnh nhân 1 (cố định)
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
    -- 2. Tạo dữ liệu cho Bảng PATIENT (Bệnh nhân thứ 2)
    INSERT INTO public.patient (user_id, address, allergy, blood_type, contact_phone, dob, gender, insurance_number)
    VALUES (
        '1a2b3c4d-5e6f-4000-8000-000000000002', -- ID Bệnh nhân 2 (cố định)
        '456 Đường Lê Lợi, Quận 3, TP. HCM',
        'Không rõ',
        'B-',
        '0987654321',
        '1985-11-20',
        'Nữ',
        'BHXH-851120'
    )
    RETURNING user_id AS patient_id_2
)
-- 3. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 1 - Cho Bệnh nhân 1)
INSERT INTO public.medical_history (
    id, appointment_id, created_at, diagnosis, disease, symptoms, treatment, updated_at, patient_profile_id
)
SELECT
    gen_random_uuid(), -- ID Hồ sơ mới
    gen_random_uuid(), -- ID Lịch hẹn giả lập
    t1.current_ts - INTERVAL '2 months', -- Thời gian tạo
    'Viêm họng cấp',
    'J02.9 - Acute pharyngitis, unspecified',
    'Đau rát họng, sốt nhẹ, ho khan',
    'Kháng sinh, giảm đau, nghỉ ngơi',
    t1.current_ts - INTERVAL '2 months',
    t1.patient_id -- Khóa ngoại tham chiếu đến Bệnh nhân 1
FROM InsertPatient t1

UNION ALL

-- 4. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 2 - Cho Bệnh nhân 1)
SELECT
    gen_random_uuid(), -- ID Hồ sơ mới
    gen_random_uuid(),
    t1.current_ts - INTERVAL '1 month', -- Thời gian tạo
    'Tăng huyết áp vô căn',
    'I10 - Essential (primary) hypertension',
    'Đau đầu, chóng mặt, huyết áp cao (150/90 mmHg)',
    'Thuốc huyết áp, thay đổi lối sống',
    t1.current_ts - INTERVAL '1 month',
    t1.patient_id -- Khóa ngoại tham chiếu đến Bệnh nhân 1
FROM InsertPatient t1

UNION ALL

-- 5. Tạo dữ liệu cho Bảng MEDICAL_HISTORY (Hồ sơ 3 - Cho Bệnh nhân 2)
SELECT
    gen_random_uuid(), -- ID Hồ sơ mới
    gen_random_uuid(),
    NOW(),
    'Kiểm tra sức khỏe định kỳ',
    'Z00.0 - General medical examination',
    'Không có triệu chứng',
    'Tư vấn dinh dưỡng',
    NOW(),
    t2.patient_id_2 -- Khóa ngoại tham chiếu đến Bệnh nhân 2
FROM InsertPatient2 t2;