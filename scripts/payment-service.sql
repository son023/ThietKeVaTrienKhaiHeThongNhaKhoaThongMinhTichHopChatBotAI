DROP TABLE IF EXISTS payment CASCADE;

-- ---------------------------------------------------------------------
-- Bảng 1: payment
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment
(
    id              UUID         NOT NULL,
    create_at       TIMESTAMP,
    description     VARCHAR(500),
    expired_at      TIMESTAMP,
    invoice_id      UUID         NOT NULL,
    paid_at         TIMESTAMP,
    payment_method  VARCHAR(50)  NOT NULL,
    payment_url     TEXT,
    status          VARCHAR(50)  NOT NULL,
    total_amount    INTEGER      NOT NULL,
    transaction_id  VARCHAR(255),
    update_at       TIMESTAMP,

    CONSTRAINT payment_pkey PRIMARY KEY (id),
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

CREATE INDEX idx_payment_invoice_id ON public.payment (invoice_id);
CREATE INDEX idx_payment_status ON public.payment (status);
CREATE INDEX idx_payment_method ON public.payment (payment_method);
CREATE INDEX idx_payment_invoice_create_at ON public.payment (invoice_id, create_at DESC);

CREATE SEQUENCE public.association_value_entry_seq
    START WITH 1
    INCREMENT BY 50
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- =========================================================
-- INSERT DATA - PAYMENTS FOR ALL 16 INVOICES (4/1-11/1)
-- =========================================================
INSERT INTO public.payment (id, invoice_id, total_amount, payment_method, status, description, transaction_id, create_at, paid_at, update_at, expired_at)
VALUES
-- Ngày 4/1: Payment 101, 102
('a1010101-0101-0101-0101-010101010101', 'f1f1f1f1-1111-1111-1111-111111111101', 79000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn trám răng', 'TXN-2026010401', '2026-01-04 09:40:00+07', '2026-01-04 09:45:00+07', '2026-01-04 09:45:00+07', NULL),
('a1020202-0202-0202-0202-020202020202', 'f1f1f1f1-1111-1111-1111-111111111102', 195000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn cạo vôi răng', 'TXN-2026010402', '2026-01-04 14:35:00+07', '2026-01-04 14:45:00+07', '2026-01-04 14:45:00+07', NULL),

-- Ngày 5/1: Payment 103, 104
('a1030303-0303-0303-0303-030303030303', 'f1f1f1f1-1111-1111-1111-111111111103', 425500, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn điều trị tủy', 'TXN-2026010501', '2026-01-05 10:05:00+07', '2026-01-05 10:30:00+07', '2026-01-05 10:30:00+07', NULL),
('a1040404-0404-0404-0404-040404040404', 'f1f1f1f1-1111-1111-1111-111111111104', 12006000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn răng sứ', 'TXN-2026010502', '2026-01-05 15:35:00+07', '2026-01-05 16:00:00+07', '2026-01-05 16:00:00+07', NULL),

-- Ngày 6/1: Payment 105, 106
('a1050505-0505-0505-0505-050505050505', 'f1f1f1f1-1111-1111-1111-111111111105', 18006000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn dán sứ Veneer', 'TXN-2026010601', '2026-01-06 10:05:00+07', '2026-01-06 10:30:00+07', '2026-01-06 10:30:00+07', NULL),
('a1060606-0606-0606-0606-060606060606', 'f1f1f1f1-1111-1111-1111-111111111106', 18385000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn cấy ghép Implant', 'TXN-2026010602', '2026-01-06 15:05:00+07', '2026-01-06 15:30:00+07', '2026-01-06 15:30:00+07', NULL),

-- Ngày 7/1: Payment 107, 108
('a1070707-0707-0707-0707-070707070707', 'f1f1f1f1-1111-1111-1111-111111111107', 5000000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn tư vấn chỉnh nha', 'TXN-2026010701', '2026-01-07 10:05:00+07', '2026-01-07 10:30:00+07', '2026-01-07 10:30:00+07', NULL),
('a1080808-0808-0808-0808-080808080808', 'f1f1f1f1-1111-1111-1111-111111111108', 431500, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn điều trị tủy', 'TXN-2026010702', '2026-01-07 16:05:00+07', '2026-01-07 16:30:00+07', '2026-01-07 16:30:00+07', NULL),

-- Ngày 8/1: Payment 109, 110
('a1090909-0909-0909-0909-090909090909', 'f1f1f1f1-1111-1111-1111-111111111109', 1732000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn nhổ răng', 'TXN-2026010801', '2026-01-08 10:05:00+07', '2026-01-08 10:30:00+07', '2026-01-08 10:30:00+07', NULL),
('a1101010-1010-1010-1010-101010101010', 'f1f1f1f1-1111-1111-1111-111111111110', 3080000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn điều trị viêm lợi', 'TXN-2026010802', '2026-01-08 15:05:00+07', '2026-01-08 15:30:00+07', '2026-01-08 15:30:00+07', NULL),

-- Ngày 9/1: Payment 111, 112
('a1111111-1111-1111-1111-111111111111', 'f1f1f1f1-1111-1111-1111-111111111111', 359000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn trám răng', 'TXN-2026010901', '2026-01-09 10:05:00+07', '2026-01-09 10:15:00+07', '2026-01-09 10:15:00+07', NULL),
('a1121212-1212-1212-1212-121212121212', 'f1f1f1f1-1111-1111-1111-111111111112', 431500, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn điều trị tủy', 'TXN-2026010902', '2026-01-09 16:05:00+07', '2026-01-09 16:30:00+07', '2026-01-09 16:30:00+07', NULL),

-- Ngày 10/1: Payment 113, 114
('a1131313-1313-1313-1313-131313131313', 'f1f1f1f1-1111-1111-1111-111111111113', 395000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn cạo vôi răng', 'TXN-2026011001', '2026-01-10 10:05:00+07', '2026-01-10 10:15:00+07', '2026-01-10 10:15:00+07', NULL),
('a1141414-1414-1414-1414-141414141414', 'f1f1f1f1-1111-1111-1111-111111111114', 356000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn trám răng', 'TXN-2026011002', '2026-01-10 15:05:00+07', '2026-01-10 15:15:00+07', '2026-01-10 15:15:00+07', NULL),

-- Ngày 11/1: Payment 115, 116
('a1151515-1515-1515-1515-151515151515', 'f1f1f1f1-1111-1111-1111-111111111115', 3025000, 'BANK_TRANSFER', 'SUCCESSFUL', 'Thanh toán chuyển khoản cho hóa đơn tẩy trắng răng', 'TXN-2026011101', '2026-01-11 10:05:00+07', '2026-01-11 10:30:00+07', '2026-01-11 10:30:00+07', NULL),
('a1161616-1616-1616-1616-161616161616', 'f1f1f1f1-1111-1111-1111-111111111116', 145000, 'CASH', 'SUCCESSFUL', 'Thanh toán tiền mặt cho hóa đơn khám định kỳ', 'TXN-2026011102', '2026-01-11 16:05:00+07', '2026-01-11 16:15:00+07', '2026-01-11 16:15:00+07', NULL);

-- =========================================================
-- AXON FRAMEWORK TABLES
-- =========================================================
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
