CREATE EXTENSION IF NOT EXISTS "pgcrypto";
DROP TABLE IF EXISTS public.invoice CASCADE;
DROP TABLE IF EXISTS public.invoice_item CASCADE;

CREATE TABLE IF NOT EXISTS invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receptionist_id UUID,
    appointment_id UUID,
    total_amount INTEGER,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(50),
    issue_at TIMESTAMP,
    paid_at TIMESTAMP,
    insurance_total_pay INTEGER,
    patient_total_pay INTEGER,
    insurance_claim_id UUID,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS invoice_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    reference_id UUID,
    service_type VARCHAR(100),
    quantity INTEGER,
    description TEXT,
    unit_price INTEGER,
    insurance_pay_amount INTEGER,
    patient_pay_amount INTEGER,
    claim_item_id UUID,

    CONSTRAINT fk_invoice_item_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES invoice(id)
    ON DELETE CASCADE
    );

-- Insert sample invoice
INSERT INTO invoice (
    id,
    receptionist_id,
    appointment_id,
    total_amount,
    currency,
    status,
    issue_at,
    paid_at,
    insurance_total_pay,
    patient_total_pay,
    insurance_claim_id
)
VALUES (
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    500000,
    'VND',
    'PENDING',
    '2025-01-15 10:30:00',
    '2025-01-15 10:35:00',
    300000,
    200000,
    '44444444-4444-4444-8444-444444444444'
);

-- Insert sample invoice items
INSERT INTO invoice_item (
    id,
    invoice_id,
    reference_id,
    service_type,
    quantity,
    description,
    unit_price,
    insurance_pay_amount,
    patient_pay_amount,
    claim_item_id
)
VALUES
-- Item 1: Khám bệnh
(
    '55555555-5555-4555-8555-555555555555',
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    'aaaa1111-aaaa-4aaa-8aaa-111111111111',
    'CONSULTATION',
    1,
    'Khám bệnh tổng quát',
    200000,
    120000,
    80000,
    '77777777-7777-4777-8777-777777777777'
),
-- Item 2: Xét nghiệm
(
    '88888888-8888-4888-8888-888888888888',
    '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    '99999999-9999-4999-8999-999999999999',
    'LAB_TEST',
    1,
    'Xét nghiệm máu tổng quát',
    300000,
    180000,
    120000,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
);
CREATE TABLE IF NOT EXISTS public.token_entry
(
    processor_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    segment integer NOT NULL,
    owner character varying(255) COLLATE pg_catalog."default",
    "timestamp" character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token oid,
    token_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT token_entry_pkey PRIMARY KEY (processor_name, segment)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.saga_entry
(
    saga_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    revision character varying(255) COLLATE pg_catalog."default",
    saga_type character varying(255) COLLATE pg_catalog."default",
    serialized_saga oid,
    CONSTRAINT saga_entry_pkey PRIMARY KEY (saga_id)
)

TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.dead_letter_entry
(
    dead_letter_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    cause_message character varying(1023) COLLATE pg_catalog."default",
    cause_type character varying(255) COLLATE pg_catalog."default",
    diagnostics oid,
    enqueued_at timestamp(6) with time zone NOT NULL,
    last_touched timestamp(6) with time zone,
    aggregate_identifier character varying(255) COLLATE pg_catalog."default",
    event_identifier character varying(255) COLLATE pg_catalog."default" NOT NULL,
    message_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    meta_data oid,
    payload oid NOT NULL,
    payload_revision character varying(255) COLLATE pg_catalog."default",
    payload_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sequence_number bigint,
    time_stamp character varying(255) COLLATE pg_catalog."default" NOT NULL,
    token oid,
    token_type character varying(255) COLLATE pg_catalog."default",
    type character varying(255) COLLATE pg_catalog."default",
    processing_group character varying(255) COLLATE pg_catalog."default" NOT NULL,
    processing_started timestamp(6) with time zone,
    sequence_identifier character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sequence_index bigint NOT NULL,
    CONSTRAINT dead_letter_entry_pkey PRIMARY KEY (dead_letter_id),
    CONSTRAINT ukhlr8io86j74qy298xf720n16v UNIQUE (processing_group, sequence_identifier, sequence_index)
)

TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS idxe67wcx5fiq9hl4y4qkhlcj9cg
    ON public.dead_letter_entry USING btree
    (processing_group COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idxrwucpgs6sn93ldgoeh2q9k6bn
    ON public.dead_letter_entry USING btree
    (processing_group COLLATE pg_catalog."default" ASC NULLS LAST, sequence_identifier COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.association_value_entry
(
    id bigint NOT NULL,
    association_key character varying(255) COLLATE pg_catalog."default" NOT NULL,
    association_value character varying(255) COLLATE pg_catalog."default",
    saga_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    saga_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT association_value_entry_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;


CREATE INDEX IF NOT EXISTS idxgv5k1v2mh6frxuy5c0hgbau94
    ON public.association_value_entry USING btree
    (saga_id COLLATE pg_catalog."default" ASC NULLS LAST, saga_type COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idxk45eqnxkgd8hpdn6xixn8sgft
    ON public.association_value_entry USING btree
    (saga_type COLLATE pg_catalog."default" ASC NULLS LAST, association_key COLLATE pg_catalog."default" ASC NULLS LAST, association_value COLLATE pg_catalog."default" ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;