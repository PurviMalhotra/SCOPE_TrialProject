/* ==========================================================================
   Navbar.jsx — Top Navigation Bar Component
   ==========================================================================
   
   Renders the sticky top navigation bar with:
   - Brand logo (VIT circle) and portal title on the left
   - Logout button with icon on the right
   
   Props:
   - onLogout (function): Called when the user clicks the logout button.
   
   TODO [BACKEND]: 
   - Replace the VIT text logo with an actual <img> tag for the real logo.
   - Wire onLogout to your authentication API (e.g., clear tokens, redirect).
   - Add user info display (name, role) if needed after authentication.
   
   Styles: src/styles/navbar.css
   ========================================================================== */

/**
 * Navbar — Top navigation bar component.
 * 
 * @param {Object} props
 * @param {Function} props.onLogout - Handler called when logout button is clicked.
 *                                     TODO [BACKEND]: Connect to auth logout API.
 */
export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      {/* --- Left side: Brand logo and title --- */}
      <div className="navbar-brand">
        {/* Logo circle — TODO [CSS]: Replace with <img src="logo.png" /> for real logo */}
        <div className="navbar-logo"><img src="/logo.png" alt="VIT Logo" /></div>

        {/* Portal title — TODO [CSS]: Update text if portal name changes */}
        <span className="navbar-title">SCOPE Event Management Portal</span>
      </div>

      {/* --- Right side: Logout button --- */}
      {/* TODO [BACKEND]: This should call your auth logout API */}
      <button className="navbar-logout" onClick={onLogout}>
        {/* Logout icon (SVG) */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </nav>
  );
}
