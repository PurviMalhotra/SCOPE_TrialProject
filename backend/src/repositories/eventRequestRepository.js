const { query, withTransaction } = require("../../database/db");
const REQUEST_STATUS = require("../constants/statuses");

const LECTURE_UI_TO_DB = {
  foreign: "foreign_expert",
  indian: "indian_expert",
  alumni: "vit_alumni",
};

const LECTURE_DB_TO_UI = {
  foreign_expert: "Foreign Expert",
  indian_expert: "Indian Expert",
  vit_alumni: "VIT Alumni",
};

const STATUS_UI_TO_DB = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
  Draft: "draft",
};

const TEMPLATE_UI_TO_DB = {
  classic: "classic_academic",
  modern: "modern_minimalist",
  elegant: "elegant_formal",
  vibrant: "vibrant_creative",
};

const TEMPLATE_DB_TO_UI = Object.fromEntries(
  Object.entries(TEMPLATE_UI_TO_DB).map(([ui, db]) => [db, ui])
);

const formatDateForDashboard = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const mapStatusFromDb = (status) => {
  if (!status) return REQUEST_STATUS.PENDING;
  const normalized = String(status).toLowerCase();
  if (normalized === "under_review" || normalized === "pending") {
    return REQUEST_STATUS.PENDING;
  }
  if (normalized === "approved") return REQUEST_STATUS.APPROVED;
  if (normalized === "rejected") return REQUEST_STATUS.REJECTED;
  if (normalized === "draft") return "Draft";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const mapRowToDashboard = (row) => ({
  id: row.request_id,
  topic: row.event_title,
  code: row.course_code,
  course: row.course_title,
  lectureBy: row.guest_lecture_type_label,
  date: formatDateForDashboard(row.event_date),
  status: mapStatusFromDb(row.status),
  formData: row.form_data || null,
  createdBy: row.submitted_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const LIST_SQL = `
  SELECT
    v.request_id,
    v.event_title,
    v.course_code,
    v.course_title,
    v.guest_lecture_type_label,
    v.event_date,
    v.status,
    er.form_data,
    er.submitted_by,
    er.created_at,
    er.updated_at
  FROM v_my_event_requests v
  JOIN event_requests er ON er.request_id = v.request_id
  ORDER BY er.updated_at DESC, v.request_id DESC
`;

const findAll = async () => {
  const { rows } = await query(LIST_SQL);
  return rows.map(mapRowToDashboard);
};

const findById = async (id) => {
  const { rows } = await query(
    `${LIST_SQL.replace("ORDER BY er.updated_at DESC, v.request_id DESC", "")}
     WHERE v.request_id = $1`,
    [id]
  );
  return rows[0] ? mapRowToDashboard(rows[0]) : null;
};

const upsertExpert = async (client, formData) => {
  const expYears = parseInt(String(formData.experience || "").replace(/\D/g, ""), 10);

  const { rows } = await client.query(
    `INSERT INTO experts (
      expert_name, designation, company_name, address,
      mobile_number, email, whatsapp_number, exp_years
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING expert_id`,
    [
      formData.expertName,
      formData.designation || null,
      formData.company || null,
      formData.address || null,
      formData.mobile || null,
      formData.email || null,
      formData.whatsapp || null,
      Number.isFinite(expYears) ? expYears : null,
    ]
  );

  return rows[0].expert_id;
};

const syncFaculty = async (client, requestId, facultyList = []) => {
  await client.query(
    `DELETE FROM event_request_faculty WHERE request_id = $1`,
    [requestId]
  );

  for (const member of facultyList) {
    const employeeId = (member.employeeId || "").trim();
    const facultyName = (member.name || "").trim();
    if (!employeeId && !facultyName) continue;

    const { rows: facultyRows } = await client.query(
      `INSERT INTO faculty (employee_id, faculty_name)
       VALUES ($1, $2)
       ON CONFLICT (employee_id) DO UPDATE
         SET faculty_name = EXCLUDED.faculty_name
       RETURNING faculty_id`,
      [employeeId || `TEMP-${requestId}-${member.id}`, facultyName || "Faculty"]
    );

    await client.query(
      `INSERT INTO event_request_faculty (request_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (request_id, faculty_id) DO NOTHING`,
      [requestId, facultyRows[0].faculty_id]
    );
  }
};

const syncSchedule = async (client, requestId, formData) => {
  const eventDate = formData.eventDate || null;
  const eventTime = formData.eventTime || null;
  const venue = formData.venue || null;
  const studentStrength = formData.studentStrength
    ? parseInt(String(formData.studentStrength), 10)
    : null;

  if (!eventDate && !eventTime && !venue && !studentStrength) {
    return;
  }

  // Form has a single "Time" field — end_time defaults to start + 2 hours
  // so chk_schedule_times (end_time > start_time on same day) is satisfied.
  await client.query(
    `UPDATE event_external_schedules SET
      start_date = COALESCE($2::date, start_date),
      end_date = COALESCE($2::date, end_date),
      start_time = CASE WHEN $3::time IS NULL THEN start_time ELSE $3::time END,
      end_time = CASE
        WHEN $3::time IS NULL THEN end_time
        WHEN ($3::time + interval '2 hours')::time > $3::time
          THEN ($3::time + interval '2 hours')::time
        ELSE time '23:59:00'
      END,
      venue = COALESCE($4, venue),
      student_strength = COALESCE($5::int, student_strength),
      updated_at = NOW()
    WHERE request_id = $1`,
    [requestId, eventDate, eventTime, venue, studentStrength]
  );
};

const resolveFacultyId = async (client, createdBy) => {
  if (!createdBy) return 1;

  const { rows } = await client.query(
    `SELECT faculty_id FROM users WHERE user_id = $1`,
    [createdBy]
  );

  if (rows[0]?.faculty_id) return rows[0].faculty_id;

  const { rows: facultyRows } = await client.query(
    `SELECT faculty_id FROM faculty ORDER BY faculty_id LIMIT 1`
  );

  return facultyRows[0]?.faculty_id || 1;
};

const buildInsertPayload = (payload) => {
  const formData = payload.formData || {};
  const lectureType =
    LECTURE_UI_TO_DB[formData.lectureType] || "indian_expert";
  const brochure =
    TEMPLATE_UI_TO_DB[formData.template] || "classic_academic";
  const status = STATUS_UI_TO_DB[payload.status] || "pending";

  return {
    lectureType,
    brochure,
    status,
    formData,
    topic: payload.topic || formData.lectureTitle,
    code: payload.code || formData.courseCode,
    course: payload.course || formData.courseTitle,
  };
};

const create = async (payload) => {
  const prepared = buildInsertPayload(payload);

  const requestId = await withTransaction(async (client) => {
    const expertId = await upsertExpert(client, prepared.formData);
    const facultyId = await resolveFacultyId(client, payload.createdBy);

    const submittedAt = prepared.status === "draft" ? null : new Date();

    const { rows } = await client.query(
      `INSERT INTO event_requests (
        guest_lecture_type, lecture_title, course_code, course_title,
        expert_id, brochure_template, submitted_by, status,
        form_data, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::request_status, $9::jsonb, $10)
      RETURNING request_id`,
      [
        prepared.lectureType,
        prepared.topic,
        prepared.code,
        prepared.course,
        expertId,
        prepared.brochure,
        facultyId,
        prepared.status,
        JSON.stringify(prepared.formData),
        submittedAt,
      ]
    );

    const newId = rows[0].request_id;
    await syncFaculty(client, newId, prepared.formData.faculty);
    await syncSchedule(client, newId, prepared.formData);
    return newId;
  });

  return findById(requestId);
};

const update = async (id, payload) => {
  const existing = await findById(id);
  if (!existing) return null;

  const prepared = buildInsertPayload({
    ...payload,
    status: payload.status || existing.status,
  });

  await withTransaction(async (client) => {
    const expertId = await upsertExpert(client, prepared.formData);

    await client.query(
      `UPDATE event_requests SET
        guest_lecture_type = $2,
        lecture_title = $3,
        course_code = $4,
        course_title = $5,
        expert_id = $6,
        brochure_template = $7,
        status = COALESCE($8::request_status, status),
        form_data = $9::jsonb,
        updated_at = NOW()
      WHERE request_id = $1`,
      [
        id,
        prepared.lectureType,
        prepared.topic,
        prepared.code,
        prepared.course,
        expertId,
        prepared.brochure,
        STATUS_UI_TO_DB[prepared.status] || null,
        JSON.stringify(prepared.formData),
      ]
    );

    await syncFaculty(client, id, prepared.formData.faculty);
    await syncSchedule(client, id, prepared.formData);
  });

  return findById(id);
};

const remove = async (id) => {
  const { rowCount } = await query(
    `DELETE FROM event_requests WHERE request_id = $1`,
    [id]
  );
  return rowCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  LECTURE_DB_TO_UI,
  TEMPLATE_DB_TO_UI,
};

