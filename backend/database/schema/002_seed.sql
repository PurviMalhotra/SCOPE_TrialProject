-- Sample data — matches SCOPE Event Request form UI

INSERT INTO faculty (employee_id, faculty_name) VALUES
    ('27643',  'Monica'),
    ('EMP001', 'Rahul Sharma'),
    ('EMP002', 'Priya Verma');

INSERT INTO users (email, full_name, role, faculty_id) VALUES
    ('rahul.sharma@vit.ac.in', 'Rahul Sharma', 'faculty',      1),
    ('priya.verma@vit.ac.in',  'Priya Verma',  'faculty',      2),
    ('hod.cs@vit.ac.in',       'Dr. CS HOD',   'hod',          NULL),
    ('dean.school@vit.ac.in',  'Dean School',  'dean',         NULL),
    ('scope.admin@vit.ac.in',  'SCOPE Admin',  'scope_admin',  NULL);

INSERT INTO experts (
    expert_name, designation, company_name, address,
    mobile_number, email, whatsapp_number, exp_years
) VALUES
    (
        'Dr. Anil Kumar',
        'Senior Data Scientist',
        'Tech Solutions Inc.',
        '123 Main Street, Cityville',
        '9876543210',
        'anil.kumar@techsolutions.com',
        '9876543210',
        10
    ),
    (
        'Prof. Sarah Mitchell',
        'Professor of AI',
        'MIT',
        '77 Massachusetts Ave, Cambridge, MA',
        '+1-555-0100',
        's.mitchell@mit.edu',
        '+1-555-0100',
        18
    );

-- Pending: Foreign Expert
INSERT INTO event_requests (
    guest_lecture_type, lecture_title, course_code, course_title,
    expert_id, brochure_template, submitted_by, status, submitted_at
) VALUES (
    'foreign_expert',
    'Advanced Machine Learning Techniques',
    'CSE501',
    'Introduction to Artificial Intelligence',
    1,
    'modern_minimalist',
    1,
    'pending',
    NOW()
);

INSERT INTO event_request_faculty (request_id, faculty_id) VALUES (1, 1), (1, 2);

UPDATE event_external_schedules SET
    external_status = 'redirected',
    external_booking_url = 'https://booking.example.edu/request/1',
    redirected_at = NOW() - INTERVAL '2 hours'
WHERE request_id = 1;

INSERT INTO event_attachments (request_id, attachment_type, file_name, file_path, file_size_bytes) VALUES
    (1, 'acceptance_mail',  'acceptance.pdf', '/uploads/1/acceptance.pdf', 95000),
    (1, 'expert_profile',   'profile.pdf',    '/uploads/1/profile.pdf',    512000),
    (1, 'guest_invitation', 'invitation.pdf', '/uploads/1/invitation.pdf', 180000);

-- Approved: VIT Alumni
INSERT INTO event_requests (
    guest_lecture_type, lecture_title, course_code, course_title,
    expert_id, brochure_template, submitted_by, status, submitted_at, reviewed_at
) VALUES (
    'vit_alumni',
    'Industry Trends in Cloud Computing',
    'IT302',
    'Cloud Infrastructure',
    2,
    'elegant_formal',
    2,
    'approved',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '2 days'
);

UPDATE event_external_schedules SET
    external_status = 'completed',
    external_reference_id = 'EXT-BOOK-2026-0042',
    redirected_at = NOW() - INTERVAL '12 days',
    completed_at = NOW() - INTERVAL '9 days',
    start_date = '2026-05-20',
    end_date = '2026-05-20',
    start_time = '10:30',
    end_time = '12:30',
    venue = 'CDMM Hall',
    student_strength = 200,
    raw_payload = '{"bookingId": "EXT-BOOK-2026-0042"}'::jsonb
WHERE request_id = 2;

-- Rejected: Indian Expert
INSERT INTO event_requests (
    guest_lecture_type, lecture_title, course_code, course_title,
    expert_id, brochure_template, submitted_by, status, rejection_reason,
    submitted_at, reviewed_at
) VALUES (
    'indian_expert',
    'Ethics in Technology and AI',
    'HU101',
    'Humanities Elective',
    1,
    'classic_academic',
    1,
    'rejected',
    'Expert unavailable on proposed dates.',
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '25 days'
);

-- Under review: Foreign Expert (schedule booking in progress)
INSERT INTO event_requests (
    guest_lecture_type, lecture_title, course_code, course_title,
    expert_id, brochure_template, submitted_by, status, submitted_at
) VALUES (
    'foreign_expert',
    'Cybersecurity Operations and Incident Response',
    'CSE402',
    'Network Security',
    NULL,
    'vibrant_creative',
    2,
    'under_review',
    NOW() - INTERVAL '1 day'
);

UPDATE event_external_schedules SET
    external_status = 'redirected',
    external_booking_url = 'https://booking.example.edu/request/4',
    redirected_at = NOW() - INTERVAL '1 day'
WHERE request_id = 4;

INSERT INTO approval_workflow_steps (request_id, template_step_id, step_order, step_role, step_label, status, acted_at)
SELECT
    er.request_id,
    wst.template_step_id,
    wst.step_order,
    wst.step_role,
    wst.step_label,
    CASE
        WHEN er.status = 'approved' AND wst.step_order <= 3 THEN 'approved'::workflow_step_status
        WHEN er.status = 'rejected' AND wst.step_order = 1 THEN 'rejected'::workflow_step_status
        WHEN er.status = 'rejected' AND wst.step_order > 1  THEN 'skipped'::workflow_step_status
        WHEN er.status = 'under_review' AND wst.step_order = 1 THEN 'approved'::workflow_step_status
        ELSE 'pending'::workflow_step_status
    END,
    CASE
        WHEN er.status IN ('approved', 'rejected')
             OR (er.status = 'under_review' AND wst.step_order = 1)
        THEN NOW() - (4 - wst.step_order) * INTERVAL '1 day'
        ELSE NULL
    END
FROM event_requests er
CROSS JOIN workflow_step_templates wst
WHERE NOT EXISTS (
    SELECT 1 FROM approval_workflow_steps aws WHERE aws.request_id = er.request_id
)
ORDER BY er.request_id, wst.step_order;
