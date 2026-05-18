/* ==========================================================================
   App.jsx — Main Application Router
   ==========================================================================
   
   Page Routing:
   - "dashboard" → Dashboard page (list of event requests)
   - "form"      → EventRequestForm in CREATE mode (empty form)
   - "edit"      → EventRequestForm in EDIT mode (pre-filled, editable)
   - "view"      → EventRequestForm in VIEW mode (read-only, pre-filled)
   ========================================================================== */

import { useState } from "react";

// --- Component Imports ---
import Navbar from "./components/layout/Navbar";
import SuccessModal from "./components/ui/SuccessModal";

// --- Page Imports ---
import Dashboard from "./pages/Dashboard";
import EventRequestForm from "./components/forms/EventRequestForm";

// --- Context Import ---
import { useEventRequests } from "./context/EventRequestContext";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [viewData, setViewData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { addRequest, updateRequest, deleteRequest } = useEventRequests();

  const handleNewRequest = () => {
    setViewData(null);
    setEditId(null);
    setPage("form");
  };

  /**
   * View a request in read-only mode.
   */
  const handleViewRequest = (r) => {
    const lectureType =
      r.lectureBy === "Foreign Expert"
        ? "foreign"
        : r.lectureBy === "Indian Expert"
          ? "indian"
          : "alumni";

    // If we have stored formData from a previous submission, use it
    if (r.formData) {
      setViewData(r.formData);
    } else {
      // Fallback for mock data rows that don't have formData
      setViewData({
        lectureType,
        faculty: [{ id: 1, employeeId: "EMP001", name: "Dr. Sample Faculty" }],
        lectureTitle: r.topic,
        courseCode: r.code,
        courseTitle: r.course,
        expertName: "Dr. Jane Doe",
        designation: "Senior Researcher",
        company: "MIT",
        address: "77 Massachusetts Ave, Cambridge, MA 02139, USA",
        mobile: "+1 617 253 0000",
        email: "jane.doe@mit.edu",
        whatsapp: "",
        experience: "12 years",
        template: "classic",
        eventDate: "",
        eventTime: "",
        venue: "",
        studentStrength: "",
        files: {
          acceptance: "acceptance.pdf",
          profile: null,
          invitation: "invite.pdf",
        },
      });
    }
    setPage("view");
  };

  /**
   * Edit a request — opens form in editable mode with pre-filled data.
   */
  const handleEditRequest = (r) => {
    const lectureType =
      r.lectureBy === "Foreign Expert"
        ? "foreign"
        : r.lectureBy === "Indian Expert"
          ? "indian"
          : "alumni";

    if (r.formData) {
      setViewData(r.formData);
    } else {
      setViewData({
        lectureType,
        faculty: [{ id: 1, employeeId: "EMP001", name: "Dr. Sample Faculty" }],
        lectureTitle: r.topic,
        courseCode: r.code,
        courseTitle: r.course,
        expertName: "",
        designation: "",
        company: "",
        address: "",
        mobile: "",
        email: "",
        whatsapp: "",
        experience: "",
        template: "",
        eventDate: "",
        eventTime: "",
        venue: "",
        studentStrength: "",
        files: { acceptance: null, profile: null, invitation: null },
      });
    }
    setEditId(r.id);
    setPage("edit");
  };

  /**
   * Delete a request with confirmation.
   */
  const handleDeleteRequest = (r) => {
    if (window.confirm(`Delete "${r.topic}"? This cannot be undone.`)) {
      deleteRequest(r.id);
      setToastMessage("Your request has been deleted successfully.");
      setSubmitted(true);
    }
  };

  /**
   * Handle new form submission.
   */
  const handleSubmit = (formData) => {
    addRequest(formData);
    setToastMessage("Your request has been submitted successfully.");
    setSubmitted(true);
  };

  /**
   * Handle edit form submission — updates existing request.
   */
  const handleEditSubmit = (formData) => {
    updateRequest(editId, formData);
    setToastMessage("Your request has been updated successfully.");
    setSubmitted(true);
  };

  const handleModalClose = () => {
    setSubmitted(false);
    if (page === "form" || page === "edit") {
      setPage("dashboard");
    }
    setEditId(null);
  };

  return (
    <>
      <SuccessModal
        visible={submitted}
        message={toastMessage}
        onClose={handleModalClose}
      />
      <Navbar onLogout={() => setPage("dashboard")} />

      {page === "dashboard" && (
        <Dashboard
          onNewRequest={handleNewRequest}
          onViewRequest={handleViewRequest}
          onEditRequest={handleEditRequest}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      {page === "form" && (
        <EventRequestForm
          onBack={() => setPage("dashboard")}
          onSubmit={handleSubmit}
          initialData={null}
          mode="create"
        />
      )}

      {page === "edit" && (
        <EventRequestForm
          onBack={() => setPage("dashboard")}
          onSubmit={handleEditSubmit}
          onDelete={() => handleDeleteRequest({ id: editId, topic: viewData?.lectureTitle })}
          initialData={viewData}
          mode="edit"
        />
      )}

      {page === "view" && (
        <EventRequestForm
          onBack={() => setPage("dashboard")}
          onSubmit={() => {}}
          initialData={viewData}
          mode="view"
        />
      )}
    </>
  );
}
