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
    price FLOAT NOT NULL,

    appointment_id UUID,
    CONSTRAINT fk_medical_service_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointment(id)
        ON DELETE SET NULL
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
