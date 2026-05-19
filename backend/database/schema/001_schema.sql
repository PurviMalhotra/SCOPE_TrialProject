-- Faculty Event Approval System (SCOPE Event Management Portal)
DROP TABLE IF EXISTS lecture_details CASCADE;
--Enums
CREATE TYPE guest_lecture_type AS ENUM (
    'foreign_expert',
    'indian_expert',
    'vit_alumni'
);

CREATE TYPE request_status AS ENUM (
    'draft',
    'pending',
    'under_review',
    'approved',
    'rejected'
);

CREATE TYPE user_role AS ENUM (
    'faculty',
    'hod',
    'dean',
    'scope_admin'
);

CREATE TYPE workflow_step_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'skipped'
);

CREATE TYPE brochure_template AS ENUM (
    'classic_academic',
    'modern_minimalist',
    'elegant_formal',
    'vibrant_creative'
);

--Attachment Types
CREATE TYPE attachment_type AS ENUM (
    'acceptance_mail',
    'expert_profile',
    'guest_invitation'
);

-- Tracks handoff to / return from the external scheduling system for venue and schedule
CREATE TYPE external_schedule_status AS ENUM (
    'not_started',       
    'redirected',        
    'completed',         
    'failed',            
    'cancelled'          
);

CREATE TABLE faculty (
    faculty_id   SERIAL PRIMARY KEY,
    employee_id  VARCHAR(20)  NOT NULL UNIQUE,
    faculty_name VARCHAR(100) NOT NULL
);

--Users

CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT,
    full_name     VARCHAR(100) NOT NULL,
    role          user_role NOT NULL,
    faculty_id    INTEGER REFERENCES faculty (faculty_id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE experts (
    expert_id         SERIAL PRIMARY KEY,
    expert_name       VARCHAR(100) NOT NULL,
    designation       VARCHAR(100),
    company_name      VARCHAR(150),
    address           TEXT,
    mobile_number     VARCHAR(15),
    email             VARCHAR(100),
    whatsapp_number   VARCHAR(15),
    exp_years         INTEGER CHECK (exp_years IS NULL OR exp_years >= 0),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

--event requests and lecture details

CREATE TABLE event_requests (
    request_id          SERIAL PRIMARY KEY,
    guest_lecture_type  guest_lecture_type NOT NULL,
    lecture_title       VARCHAR(200) NOT NULL,
    course_code         VARCHAR(20)  NOT NULL,
    course_title        VARCHAR(100) NOT NULL,

    expert_id           INTEGER REFERENCES experts (expert_id) ON DELETE RESTRICT,
    brochure_template   brochure_template NOT NULL DEFAULT 'classic_academic',

    submitted_by        INTEGER REFERENCES faculty (faculty_id) ON DELETE SET NULL,
    status            request_status    NOT NULL DEFAULT 'draft',
    form_data         JSONB,
    rejection_reason  TEXT,
    submitted_at      TIMESTAMPTZ,
    reviewed_at       TIMESTAMPTZ,
    created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- External schedule & venue (filled when the other team's site finishes)

CREATE TABLE event_external_schedules (
    schedule_id           SERIAL PRIMARY KEY,
    request_id            INTEGER NOT NULL UNIQUE REFERENCES event_requests (request_id) ON DELETE CASCADE,

    external_status       external_schedule_status NOT NULL DEFAULT 'not_started',
    external_reference_id VARCHAR(100),   -- booking id from external system
    external_booking_url  TEXT,       

    redirected_at         TIMESTAMPTZ,    
    completed_at          TIMESTAMPTZ,   
    synced_at             TIMESTAMPTZ,  

    -- Schedule & venue ( after external_status = 'completed')
    start_date            DATE,
    end_date              DATE,
    start_time            TIME,
    end_time              TIME,
    venue                 VARCHAR(200),
    student_strength      INTEGER CHECK (student_strength IS NULL OR student_strength > 0),

    raw_payload           JSONB,          -- full JSON from external team / webhook

    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_schedule_dates CHECK (
        start_date IS NULL AND end_date IS NULL
        OR (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date)
    ),
    CONSTRAINT chk_schedule_times CHECK (
        start_date IS NULL OR end_date IS NULL OR start_time IS NULL OR end_time IS NULL
        OR start_date < end_date
        OR (start_date = end_date AND end_time > start_time)
    ),
    CONSTRAINT chk_completed_has_schedule CHECK (
        external_status <> 'completed'
        OR (
            start_date IS NOT NULL
            AND end_date IS NOT NULL
            AND start_time IS NOT NULL
            AND end_time IS NOT NULL
            AND venue IS NOT NULL
            AND student_strength IS NOT NULL
        )
    )
);

-- Co-faculty, attachments, workflow
--Faculty Information (Employee ID + Name per row)
CREATE TABLE event_request_faculty (
    event_request_faculty_id SERIAL PRIMARY KEY,
    request_id               INTEGER NOT NULL REFERENCES event_requests (request_id) ON DELETE CASCADE,
    faculty_id               INTEGER NOT NULL REFERENCES faculty (faculty_id) ON DELETE RESTRICT,
    UNIQUE (request_id, faculty_id)
);

CREATE TABLE event_attachments (
    attachment_id   SERIAL PRIMARY KEY,
    request_id      INTEGER NOT NULL REFERENCES event_requests (request_id) ON DELETE CASCADE,
    attachment_type attachment_type NOT NULL,
    file_name       VARCHAR(255) NOT NULL,
    file_path       TEXT NOT NULL,
    file_size_bytes BIGINT CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
    UNIQUE (request_id, attachment_type)
);

CREATE TABLE workflow_step_templates (
    template_step_id SERIAL PRIMARY KEY,
    step_order       INTEGER      NOT NULL UNIQUE,
    step_role        VARCHAR(50)  NOT NULL,
    step_label       VARCHAR(100) NOT NULL
);

CREATE TABLE approval_workflow_steps (
    step_id          SERIAL PRIMARY KEY,
    request_id       INTEGER NOT NULL REFERENCES event_requests (request_id) ON DELETE CASCADE,
    template_step_id INTEGER REFERENCES workflow_step_templates (template_step_id) ON DELETE SET NULL,
    step_order       INTEGER NOT NULL,
    step_role        VARCHAR(50)  NOT NULL,
    step_label       VARCHAR(100) NOT NULL,
    status           workflow_step_status NOT NULL DEFAULT 'pending',
    acted_by         INTEGER REFERENCES users (user_id) ON DELETE SET NULL,
    comments         TEXT,
    acted_at         TIMESTAMPTZ,
    UNIQUE (request_id, step_order)
);

INSERT INTO workflow_step_templates (step_order, step_role, step_label) VALUES
    (1, 'hod',         'HOD Review'),
    (2, 'dean',        'Dean Review'),
    (3, 'scope_admin', 'SCOPE Admin Approval');
-- Indexes

CREATE INDEX idx_event_requests_status ON event_requests (status);
CREATE INDEX idx_event_requests_guest_lecture_type ON event_requests (guest_lecture_type);
CREATE INDEX idx_event_requests_submitted_by ON event_requests (submitted_by);
CREATE INDEX idx_event_requests_lecture_title ON event_requests USING gin (to_tsvector('english', lecture_title));
CREATE INDEX idx_external_schedules_status ON event_external_schedules (external_status);
CREATE INDEX idx_external_schedules_start_date ON event_external_schedules (start_date DESC);
CREATE INDEX idx_faculty_employee_id ON faculty (employee_id);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_approval_workflow_request ON approval_workflow_steps (request_id);

-- Triggers: updated_at

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_experts_updated_at
    BEFORE UPDATE ON experts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_event_requests_updated_at
    BEFORE UPDATE ON event_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_external_schedules_updated_at
    BEFORE UPDATE ON event_external_schedules
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger: workflow steps on submit

CREATE OR REPLACE FUNCTION create_workflow_steps_on_submit()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('pending', 'under_review')
       AND (TG_OP = 'INSERT' OR OLD.status = 'draft')
    THEN
        INSERT INTO approval_workflow_steps (
            request_id, template_step_id, step_order, step_role, step_label
        )
        SELECT
            NEW.request_id,
            wst.template_step_id,
            wst.step_order,
            wst.step_role,
            wst.step_label
        FROM workflow_step_templates wst
        WHERE NOT EXISTS (
            SELECT 1
            FROM approval_workflow_steps aws
            WHERE aws.request_id = NEW.request_id
        )
        ORDER BY wst.step_order;

        IF NEW.submitted_at IS NULL THEN
            UPDATE event_requests
            SET submitted_at = NOW()
            WHERE request_id = NEW.request_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_requests_workflow
    AFTER INSERT OR UPDATE OF status ON event_requests
    FOR EACH ROW EXECUTE FUNCTION create_workflow_steps_on_submit();

-- Auto-create external schedule row when request is first saved
CREATE OR REPLACE FUNCTION ensure_external_schedule_row()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO event_external_schedules (request_id)
    VALUES (NEW.request_id)
    ON CONFLICT (request_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_requests_external_schedule
    AFTER INSERT ON event_requests
    FOR EACH ROW EXECUTE FUNCTION ensure_external_schedule_row();

-- Stamp synced_at when external team completes booking
CREATE OR REPLACE FUNCTION stamp_external_schedule_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.external_status = 'completed'
       AND (TG_OP = 'INSERT' OR OLD.external_status IS DISTINCT FROM 'completed')
    THEN
        NEW.synced_at = NOW();
        IF NEW.completed_at IS NULL THEN
            NEW.completed_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_external_schedule_sync
    BEFORE INSERT OR UPDATE OF external_status ON event_external_schedules
    FOR EACH ROW EXECUTE FUNCTION stamp_external_schedule_sync();

-- Views

CREATE OR REPLACE VIEW v_my_event_requests AS
SELECT
    er.request_id,
    er.lecture_title AS event_title,
    f.faculty_name AS applicant,
    CASE er.guest_lecture_type
        WHEN 'foreign_expert' THEN 'Foreign Expert'
        WHEN 'indian_expert'  THEN 'Indian Expert'
        WHEN 'vit_alumni'     THEN 'VIT Alumni'
    END AS guest_lecture_type_label,
    er.course_code,
    er.course_title,
    es.start_date AS event_date,
    es.venue,
    es.student_strength,
    INITCAP(REPLACE(es.external_status::TEXT, '_', ' ')) AS schedule_status,
    CASE er.status
        WHEN 'under_review' THEN 'Pending'
        WHEN 'draft'        THEN 'Draft'
        ELSE INITCAP(er.status::TEXT)
    END AS status,
    e.expert_name,
    er.submitted_at
FROM event_requests er
LEFT JOIN faculty f ON f.faculty_id = er.submitted_by
LEFT JOIN experts e ON e.expert_id = er.expert_id
LEFT JOIN event_external_schedules es ON es.request_id = er.request_id;

CREATE OR REPLACE VIEW v_request_workflow AS
SELECT
    aws.step_id,
    aws.request_id,
    er.lecture_title AS event_title,
    aws.step_order,
    aws.step_label,
    aws.step_role,
    INITCAP(aws.status::TEXT) AS step_status,
    u.full_name AS acted_by_name,
    aws.comments,
    aws.acted_at
FROM approval_workflow_steps aws
JOIN event_requests er ON er.request_id = aws.request_id
LEFT JOIN experts e ON e.expert_id = er.expert_id
LEFT JOIN users u ON u.user_id = aws.acted_by
ORDER BY aws.request_id, aws.step_order;

-- Full schedule row for backend after external callback
CREATE OR REPLACE VIEW v_event_schedules AS
SELECT
    er.request_id,
    er.lecture_title,
    er.guest_lecture_type,
    er.course_code,
    er.course_title,
    er.status AS approval_status,
    es.schedule_id,
    es.external_status,
    es.external_reference_id,
    es.external_booking_url,
    es.redirected_at,
    es.completed_at,
    es.synced_at,
    es.start_date,
    es.end_date,
    es.start_time,
    es.end_time,
    es.venue,
    es.student_strength,
    es.raw_payload
FROM event_requests er
JOIN event_external_schedules es ON es.request_id = er.request_id;

--Faculty Information table
CREATE OR REPLACE VIEW v_event_request_faculty AS
SELECT
    erf.event_request_faculty_id,
    erf.request_id,
    ROW_NUMBER() OVER (PARTITION BY erf.request_id ORDER BY erf.event_request_faculty_id) AS sl_no,
    f.employee_id,
    f.faculty_name
FROM event_request_faculty erf
JOIN faculty f ON f.faculty_id = erf.faculty_id;
