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
-- Bảng 2: medical_service (Dịch vụ Y tế)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_service
(
    id           UUID         NOT NULL,
    price        REAL         NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    service_time INTEGER      NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    status       VARCHAR(255) NOT NULL,

    CONSTRAINT medical_service_pkey PRIMARY KEY (id),
    CONSTRAINT medical_service_status_check
    CHECK ((status)::TEXT = ANY (ARRAY['ACTIVE'::VARCHAR, 'INACTIVE'::VARCHAR]::TEXT[]))
    );

---

-- ---------------------------------------------------------------------
-- Bảng 3: work_schedule (Lịch làm việc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_schedule
(
    id         UUID                        NOT NULL,
    end_time   TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    work_date  TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT work_schedule_pkey PRIMARY KEY (id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 4: appointment (Lịch hẹn khám)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointment
(
    id         UUID                        NOT NULL,
    end_time   TIMESTAMP WITH TIME ZONE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    doctor_id  UUID                        NOT NULL, -- ĐÃ THAY ĐỔI: Giả định tham chiếu doctor.user_id (UUID)
    patient_id UUID                        NOT NULL, -- ĐÃ THAY ĐỔI: Tham chiếu patient.user_id (UUID)
    status     VARCHAR(255)                NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT appointment_pkey PRIMARY KEY (id),
    CONSTRAINT appointment_status_check
    CHECK ((status)::TEXT = ANY (ARRAY['CHECKED'::VARCHAR, 'CONFIRMED'::VARCHAR, 'CANCELLED'::VARCHAR, 'FAILED'::VARCHAR, 'PROGRESSING'::VARCHAR]::TEXT[]))
    -- Thêm các Khóa ngoại (Giả định bảng 'doctor' đã tồn tại với user_id là UUID)
    -- CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctor (user_id),
    CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES public.patient (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 5: medical_history (Hồ sơ bệnh án)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id                 UUID NOT NULL, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID
    appointment_id     UUID, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID
    created_at         TIMESTAMP WITH TIME ZONE,
    diagnosis          VARCHAR(255),
    disease            VARCHAR(255),
    symptoms           VARCHAR(255),
    treatment          VARCHAR(255),
    updated_at         TIMESTAMP WITH TIME ZONE,
    patient_profile_id UUID, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID

    CONSTRAINT medical_history_pkey PRIMARY KEY (id),
    -- Khóa ngoại: Liên kết với bảng patient
    CONSTRAINT fk_medical_history_patient
    FOREIGN KEY (patient_profile_id)
    REFERENCES public.patient (user_id),
    -- Khóa ngoại: Liên kết với bảng appointment
    CONSTRAINT fk_medical_history_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id)
);

---

-- ---------------------------------------------------------------------
-- Bảng 6: appointment_medical_service (Bảng liên kết Dịch vụ Y tế và Lịch hẹn)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointment_medical_service
(
    appointment_id     UUID NOT NULL,
    medical_service_id UUID NOT NULL,

    CONSTRAINT appointment_medical_service_pkey PRIMARY KEY (appointment_id, medical_service_id),

    -- Khóa ngoại 1: Liên kết với bảng appointment
    CONSTRAINT fk_ams_appointment
    FOREIGN KEY (appointment_id)
    REFERENCES public.appointment (id)
    ON DELETE CASCADE,

    -- Khóa ngoại 2: Liên kết với bảng medical_service
    CONSTRAINT fk_ams_medical_service
    FOREIGN KEY (medical_service_id)
    REFERENCES public.medical_service (id)
    ON DELETE CASCADE
);

---

-- ---------------------------------------------------------------------
-- Bảng 7: doctor_work_schedule (Bảng liên kết Bác sĩ và Lịch làm việc)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_work_schedule
(
    id               UUID                        NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL,
    doctor_id        UUID                        NOT NULL, -- ĐÃ THAY ĐỔI: varchar(50) -> UUID (Giả định tham chiếu doctor.user_id)
    status           VARCHAR(255)                NOT NULL,
    updated_at       TIMESTAMP WITH TIME ZONE NOT NULL,
                                   work_schedule_id UUID,

    CONSTRAINT doctor_work_schedule_pkey PRIMARY KEY (id),
    CONSTRAINT doctor_work_schedule_status_check
    CHECK ((status)::TEXT = ANY (ARRAY['ACTIVE'::VARCHAR, 'INACTIVE'::VARCHAR, 'ON_LEAVE'::VARCHAR]::TEXT[])),

    -- Khóa ngoại: Liên kết với bảng work_schedule
    CONSTRAINT fk_dws_work_schedule
    FOREIGN KEY (work_schedule_id)
    REFERENCES public.work_schedule (id)
    ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- Thêm các Index để tăng tốc độ truy vấn
-- ---------------------------------------------------------------------
CREATE INDEX idx_appointment_doctor_id ON public.appointment (doctor_id);
CREATE INDEX idx_appointment_patient_id ON public.appointment (patient_id);
CREATE INDEX idx_ams_appointment_id ON public.appointment_medical_service (appointment_id);
CREATE INDEX idx_ams_medical_service_id ON public.appointment_medical_service (medical_service_id);
CREATE INDEX idx_medical_history_patient_id ON public.medical_history (patient_profile_id);