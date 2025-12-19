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
    specialization_code     VARCHAR(50) NOT NULL,
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
-- Composition relationship: degrees are managed through doctor operations
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctor_degree
(
    id            UUID NOT NULL,
    degree_name   VARCHAR(255),
    institution   VARCHAR(255),
    year_obtained INTEGER,
    doctor_id     UUID NOT NULL, -- Khóa ngoại tham chiếu đến bảng doctor

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

-- =========================================================
-- 5) DOCTOR + DOCTOR_DEGREE
-- =========================================================
INSERT INTO doctor (user_id, specialization_code, working_hospital, license_number, consultation_fee_amount) VALUES
('00000000-0000-0000-0000-000000000201', 'GEN', 'Bệnh viện Răng Hàm Mặt TP.HCM', 'BS-79001234', 300000),
('00000000-0000-0000-0000-000000000202', 'PEDO',   'Bệnh viện Răng Hàm Mặt TW',     'BS-79005678', 350000);

INSERT INTO doctor_degree (id, degree_name, institution, year_obtained, doctor_id) VALUES
('00000000-0000-0000-0000-000000002001', 'Bác sĩ Răng Hàm Mặt', 'ĐH Y Dược TP.HCM', 2016, '00000000-0000-0000-0000-000000000201'),
('00000000-0000-0000-0000-000000002002', 'Chuyên khoa I',       'ĐH Y Dược TP.HCM', 2019, '00000000-0000-0000-0000-000000000201'),
('00000000-0000-0000-0000-000000002003', 'Bác sĩ Răng Hàm Mặt', 'ĐH Y Hà Nội',      2017, '00000000-0000-0000-0000-000000000202'),
('00000000-0000-0000-0000-000000002004', 'Chuyên khoa II',      'ĐH Y Hà Nội',      2022, '00000000-0000-0000-0000-000000000202'),
('00000000-0000-0000-0000-000000002005', 'Chứng chỉ Implant',   'Viện Đào tạo RHM', 2021, '00000000-0000-0000-0000-000000000201');

-- =========================================================
-- 6) WORK_SCHEDULE + DOCTOR_WORK_SCHEDULE
-- =========================================================
INSERT INTO work_schedule (id, work_date, start_time, end_time) VALUES
('00000000-0000-0000-0000-000000003001', '2025-12-16', '2025-12-16 08:00:00', '2025-12-16 12:00:00'),
('00000000-0000-0000-0000-000000003002', '2025-12-16', '2025-12-16 13:30:00', '2025-12-16 17:30:00'),
('00000000-0000-0000-0000-000000003003', '2025-12-17', '2025-12-17 08:00:00', '2025-12-17 12:00:00'),
('00000000-0000-0000-0000-000000003004', '2025-12-18', '2025-12-18 13:30:00', '2025-12-18 17:30:00'),
('00000000-0000-0000-0000-000000003005', '2025-12-19', '2025-12-19 08:00:00', '2025-12-19 12:00:00');

INSERT INTO doctor_work_schedule (id, status, created_at, updated_at, doctor_id, work_schedule_id) VALUES
('00000000-0000-0000-0000-000000003101', 'ACTIVE', '2025-12-10 09:00:00', '2025-12-10 09:00:00', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000003001'),
('00000000-0000-0000-0000-000000003102', 'ACTIVE', '2025-12-10 09:00:00', '2025-12-10 09:00:00', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000003003'),
('00000000-0000-0000-0000-000000003103', 'ACTIVE', '2025-12-10 09:00:00', '2025-12-10 09:00:00', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000003002'),
('00000000-0000-0000-0000-000000003104', 'ACTIVE', '2025-12-10 09:00:00', '2025-12-10 09:00:00', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000003004'),
('00000000-0000-0000-0000-000000003105', 'ACTIVE', '2025-12-10 09:00:00', '2025-12-10 09:00:00', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000003005');
