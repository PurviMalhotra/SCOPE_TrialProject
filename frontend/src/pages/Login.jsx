import { getGoogleLoginUrl } from "../services/authService";

export default function Login({ error }) {
  const handleLogin = () => {
    window.location.assign(getGoogleLoginUrl());
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <img src="/logo.png" alt="VIT Logo" />
          <div>
            <p>SCOPE</p>
            <h1 id="login-title">Event Management Portal</h1>
          </div>
        </div>

        <div className="login-copy">
          <h2>Sign in to continue</h2>
          <p>Use your Google account to access event requests and approvals.</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="google-login-btn" type="button" onClick={handleLogin}>
          <span className="google-mark" aria-hidden="true">G</span>
          Continue with Google
        </button>
      </section>
    </main>
  );
}
