# UI vs database audit (SCOPE Event Request form)

## Why there is no `lecture_details` table

The UI **8th Module Guest Lecture Details** section is stored **on each request**, not in a separate table:

| UI field | Column |
|----------|--------|
| Title of the Guest Lecture | `event_requests.lecture_title` |
| Course Code | `event_requests.course_code` |
| Course Title | `event_requests.course_title` |

A standalone `lecture_details` table was removed because it was not linked to requests. The same data now lives on `event_requests` (one set per submission).

## Guest Lecture Type

| UI radio | `guest_lecture_type` |
|----------|----------------------|
| Foreign Expert | `foreign_expert` |
| Indian Expert | `indian_expert` |
| VIT Alumni | `vit_alumni` |

There is **no** Internal / External / Other and **no** webinar.

## Form sections → database

| § | UI section | Database |
|---|------------|----------|
| 1 | Guest Lecture Type | `guest_lecture_type` |
| 2 | Faculty (Employee ID, Name) | `faculty` + `event_request_faculty` |
| 3 | 8th Module details | `lecture_title`, `course_code`, `course_title` |
| 4 | Expert details | `experts` |
| 5 | Event schedule & venue | `event_external_schedules` *(filled after external booking site)* |
| 6 | Brochure template | `brochure_template` |
| 7 | Enclosure uploads | `event_attachments` (`acceptance_mail`, `expert_profile`, `guest_invitation`) |

## Schedule note

The form shows Date, Time, Venue, Student Strength, but your team sends users to an **external booking site**. Those values are stored in `event_external_schedules` when the other team finishes (`start_date`, `start_time`, `venue`, `student_strength`).

## Removed (wrong mockup)

- `event_type` internal / external / other  
- `event_category` workshop / industrial visit  
- `objective`, `target_audience`, `expected_participants`  
- Outcome boolean checkboxes (UI uses file uploads in Enclosure Details)
