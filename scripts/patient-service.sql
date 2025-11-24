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