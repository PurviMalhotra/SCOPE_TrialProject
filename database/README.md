# Database module

## Schema files

| File | Purpose |
|------|---------|
| `schema/001_schema.sql` | Full DDL: enums, tables, indexes, triggers, views |
| `schema/002_seed.sql` | Sample data for development |

Apply order: **001** then **002**.

## Entity overview

```
faculty ──┬──< event_requests >── experts
          │         │
          │         ├──< event_external_schedules   ← schedule/venue (external team)
          │         ├──< event_request_faculty
          │         ├──< event_attachments
          │         └──< approval_workflow_steps
          │                   └── workflow_step_templates
users ────┘
```

## Schedule & venue (external team)

The main portal form does **not** store date, time, venue, or strength.

1. Each `event_requests` row gets an `event_external_schedules` row automatically (`not_started`).
2. When faculty are redirected to the other team’s site, set `external_status = 'redirected'`.
3. When that team finishes, your backend (webhook/API) updates the same row to `completed` with schedule fields and optional `raw_payload`.

See [SCHEMA.md](SCHEMA.md) for SQL examples.

## Approval flow

1. Faculty creates `event_requests` (`draft` → `pending`).
2. Trigger creates HOD → Dean → SCOPE Admin workflow steps.
3. Reviewers update `approval_workflow_steps`.
4. Final status: `approved` or `rejected`.

## Enums

| Type | Values |
|------|--------|
| `guest_lecture_type` | `foreign_expert`, `indian_expert`, `vit_alumni` (UI radio) |
| `lecture_title`, `course_code`, `course_title` | 8th Module Guest Lecture Details |
| `request_status` | `draft`, `pending`, `under_review`, `approved`, `rejected` |
| `external_schedule_status` | `not_started`, `redirected`, `completed`, `failed`, `cancelled` |
| `user_role` | `faculty`, `hod`, `dean`, `scope_admin` |
