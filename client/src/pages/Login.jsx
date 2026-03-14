import React, { useState } from "react";
import supabase from "../supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setLoading(false);
      setError("Invalid email or password. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (profileError || !profile) {
      setError("Account not found in the system. Contact your administrator.");
      await supabase.auth.signOut();
      return;
    }

    if (profile.status !== "active") {
      setError("Your account has been deactivated. Contact your administrator.");
      await supabase.auth.signOut();
      return;
    }

    onLogin(profile);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: Arial, sans-serif;
          background: #f4f6f0;
        }

        /* ── LEFT SIDEBAR ── */
        .sidebar {
          flex: 1;
          background: #07713c;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 64px;
          position: relative;
          overflow: hidden;
        }
        .sidebar::before,
        .sidebar::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar::before { width: 480px; height: 480px; top: -120px; left: -120px; }
        .sidebar::after  { width: 360px; height: 360px; bottom: -100px; right: -140px; }

        .sidebar-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .logo-ring {
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1.5px solid rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 36px;
          box-shadow: 0 0 60px rgba(92,184,92,0.18);
        }
        .logo-ring-icon {
          font-size: 72px;
          line-height: 1;
        }

        .sidebar-school {
          font-family: Arial, sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          letter-spacing: 0.01em;
          margin-bottom: 12px;
        }
        .sidebar-tagline {
          font-size: 0.82rem;
          font-weight: 400;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1.6;
          margin-bottom: 6px;
        }
        .sidebar-divider {
          width: 48px; height: 2px;
          background: #5cb85c;
          border-radius: 2px;
          margin: 28px auto;
          opacity: 0.7;
        }
        .sidebar-quote {
          font-size: 0.92rem;
          color: rgba(255,255,255,0.38);
          font-style: italic;
          line-height: 1.8;
          max-width: 300px;
        }

        /* ── RIGHT PANEL ── */
        .form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 64px;
          background: #f4f6f0;
        }
        .form-card {
          width: 100%;
          max-width: 400px;
        }
        .form-header { margin-bottom: 36px; }
        .form-eyebrow {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #07713c;
          margin-bottom: 8px;
        }
        .form-title {
          font-family: Arial, sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #07713c;
          line-height: 1.2;
        }
        .form-subtitle {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #6b7a6b;
          font-weight: 300;
        }

        .alert-error {
          padding: 12px 16px;
          border-radius: 8px;
          background: #fdecea;
          border-left: 3px solid #e53935;
          color: #b71c1c;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        .field { margin-bottom: 20px; }
        .field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #07713c;
          margin-bottom: 8px;
        }
        .field input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #d2dcd2;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: Arial, sans-serif;
          background: #ffffff;
          color: #07713c;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .field input::placeholder { color: #a8b8a8; font-style: italic; font-weight: 300; }
        .field input:focus {
          border-color: #07713c;
          box-shadow: 0 0 0 3px rgba(7,113,60,0.12);
        }

        .pass-wrap { position: relative; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          font-size: 1.1rem; color: #a8b8a8;
        }
        .eye-btn:hover { color: #07713c; }

        .btn-submit {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          background: #07713c;
          color: #ffffff;
          font-family: Arial, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(7,113,60,0.25);
        }
        .btn-submit:hover:not(:disabled) {
          background: #05592f;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(7,113,60,0.3);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .btn-spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .form-footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 0.75rem;
          color: #9aaa9a;
        }

        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .sidebar {
            width: 100%; padding: 36px 28px;
            flex-direction: row; justify-content: flex-start;
            gap: 20px; min-height: auto;
          }
          .sidebar::before, .sidebar::after { display: none; }
          .sidebar-inner { flex-direction: row; text-align: left; gap: 20px; align-items: center; }
          .logo-ring { width: 72px; height: 72px; margin-bottom: 0; flex-shrink: 0; }
          .logo-ring-icon { font-size: 36px; }
          .sidebar-divider, .sidebar-quote { display: none; }
          .sidebar-school { font-size: 1.1rem; }
          .form-panel { padding: 36px 24px; }
        }
      `}</style>

      <div className="login-root">
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="logo-ring">
              <span className="logo-ring-icon">🏨</span>
            </div>
            <div>
              <div className="sidebar-tagline">Welcome to</div>
              <div className="sidebar-school">Hotel Management<br />System</div>
              <div className="sidebar-divider" />
              <div className="sidebar-quote">
                Manage reservations, rooms, guests, and operations — all in one place.
              </div>
            </div>
          </div>
        </aside>

        <main className="form-panel">
          <div className="form-card">
            <div className="form-header">
              <div className="form-eyebrow">Hotel Management</div>
              <h1 className="form-title">Sign in to<br />your account</h1>
              <p className="form-subtitle">Access the hotel management system</p>
            </div>

            {error && (
              <div className="alert-error">✕ {error}</div>
            )}

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hotel.com"
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pass-wrap">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && <span className="btn-spinner" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="form-footer-note">
              Hotel Management System v1.0 © 2024
            </div>
          </div>
        </main>
      </div>
    </>
  );
}