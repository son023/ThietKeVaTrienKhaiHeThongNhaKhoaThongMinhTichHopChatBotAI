DROP TABLE IF EXISTS payment CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: payment
-- Lưu trữ thông tin giao dịch thanh toán
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment
(
    id              UUID         NOT NULL,
    create_at       TIMESTAMP,
    description     VARCHAR(500),
    expired_at      TIMESTAMP,
    invoice_id      UUID         NOT NULL,
    paid_at         TIMESTAMP,
    payment_method  VARCHAR(50)  NOT NULL,-- Enum: CASH, BANK_TRANSFER
    payment_url     TEXT,
    status          VARCHAR(50)  NOT NULL,-- Enum: PENDING, SUCCESSFUL, FAILED, TIMEOUT
    total_amount    INTEGER      NOT NULL,
    transaction_id  VARCHAR(255),
    update_at       TIMESTAMP,

-- Khóa chính
    CONSTRAINT payment_pkey PRIMARY KEY (id),

    -- Ràng buộc duy nhất cho mã giao dịch (PayOS order code)
    CONSTRAINT uk_transaction_id UNIQUE (transaction_id)
    );

CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
                                 task_name text not null,
                                 task_instance text not null,
                                 task_data bytea,
                                 execution_time timestamp with time zone not null,
                                 picked BOOLEAN not null,
                                 picked_by text,
                                 last_success timestamp with time zone,
                                 last_failure timestamp with time zone,
                                 consecutive_failures INT,
                                 last_heartbeat timestamp with time zone,
                                 version BIGINT not null,
                                 priority SMALLINT,
                                 PRIMARY KEY (task_name, task_instance)
);

CREATE INDEX execution_time_idx ON public.scheduled_tasks (execution_time);
CREATE INDEX last_heartbeat_idx ON public.scheduled_tasks (last_heartbeat);
CREATE INDEX priority_execution_time_idx on public.scheduled_tasks (priority desc, execution_time asc);

-- ---------------------------------------------------------------------
-- Tạo Index để tối ưu hóa truy vấn (Dựa trên PaymentRepository)
-- ---------------------------------------------------------------------
-- Tìm kiếm lịch sử thanh toán của hóa đơn
CREATE INDEX idx_payment_invoice_id ON public.payment (invoice_id);

-- Tìm kiếm theo trạng thái (cho Scheduler quét PENDING)
CREATE INDEX idx_payment_status ON public.payment (status);

-- Tìm kiếm theo phương thức thanh toán (Thống kê)
CREATE INDEX idx_payment_method ON public.payment (payment_method);

-- Index kết hợp cho truy vấn phổ biến: Tìm payment của invoice theo thời gian
CREATE INDEX idx_payment_invoice_create_at ON public.payment (invoice_id, create_at DESC);

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