CREATE TABLE appointment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    doctor_id UUID NOT NULL,
    patient_id UUID NOT NULL,

    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,

    status VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);


CREATE TABLE medical_service (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    service_name VARCHAR(255) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    service_time INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    price FLOAT NOT NULL
);

CREATE TABLE appointment_medical_service (
    appointment_id UUID NOT NULL,
    medical_service_id UUID NOT NULL,

    PRIMARY KEY (appointment_id, medical_service_id),

    CONSTRAINT fk_ams_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ams_medical_service
        FOREIGN KEY (medical_service_id)
        REFERENCES medical_service(id)
        ON DELETE CASCADE
);


CREATE TABLE work_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    work_date TIMESTAMPTZ NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE doctor_work_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    doctor_id VARCHAR(50) NOT NULL,

    status VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,

    work_schedule_id UUID,
    CONSTRAINT fk_dws_work_schedule
        FOREIGN KEY (work_schedule_id)
        REFERENCES work_schedule(id)
        ON DELETE SET NULL
);
