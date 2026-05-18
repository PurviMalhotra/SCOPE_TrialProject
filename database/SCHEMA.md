# Schema reference

See [UI_AUDIT.md](UI_AUDIT.md) for form mapping.

## `event_requests` (main form)

| Column | UI |
|--------|-----|
| `guest_lecture_type` | Guest Lecture Type radio |
| `lecture_title` | Title of the Guest Lecture |
| `course_code` | Course Code |
| `course_title` | Course Title |
| `expert_id` | Expert Details (linked row) |
| `brochure_template` | Brochure Template card |

## `experts`

`expert_name`, `designation`, `company_name`, `address`, `mobile_number`, `email`, `whatsapp_number`, `exp_years`

## `event_external_schedules`

Date, time, venue, student strength — from external booking team when complete.

## `event_attachments`

| Type | UI document |
|------|-------------|
| `acceptance_mail` | Acceptance Mail from Expert |
| `expert_profile` | Expert's Profile |
| `guest_invitation` | Guest Invitation |

## Views

- `v_my_event_requests` — dashboard (`event_title` = `lecture_title`)
- `v_event_request_faculty` — faculty table with `sl_no`, `employee_id`, `faculty_name`
