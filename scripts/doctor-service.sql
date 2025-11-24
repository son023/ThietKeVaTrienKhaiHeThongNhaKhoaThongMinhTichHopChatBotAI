-- ---------------------------------------------------------------------
-- Bảng 1: doctor
-- Lưu trữ thông tin cơ bản về bác sĩ
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor
(
    user_id                 UUID NOT NULL,
    consultation_fee_amount INTEGER,
    license_number          VARCHAR(100),
    specialization_code     VARCHAR(100),
    working_hospital        VARCHAR(255),

    -- Khóa chính
    CONSTRAINT doctor_pkey PRIMARY KEY (user_id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: work_schedule
-- Lưu trữ chi tiết về thời gian và ngày làm việc
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_schedule
(
    id         UUID NOT NULL,
    end_time   TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    work_date  DATE,

    -- Khóa chính
    CONSTRAINT work_schedule_pkey PRIMARY KEY (id)
);

---

-- ---------------------------------------------------------------------
-- Bảng 3: doctor_degree
-- Lưu trữ thông tin bằng cấp của từng bác sĩ (Liên kết 1-n với doctor)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_degree
(
    id            UUID NOT NULL,
    degree_name   VARCHAR(255),
    institution   VARCHAR(255),
    user_id       UUID, -- Cột này có thể là UUID tham chiếu đến người dùng chung (nếu có)
    year_obtained INTEGER,
    doctor_id     UUID, -- Khóa ngoại tham chiếu đến bảng doctor

-- Khóa chính
    CONSTRAINT doctor_degree_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng doctor
    CONSTRAINT fk_doctor_degree_doctor
    FOREIGN KEY (doctor_id)
    REFERENCES public.doctor (user_id)
    ON DELETE CASCADE
);

---

-- ---------------------------------------------------------------------
-- Bảng 4: doctor_work_schedule
-- Bảng liên kết (Join Table) giữa doctor và work_schedule (Quan hệ n-n)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_work_schedule
(
    id               UUID NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE,
    status           VARCHAR(255),
    updated_at       TIMESTAMP WITH TIME ZONE,
    doctor_id        UUID, -- Khóa ngoại tham chiếu đến doctor
    work_schedule_id UUID, -- Khóa ngoại tham chiếu đến work_schedule

-- Khóa chính
    CONSTRAINT doctor_work_schedule_pkey PRIMARY KEY (id),

    -- Khóa ngoại 1: Liên kết với bảng doctor
    CONSTRAINT fk_dws_doctor
    FOREIGN KEY (doctor_id)
    REFERENCES public.doctor (user_id)
    ON DELETE CASCADE,

    -- Khóa ngoại 2: Liên kết với bảng work_schedule
    CONSTRAINT fk_dws_work_schedule
    FOREIGN KEY (work_schedule_id)
    REFERENCES public.work_schedule (id)
    ON DELETE CASCADE
);

-- Tạo Index để tăng tốc độ truy vấn trên các cột Khóa ngoại
CREATE INDEX idx_doctor_degree_doctor_id ON public.doctor_degree (doctor_id);
CREATE INDEX idx_dws_doctor_id ON public.doctor_work_schedule (doctor_id);
CREATE INDEX idx_dws_work_schedule_id ON public.doctor_work_schedule (work_schedule_id);