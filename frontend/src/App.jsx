/* ==========================================================================
   App.jsx — Main Application Router
   ==========================================================================
   
   Page Routing:
   - "dashboard" → Dashboard page (list of event requests)
   - "form"      → EventRequestForm in CREATE mode (empty form)
   - "edit"      → EventRequestForm in EDIT mode (pre-filled, editable)
   - "view"      → EventRequestForm in VIEW mode (read-only, pre-filled)
   ========================================================================== */

import { useEffect, useState } from "react";

// --- Component Imports ---
import Navbar from "./components/layout/Navbar";
import SuccessModal from "./components/ui/SuccessModal";

// --- Page Imports ---
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import EventRequestForm from "./components/forms/EventRequestForm";

// --- Context Import ---
import { useEventRequests } from "./context/EventRequestContext";
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  logoutUser,
  storeToken,
} from "./services/authService";

const getInitialAuthToken = () => {
  const params = new URLSearchParams(window.location.search);
  const callbackToken = params.get("token");

  if (!callbackToken) {
    return getStoredToken();
  }

  storeToken(callbackToken);
  params.delete("token");

  const nextSearch = params.toString();
  const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, nextUrl);

  return callbackToken;
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [viewData, setViewData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [authChecking, setAuthChecking] = useState(() => Boolean(getStoredToken()));
  const [authError, setAuthError] = useState("");
  const [token, setToken] = useState(getInitialAuthToken);
  const [user, setUser] = useState(null);

  const { addRequest, updateRequest, deleteRequest } = useEventRequests();

  useEffect(() => {
    if (!token) {
      return;
    }

    let cancelled = false;

    const loadUser = async () => {
      setAuthChecking(true);
      setAuthError("");

      try {
        const currentUser = await getCurrentUser(token);
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (err) {
        clearStoredToken();
        if (!cancelled) {
          setToken(null);
          setUser(null);
          setAuthError(err.message);
        }
      } finally {
        if (!cancelled) {
          setAuthChecking(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

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

  const handleLogout = async () => {
    try {
      await logoutUser(token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      clearStoredToken();
      setToken(null);
      setUser(null);
      setPage("dashboard");
    }
  };

  if (authChecking) {
    return <div className="auth-loading">Checking your session...</div>;
  }

  if (!user) {
    return <Login error={authError} />;
  }

  return (
    <>
      <SuccessModal
        visible={submitted}
        message={toastMessage}
        onClose={handleModalClose}
      />
      <Navbar user={user} onLogout={handleLogout} />

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
