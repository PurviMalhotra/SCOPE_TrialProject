const { query, withTransaction } = require("../../database/db");
const REQUEST_STATUS = require("../constants/statuses");
const LECTURE_TYPE_LABELS = require("../constants/lectureTypes");

const FORM_LECTURE_TYPE_TO_DB = {
  foreign: "foreign_expert",
  indian: "indian_expert",
  alumni: "vit_alumni",
};

const DB_LECTURE_TYPE_TO_LABEL = {
  foreign_expert: "Foreign Expert",
  indian_expert: "Indian Expert",
  vit_alumni: "VIT Alumni",
};

const STATUS_TO_DB = {
  [REQUEST_STATUS.PENDING]: "pending",
  [REQUEST_STATUS.APPROVED]: "approved",
  [REQUEST_STATUS.REJECTED]: "rejected",
  Draft: "draft",
};

const STATUS_FROM_DB = {
  pending: REQUEST_STATUS.PENDING,
  under_review: REQUEST_STATUS.PENDING,
  draft: "Draft",
  approved: REQUEST_STATUS.APPROVED,
  rejected: REQUEST_STATUS.REJECTED,
};

const TEMPLATE_TO_DB = {
  classic: "classic_academic",
  modern: "modern_minimalist",
  elegant: "elegant_formal",
  vibrant: "vibrant_creative",
};

const formatDashboardDate = (value) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const parseSubmittedBy = (createdBy) => {
  if (createdBy == null || createdBy === "seed") return null;
  const parsed = Number.parseInt(String(createdBy), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const mapRowToRecord = (row) => {
  const formData = row.form_data || null;
  const lectureBy =
    DB_LECTURE_TYPE_TO_LABEL[row.guest_lecture_type] ||
    LECTURE_TYPE_LABELS[formData?.lectureType] ||
    "Indian Expert";

  const date =
    row.start_date != null
      ? formatDashboardDate(row.start_date)
      : formData?.eventDate
        ? formatDashboardDate(formData.eventDate)
        : "";

  return {
    id: row.request_id,
    topic: row.lecture_title,
    code: row.course_code,
    course: row.course_title,
    lectureBy,
    date,
    status: STATUS_FROM_DB[row.status] || row.status,
    formData,
    createdBy:
      row.submitted_by != null ? String(row.submitted_by) : row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const BASE_SELECT = `
  SELECT
    er.request_id,
    er.guest_lecture_type,
    er.lecture_title,
    er.course_code,
    er.course_title,
    er.status,
    er.form_data,
    er.submitted_by,
    er.created_at,
    er.updated_at,
    es.start_date,
    es.venue
  FROM event_requests er
  LEFT JOIN event_external_schedules es ON es.request_id = er.request_id
`;

const upsertExpert = async (client, form) => {
  const expYears = form.experience
    ? Number.parseInt(String(form.experience), 10)
  : null;

  const result = await client.query(
    `INSERT INTO experts (
      expert_name, designation, company_name, address,
      mobile_number, email, whatsapp_number, exp_years
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING expert_id`,
    [
      form.expertName,
      form.designation || null,
      form.company || null,
      form.address || null,
      form.mobile || null,
      form.email || null,
      form.whatsapp || null,
      Number.isNaN(expYears) ? null : expYears,
    ]
  );

  return result.rows[0].expert_id;
};

const updateExpert = async (client, expertId, form) => {
  const expYears = form.experience
    ? Number.parseInt(String(form.experience), 10)
    : null;

  await client.query(
    `UPDATE experts SET
      expert_name = $2,
      designation = $3,
      company_name = $4,
      address = $5,
      mobile_number = $6,
      email = $7,
      whatsapp_number = $8,
      exp_years = $9,
      updated_at = NOW()
    WHERE expert_id = $1`,
    [
      expertId,
      form.expertName,
      form.designation || null,
      form.company || null,
      form.address || null,
      form.mobile || null,
      form.email || null,
      form.whatsapp || null,
      Number.isNaN(expYears) ? null : expYears,
    ]
  );
};

const upsertFacultyMember = async (client, member) => {
  const employeeId = String(member.employeeId || "").trim();
  const facultyName = String(member.name || "").trim();

  if (!employeeId || !facultyName) {
    return null;
  }

  const result = await client.query(
    `INSERT INTO faculty (employee_id, faculty_name)
     VALUES ($1, $2)
     ON CONFLICT (employee_id) DO UPDATE
       SET faculty_name = EXCLUDED.faculty_name
     RETURNING faculty_id`,
    [employeeId, facultyName]
  );

  return result.rows[0].faculty_id;
};

const syncFaculty = async (client, requestId, facultyList = []) => {
  await client.query(
    `DELETE FROM event_request_faculty WHERE request_id = $1`,
    [requestId]
  );

  for (const member of facultyList) {
    const facultyId = await upsertFacultyMember(client, member);
    if (!facultyId) continue;

    await client.query(
      `INSERT INTO event_request_faculty (request_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (request_id, faculty_id) DO NOTHING`,
      [requestId, facultyId]
    );
  }
};

const syncSchedule = async (client, requestId, form) => {
  const eventDate = form.eventDate || null;
  const eventTime = form.eventTime || null;
  const venue = form.venue || null;
  const studentStrength = form.studentStrength
    ? Number.parseInt(String(form.studentStrength), 10)
    : null;

  await client.query(
    `UPDATE event_external_schedules SET
      start_date = COALESCE($2::date, start_date),
      end_date = COALESCE($2::date, end_date),
      start_time = COALESCE($3::time, start_time),
      end_time = COALESCE(
        CASE
          WHEN $3::time IS NOT NULL THEN $3::time + INTERVAL '2 hours'
          ELSE NULL
        END,
        end_time
      ),
      venue = COALESCE($4, venue),
      student_strength = COALESCE($5, student_strength),
      updated_at = NOW()
    WHERE request_id = $1`,
    [
      requestId,
      eventDate,
      eventTime,
      venue,
      Number.isNaN(studentStrength) ? null : studentStrength,
    ]
  );
};

const fetchById = async (client, id) => {
  const result = await client.query(
    `${BASE_SELECT} WHERE er.request_id = $1`,
    [id]
  );

  return result.rows[0] ? mapRowToRecord(result.rows[0]) : null;
};

const findAll = async () => {
  const result = await query(
    `${BASE_SELECT} ORDER BY er.request_id DESC`
  );
  return result.rows.map(mapRowToRecord);
};

const findById = async (id) => {
  const result = await query(`${BASE_SELECT} WHERE er.request_id = $1`, [id]);
  return result.rows[0] ? mapRowToRecord(result.rows[0]) : null;
};

const create = async (payload) => {
  const form = payload.formData || {};
  const guestLectureType =
    FORM_LECTURE_TYPE_TO_DB[form.lectureType] || "indian_expert";
  const brochureTemplate = TEMPLATE_TO_DB[form.template] || "classic_academic";
  const dbStatus = STATUS_TO_DB[payload.status] || "pending";
  const submittedBy = parseSubmittedBy(payload.createdBy);
  const submittedAt = ["pending", "under_review"].includes(dbStatus)
    ? new Date()
    : null;

  return withTransaction(async (client) => {
    const expertId = await upsertExpert(client, form);

    const requestResult = await client.query(
      `INSERT INTO event_requests (
        guest_lecture_type, lecture_title, course_code, course_title,
        expert_id, brochure_template, submitted_by, status, form_data, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
      RETURNING request_id, expert_id`,
      [
        guestLectureType,
        payload.topic,
        payload.code,
        payload.course,
        expertId,
        brochureTemplate,
        submittedBy,
        dbStatus,
        JSON.stringify(form),
        submittedAt,
      ]
    );

    const requestId = requestResult.rows[0].request_id;

    await syncFaculty(client, requestId, form.faculty);
    await syncSchedule(client, requestId, form);

    return fetchById(client, requestId);
  });
};

const update = async (id, payload) => {
  if (payload.status && payload.topic == null && payload.formData == null) {
    const dbStatus = STATUS_TO_DB[payload.status] || String(payload.status).toLowerCase();
    const result = await query(
      `UPDATE event_requests
       SET status = $2::request_status, updated_at = NOW()
       WHERE request_id = $1
       RETURNING request_id`,
      [id, dbStatus]
    );

    if (!result.rows[0]) {
      return null;
    }

    return findById(id);
  }

  const existingResult = await query(
    `SELECT request_id, expert_id, submitted_by FROM event_requests WHERE request_id = $1`,
    [id]
  );

  if (!existingResult.rows[0]) {
    return null;
  }

  const existing = existingResult.rows[0];
  const form = payload.formData || {};
  const guestLectureType =
    FORM_LECTURE_TYPE_TO_DB[form.lectureType] || "indian_expert";
  const brochureTemplate = TEMPLATE_TO_DB[form.template] || "classic_academic";
  const dbStatus = STATUS_TO_DB[payload.status] || "pending";
  const submittedBy =
    parseSubmittedBy(payload.createdBy) ?? existing.submitted_by;

  return withTransaction(async (client) => {
    if (existing.expert_id) {
      await updateExpert(client, existing.expert_id, form);
    } else {
      const expertId = await upsertExpert(client, form);
      await client.query(
        `UPDATE event_requests SET expert_id = $2 WHERE request_id = $1`,
        [id, expertId]
      );
    }

    await client.query(
      `UPDATE event_requests SET
        guest_lecture_type = $2,
        lecture_title = $3,
        course_code = $4,
        course_title = $5,
        brochure_template = $6,
        submitted_by = $7,
        status = $8::request_status,
        form_data = $9::jsonb,
        updated_at = NOW()
      WHERE request_id = $1`,
      [
        id,
        guestLectureType,
        payload.topic,
        payload.code,
        payload.course,
        brochureTemplate,
        submittedBy,
        dbStatus,
        JSON.stringify(form),
      ]
    );

    await syncFaculty(client, id, form.faculty);
    await syncSchedule(client, id, form);

    return fetchById(client, id);
  });
};

const remove = async (id) => {
  const result = await query(
    `DELETE FROM event_requests WHERE request_id = $1 RETURNING request_id`,
    [id]
  );
  return result.rowCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
