CREATE TABLE lab_test_type (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255)
);

CREATE TABLE medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    appointment_id UUID,
    symptoms VARCHAR(255),
    treatment VARCHAR(255),
    diagnosis VARCHAR(255),
    disease VARCHAR(255),

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

CREATE TABLE lab_test (
    id UUID PRIMARY KEY,

    lab_technician_id UUID,
    doctor_id UUID,

    price INT,
    instructions VARCHAR(255),
    status VARCHAR(255),

    result_date TIMESTAMPTZ,
    abnormal_flag VARCHAR(255),
    units VARCHAR(255),
    structure_json VARCHAR(255),
    reference_range VARCHAR(255),

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    medical_history_id UUID,
    lab_test_type_id UUID,

    CONSTRAINT fk_lab_test_medical_history
        FOREIGN KEY (medical_history_id)
        REFERENCES medical_history(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_lab_test_lab_test_type
        FOREIGN KEY (lab_test_type_id)
        REFERENCES lab_test_type(id)
        ON DELETE SET NULL
);

CREATE TABLE medical_attachment (
    id UUID PRIMARY KEY,

    file_path VARCHAR(255),
    type VARCHAR(255),

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,

    lab_test_id UUID,
    CONSTRAINT fk_medical_attachment_lab_test
        FOREIGN KEY (lab_test_id)
        REFERENCES lab_test(id)
        ON DELETE CASCADE
);
