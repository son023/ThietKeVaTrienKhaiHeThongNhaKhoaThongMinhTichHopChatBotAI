CREATE DATABASE IF NOT EXISTS user_service;
USE user_service;

CREATE TABLE user (
                      id CHAR(36) PRIMARY KEY,
                      username VARCHAR(50) NOT NULL UNIQUE,
                      password_hash VARCHAR(255) NOT NULL,
                      email VARCHAR(100) NOT NULL UNIQUE,
                      is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
                      phone VARCHAR(20),
                      full_name VARCHAR(100),
                      last_login_at TIMESTAMP(3),
                      password_updated_at TIMESTAMP(3),
                      is_active BOOLEAN NOT NULL DEFAULT TRUE,
                      created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                      updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE role (
                      id CHAR(36) PRIMARY KEY,
                      name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE user_role (
                           user_id CHAR(36) NOT NULL,
                           role_id CHAR(36) NOT NULL,
                           PRIMARY KEY(user_id, role_id),
                           INDEX idx_user_role_role (role_id),
                           FOREIGN KEY (user_id) REFERENCES user(id),
                           FOREIGN KEY (role_id) REFERENCES role(id)
);

-- Sample data
INSERT INTO user VALUES
                     ('11111111-1111-1111-1111-111111111111','alice','$2a$12$hash...','alice@example.com',TRUE,'+84900123456','Alice Nguyễn',NULL,NULL,TRUE,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3)),
                     ('22222222-2222-2222-2222-222222222222','bob','$2a$12$hash...','bob@example.com',FALSE,'+84900765432','Bob Trần',NULL,NULL,TRUE,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO role VALUES
                     ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Patient'),
                     ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Doctor'),
                     ('cccccccc-cccc-cccc-cccc-cccccccccccc','Admin');

INSERT INTO user_role VALUES
                          ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
                          ('22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');



CREATE DATABASE IF NOT EXISTS patient_service;
USE patient_service;

CREATE TABLE patient (
                         id CHAR(36) PRIMARY KEY,
                         user_id CHAR(36) NOT NULL,
                         dob DATE,
                         gender VARCHAR(10),
                         address TEXT,
                         contact_phone VARCHAR(20),
                         blood_type VARCHAR(3),
                         created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                         updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Sample data
INSERT INTO patient VALUES
    ('33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','1985-05-12','Female','123 Lê Lợi, Hà Nội','+84900123456','O+',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS medical_record_service;
USE medical_record_service;

CREATE TABLE medical_record (
                                id CHAR(36) PRIMARY KEY,
                                patient_id CHAR(36) NOT NULL,
                                doctor_id CHAR(36) NOT NULL,
                                visit_date TIMESTAMP(3) NOT NULL,
                                symptoms TEXT,
                                diagnosis TEXT,
                                notes TEXT,
                                version INT NOT NULL DEFAULT 1,
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE medical_attachment (
                                    id CHAR(36) PRIMARY KEY,
                                    record_id CHAR(36) NOT NULL,
                                    file_path VARCHAR(255),
                                    type VARCHAR(50),
                                    uploaded_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                    FOREIGN KEY (record_id) REFERENCES medical_record(id)
);

-- Sample data
INSERT INTO medical_record VALUES
    ('44444444-4444-4444-4444-444444444444','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','2025-10-01 09:30:00','Đau răng','Sâu răng','Kê đơn hàn răng',1,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO medical_attachment VALUES
    ('55555555-5555-5555-5555-555555555555','44444444-4444-4444-4444-444444444444','/files/xray1.png','XRay',CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS doctor_profile_service;
USE doctor_profile_service;

CREATE TABLE doctor_profile (
                                id CHAR(36) PRIMARY KEY,
                                user_id CHAR(36) NOT NULL,
                                doctor_code VARCHAR(20) UNIQUE,
                                specialization_code VARCHAR(50),
                                working_hospital VARCHAR(100),
                                license_number VARCHAR(50),
                                consultation_fee_amount DECIMAL(10,2),
                                consultation_fee_currency CHAR(3),
                                phone VARCHAR(20),
                                email VARCHAR(100),
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE department (
                            id CHAR(36) PRIMARY KEY,
                            name VARCHAR(100),
                            description TEXT,
                            head_of_department VARCHAR(100),
                            location VARCHAR(100),
                            phone VARCHAR(20),
                            created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                            updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE doctor_department (
                                   doctor_id CHAR(36) NOT NULL,
                                   department_id CHAR(36) NOT NULL,
                                   PRIMARY KEY(doctor_id, department_id),
                                   FOREIGN KEY (doctor_id) REFERENCES doctor_profile(id),
                                   FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE degree (
                        id CHAR(36) PRIMARY KEY,
                        doctor_id CHAR(36) NOT NULL,
                        degree_name VARCHAR(100),
                        institution VARCHAR(100),
                        year_obtained YEAR,
                        certificate_url VARCHAR(255),
                        FOREIGN KEY (doctor_id) REFERENCES doctor_profile(id)
);

-- Sample data
INSERT INTO doctor_profile VALUES
    ('22222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','DOC1001','DENT','Bệnh viện Trung ương Hà Nội','LIC123','500000.00','VND','+84900765432','doc@example.com',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO department VALUES
    ('66666666-6666-6666-6666-666666666666','Khoa Răng Hàm Mặt','Khoa chuyên về nha khoa','BS. Nguyễn Văn X','Tầng 3 tòa A','+84900000000',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO doctor_department VALUES
    ('22222222-2222-2222-2222-222222222222','66666666-6666-6666-6666-666666666666');

INSERT INTO degree VALUES
    ('77777777-7777-7777-7777-777777777777','22222222-2222-2222-2222-222222222222','Bác sĩ Răng Hàm Mặt','Đại học Y Hà Nội','2010','/certs/dds.pdf');



CREATE DATABASE IF NOT EXISTS payment_service;
USE payment_service;

CREATE TABLE payment (
                         id CHAR(36) PRIMARY KEY,
                         invoice_id CHAR(36),
                         patient_id CHAR(36),
                         amount DECIMAL(12,2),
                         currency CHAR(3),
                         status ENUM('PENDING','AUTHORIZED','SUCCEEDED','FAILED','REFUNDED'),
                         payment_method VARCHAR(50),
                         provider VARCHAR(50),
                         provider_txn_id VARCHAR(100),
                         issued_at TIMESTAMP(3),
                         paid_at TIMESTAMP(3),
                         created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                         updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE payment_refund (
                                id CHAR(36) PRIMARY KEY,
                                payment_id CHAR(36),
                                amount DECIMAL(12,2),
                                provider_refund_id VARCHAR(100),
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                FOREIGN KEY (payment_id) REFERENCES payment(id)
);

-- Sample data
INSERT INTO payment VALUES
    ('88888888-8888-8888-8888-888888888888','99999999-9999-9999-9999-999999999999','33333333-3333-3333-3333-333333333333',500000.00,'VND','PENDING','CARD','VNPay','vnp_123','2025-10-02 10:00:00',NULL,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS laboratory_service;
USE laboratory_service;

CREATE TABLE lab_test_type (
                               code VARCHAR(20) PRIMARY KEY,
                               name VARCHAR(100),
                               description TEXT
);

CREATE TABLE lab_technician (
                                id CHAR(36) PRIMARY KEY,
                                user_id CHAR(36),
                                field VARCHAR(100),
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE lab_test_request (
                                  id CHAR(36) PRIMARY KEY,
                                  patient_id CHAR(36),
                                  ordered_by_doctor_id CHAR(36),
                                  test_type_code VARCHAR(20),
                                  status ENUM('REQUESTED','IN_PROGRESS','COMPLETED','CANCELLED'),
                                  instructions TEXT,
                                  request_date TIMESTAMP(3),
                                  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                                  FOREIGN KEY (test_type_code) REFERENCES lab_test_type(code)
);

CREATE TABLE lab_test_result (
                                 id CHAR(36) PRIMARY KEY,
                                 request_id CHAR(36),
                                 technician_id CHAR(36),
                                 status ENUM('PRELIMINARY','FINAL','AMENDED'),
                                 test_date TIMESTAMP(3),
                                 result_date TIMESTAMP(3),
                                 structured_json JSON,
                                 reference_range VARCHAR(50),
                                 units VARCHAR(20),
                                 abnormal_flag BOOLEAN,
                                 file_path VARCHAR(255),
                                 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                                 FOREIGN KEY (request_id) REFERENCES lab_test_request(id),
                                 FOREIGN KEY (technician_id) REFERENCES lab_technician(id)
);

-- Sample data
INSERT INTO lab_test_type VALUES
    ('CBC','Công thức máu','Xét nghiệm máu tổng quát');

INSERT INTO lab_test_request VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','CBC','REQUESTED','Nhịn ăn 8 tiếng','2025-10-02 08:00:00',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS billing_service;
USE billing_service;

CREATE TABLE invoice (
                         id CHAR(36) PRIMARY KEY,
                         patient_id CHAR(36),
                         total_amount DECIMAL(12,2),
                         currency CHAR(3),
                         status ENUM('PENDING','PARTIALLY_PAID','PAID','CANCELLED','REFUNDED'),
                         issued_at TIMESTAMP(3),
                         paid_at TIMESTAMP(3),
                         created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                         updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE invoice_item (
                              id CHAR(36) PRIMARY KEY,
                              invoice_id CHAR(36),
                              service_type ENUM('CONSULTATION','LAB_TEST','MEDICINE','OTHER'),
                              reference_id CHAR(36),
                              description VARCHAR(255),
                              amount DECIMAL(12,2),
                              created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                              FOREIGN KEY (invoice_id) REFERENCES invoice(id)
);

CREATE TABLE invoice_refund (
                                id CHAR(36) PRIMARY KEY,
                                invoice_id CHAR(36),
                                amount DECIMAL(12,2),
                                reason TEXT,
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                FOREIGN KEY (invoice_id) REFERENCES invoice(id)
);

-- Sample data
INSERT INTO invoice VALUES
    ('99999999-9999-9999-9999-999999999999','33333333-3333-3333-3333-333333333333',500000.00,'VND','PENDING','2025-10-02 10:05:00',NULL,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO invoice_item VALUES
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii','99999999-9999-9999-9999-999999999999','CONSULTATION','','Khám răng tổng quát',500000.00,CURRENT_TIMESTAMP(3));


CREATE DATABASE IF NOT EXISTS prescription_service;
USE prescription_service;

CREATE TABLE prescription (
                              id CHAR(36) PRIMARY KEY,
                              patient_id CHAR(36),
                              doctor_id CHAR(36),
                              prescribed_date TIMESTAMP(3),
                              status ENUM('ISSUED','PARTIALLY_DISPENSED','DISPENSED','CANCELLED'),
                              notes TEXT,
                              created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                              updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE prescription_item (
                                   id CHAR(36) PRIMARY KEY,
                                   prescription_id CHAR(36),
                                   medicine_id CHAR(36),
                                   dosage VARCHAR(50),
                                   quantity INT,
                                   FOREIGN KEY (prescription_id) REFERENCES prescription(id)
);

-- Sample data
INSERT INTO prescription VALUES
    ('pppppppp-pppp-pppp-pppp-pppppppppppp','33333333-3333-3333-3333-333333333333','22222222-2222-2222-2222-222222222222','2025-10-01 10:00:00','ISSUED','Uống sau ăn',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO prescription_item VALUES
    ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq','pppppppp-pppp-pppp-pppp-pppppppppppp','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','500mg',10);



CREATE DATABASE IF NOT EXISTS pharmacy_service;
USE pharmacy_service;

CREATE TABLE medicine (
                          id CHAR(36) PRIMARY KEY,
                          name VARCHAR(100),
                          unit VARCHAR(20),
                          description TEXT,
                          created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                          updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE inventory_lot (
                               id CHAR(36) PRIMARY KEY,
                               medicine_id CHAR(36),
                               lot_no VARCHAR(50),
                               expire_date DATE,
                               quantity_on_hand INT,
                               created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                               FOREIGN KEY (medicine_id) REFERENCES medicine(id)
);

CREATE TABLE stock_ledger (
                              id CHAR(36) PRIMARY KEY,
                              lot_id CHAR(36),
                              type ENUM('IN','OUT','ADJUST'),
                              quantity INT,
                              reference_type VARCHAR(50),
                              reference_id CHAR(36),
                              occurred_at TIMESTAMP(3),
                              FOREIGN KEY (lot_id) REFERENCES inventory_lot(id)
);

CREATE TABLE pharmacist (
                            id CHAR(36) PRIMARY KEY,
                            user_id CHAR(36),
                            degree VARCHAR(100),
                            certificate VARCHAR(255),
                            created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                            updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE dispense_order (
                                id CHAR(36) PRIMARY KEY,
                                prescription_id CHAR(36),
                                status ENUM('RESERVED','DISPENSED','CANCELLED'),
                                created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE dispense_item (
                               id CHAR(36) PRIMARY KEY,
                               dispense_order_id CHAR(36),
                               lot_id CHAR(36),
                               quantity INT,
                               FOREIGN KEY (dispense_order_id) REFERENCES dispense_order(id),
                               FOREIGN KEY (lot_id) REFERENCES inventory_lot(id)
);

-- Sample data
INSERT INTO medicine VALUES
    ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','Amoxicillin','Viên','Thuốc kháng sinh',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO inventory_lot VALUES
    ('llllllll-llll-llll-llll-llllllllllll','mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm','L001','2026-01-01',100,CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS insurance_service;
USE insurance_service;

CREATE TABLE insurance_policy (
                                  id CHAR(36) PRIMARY KEY,
                                  policy_number VARCHAR(50),
                                  policy_type VARCHAR(50),
                                  coverage_amount DECIMAL(12,2),
                                  deductible DECIMAL(12,2),
                                  start_date DATE,
                                  end_date DATE,
                                  status VARCHAR(20),
                                  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE patient_insurance (
                                   id CHAR(36) PRIMARY KEY,
                                   patient_id CHAR(36),
                                   insurance_policy_id CHAR(36),
                                   issue_date DATE,
                                   expiry_date DATE,
                                   status VARCHAR(20),
                                   created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                   updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                                   FOREIGN KEY (insurance_policy_id) REFERENCES insurance_policy(id)
);

CREATE TABLE insurance_claim (
                                 id CHAR(36) PRIMARY KEY,
                                 patient_insurance_id CHAR(36),
                                 claim_amount DECIMAL(12,2),
                                 approved_amount DECIMAL(12,2),
                                 status VARCHAR(20),
                                 claim_date TIMESTAMP(3),
                                 approval_date TIMESTAMP(3),
                                 notes TEXT,
                                 created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                                 updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                                 FOREIGN KEY (patient_insurance_id) REFERENCES patient_insurance(id)
);

CREATE TABLE claim_document (
                                id CHAR(36) PRIMARY KEY,
                                insurance_claim_id CHAR(36),
                                file_path VARCHAR(255),
                                document_type VARCHAR(50),
                                uploaded_at TIMESTAMP(3),
                                status VARCHAR(20),
                                FOREIGN KEY (insurance_claim_id) REFERENCES insurance_claim(id)
);

-- Sample data
INSERT INTO insurance_policy VALUES
    ('pppppppp-pppp-pppp-pppp-pppppppppppp','BHYT001','Bảo hiểm y tế xã hội',10000000.00,50000.00,'2025-01-01','2025-12-31','ACTIVE',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));

INSERT INTO patient_insurance VALUES
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii','33333333-3333-3333-3333-333333333333','pppppppp-pppp-pppp-pppp-pppppppppppp','2025-01-01','2025-12-31','ACTIVE',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));



CREATE DATABASE IF NOT EXISTS scheduling_service;
USE scheduling_service;

CREATE TABLE work_schedule (
                               id CHAR(36) PRIMARY KEY,
                               doctor_id CHAR(36),
                               work_date DATE,
                               start_time TIME,
                               end_time TIME,
                               created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                               updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE appointment (
                             id CHAR(36) PRIMARY KEY,
                             patient_id CHAR(36),
                             doctor_id CHAR(36),
                             work_schedule_id CHAR(36),
                             appointment_start_time TIMESTAMP(3),
                             appointment_end_time TIMESTAMP(3),
                             status ENUM('PENDING','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED','NO_SHOW'),
                             created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                             updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                             FOREIGN KEY (work_schedule_id) REFERENCES work_schedule(id)
);

CREATE TABLE slot_hold (
                           id CHAR(36) PRIMARY KEY,
                           doctor_id CHAR(36),
                           appointment_id CHAR(36),
                           time_from TIMESTAMP(3),
                           time_to TIMESTAMP(3),
                           expires_at TIMESTAMP(3),
                           status ENUM('HOLD','RELEASED','CONFIRMED'),
                           created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                           updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                           FOREIGN KEY (appointment_id) REFERENCES appointment(id)
);

-- Sample data
INSERT INTO work_schedule VALUES
    ('wwwwwwww-wwww-wwww-wwww-wwwwwwwwwwww','22222222-2222-2222-2222-222222222222','2025-10-03','08:00:00','17:00:00',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));


CREATE DATABASE IF NOT EXISTS notification_service;
USE notification_service;

CREATE TABLE notification (
                              id CHAR(36) PRIMARY KEY,
                              user_id CHAR(36),
                              channel ENUM('EMAIL','SMS','PUSH'),
                              template_id VARCHAR(50),
                              message TEXT,
                              status ENUM('SCHEDULED','SENT','FAILED'),
                              error_message TEXT,
                              retry_count INT DEFAULT 0,
                              send_at TIMESTAMP(3),
                              created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                              updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Sample data
INSERT INTO notification VALUES
    ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn','11111111-1111-1111-1111-111111111111','SMS','APPOINTMENT_REMINDER','Nhắc lịch khám ngày mai','SCHEDULED',NULL,0,'2025-10-03 08:00:00',CURRENT_TIMESTAMP(3),CURRENT_TIMESTAMP(3));


