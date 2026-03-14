import React, { useState } from "react";
import supabase from "../supabaseClient";

const CLEAR_ACTIONS = [
  {
    id: "guests",
    icon: "👥",
    title: "Clear Guest & Reservation History",
    desc: "Deletes ALL reservation records. Rooms reset to available.",
    warn: "ALL guest records and reservations will be permanently deleted. This cannot be undone.",
    color: "#e65100", bg: "#fff3e0", border: "#ffcc80",
  },
  {
    id: "rooms",
    icon: "🛏️",
    title: "Delete All Rooms",
    desc: "Permanently deletes ALL room records from the database.",
    warn: "ALL rooms will be permanently deleted from the database. This cannot be undone.",
    color: "#1565c0", bg: "#e3f2fd", border: "#90caf9",
  },
  {
    id: "revenue",
    icon: "💰",
    title: "Clear Revenue Data",
    desc: "Wipes all payment data from checked-out reservations.",
    warn: "All payment amounts from checked-out reservations will be reset to 0.",
    color: "#6a1b9a", bg: "#f3e5f5", border: "#ce93d8",
  },
  {
    id: "all",
    icon: "🗑️",
    title: "Clear Everything",
    desc: "Nuclear option — deletes ALL guests, rooms, and revenue.",
    warn: "EVERYTHING will be permanently wiped. The system will be completely empty.",
    color: "#c62828", bg: "#fce4ec", border: "#ef9a9a",
  },
];

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.stg-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
.stg-col  { display:flex; flex-direction:column; gap:24px; }
.stg-card { background:#fff; border-radius:16px; padding:24px; box-shadow:0 2px 8px rgba(0,0,0,.05); border:1px solid #e4ebe4; }
.stg-card-hdr { display:flex; align-items:center; gap:10px; margin-bottom:20px; }
.stg-card-ico { font-size:1.3rem; }
.stg-card-title { font-size:1rem; font-weight:700; color:#07713c; margin:0; }
.stg-card-sub   { font-size:.8rem; color:#9aaa9a; margin:2px 0 0; }
.danger-item { border-radius:12px; padding:16px 18px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.danger-item:last-child { margin-bottom:0; }
.flabel { display:block; font-size:.78rem; font-weight:700; color:#3a6a3a; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#07713c; box-sizing:border-box; transition:border-color .2s,box-shadow .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.btn-primary { width:100%; padding:11px; background:#07713c; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); }
.btn-primary:hover { background:#05592f; }
.btn-blue { background:#1565c0; box-shadow:0 4px 14px rgba(21,101,192,.25); }
.btn-blue:hover { background:#0d47a1; }
.btn-primary:disabled { background:#a8b8a8; cursor:not-allowed; box-shadow:none; }
.alert-ok  { padding:10px 15px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.84rem; margin-bottom:14px; }
.alert-err { padding:10px 15px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.84rem; margin-bottom:14px; }
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:16px; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.22); }
.mh { padding:22px 28px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; }
.mh-title { color:#fff; font-size:1.15rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.82rem; margin:4px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:22px 28px; overflow-y:auto; flex:1; }
.mfoot { padding:14px 28px; border-top:1px solid #e4ebe4; display:flex; gap:12px; flex-shrink:0; }
.btn-cancel  { flex:1; padding:12px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-cancel:hover { background:#f4f6f0; }
.btn-confirm { flex:2; padding:12px; border:none; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; }
.btn-confirm:disabled { opacity:.6; cursor:not-allowed; }
`;

export default function Settings({ user }) {
  const [hotelName,    setHotelName]    = useState("Grand Hotel");
  const [hotelEmail,   setHotelEmail]   = useState("");
  const [hotelPhone,   setHotelPhone]   = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [infoMsg,      setInfoMsg]      = useState("");

  const [modal,      setModal]      = useState(null);
  const [password,   setPassword]   = useState("");
  const [pwErr,      setPwErr]      = useState("");
  const [confirming, setConfirming] = useState(false);
  const [doneMsg,    setDoneMsg]    = useState("");

  const [curPw,      setCurPw]      = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confPw,     setConfPw]     = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg,      setPwMsg]      = useState("");
  const [pwErrMsg,   setPwErrMsg]   = useState("");

  const openClear = (a) => { setModal(a); setPassword(""); setPwErr(""); setDoneMsg(""); };

  const handleClear = async () => {
    setPwErr("");
    if (!password) { setPwErr("Please enter the admin password."); return; }
    setConfirming(true);
    const { error: ae } = await supabase.auth.signInWithPassword({ email: user?.email, password });
    if (ae) { setPwErr("Incorrect password. Please try again."); setConfirming(false); return; }
    const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id).single();
    if (!profile || profile.role !== "admin") { setPwErr("Only admins can perform this action."); setConfirming(false); return; }
    try {
      if (modal.id === "guests" || modal.id === "all") {
        await supabase.from("reservations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("rooms").update({ status: "available" }).neq("id", "00000000-0000-0000-0000-000000000000");
      }
      if (modal.id === "rooms" || modal.id === "all") {
        await supabase.from("rooms").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      }
      if (modal.id === "revenue") {
        await supabase.from("reservations").update({ amount_paid: 0, total_amount: 0, extra_charges: 0 }).eq("status", "checked_out");
      }
      setDoneMsg("✅ Done! Data has been cleared successfully.");
      setConfirming(false);
      setTimeout(() => { setModal(null); setDoneMsg(""); }, 2000);
    } catch (e) {
      setPwErr("Something went wrong: " + e.message);
      setConfirming(false);
    }
  };

  const handleChangePw = async () => {
    setPwErrMsg(""); setPwMsg("");
    if (!curPw || !newPw || !confPw) { setPwErrMsg("Please fill in all fields."); return; }
    if (newPw !== confPw)  { setPwErrMsg("New passwords do not match."); return; }
    if (newPw.length < 8)  { setPwErrMsg("Password must be at least 8 characters."); return; }
    setChangingPw(true);
    const { error: ae } = await supabase.auth.signInWithPassword({ email: user?.email, password: curPw });
    if (ae) { setPwErrMsg("Current password is incorrect."); setChangingPw(false); return; }
    const { error: ue } = await supabase.auth.updateUser({ password: newPw });
    if (ue) { setPwErrMsg(ue.message); setChangingPw(false); return; }
    setPwMsg("Password changed successfully!");
    setCurPw(""); setNewPw(""); setConfPw("");
    setChangingPw(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Settings</h2>
            <p className="page-sub">Manage hotel information and system data</p>
          </div>
        </div>

        <div className="stg-grid">
          {/* LEFT COLUMN */}
          <div className="stg-col">
            <div className="stg-card">
              <div className="stg-card-hdr">
                <span className="stg-card-ico">🏨</span>
                <div>
                  <p className="stg-card-title">Hotel Information</p>
                  <p className="stg-card-sub">Basic details shown on receipts and reports</p>
                </div>
              </div>
              {infoMsg && <div className="alert-ok">{infoMsg}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  ["Hotel Name",     "text",  hotelName,    setHotelName,    "Grand Hotel"],
                  ["Contact Email",  "email", hotelEmail,   setHotelEmail,   "hotel@email.com"],
                  ["Contact Phone",  "text",  hotelPhone,   setHotelPhone,   "+63 9XX XXX XXXX"],
                ].map(([lbl, tp, val, setter, ph]) => (
                  <div key={lbl}>
                    <label className="flabel">{lbl}</label>
                    <input type={tp} className="fi" value={val} onChange={e => setter(e.target.value)} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label className="flabel">Address</label>
                  <textarea className="fi" value={hotelAddress} onChange={e => setHotelAddress(e.target.value)} placeholder="Hotel address..." rows={2} style={{ resize: "vertical" }} />
                </div>
                <button
                  className="btn-primary"
                  disabled={savingInfo}
                  onClick={async () => {
                    setSavingInfo(true);
                    await new Promise(r => setTimeout(r, 600));
                    setSavingInfo(false);
                    setInfoMsg("✅ Hotel information saved!");
                    setTimeout(() => setInfoMsg(""), 2500);
                  }}
                >
                  {savingInfo ? "Saving…" : "💾 Save Information"}
                </button>
              </div>
            </div>

            <div className="stg-card">
              <div className="stg-card-hdr">
                <span className="stg-card-ico">🔐</span>
                <div>
                  <p className="stg-card-title">Change Password</p>
                  <p className="stg-card-sub">Update your account password</p>
                </div>
              </div>
              {pwErrMsg && <div className="alert-err">✕ {pwErrMsg}</div>}
              {pwMsg    && <div className="alert-ok">✓ {pwMsg}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  ["Current Password",     curPw,  setCurPw],
                  ["New Password",         newPw,  setNewPw],
                  ["Confirm New Password", confPw, setConfPw],
                ].map(([lbl, val, setter]) => (
                  <div key={lbl}>
                    <label className="flabel">{lbl}</label>
                    <input type="password" className="fi" value={val} onChange={e => setter(e.target.value)} placeholder="••••••••" />
                  </div>
                ))}
                <button
                  className="btn-primary btn-blue"
                  disabled={changingPw}
                  onClick={handleChangePw}
                >
                  {changingPw ? "Updating…" : "🔑 Update Password"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Danger Zone */}
          <div className="stg-card">
            <div className="stg-card-hdr">
              <span className="stg-card-ico">⚠️</span>
              <div>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#c62828" }}>Danger Zone</p>
                <p className="stg-card-sub">Irreversible actions. Admin password required.</p>
              </div>
            </div>
            {CLEAR_ACTIONS.map(a => (
              <div key={a.id} className="danger-item" style={{ background: a.bg, border: `1.5px solid ${a.border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "1.1rem" }}>{a.icon}</span>
                    <span style={{ fontWeight: "700", fontSize: ".9rem", color: a.color }}>{a.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: ".82rem", color: "#6b7a6b", lineHeight: "1.4" }}>{a.desc}</p>
                </div>
                <button
                  onClick={() => openClear(a)}
                  style={{ padding: "8px 16px", background: a.color, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: ".8rem", fontWeight: "700", fontFamily: "Arial,sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="mo" onClick={() => setModal(null)}>
          <div className="mb" style={{ maxWidth: "440px" }} onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background: `linear-gradient(135deg,${modal.color},${modal.color}cc)` }}>
              <div>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{modal.icon}</div>
                <p className="mh-title">{modal.title}</p>
                <p className="mh-sub">Admin authentication required</p>
              </div>
              <button className="mx" onClick={() => setModal(null)}>×</button>
            </div>

            <div className="mbody">
              {doneMsg ? (
                <div className="alert-ok" style={{ textAlign: "center" }}>{doneMsg}</div>
              ) : (
                <>
                  <div style={{ background: "#fdecea", border: "1.5px solid #fca5a5", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
                    <div style={{ fontWeight: "700", color: "#b71c1c", fontSize: ".85rem", marginBottom: "4px" }}>⚠️ Warning</div>
                    <p style={{ margin: 0, fontSize: ".83rem", color: "#6b7a6b", lineHeight: "1.5" }}>{modal.warn}</p>
                  </div>
                  <div>
                    <label className="flabel">Enter Admin Password to Confirm</label>
                    <input
                      type="password" className="fi"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setPwErr(""); }}
                      placeholder="••••••••"
                      onKeyDown={e => e.key === "Enter" && handleClear()}
                      autoFocus
                      style={pwErr ? { borderColor: "#e53935" } : {}}
                    />
                    {pwErr && <p style={{ margin: "6px 0 0", fontSize: ".82rem", color: "#e53935" }}>⚠️ {pwErr}</p>}
                  </div>
                </>
              )}
            </div>

            {!doneMsg && (
              <div className="mfoot">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button
                  className="btn-confirm"
                  style={{ background: confirming || !password ? "#a8b8a8" : modal.color, boxShadow: "none" }}
                  onClick={handleClear}
                  disabled={confirming || !password}
                >
                  {confirming ? "Verifying…" : `Yes, ${modal.title}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}