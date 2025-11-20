CREATE TABLE IF NOT EXISTS invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receptionist_id VARCHAR(255),
    appointment_id VARCHAR(255),
    total_amount DOUBLE PRECISION,
    currency VARCHAR(10) DEFAULT 'VND',
    status VARCHAR(50),
    issue_at TIMESTAMP,
    paid_at TIMESTAMP,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS invoice_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR(50) NOT NULL,
    reference_id INTEGER,
    service_type VARCHAR(100),
    quantity INTEGER,
    description TEXT,
    unit_price DOUBLE PRECISION,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_invoice_item_invoice
    FOREIGN KEY (invoice_id)
    REFERENCES invoice(id)
    ON DELETE CASCADE
    );


