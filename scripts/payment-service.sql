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

