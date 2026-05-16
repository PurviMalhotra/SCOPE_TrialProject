/* ==========================================================================
   Dashboard.jsx — Dashboard Page Component
   ==========================================================================
   
   Props:
   - onNewRequest    (function): Navigate to new request form
   - onViewRequest   (function): View a request (read-only)
   - onEditRequest   (function): Edit a request (editable form)
   - onDeleteRequest (function): Delete a request with confirmation
   
   Styles: src/styles/dashboard.css
   ========================================================================== */

import { useState } from "react";

// --- Component Imports ---
import StatusBadge from "../components/common/StatusBadge";

// --- Context Import ---
import { useEventRequests } from "../context/EventRequestContext";

export default function Dashboard({ onNewRequest, onViewRequest, onEditRequest, onDeleteRequest }) {
  const [search, setSearch] = useState("");

  // Get live requests from context
  const { requests } = useEventRequests();

  // Filter requests based on search query
  const filtered = requests.filter(
    (r) =>
      r.topic.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.course.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      {/* ===== DASHBOARD HEADER ===== */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">My Event Requests</h1>

        <div className="dashboard-controls">
          <span className="request-count">{requests.length} requests</span>

          <div className="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9aa3bc" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button className="btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            View Guidelines
          </button>

          <button className="btn-primary" onClick={onNewRequest}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Event Request
          </button>
        </div>
      </div>

      {/* ===== DATA TABLE ===== */}
      <div className="table-card">
        <div className="table-scroll-wrapper">
          <table>
            <thead>
              <tr>
                <th>Guest Lecture Topic</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Lecture by</th>
                <th>
                  <span className="col-header-sort">
                    Date <span className="sort-arrow">↓</span>
                  </span>
                </th>
                <th>
                  <span className="col-header-sort">
                    Status <span className="sort-arrow">↑</span>
                  </span>
                </th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "40px", color: "#9aa3bc" }}
                  >
                    No events found
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={{ maxWidth: 280 }}>{r.topic}</td>
                    <td className="course-code">{r.code}</td>
                    <td>{r.course}</td>
                    <td>{r.lectureBy}</td>
                    <td style={{ color: "#6b7a99" }}>{r.date}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      <div className="action-btns">
                        {/* View button — read-only mode */}
                        <button
                          className="icon-btn"
                          title="View"
                          onClick={() => onViewRequest(r)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>

                        {/* Edit button — opens editable form (disabled for approved) */}
                        <button
                          className={`icon-btn ${r.status === "Approved" ? "disabled" : ""}`}
                          title="Edit"
                          onClick={() => r.status !== "Approved" && onEditRequest(r)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
