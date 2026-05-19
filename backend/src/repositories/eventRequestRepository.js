const { query, withTransaction } = require("../../database/db");

const lectureTypeToDb = {
  foreign: "foreign_expert",
  indian: "indian_expert",
  alumni: "vit_alumni",
};

const lectureTypeFromDb = {
  foreign_expert: "foreign",
  indian_expert: "indian",
  vit_alumni: "alumni",
};

const lectureLabelFromDb = {
  foreign_expert: "Foreign Expert",
  indian_expert: "Indian Expert",
  vit_alumni: "VIT Alumni",
};

const templateToDb = {
  classic: "classic_academic",
  modern: "modern_minimalist",
  elegant: "elegant_formal",
  vibrant: "vibrant_creative",
};

const templateFromDb = {
  classic_academic: "classic",
  modern_minimalist: "modern",
  elegant_formal: "elegant",
  vibrant_creative: "vibrant",
};

const statusToDb = {
  Draft: "draft",
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
};

const statusFromDb = {
  draft: "Draft",
  pending: "Pending",
  under_review: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const attachmentTypeToDb = {
  acceptance: "acceptance_mail",
  profile: "expert_profile",
  invitation: "guest_invitation",
};

const attachmentTypeFromDb = {
  acceptance_mail: "acceptance",
  expert_profile: "profile",
  guest_invitation: "invitation",
};

const parseInteger = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
};

const addOneHour = (time) => {
  if (!time) return null;
  const [hours, minutes] = String(time).split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date(Date.UTC(2000, 0, 1, hours, minutes));
  date.setUTCHours(date.getUTCHours() + 1);
  return date.toISOString().slice(11, 16);
};

const toIsoDate = (value) => {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const formatDashboardDate = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const fileMetadata = (file) => {
  if (!file) return null;
  if (typeof file === "string") {
    return { fileName: file, filePath: file, size: null };
  }

  return {
    fileName: file.originalName || file.fileName || file.name || "upload",
    filePath: file.objectKey || file.url || file.fileName || file.name || "upload",
    size: file.size || null,
  };
};

const upsertExpert = async (client, formData) => {
  const result = await client.query(
    `INSERT INTO experts (
      expert_name, designation, company_name, address,
      mobile_number, email, whatsapp_number, exp_years
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING expert_id`,
    [
      formData.expertName,
      formData.designation || null,
      formData.company || null,
      formData.address || null,
      formData.mobile || null,
      formData.email || null,
      formData.whatsapp || null,
      parseInteger(formData.experience),
    ]
  );

  return result.rows[0].expert_id;
};

const upsertFaculty = async (client, faculty, index) => {
  const employeeId = faculty.employeeId || `TEMP-${Date.now()}-${index}`;
  const name = faculty.name || employeeId;

  const result = await client.query(
    `INSERT INTO faculty (employee_id, faculty_name)
     VALUES ($1, $2)
     ON CONFLICT (employee_id)
     DO UPDATE SET faculty_name = EXCLUDED.faculty_name
     RETURNING faculty_id`,
    [employeeId, name]
  );

  return result.rows[0].faculty_id;
};

const replaceFacultyLinks = async (client, requestId, facultyList = []) => {
  await client.query("DELETE FROM event_request_faculty WHERE request_id = $1", [
    requestId,
  ]);

  const facultyIds = [];
  for (let index = 0; index < facultyList.length; index += 1) {
    const facultyId = await upsertFaculty(client, facultyList[index], index);
    facultyIds.push(facultyId);
    await client.query(
      `INSERT INTO event_request_faculty (request_id, faculty_id)
       VALUES ($1, $2)
       ON CONFLICT (request_id, faculty_id) DO NOTHING`,
      [requestId, facultyId]
    );
  }

  return facultyIds;
};

const replaceAttachments = async (client, requestId, files = {}) => {
  await client.query("DELETE FROM event_attachments WHERE request_id = $1", [
    requestId,
  ]);

  for (const [key, file] of Object.entries(files || {})) {
    const attachmentType = attachmentTypeToDb[key];
    const metadata = fileMetadata(file);
    if (!attachmentType || !metadata) continue;

    await client.query(
      `INSERT INTO event_attachments (
        request_id, attachment_type, file_name, file_path, file_size_bytes
      )
      VALUES ($1, $2, $3, $4, $5)`,
      [
        requestId,
        attachmentType,
        metadata.fileName,
        metadata.filePath,
        metadata.size,
      ]
    );
  }
};

const upsertSchedule = async (client, requestId, formData) => {
  const eventDate = formData.eventDate || null;
  const eventTime = formData.eventTime || null;

  await client.query(
    `INSERT INTO event_external_schedules (
      request_id, start_date, end_date, start_time, end_time, venue, student_strength
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (request_id)
    DO UPDATE SET
      start_date = EXCLUDED.start_date,
      end_date = EXCLUDED.end_date,
      start_time = EXCLUDED.start_time,
      end_time = EXCLUDED.end_time,
      venue = EXCLUDED.venue,
      student_strength = EXCLUDED.student_strength`,
    [
      requestId,
      eventDate,
      eventDate,
      eventTime,
      addOneHour(eventTime),
      formData.venue || null,
      parseInteger(formData.studentStrength),
    ]
  );
};

const fetchRows = async (executor, id = null) => {
  const params = id ? [id] : [];
  const filter = id ? "WHERE er.request_id = $1" : "";

  const result = await executor.query(
    `SELECT
      er.request_id,
      er.guest_lecture_type,
      er.lecture_title,
      er.course_code,
      er.course_title,
      er.brochure_template,
      er.submitted_by,
      er.status,
      er.created_at,
      er.updated_at,
      e.expert_name,
      e.designation,
      e.company_name,
      e.address,
      e.mobile_number,
      e.email AS expert_email,
      e.whatsapp_number,
      e.exp_years,
      es.start_date,
      es.start_time,
      es.venue,
      es.student_strength
    FROM event_requests er
    LEFT JOIN experts e ON e.expert_id = er.expert_id
    LEFT JOIN event_external_schedules es ON es.request_id = er.request_id
    ${filter}
    ORDER BY er.created_at DESC, er.request_id DESC`,
    params
  );

  return result.rows;
};

const hydrate = async (executor, row) => {
  const [facultyResult, attachmentsResult] = await Promise.all([
    executor.query(
      `SELECT f.employee_id, f.faculty_name
       FROM event_request_faculty erf
       JOIN faculty f ON f.faculty_id = erf.faculty_id
       WHERE erf.request_id = $1
       ORDER BY erf.event_request_faculty_id`,
      [row.request_id]
    ),
    executor.query(
      `SELECT attachment_type, file_name
       FROM event_attachments
       WHERE request_id = $1`,
      [row.request_id]
    ),
  ]);

  const files = { acceptance: null, profile: null, invitation: null };
  for (const attachment of attachmentsResult.rows) {
    const key = attachmentTypeFromDb[attachment.attachment_type];
    if (key) files[key] = attachment.file_name;
  }

  const formData = {
    lectureType: lectureTypeFromDb[row.guest_lecture_type] || "indian",
    faculty: facultyResult.rows.map((faculty, index) => ({
      id: index + 1,
      employeeId: faculty.employee_id,
      name: faculty.faculty_name,
    })),
    lectureTitle: row.lecture_title,
    courseCode: row.course_code,
    courseTitle: row.course_title,
    expertName: row.expert_name || "",
    designation: row.designation || "",
    company: row.company_name || "",
    address: row.address || "",
    mobile: row.mobile_number || "",
    email: row.expert_email || "",
    whatsapp: row.whatsapp_number || "",
    experience:
      row.exp_years === null || row.exp_years === undefined
        ? ""
        : String(row.exp_years),
    template: templateFromDb[row.brochure_template] || "classic",
    eventDate: toIsoDate(row.start_date),
    eventTime: row.start_time ? String(row.start_time).slice(0, 5) : "",
    venue: row.venue || "",
    studentStrength:
      row.student_strength === null || row.student_strength === undefined
        ? ""
        : String(row.student_strength),
    files,
  };

  return {
    id: row.request_id,
    topic: row.lecture_title,
    code: row.course_code,
    course: row.course_title,
    lectureBy: lectureLabelFromDb[row.guest_lecture_type] || "Indian Expert",
    date: formatDashboardDate(row.start_date || row.created_at),
    status: statusFromDb[row.status] || "Pending",
    formData,
    createdBy: row.submitted_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const findAll = async () => {
  const executor = { query };
  const rows = await fetchRows(executor);
  return Promise.all(rows.map((row) => hydrate(executor, row)));
};

const findById = async (id) => {
  const executor = { query };
  const rows = await fetchRows(executor, id);
  if (!rows.length) return null;
  return hydrate(executor, rows[0]);
};

const create = async (payload) => {
  return withTransaction(async (client) => {
    const formData = payload.formData || {};
    const expertId = await upsertExpert(client, formData);
    const facultyIds = [];

    for (let index = 0; index < (formData.faculty || []).length; index += 1) {
      facultyIds.push(await upsertFaculty(client, formData.faculty[index], index));
    }

    const result = await client.query(
      `INSERT INTO event_requests (
        guest_lecture_type, lecture_title, course_code, course_title,
        expert_id, brochure_template, submitted_by, status, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING request_id`,
      [
        lectureTypeToDb[formData.lectureType] || "indian_expert",
        formData.lectureTitle,
        formData.courseCode,
        formData.courseTitle,
        expertId,
        templateToDb[formData.template] || "classic_academic",
        facultyIds[0] || null,
        statusToDb[payload.status] || "pending",
      ]
    );

    const requestId = result.rows[0].request_id;

    for (const facultyId of facultyIds) {
      await client.query(
        `INSERT INTO event_request_faculty (request_id, faculty_id)
         VALUES ($1, $2)
         ON CONFLICT (request_id, faculty_id) DO NOTHING`,
        [requestId, facultyId]
      );
    }

    await upsertSchedule(client, requestId, formData);
    await replaceAttachments(client, requestId, formData.files);

    const rows = await fetchRows(client, requestId);
    return hydrate(client, rows[0]);
  });
};

const update = async (id, payload) => {
  return withTransaction(async (client) => {
    const existingRows = await fetchRows(client, id);
    if (!existingRows.length) return null;

    if (payload.formData) {
      const formData = payload.formData;
      const expertId = await upsertExpert(client, formData);
      const facultyIds = await replaceFacultyLinks(
        client,
        id,
        formData.faculty || []
      );

      await client.query(
        `UPDATE event_requests SET
          guest_lecture_type = $1,
          lecture_title = $2,
          course_code = $3,
          course_title = $4,
          expert_id = $5,
          brochure_template = $6,
          submitted_by = $7,
          status = COALESCE($8, status)
        WHERE request_id = $9`,
        [
          lectureTypeToDb[formData.lectureType] || "indian_expert",
          formData.lectureTitle,
          formData.courseCode,
          formData.courseTitle,
          expertId,
          templateToDb[formData.template] || "classic_academic",
          facultyIds[0] || null,
          payload.status ? statusToDb[payload.status] : null,
          id,
        ]
      );

      await upsertSchedule(client, id, formData);
      await replaceAttachments(client, id, formData.files);
    } else if (payload.status) {
      await client.query(
        `UPDATE event_requests SET
          status = $1::request_status,
          reviewed_at = CASE
            WHEN $1::request_status IN ('approved', 'rejected') THEN NOW()
            ELSE reviewed_at
          END
        WHERE request_id = $2`,
        [statusToDb[payload.status] || "pending", id]
      );
    }

    const rows = await fetchRows(client, id);
    return hydrate(client, rows[0]);
  });
};

const remove = async (id) => {
  const result = await query("DELETE FROM event_requests WHERE request_id = $1", [
    id,
  ]);
  return result.rowCount > 0;
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
