/* ==========================================================================
   EventRequestForm.jsx — Event Request Form Page Component
   ==========================================================================
   
   Renders a multi-section form for creating or viewing an event request.
   
   Three modes:
   - CREATE mode (mode = "create"): All fields editable, shows submit button
   - EDIT mode   (mode = "edit"): Pre-filled and editable, shows update button
   - VIEW mode   (mode = "view"): All fields read-only, shows back button
   
   Form Sections:
   1. Guest Lecture Type (radio buttons)
   2. Faculty Information (dynamic table with add/remove)
   3. Lecture Details (title, course code, course title)
   4. Expert Details (name, designation, company, contact)
   5. Brochure Template (selectable template cards)
   6. Enclosure Documents (file upload checklist)
   
   Props:
   - onBack      (function): Called to navigate back to dashboard
   - onSubmit    (function): Called with form data object on submit
   - initialData (object|null): Pre-filled data for view mode, null for create mode
   
   Styles: src/styles/form.css
   ========================================================================== */

import { useState } from "react";
import { parseResume } from "../../services/resumeService";

// --- Data Imports (updated path) ---
import {
  EMPTY_FORM,
  TEMPLATES,
  LECTURE_TYPES,
  ENCLOSURE_DOCS,
} from "../../constants";

export default function EventRequestForm({
  onBack,
  onSubmit,
  onDelete,
  initialData,
  mode = "create",
}) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);
  const [resumeFileName, setResumeFileName] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [nextFacId, setNextFacId] = useState(2);
  const isReadOnly = mode === "view";

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addFaculty = () => {
    setForm((f) => ({
      ...f,
      faculty: [...f.faculty, { id: nextFacId, employeeId: "", name: "" }],
    }));
    setNextFacId((n) => n + 1);
  };

  const removeFaculty = (id) => {
    if (form.faculty.length === 1) return;
    setForm((f) => ({
      ...f,
      faculty: f.faculty.filter((fac) => fac.id !== id),
    }));
  };

  const updateFaculty = (id, field, value) => {
    setForm((f) => ({
      ...f,
      faculty: f.faculty.map((fac) =>
        fac.id === id ? { ...fac, [field]: value } : fac,
      ),
    }));
  };

  const setFile = (key, filename) => {
    setForm((f) => ({ ...f, files: { ...f.files, [key]: filename } }));
  };

  const handleSubmit = () => {
    if (
      !form.lectureTitle ||
      !form.courseCode ||
      !form.courseTitle ||
      !form.expertName
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    onSubmit(form);
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    setResumeFileName(file.name);

    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setIsParsingResume(true);

      const res = await parseResume(file);
      const data = res.data;

      setForm((prev) => ({
        ...prev,
        expertName: data.name || prev.expertName,
        designation: data.designation || prev.designation,
        company: data.companyName || prev.company,
        address: data.address || prev.address,
        mobile: data.mobileNumber || prev.mobile,
        email: data.officialEmail || prev.email,
        whatsapp: data.whatsappNumber || prev.whatsapp,
        experience: data.yearsOfExperience || prev.experience,
      }));

      console.log(form);
      setIsParsingResume(false);
    } catch (err) {
      console.error(err);
      alert("Failed to process resume.");
      setIsParsingResume(false);
    }
  };

  return (
    <div className="page">
      {/* ===== FORM PAGE HEADER ===== */}
      <div className="form-page-header">
        <button className="back-btn" onClick={onBack}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>
            {mode === "view"
              ? "View Event Request"
              : mode === "edit"
                ? "Edit Event Request"
                : "Event request"}
          </span>
        </button>
        <button className="btn-outline">
          View Guidelines
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* ===== FORM SECTIONS CONTAINER ===== */}
      <div className="form-sections">
        {/* SECTION 1: GUEST LECTURE TYPE */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">Guest Lecture Type</div>
              <div className="form-card-sub">
                Select the type of guest lecturer
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 8, fontSize: 13, color: "#1a2540" }}>
            Is the guest lecture is <span className="required">*</span>
          </div>

          <div className="radio-group">
            {LECTURE_TYPES.map((t) => (
              <label
                key={t.id}
                className={`radio-option ${form.lectureType === t.id ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  style={{ display: "none" }}
                  checked={form.lectureType === t.id}
                  onChange={() => !isReadOnly && update("lectureType", t.id)}
                />
                <div className="radio-circle">
                  <div className="radio-dot" />
                </div>
                {t.label}
              </label>
            ))}
          </div>
        </div>

        {/* SECTION 2: FACULTY INFORMATION */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">Faculty Information</div>
              <div className="form-card-sub">
                Add faculty members submitting this request
              </div>
            </div>
          </div>

          <div className="faculty-table-wrapper">
            <table className="faculty-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Sl.No.</th>
                  <th>Employee ID</th>
                  <th>Name of the Faculty</th>
                  <th style={{ width: 120 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {form.faculty.map((fac, idx) => (
                  <tr key={fac.id}>
                    <td style={{ color: "#6b7a99", fontSize: 14 }}>
                      {idx + 1}.
                    </td>
                    <td style={{ paddingRight: 12 }}>
                      <input
                        className="faculty-input"
                        placeholder="Select ID"
                        value={fac.employeeId}
                        readOnly={isReadOnly}
                        onChange={(e) =>
                          updateFaculty(fac.id, "employeeId", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ paddingRight: 12 }}>
                      <input
                        className="faculty-input"
                        placeholder="Select Faculty"
                        value={fac.name}
                        readOnly={isReadOnly}
                        onChange={(e) =>
                          updateFaculty(fac.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      {idx === form.faculty.length - 1 && !isReadOnly ? (
                        <button className="btn-add" onClick={addFaculty}>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add
                        </button>
                      ) : !isReadOnly && form.faculty.length > 1 ? (
                        <button
                          className="btn-remove"
                          onClick={() => removeFaculty(fac.id)}
                        >
                          Remove
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: LECTURE DETAILS */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">
                8th Module Guest Lecture Details
              </div>
              <div className="form-card-sub">
                Provide the basic details about the guest lecture
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ gap: 18 }}>
            <div className="form-group">
              <label className="form-label">
                Title of the Guest Lecture <span className="required">*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g., Advanced Machine Learning Techniques"
                value={form.lectureTitle}
                readOnly={isReadOnly}
                onChange={(e) => update("lectureTitle", e.target.value)}
              />
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Course Code <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., CS501"
                  value={form.courseCode}
                  readOnly={isReadOnly}
                  onChange={(e) => update("courseCode", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Course Title <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., Introduction to Artificial Intelligence"
                  value={form.courseTitle}
                  readOnly={isReadOnly}
                  onChange={(e) => update("courseTitle", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: EXPERT DETAILS */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">Expert Details</div>
              <div className="form-card-sub">
                Information about the guest lecturer/expert
              </div>
            </div>
          </div>
          <label
            className="btn-outline"
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {isParsingResume
              ? "Parsing Resume..."
              : resumeFileName || "Autofill with Resume"}{" "}
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: "none" }}
              onChange={handleResumeUpload}
            />
          </label>
          <br />

          <div className="form-grid" style={{ gap: 18 }}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Expert's Name <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., Dr. John Smith"
                  value={form.expertName}
                  readOnly={isReadOnly}
                  onChange={(e) => update("expertName", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Expert's Designation <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., Senior Data Scientist"
                  value={form.designation}
                  readOnly={isReadOnly}
                  onChange={(e) => update("designation", e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Expert's Company Name <span className="required">*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g., Google Inc."
                value={form.company}
                readOnly={isReadOnly}
                onChange={(e) => update("company", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Expert's Address <span className="required">*</span>
              </label>
              <textarea
                className="form-input textarea"
                placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA"
                value={form.address}
                readOnly={isReadOnly}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Mobile Number <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., +1 234 567 8900"
                  value={form.mobile}
                  readOnly={isReadOnly}
                  onChange={(e) => update("mobile", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Official Email <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., john.smith@company.com"
                  type="email"
                  value={form.email}
                  readOnly={isReadOnly}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">WhatsApp Number</label>
                <input
                  className="form-input"
                  placeholder="e.g., +1 234 567 8900"
                  value={form.whatsapp}
                  readOnly={isReadOnly}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Expert's Years of Experience{" "}
                  <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., 15 years"
                  value={form.experience}
                  readOnly={isReadOnly}
                  onChange={(e) => update("experience", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: EVENT SCHEDULE & VENUE */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">Event Schedule & Venue</div>
              <div className="form-card-sub">
                Specify when and where the lecture will take place
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ gap: 18 }}>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Date <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="date"
                  value={form.eventDate}
                  readOnly={isReadOnly}
                  onChange={(e) => update("eventDate", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Time <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  type="time"
                  value={form.eventTime}
                  readOnly={isReadOnly}
                  onChange={(e) => update("eventTime", e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Venue <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., Main Auditorium, Building A, 3rd Floor"
                  value={form.venue}
                  readOnly={isReadOnly}
                  onChange={(e) => update("venue", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Student Strength <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., 120"
                  type="number"
                  value={form.studentStrength}
                  readOnly={isReadOnly}
                  onChange={(e) => update("studentStrength", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: BROCHURE TEMPLATE */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">Brochure Template</div>
              <div className="form-card-sub">
                Choose a template for your event brochure
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14, fontSize: 13, color: "#1a2540" }}>
            Select Template <span className="required">*</span>
          </div>

          <div className="template-grid">
            {TEMPLATES.map((t) => (
              <div
                key={t.id}
                className={`template-card ${form.template === t.id ? "selected" : ""}`}
                onClick={() => !isReadOnly && update("template", t.id)}
              >
                <div className="template-icon">{t.icon}</div>
                <div className="template-name">{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: ENCLOSURE DOCUMENTS */}
        <div className="form-card">
          <div className="form-card-header">
            <div className="form-card-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <div className="form-card-title">
                Enclosure Details (Check List)
              </div>
              <div className="form-card-sub">
                Select the documents to include with the request
              </div>
            </div>
          </div>

          <table className="enclosure-table">
            <thead>
              <tr>
                <th>Document</th>
                <th style={{ textAlign: "right" }}>Upload File</th>
              </tr>
            </thead>
            <tbody>
              {ENCLOSURE_DOCS.map((doc) => (
                <tr key={doc.key}>
                  <td>{doc.label}</td>
                  <td style={{ textAlign: "right" }}>
                    {isReadOnly ? (
                      <span
                        style={{
                          fontSize: 13,
                          color: form.files[doc.key] ? "#16a34a" : "#9aa3bc",
                        }}
                      >
                        {form.files[doc.key] || "Not uploaded"}
                      </span>
                    ) : (
                      <label
                        className={`file-upload-btn ${form.files[doc.key] ? "uploaded" : ""}`}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        {form.files[doc.key]
                          ? form.files[doc.key]
                          : "Choose File"}
                        <input
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) =>
                            e.target.files[0] &&
                            setFile(doc.key, e.target.files[0].name)
                          }
                        />
                      </label>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== FORM FOOTER ===== */}
        {mode === "create" && (
          <div className="form-footer">
            <button className="btn-cancel" onClick={onBack}>
              Cancel
            </button>
            <button className="btn-submit" onClick={handleSubmit}>
              Submit Request
            </button>
          </div>
        )}

        {mode === "edit" && (
          <div
            className="form-footer"
            style={{ justifyContent: "space-between" }}
          >
            <button
              className="btn-remove"
              onClick={(e) => {
                e.preventDefault();
                if (onDelete) onDelete();
              }}
              style={{
                padding: "10px 24px",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              Delete Request
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn-cancel" onClick={onBack}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmit}>
                Update Request
              </button>
            </div>
          </div>
        )}

        {mode === "view" && (
          <div className="form-footer">
            <button className="btn-cancel" onClick={onBack}>
              ← Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
