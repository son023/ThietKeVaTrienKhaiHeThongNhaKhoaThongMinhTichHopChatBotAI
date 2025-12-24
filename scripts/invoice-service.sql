DROP TABLE IF EXISTS invoice_item CASCADE;
DROP TABLE IF EXISTS invoice CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: invoice
-- Lưu trữ thông tin hóa đơn tổng
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice
(
    id                  UUID NOT NULL,
    appointment_id      UUID,
    currency            VARCHAR(10) DEFAULT 'VND',
    insurance_claim_id  UUID,
    insurance_total_pay INTEGER,
    issue_at            TIMESTAMP,
    paid_at             TIMESTAMP,
    patient_total_pay   INTEGER,
    receptionist_id     UUID,
    status              VARCHAR(50), -- PENDING, PAID, CANCELLED
    total_amount        INTEGER,
    update_at           TIMESTAMP,

-- Khóa chính
    CONSTRAINT invoice_pkey PRIMARY KEY (id)
    );

---

-- ---------------------------------------------------------------------
-- Bảng 2: invoice_item
-- Chi tiết từng mục trong hóa đơn (Liên kết N-1 với Invoice)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_item
(
    id                   UUID NOT NULL,
    claim_item_id        UUID,
    description          VARCHAR(255),
    insurance_pay_amount INTEGER,
    patient_pay_amount   INTEGER,
    quantity             INTEGER,
    reference_id         UUID,
    service_type         VARCHAR(50),   -- SERVICE, MEDICINE
    unit_price           INTEGER,
    invoice_id           UUID NOT NULL,

-- Khóa chính
    CONSTRAINT invoice_item_pkey PRIMARY KEY (id),

    -- Khóa ngoại: Liên kết với bảng invoice
    CONSTRAINT fk_invoice_item_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES public.invoice (id)
    ON DELETE CASCADE
    );

-- ---------------------------------------------------------------------
-- Tạo Index để tối ưu hóa truy vấn
-- ---------------------------------------------------------------------
CREATE INDEX idx_invoice_appointment_id ON public.invoice (appointment_id);
CREATE INDEX idx_invoice_receptionist_id ON public.invoice (receptionist_id);
CREATE INDEX idx_invoice_item_invoice_id ON public.invoice_item (invoice_id);

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