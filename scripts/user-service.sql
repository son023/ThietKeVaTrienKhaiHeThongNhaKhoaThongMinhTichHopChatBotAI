-- 1. Bảng users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng role (Đã sửa lỗi cú pháp phẩy kép)
CREATE TABLE IF NOT EXISTS role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Bảng user_role (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS user_role (
    user_id UUID NOT NULL, -- Sửa từ VARCHAR(50) sang UUID
    role_id UUID NOT NULL, -- Sửa từ VARCHAR(50) sang UUID
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

-- 4. Bảng admin (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Bảng patient (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dob DATE,
    gender VARCHAR(20),
    address VARCHAR(255),
    blood_type VARCHAR(10),
    allergy TEXT,
    insurance_number VARCHAR(50),
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Bảng doctor (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS doctor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialization_code VARCHAR(50),
    working_hospital VARCHAR(255),
    license_number VARCHAR(50),
    consultation_fee_amount INTEGER,
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Bảng degree (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS degree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    degree_name VARCHAR(255),
    institution VARCHAR(255),
    year_obtained INTEGER,
    image_url VARCHAR(255),
    doctor_id UUID, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_degree_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
);

-- 8. Bảng pharmacist (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS pharmacist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    degree VARCHAR(255),
    certificate VARCHAR(255),
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_pharmacist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Bảng lab_technician (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS lab_technician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field VARCHAR(255),
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_lab_technician_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Bảng receptionist (Đã sửa kiểu dữ liệu của FK sang UUID)
CREATE TABLE IF NOT EXISTS receptionist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- Sửa từ VARCHAR(50) sang UUID
    CONSTRAINT fk_receptionist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =======================================================
-- II. DML: DỮ LIỆU MẪU (SEED DATA)
-- =======================================================

-- Định nghĩa các ID cố định để dễ tham chiếu
DO $$
DECLARE
    -- Role IDs
    admin_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000001';
    doctor_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000002';
    patient_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000003';
    pharmacist_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000004';
    labtech_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000005';
    receptionist_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000006';

    -- User IDs
    admin_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000001';
    doctor_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000002';
    patient_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000003';
    pharmacist_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000004';
    labtech_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000005';
    receptionist_user_id CONSTANT UUID := 'd903022a-1000-4001-8001-000000000006';

    -- Profile IDs
    doctor_profile_id CONSTANT UUID := 'd903022a-2000-4001-8001-000000000002';
    patient_profile_id CONSTANT UUID := 'd903022a-2000-4001-8001-000000000003';

BEGIN
    -- 1. INSERT INTO role (Đã sửa lỗi phẩy cuối và thêm ID UUID)
    INSERT INTO role (id, role_name) VALUES
         (admin_role_id, 'ADMIN'),
         (doctor_role_id, 'DOCTOR'),
         (patient_role_id, 'PATIENT'),
         (pharmacist_role_id, 'PHARMACIST'),
         (labtech_role_id, 'LABTECHNICIAN'),
         (receptionist_role_id, 'RECEPTIONIST')
    ON CONFLICT (role_name) DO NOTHING;

    -- 2. INSERT INTO users
    INSERT INTO users (id, username, password, email, phone, full_name, is_active) VALUES
    (admin_user_id, 'admin_user', 'hashed_admin_pass', 'admin@hospital.com', '0901000001', 'Nguyễn Văn Admin', TRUE),
    (doctor_user_id, 'doctor_hieu', 'hashed_doctor_pass', 'hieu.bs@hospital.com', '0901000002', 'Bác sĩ Hiếu', TRUE),
    (patient_user_id, 'patient_an', 'hashed_patient_pass', 'patient.an@gmail.com', '0901000003', 'Trần Thị An', TRUE),
    (pharmacist_user_id, 'pharmacist_hoa', 'hashed_pharma_pass', 'hoa.duoc@hospital.com', '0901000004', 'Dược sĩ Hoa', TRUE),
    (labtech_user_id, 'labtech_cuong', 'hashed_lab_pass', 'cuong.lab@hospital.com', '0901000005', 'Kỹ thuật viên Cường', TRUE),
    (receptionist_user_id, 'recept_linh', 'hashed_recept_pass', 'linh.le@hospital.com', '0901000006', 'Lễ tân Linh', TRUE);

    -- 3. INSERT INTO user_role
    INSERT INTO user_role (user_id, role_id) VALUES
    (admin_user_id, admin_role_id),
    (doctor_user_id, doctor_role_id),
    (patient_user_id, patient_role_id),
    (pharmacist_user_id, pharmacist_role_id),
    (labtech_user_id, labtech_role_id),
    (receptionist_user_id, receptionist_role_id);

    -- 4. INSERT INTO admin
    INSERT INTO admin (user_id) VALUES (admin_user_id);

    -- 5. INSERT INTO patient
    INSERT INTO patient (id, dob, gender, address, blood_type, allergy, insurance_number, user_id) VALUES
    (patient_profile_id, '1995-05-20', 'Female', '123 Đường Ba Đình, Hà Nội', 'O+', 'Không rõ', 'BH12345678', patient_user_id);

    -- 6. INSERT INTO doctor
    INSERT INTO doctor (id, specialization_code, working_hospital, license_number, consultation_fee_amount, user_id) VALUES
    (doctor_profile_id, 'CARDIOLOGY', 'Bệnh viện Tim Mạch', 'LIC987654', 300000, doctor_user_id);

    -- 7. INSERT INTO degree
    INSERT INTO degree (degree_name, institution, year_obtained, doctor_id) VALUES
    ('Thạc sĩ Y học', 'Đại học Y Hà Nội', 2015, doctor_profile_id),
    ('Chuyên khoa I Tim mạch', 'Bệnh viện Bạch Mai', 2018, doctor_profile_id);

    -- 8. INSERT INTO pharmacist
    INSERT INTO pharmacist (degree, certificate, user_id) VALUES
    ('Dược sĩ Đại học', 'PC00123', pharmacist_user_id);

    -- 9. INSERT INTO lab_technician
    INSERT INTO lab_technician (field, user_id) VALUES
    ('Hóa sinh', labtech_user_id);

    -- 10. INSERT INTO receptionist
    INSERT INTO receptionist (user_id) VALUES (receptionist_user_id);

END $$;