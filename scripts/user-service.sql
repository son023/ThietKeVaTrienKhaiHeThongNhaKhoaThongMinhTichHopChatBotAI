
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


CREATE TABLE IF NOT EXISTS role (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),,
    role_name VARCHAR(50) NOT NULL UNIQUE
    );


CREATE TABLE IF NOT EXISTS user_role (
    user_id VARCHAR(50) NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) UNIQUE,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS patient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dob DATE,
    gender VARCHAR(20),
    address VARCHAR(255),
    blood_type VARCHAR(10),
    allergy TEXT, -- @Column(columnDefinition = "TEXT")
    insurance_number VARCHAR(50),
    user_id VARCHAR(50) UNIQUE, -- OneToOne mapping
    CONSTRAINT fk_patient_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS doctor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialization_code VARCHAR(50),
    working_hospital VARCHAR(255),
    license_number VARCHAR(50),
    consultation_fee_amount INTEGER,
    user_id VARCHAR(50) UNIQUE, -- OneToOne mapping
    CONSTRAINT fk_doctor_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS degree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    degree_name VARCHAR(255),
    institution VARCHAR(255),
    year_obtained INTEGER,
    image_url VARCHAR(255),
    doctor_id VARCHAR(50),
    CONSTRAINT fk_degree_doctor FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE
    );

CREATE TABLE IF NOT EXISTS pharmacist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    degree VARCHAR(255),
    certificate VARCHAR(255),
    user_id VARCHAR(50) UNIQUE,
    CONSTRAINT fk_pharmacist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS lab_technician (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field VARCHAR(255),
    user_id VARCHAR(50) UNIQUE,
    CONSTRAINT fk_lab_technician_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


CREATE TABLE IF NOT EXISTS receptionist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) UNIQUE,
    CONSTRAINT fk_receptionist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


INSERT INTO role (id, role_name) VALUES
     ('role-admin-id', 'ADMIN'),
     ('role-doctor-id', 'DOCTOR'),
     ('role-patient-id', 'PATIENT'),
     ('role-pharmacist-id', 'PHARMACIST'),
     ('role-labtech-id', 'LABTECHNICIAN'),
     ('role-receptionist-id', 'RECEPTIONIST')
    ON CONFLICT (role_name) DO NOTHING;