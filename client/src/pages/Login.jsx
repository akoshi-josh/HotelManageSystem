import React, { useState } from "react";
import supabase from "../supabaseClient";

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address."); return; }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setLoading(false); setError("Invalid email or password. Please try again."); return; }
    const { data: profile, error: profileError } = await supabase
      .from("users").select("*").eq("id", data.user.id).single();
    setLoading(false);
    if (profileError || !profile) {
      setError("Account not found in the system. Contact your administrator.");
      await supabase.auth.signOut(); return;
    }
    if (profile.status !== "active") {
      setError("Your account has been deactivated. Contact your administrator.");
      await supabase.auth.signOut(); return;
    }
    onLogin(profile);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lr-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Roboto', sans-serif;
        }

        /* ─────────────────────────────────────────
           SIDEBAR — exactly 50% width
        ───────────────────────────────────────── */
        .lr-sidebar {
          flex: 0 0 50%;
          width: 50%;
          background: #07713c;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 52px;
          position: relative;
          overflow: hidden;
        }

        .lr-sidebar::before {
          content: '';
          position: absolute;
          width: 480px; height: 480px;
          border-radius: 50%;
          border: 1px solid rgba(219,186,20,0.12);
          top: -160px; right: -160px;
          pointer-events: none;
        }
        .lr-sidebar::after {
          content: '';
          position: absolute;
          width: 320px; height: 320px;
          border-radius: 50%;
          border: 1px solid rgba(219,186,20,0.08);
          bottom: -100px; left: -100px;
          pointer-events: none;
        }
        .lr-sb-blob {
          position: absolute;
          width: 140px; height: 140px;
          border-radius: 50%;
          background: rgba(219,186,20,0.06);
          bottom: 80px; right: 60px;
          pointer-events: none;
        }

        .lr-sb-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 380px;
        }

        .lr-logo-wrap {
          width: 88px; height: 88px;
          border-radius: 22px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(219,186,20,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
        }

        .lr-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(219,186,20,0.1);
          border: 1px solid rgba(219,186,20,0.28);
          border-radius: 30px;
          padding: 5px 16px;
          margin-bottom: 20px;
        }
        .lr-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #dbba14;
          box-shadow: 0 0 0 3px rgba(219,186,20,0.2);
          flex-shrink: 0;
        }
        .lr-badge-txt {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #dbba14;
        }

        .lr-sb-title {
          font-family: 'Roboto', sans-serif;
          font-size: 2.1rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 14px;
          letter-spacing: -0.01em;
        }
        .lr-sb-title .gold { color: #dbba14; }

        .lr-sb-sub {
          font-size: 0.87rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.75;
          font-weight: 300;
          margin-bottom: 36px;
        }

        .lr-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(219,186,20,0.4), transparent);
          margin-bottom: 32px;
        }

        .lr-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          width: 100%;
        }
        .lr-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(219,186,20,0.14);
          border-radius: 12px;
          padding: 14px 16px;
          text-align: left;
        }
        .lr-stat-num {
          font-size: 1.3rem;
          font-weight: 900;
          color: #dbba14;
          line-height: 1;
          letter-spacing: -0.01em;
        }
        .lr-stat-lbl {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.38);
          margin-top: 4px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-weight: 400;
        }

        .lr-sb-footer {
          margin-top: 32px;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.22);
          letter-spacing: 0.06em;
        }

        /* ─────────────────────────────────────────
           FORM PANEL — exactly 50% width
        ───────────────────────────────────────── */
        .lr-panel {
          flex: 0 0 50%;
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 52px;
          background: #f5f6f2;
        }

        .lr-card {
          width: 100%;
          max-width: 400px;
        }

        .lr-form-header {
          margin-bottom: 36px;
        }
        .lr-eyebrow {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #dbba14;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .lr-eyebrow::before {
          content: '';
          display: inline-block;
          width: 20px; height: 2px;
          background: #dbba14;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .lr-gold-bar {
          width: 44px; height: 3px;
          background: #dbba14;
          border-radius: 2px;
          margin: 12px 0 18px;
        }
        .lr-form-title {
          font-family: 'Roboto', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: #07713c;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .lr-form-sub {
          font-size: 0.87rem;
          color: #7a8a7a;
          font-weight: 300;
        }

        /* error */
        .lr-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 15px;
          border-radius: 10px;
          background: #fdecea;
          border-left: 3px solid #e53935;
          color: #b71c1c;
          font-size: 0.83rem;
          margin-bottom: 20px;
          line-height: 1.5;
          font-weight: 400;
        }

        /* fields */
        .lr-field { margin-bottom: 18px; }
        .lr-field label {
          display: block;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3a5c3a;
          margin-bottom: 7px;
        }
        .lr-field input {
          width: 100%;
          padding: 13px 16px;
          border: 1.5px solid #d4ddd4;
          border-radius: 10px;
          font-size: 0.92rem;
          font-family: 'Roboto', sans-serif;
          font-weight: 400;
          background: #ffffff;
          color: #1a2e1a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .lr-field input::placeholder {
          color: #b2c2b2;
          font-style: italic;
          font-weight: 300;
        }
        .lr-field input:focus {
          border-color: #07713c;
          box-shadow: 0 0 0 3px rgba(7,113,60,0.1);
        }
        .lr-field input:hover:not(:focus) { border-color: #b0c8b0; }

        .lr-pw-wrap { position: relative; }
        .lr-pw-wrap input { padding-right: 48px; }
        .lr-eye-btn {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #a0b4a0;
          display: flex; align-items: center; justify-content: center;
          padding: 4px;
          transition: color 0.2s;
        }
        .lr-eye-btn:hover { color: #07713c; }

        /* submit */
        .lr-submit {
          width: 100%;
          margin-top: 10px;
          padding: 14px 24px;
          background: #07713c;
          color: #ffffff;
          font-family: 'Roboto', sans-serif;
          font-size: 0.87rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 18px rgba(7,113,60,0.22);
          position: relative; overflow: hidden;
        }
        .lr-submit::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: #dbba14;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .lr-submit:hover:not(:disabled) {
          background: #05592f;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(7,113,60,0.3);
        }
        .lr-submit:hover:not(:disabled)::after { opacity: 1; }
        .lr-submit:active:not(:disabled) { transform: translateY(0); }
        .lr-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .lr-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lr-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes lr-spin { to { transform: rotate(360deg); } }

        .lr-footer-note {
          text-align: center;
          margin-top: 28px;
          font-size: 0.7rem;
          color: #9aaa9a;
          letter-spacing: 0.05em;
          font-weight: 400;
        }
        .lr-footer-note span { color: #dbba14; font-weight: 500; }

        /* ─────────────────────────────────────────
           RESPONSIVE
        ───────────────────────────────────────── */

        /* Tablet: still side-by-side but tighter padding */
        @media (max-width: 900px) {
          .lr-sidebar { padding: 48px 36px; }
          .lr-panel   { padding: 48px 36px; }
          .lr-sb-title { font-size: 1.8rem; }
        }

        /* Below 768px: stack vertically, each takes full width */
        @media (max-width: 768px) {
          .lr-root { flex-direction: column; }

          .lr-sidebar {
            flex: none;
            width: 100%;
            padding: 36px 24px;
          }
          .lr-sidebar::before,
          .lr-sidebar::after,
          .lr-sb-blob { display: none; }

          .lr-sb-content { max-width: 100%; }
          .lr-logo-wrap  { width: 68px; height: 68px; border-radius: 16px; margin-bottom: 18px; }
          .lr-sb-title   { font-size: 1.65rem; }
          .lr-sb-sub     { font-size: 0.83rem; margin-bottom: 22px; }
          .lr-divider    { margin-bottom: 20px; }
          .lr-stats      { grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .lr-stat       { padding: 10px 12px; }
          .lr-stat-num   { font-size: 1rem; }
          .lr-sb-footer  { margin-top: 20px; }

          .lr-panel {
            flex: none;
            width: 100%;
            padding: 36px 24px;
          }
        }

        /* Small phones: 2-col stats grid */
        @media (max-width: 520px) {
          .lr-stats { grid-template-columns: 1fr 1fr; }
          .lr-form-title { font-size: 1.7rem; }
        }

        @media (max-width: 360px) {
          .lr-sidebar { padding: 24px 16px; }
          .lr-panel   { padding: 28px 16px; }
          .lr-sb-title { font-size: 1.4rem; }
          .lr-form-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="lr-root">

        {/* ── LEFT: SIDEBAR ── */}
        <aside className="lr-sidebar">
          <div className="lr-sb-blob" />
          <div className="lr-sb-content">

            <div className="lr-logo-wrap">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none"
                stroke="#dbba14" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M3 7l9-4 9 4" />
                <path d="M4 7v14M20 7v14" />
                <path d="M9 21V12h6v9" />
                <path d="M9 12a3 3 0 0 1 6 0" />
              </svg>
            </div>

            <div className="lr-badge">
              <span className="lr-badge-dot" />
              <span className="lr-badge-txt">v1.0 · Live System</span>
            </div>

            <div className="lr-sb-title">
              Hotel <span className="gold">Management</span><br />System
            </div>

            <div className="lr-sb-sub">
              Manage reservations, rooms, guests, and operations — all in one place.
            </div>

            <div className="lr-divider" />

            <div className="lr-stats">
              <div className="lr-stat">
                <div className="lr-stat-num">24/7</div>
                <div className="lr-stat-lbl">Operations</div>
              </div>
              <div className="lr-stat">
                <div className="lr-stat-num">100%</div>
                <div className="lr-stat-lbl">Uptime</div>
              </div>
              <div className="lr-stat">
                <div className="lr-stat-num">Live</div>
                <div className="lr-stat-lbl">Updates</div>
              </div>
              <div className="lr-stat">
                <div className="lr-stat-num">Safe</div>
                <div className="lr-stat-lbl">Access</div>
              </div>
            </div>

            <div className="lr-sb-footer">© 2024 Hotel Management System</div>
          </div>
        </aside>

        {/* ── RIGHT: FORM PANEL ── */}
        <main className="lr-panel">
          <div className="lr-card">

            <div className="lr-form-header">
              <div className="lr-eyebrow">Hotel Management</div>
              <div className="lr-gold-bar" />
              <h1 className="lr-form-title">Sign in to<br />your account</h1>
              <p className="lr-form-sub">Access the hotel management portal</p>
            </div>

            {error && (
              <div className="lr-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="#e53935" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="lr-field">
              <label htmlFor="lr-email">Email Address</label>
              <input
                id="lr-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@hotel.com"
                autoComplete="email"
              />
            </div>

            <div className="lr-field">
              <label htmlFor="lr-password">Password</label>
              <div className="lr-pw-wrap">
                <input
                  id="lr-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lr-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="lr-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading && <span className="lr-spinner" />}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div className="lr-footer-note">
              Hotel Management System v1.0 &nbsp;·&nbsp; <span>-</span> akuxhijosh
            </div>

          </div>
        </main>

      </div>
    </>
  );
}