DROP TABLE IF EXISTS user_role CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    image_url VARCHAR(255),
    create_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    update_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_role (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

DO $$
DECLARE
    -- Định nghĩa Role IDs cố định
    admin_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000001';
    doctor_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000002';
    patient_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000003';
    pharmacist_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000004';
    recept_role_id CONSTANT UUID := '4c84022a-1111-4001-8001-000000000006'; -- ID Lễ tân

    -- Định nghĩa User IDs cố định
    user_admin CONSTANT UUID := 'd903022a-1000-4001-8001-000000000001';
    user_doc_hieu CONSTANT UUID := 'd903022a-1000-4001-8001-000000000002';
    user_doc_mai CONSTANT UUID := 'd903022a-1000-4001-8001-000000000007';
    user_pat_an CONSTANT UUID := 'd903022a-1000-4001-8001-000000000003';
    user_pat_minh CONSTANT UUID := 'd903022a-1000-4001-8001-000000000008';
    user_pharma_hoa CONSTANT UUID := 'd903022a-1000-4001-8001-000000000004';
    user_recept_linh CONSTANT UUID := 'd903022a-1000-4001-8001-000000000006';

BEGIN
    -- 1. INSERT INTO role
    INSERT INTO role (id, role_name) VALUES
        (admin_role_id, 'ADMIN'),
        (doctor_role_id, 'DOCTOR'),
        (patient_role_id, 'PATIENT'),
        (pharmacist_role_id, 'PHARMACIST'),
        (recept_role_id, 'RECEPTIONIST')
    ON CONFLICT (role_name) DO NOTHING;

    -- 2. INSERT INTO users (Tất cả các cột NOT NULL đều được cung cấp giá trị)
    INSERT INTO users (id, username, password, email, phone, full_name, is_active) VALUES
    -- ADMIN
    (user_admin, 'admin_super', 'hashed_admin_pass', 'admin@hospital.com', '0901000001', 'Nguyễn Văn Admin', TRUE),

    -- DOCTOR
    (user_doc_hieu, 'doctor_hieu', 'hashed_doc_hieu_pass', 'hieu.bs@hospital.com', '0901000002', 'Bác sĩ Hiếu (Tim mạch)', TRUE),
    (user_doc_mai, 'doctor_mai', 'hashed_doc_mai_pass', 'mai.bs@hospital.com', '0901000007', 'Bác sĩ Mai (Nhi)', TRUE),

    -- PATIENT
    (user_pat_an, 'patient_an', 'hashed_pat_an_pass', 'patient.an@gmail.com', '0901000003', 'Trần Thị An', TRUE),
    (user_pat_minh, 'patient_minh', 'hashed_pat_minh_pass', 'patient.minh@gmail.com', '0901000008', 'Lê Văn Minh', TRUE),

    -- PHARMACIST
    (user_pharma_hoa, 'pharmacist_hoa', 'hashed_pharma_hoa_pass', 'hoa.duoc@hospital.com', '0901000004', 'Dược sĩ Hoa', TRUE),

    -- RECEPTIONIST (LỄ TÂN)
    (user_recept_linh, 'recept_linh', 'hashed_recept_linh_pass', 'linh.le@hospital.com', '0901000006', 'Lễ tân Linh', TRUE);

    -- 3. INSERT INTO user_role (Gán vai trò cho người dùng)
    INSERT INTO user_role (user_id, role_id) VALUES
    -- ADMIN
    (user_admin, admin_role_id),

    -- DOCTOR
    (user_doc_hieu, doctor_role_id),
    (user_doc_mai, doctor_role_id),

    -- PATIENT
    (user_pat_an, patient_role_id),
    (user_pat_minh, patient_role_id),

    -- PHARMACIST
    (user_pharma_hoa, pharmacist_role_id),

    -- RECEPTIONIST
    (user_recept_linh, recept_role_id);

END $$;