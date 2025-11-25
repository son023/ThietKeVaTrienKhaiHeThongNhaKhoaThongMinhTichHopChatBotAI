DROP TABLE IF EXISTS doctor_work_schedule CASCADE;
DROP TABLE IF EXISTS doctor_degree CASCADE;
DROP TABLE IF EXISTS work_schedule CASCADE;
DROP TABLE IF EXISTS doctor CASCADE;

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

-- -------------------------
-- Bảng doctor
-- -------------------------
INSERT INTO public.doctor (user_id, consultation_fee_amount, license_number, specialization_code, working_hospital)
VALUES
('d903022a-1000-4001-8001-000000000002', 500000, 'LIC-001', 'CARDIO', 'Bệnh viện A'),
('d903022a-1000-4001-8001-000000000007', 400000, 'LIC-002', 'DERM', 'Bệnh viện B');

-- -------------------------
-- Bảng work_schedule
-- -------------------------
INSERT INTO public.work_schedule (id, start_time, end_time, work_date)
VALUES
('11111111-0000-0000-0000-000000000001', '2025-11-26 08:00:00+07', '2025-11-26 12:00:00+07', '2025-11-26'),
('11111111-0000-0000-0000-000000000002', '2025-11-26 13:00:00+07', '2025-11-26 17:00:00+07', '2025-11-26'),
('11111111-0000-0000-0000-000000000003', '2025-11-27 08:00:00+07', '2025-11-27 12:00:00+07', '2025-11-27');

-- -------------------------
-- Bảng doctor_degree
-- -------------------------
INSERT INTO public.doctor_degree (id, degree_name, institution, year_obtained, doctor_id)
VALUES
('22222222-0000-0000-0000-000000000001', 'Bác sĩ Đa khoa', 'ĐH Y Hà Nội', 2015, 'd903022a-1000-4001-8001-000000000002'),
('22222222-0000-0000-0000-000000000002', 'Bác sĩ Da liễu', 'ĐH Y Hà Nội', 2018, 'd903022a-1000-4001-8001-000000000007');

-- -------------------------
-- Bảng doctor_work_schedule
-- -------------------------
INSERT INTO public.doctor_work_schedule (id, created_at, updated_at, status, doctor_id, work_schedule_id)
VALUES
('33333333-0000-0000-0000-000000000001', NOW(), NOW(), 'ACTIVE', 'd903022a-1000-4001-8001-000000000002', '11111111-0000-0000-0000-000000000001'),
('33333333-0000-0000-0000-000000000002', NOW(), NOW(), 'ACTIVE', 'd903022a-1000-4001-8001-000000000002', '11111111-0000-0000-0000-000000000002'),
('33333333-0000-0000-0000-000000000003', NOW(), NOW(), 'ACTIVE', 'd903022a-1000-4001-8001-000000000007', '11111111-0000-0000-0000-000000000003');
