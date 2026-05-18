/* ==========================================================================
   StatusBadge.jsx — Status Pill Badge Component
   ==========================================================================
   
   Renders a small colored pill badge indicating request status.
   
   Props:
   - status (string): One of "Approved", "Pending", "Rejected"
   
   CSS Classes Applied:
   - "Approved" → .status-approved (green)
   - "Pending"  → .status-pending  (yellow/amber)
   - "Rejected" → .status-rejected (red)
   
   TODO [BACKEND]: If you add new statuses (e.g., "Draft", "Under Review"),
   add matching CSS classes in dashboard.css and update the mapping below.
   
   Styles: src/styles/dashboard.css (status badge section)
   ========================================================================== */

/**
 * StatusBadge — Displays a colored pill badge for request status.
 * 
 * @param {Object} props
 * @param {string} props.status - The status text ("Approved" | "Pending" | "Rejected")
 * 
 * TODO [BACKEND]: Add more status mappings here if your API returns
 * additional statuses like "Draft", "Under Review", etc.
 */
export default function StatusBadge({ status }) {
  // Map status text to the corresponding CSS class name
  const statusClassMap = {
    Approved: "status-approved",
    Pending: "status-pending",
    Rejected: "status-rejected",
    // TODO [BACKEND]: Add new statuses here, e.g.:
    // Draft: "status-draft",
    // "Under Review": "status-review",
  };

  // Get the CSS class for the given status, fallback to pending style
  const statusClass = statusClassMap[status] || "status-pending";

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
}
