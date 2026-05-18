/* ==========================================================================
   Toast.jsx — Success Notification Toast Component
   ========================================================================== */

export default function Toast({ visible, message }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: "#16a34a",
        color: "white",
        padding: "14px 24px",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 999,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      ✓ {message}
    </div>
  );
}
