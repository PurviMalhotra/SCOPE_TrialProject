/* ==========================================================================
   constants/index.js — Mock Data, Default Values, and Configuration
   ==========================================================================
   
   This file contains all static data used across the app:
   1. INITIAL_REQUESTS — Mock event request data for the dashboard table
   2. EMPTY_FORM       — Default empty form state for new event requests
   3. TEMPLATES        — Brochure template options shown in the form
   4. LECTURE_TYPES     — Radio button options for guest lecture type
   5. ENCLOSURE_DOCS   — Document checklist items for file uploads
   
   TODO [BACKEND]: Replace INITIAL_REQUESTS with data fetched from your API.
   The other constants (TEMPLATES, LECTURE_TYPES, ENCLOSURE_DOCS) can remain
   as frontend config, or be fetched from a config API if they change often.
   ========================================================================== */

// ---------------------------------------------------------------------------
// 1. INITIAL_REQUESTS — Mock Data for Dashboard Table
// ---------------------------------------------------------------------------
// TODO [BACKEND]: Replace this with an API call in Dashboard.jsx.
// Expected API response shape: Array of objects matching this structure.
// Fields:
//   id         — Unique identifier (from database)
//   topic      — Guest lecture topic/title
//   code       — Course code (e.g., "CS501")
//   course     — Full course name
//   lectureBy  — Type of lecturer ("Foreign Expert" | "Indian Expert" | "VIT Alumni")
//   date       — Event date (formatted string)
//   status     — Request status ("Approved" | "Pending" | "Rejected")
export const INITIAL_REQUESTS = [
  {
    id: 1,
    topic: "Quantum Algorithms and Their Applications",
    code: "PH402",
    course: "Quantum Computing",
    lectureBy: "Foreign Expert",
    date: "Apr 22, 2026",
    status: "Pending",
  },
  {
    id: 2,
    topic: "Building Scalable Startups in the Tech Industry",
    code: "MBA301",
    course: "Entrepreneurship and Startups",
    lectureBy: "VIT Alumni",
    date: "Apr 30, 2026",
    status: "Pending",
  },
  {
    id: 3,
    topic: "International Trade Policies and Market Dynamics",
    code: "EC205",
    course: "Global Economic Trends",
    lectureBy: "Foreign Expert",
    date: "Mar 18, 2026",
    status: "Rejected",
  },
  {
    id: 4,
    topic: "Deep Learning and Neural Network Architectures",
    code: "CS501",
    course: "Advanced Machine Learning",
    lectureBy: "Indian Expert",
    date: "May 15, 2026",
    status: "Approved",
  },
  {
    id: 5,
    topic: "CRISPR Technology and Gene Editing",
    code: "BT403",
    course: "Innovations in Biotechnology",
    lectureBy: "Indian Expert",
    date: "Jun 10, 2026",
    status: "Approved",
  },
  {
    id: 6,
    topic: "Navigating Software Engineering Careers",
    code: "CS201",
    course: "Career Pathways in Technology",
    lectureBy: "VIT Alumni",
    date: "Apr 25, 2026",
    status: "Approved",
  },
];

// ---------------------------------------------------------------------------
// 2. EMPTY_FORM — Default State for New Event Request Form
// ---------------------------------------------------------------------------
// TODO [BACKEND]: When submitting, send this object shape to your API.
// The "files" field should contain actual File objects (not just filenames)
// when integrating with a file upload endpoint.
export const EMPTY_FORM = {
  lectureType: "foreign",                                // "foreign" | "indian" | "alumni"
  faculty: [{ id: 1, employeeId: "", name: "" }],        // Array of faculty members
  lectureTitle: "",                                       // Title of the guest lecture
  courseCode: "",                                         // Course code (e.g., "CS501")
  courseTitle: "",                                        // Full course name
  expertName: "",                                         // Expert's full name
  designation: "",                                        // Expert's job title
  company: "",                                            // Expert's company/institution
  address: "",                                            // Expert's address
  mobile: "",                                             // Expert's phone number
  email: "",                                              // Expert's email
  whatsapp: "",                                           // Expert's WhatsApp (optional)
  experience: "",                                         // Years of experience
  template: "",                                           // Selected brochure template ID
  eventDate: "",                                          // Event date (YYYY-MM-DD)
  eventTime: "",                                          // Event time (HH:MM)
  venue: "",                                              // Event venue/location
  studentStrength: "",                                    // Expected number of students
  files: { acceptance: null, profile: null, invitation: null }, // Uploaded file references
};

// ---------------------------------------------------------------------------
// 3. TEMPLATES — Brochure Template Options
// ---------------------------------------------------------------------------
// TODO [BACKEND]: These could come from a config API if templates change often.
// Each template has:
//   id   — Unique identifier sent in form submission
//   name — Display name shown in the UI
//   icon — Emoji icon (could be replaced with image URLs)
export const TEMPLATES = [
  { id: "classic", name: "Classic Academic", icon: "📋" },
  { id: "modern", name: "Modern Minimalist", icon: "📄" },
  { id: "elegant", name: "Elegant Formal", icon: "📜" },
  { id: "vibrant", name: "Vibrant Creative", icon: "🎨" },
];

// ---------------------------------------------------------------------------
// 4. LECTURE_TYPES — Radio Button Options for Lecture Type
// ---------------------------------------------------------------------------
// TODO [BACKEND]: The selected type's `id` is sent as `lectureType` in the form.
export const LECTURE_TYPES = [
  { id: "foreign", label: "Foreign Expert" },
  { id: "indian", label: "Indian Expert" },
  { id: "alumni", label: "VIT Alumni" },
];

// ---------------------------------------------------------------------------
// 5. ENCLOSURE_DOCS — Document Checklist for File Uploads
// ---------------------------------------------------------------------------
// TODO [BACKEND]: Each document's file should be uploaded to your file storage.
// The `key` is used as the field name in the files object.
export const ENCLOSURE_DOCS = [
  { key: "acceptance", label: "Acceptance Mail from Expert" },
  { key: "profile", label: "Expert's Profile" },
  { key: "invitation", label: "Guest Invitation" },
];

// ---------------------------------------------------------------------------
// 6. LECTURE_TYPE_MAP — Maps form lectureType ID to display label
// ---------------------------------------------------------------------------
// Used when converting form data to dashboard table row format.
export const LECTURE_TYPE_MAP = {
  foreign: "Foreign Expert",
  indian: "Indian Expert",
  alumni: "VIT Alumni",
};
