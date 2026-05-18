import React from "react";

export default function SuccessModal({ visible, message, onClose }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "40px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          maxWidth: "420px",
          width: "90%",
          textAlign: "center",
          fontFamily: "var(--font-primary, 'DM Sans', sans-serif)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            backgroundColor: "#00c300",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2
          style={{
            margin: "0 0 10px 0",
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a1a1a",
          }}
        >
          Success
        </h2>
        <p
          style={{
            margin: "0 0 28px 0",
            color: "#4b5563",
            fontSize: "15px",
          }}
        >
          {message || "Your request has been submitted successfully."}
        </p>
        <button
          onClick={onClose}
          style={{
            backgroundColor: "var(--navy, #0f2b5b)",
            color: "white",
            border: "none",
            borderRadius: "24px",
            padding: "10px 36px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Ok
        </button>
      </div>
    </div>
  );
}
