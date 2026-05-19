#!/usr/bin/env node
/**
 * Verifies PostgreSQL connectivity, schema, and event-request CRUD.
 * Usage: node scripts/verify-db.js
 */
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { query, pool } = require("../database/db");

const sampleForm = {
  lectureType: "indian",
  faculty: [{ id: 1, employeeId: "TEST001", name: "Verify Script" }],
  lectureTitle: "DB Verify Lecture",
  courseCode: "TST101",
  courseTitle: "Verification Course",
  expertName: "Test Expert",
  designation: "Professor",
  company: "VIT",
  address: "Campus",
  mobile: "9999999999",
  email: "verify@test.local",
  whatsapp: "",
  experience: "5",
  template: "classic",
  eventDate: "2026-06-01",
  eventTime: "10:00",
  venue: "Test Hall",
  studentStrength: "50",
  files: { acceptance: null, profile: null, invitation: null },
};

async function checkColumn() {
  const result = await query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'event_requests'
       AND column_name = 'form_data'`
  );

  if (!result.rows.length) {
    throw new Error(
      "Missing column event_requests.form_data — run database/schema/004_add_form_data.sql"
    );
  }
}

async function main() {
  const failures = [];

  try {
    await query("SELECT 1 AS ok");
    console.log("✓ Database connection");
  } catch (err) {
    console.error("✗ Database connection:", err.message);
    console.error(
      "  Fix DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD in backend/.env"
    );
    process.exitCode = 1;
    return;
  }

  try {
    await checkColumn();
    console.log("✓ form_data column exists");
  } catch (err) {
    console.error("✗ Schema:", err.message);
    failures.push("schema");
  }

  if (!failures.includes("schema")) {
    const repo = require("../src/repositories/eventRequestRepository");

    try {
      const created = await repo.create({
        topic: sampleForm.lectureTitle,
        code: sampleForm.courseCode,
        course: sampleForm.courseTitle,
        lectureBy: "Indian Expert",
        date: "Jun 1, 2026",
        status: "Pending",
        formData: sampleForm,
        createdBy: null,
      });

      console.log("✓ CREATE event request (id:", created.id, ")");

      const fetched = await repo.findById(created.id);
      if (!fetched || fetched.topic !== sampleForm.lectureTitle) {
        throw new Error("findById returned unexpected data");
      }
      console.log("✓ READ event request");

      await repo.remove(created.id);
      console.log("✓ DELETE event request (cleanup)");
    } catch (err) {
      console.error("✗ Repository CRUD:", err.message);
      failures.push("crud");
    }
  }

  if (failures.length) {
    process.exitCode = 1;
  } else {
    console.log("\nAll database checks passed.");
  }
}

main()
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
