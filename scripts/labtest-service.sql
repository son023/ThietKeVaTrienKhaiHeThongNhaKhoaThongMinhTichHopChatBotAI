-- ---------------------------------------------------------------------
-- Bảng 1: medical_history (Lịch sử Y tế)
-- Phải được tạo đầu tiên vì các bảng khác tham chiếu đến nó.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_history
(
    id             UUID NOT NULL,
    appointment_id UUID,
    created_at     TIMESTAMP WITH TIME ZONE,
    diagnosis      VARCHAR(255),
    disease        VARCHAR(255),
    symptoms       VARCHAR(255),
    treatment      VARCHAR(255),
    updated_at     TIMESTAMP WITH TIME ZONE,
    CONSTRAINT medical_history_pkey PRIMARY KEY (id)
);

---

-- ---------------------------------------------------------------------
-- Bảng 2: lab_test_type (Loại Xét nghiệm)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lab_test_type
(
    id          UUID NOT NULL,
    description VARCHAR(255),
    name        VARCHAR(255),
    CONSTRAINT lab_test_type_pkey PRIMARY KEY (id)
);

---

-- ---------------------------------------------------------------------
-- Bảng 3: lab_test (Xét nghiệm)
-- Liên kết với lab_test_type và medical_history
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lab_test
(
    id                 UUID    NOT NULL,
    abnormal_flag      VARCHAR(255),
    created_at         TIMESTAMP WITH TIME ZONE,
    doctor_id          UUID,              -- Giả định tham chiếu đến bảng doctor
    instructions       VARCHAR(255),
    lab_technician_id  UUID,              -- Giả định tham chiếu đến nhân viên phòng thí nghiệm
    price              INTEGER NOT NULL,
    reference_range    VARCHAR(255),
    result_date        TIMESTAMP WITH TIME ZONE,
    status             VARCHAR(255),
    structure_json     VARCHAR(255),
    units              VARCHAR(255),
    updated_at         TIMESTAMP WITH TIME ZONE,
    lab_test_type_id   UUID,              -- Khóa ngoại tham chiếu đến lab_test_type
    medical_history_id UUID,              -- Khóa ngoại tham chiếu đến medical_history

    CONSTRAINT lab_test_pkey PRIMARY KEY (id),

    -- Khóa ngoại 1: Liên kết với lab_test_type
    CONSTRAINT fk_lab_test_type
    FOREIGN KEY (lab_test_type_id)
    REFERENCES public.lab_test_type (id),

    -- Khóa ngoại 2: Liên kết với medical_history
    CONSTRAINT fk_lab_test_medical_history
    FOREIGN KEY (medical_history_id)
    REFERENCES public.medical_history (id)
);

---

-- ---------------------------------------------------------------------
-- Bảng 4: medical_attachment (Tệp đính kèm Y tế)
-- Liên kết với lab_test
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_attachment
(
    id          UUID NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE,
    file_path   VARCHAR(255),
    type        VARCHAR(255),
    updated_at  TIMESTAMP WITH TIME ZONE,
    lab_test_id UUID, -- Khóa ngoại tham chiếu đến lab_test

    CONSTRAINT medical_attachment_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với lab_test
    CONSTRAINT fk_medical_attachment_lab_test
    FOREIGN KEY (lab_test_id)
    REFERENCES public.lab_test (id)
);

-- ---------------------------------------------------------------------
-- Thêm các Index để tăng tốc độ truy vấn trên các cột Khóa ngoại
-- ---------------------------------------------------------------------
CREATE INDEX idx_lab_test_type_id ON public.lab_test (lab_test_type_id);
CREATE INDEX idx_lab_test_medical_history_id ON public.lab_test (medical_history_id);
CREATE INDEX idx_medical_attachment_lab_test_id ON public.medical_attachment (lab_test_id);