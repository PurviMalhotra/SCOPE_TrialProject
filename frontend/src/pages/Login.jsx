import { useEffect, useState } from "react";
import {
  DEV_LOGIN_EMAIL,
  devLogin,
  getAuthConfig,
  getGoogleLoginUrl,
} from "../services/authService";

export default function Login({ error, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(true);
  const [devLoginEnabled, setDevLoginEnabled] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    getAuthConfig()
      .then((config) => {
        setBackendOffline(false);
        setGoogleEnabled(config.googleEnabled);
        setDevLoginEnabled(config.devLoginEnabled);
      })
      .catch(() => {
        // Backend unreachable or outdated — still allow Google click to try
        setBackendOffline(true);
        setGoogleEnabled(true);
        setDevLoginEnabled(true);
      });
  }, []);

  const handleGoogleLogin = () => {
    if (backendOffline) {
      setLocalError("Start the backend first: cd backend && npm run dev");
      return;
    }

    if (!googleEnabled) {
      setLocalError(
        "Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend/.env (see README)."
      );
      return;
    }

    setGoogleLoading(true);
    setLocalError("");
    window.location.assign(getGoogleLoginUrl());
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setLocalError("");

    try {
      const result = await devLogin(DEV_LOGIN_EMAIL);
      onLogin?.(result.token, result.user);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <img
            src="/logo.png"
            alt="VIT Logo"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div>
            <p>SCOPE</p>
            <h1 id="login-title">Event Management Portal</h1>
          </div>
        </div>

        <div className="login-copy">
          <h2>Sign in to continue</h2>
          <p>Use your Google account to access event requests and approvals.</p>
        </div>

        {displayError && <div className="login-error">{displayError}</div>}

        <button
          className="google-login-btn"
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
          <span className="google-mark" aria-hidden="true">G</span>
          {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
        </button>

        {backendOffline && (
          <p className="login-hint login-hint-warn">
            Cannot reach the backend. Run <code>cd backend && npm run dev</code>, then
            refresh. Frontend must use <code>VITE_API_URL=http://localhost:5500</code>.
          </p>
        )}

        {!backendOffline && !googleEnabled && (
          <p className="login-hint login-hint-warn">
            Google OAuth credentials are missing in <code>backend/.env</code>.
          </p>
        )}

        {devLoginEnabled && (
          <>
            <div className="login-divider">
              <span>or for local testing</span>
            </div>

            <button
              className="login-secondary-btn"
              type="button"
              onClick={handleDevLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue as Demo Faculty"}
            </button>

            <p className="login-hint">
              Dev only — uses <strong>{DEV_LOGIN_EMAIL}</strong>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
