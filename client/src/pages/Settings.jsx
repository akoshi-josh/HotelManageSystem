import React, { useState } from "react";
import {
  RiHotelLine, RiLockLine, RiErrorWarningLine,
  RiGroupLine, RiHotelBedLine, RiMoneyDollarCircleLine,
  RiDeleteBinLine, RiSaveLine, RiKeyLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.page-sub   { font-size:.83rem; color:#8a9a8a; margin-bottom:24px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }
.col { display:flex; flex-direction:column; gap:20px; }
.card { background:#fff; border-radius:16px; padding:22px; box-shadow:0 2px 8px rgba(0,0,0,.05); border:1px solid #e4ebe4; }
.card-hdr { display:flex; align-items:center; gap:10px; margin-bottom:18px; }
.card-icon { width:38px; height:38px; border-radius:10px; background:#ecfdf5; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.card-title { font-size:.92rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.card-sub   { font-size:.78rem; color:#8a9a8a; margin:0; }
.flabel { display:block; font-size:.76rem; font-weight:700; color:#3a6a3a; margin-bottom:4px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; transition:border-color .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.fi.readonly { background:#f8f8f8; color:#888; cursor:default; }
.fi-group { display:flex; flex-direction:column; gap:12px; }
.btn-save { width:100%; padding:11px; background:#07713c; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.btn-save:hover { background:#05592f; }
.btn-pw { width:100%; padding:11px; background:#1565c0; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.btn-pw:hover { background:#0d47a1; }
.btn-pw:disabled, .btn-save:disabled { background:#aaa; cursor:not-allowed; }
.alert-ok  { padding:9px 14px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.83rem; margin-bottom:12px; }
.alert-err { padding:9px 14px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.83rem; margin-bottom:12px; }
.danger-title { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
.danger-sub { font-size:.8rem; color:#aaa; margin-bottom:18px; }
.dz-item { border:1.5px solid; border-radius:12px; padding:14px 16px; margin-bottom:12px; }
.dz-item:last-child { margin-bottom:0; }
.dz-row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; }
.dz-info { flex:1; }
.dz-name { display:flex; align-items:center; gap:7px; font-weight:700; font-size:.88rem; margin-bottom:3px; }
.dz-desc { font-size:.8rem; color:#555; line-height:1.4; }
.dz-btn { padding:7px 14px; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.78rem; font-weight:700; font-family:Arial,sans-serif; white-space:nowrap; flex-shrink:0; }
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.52); backdrop-filter:blur(2px); padding:20px; }
.mb { background:#fff; border-radius:20px; width:100%; max-width:440px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.24); }
.mh { padding:22px 26px; }
.mh-icon { font-size:1.8rem; margin-bottom:8px; width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
.mh-title { color:#fff; font-size:1rem; font-weight:700; margin:0 0 3px; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.8rem; margin:0; }
.mbody { padding:20px 26px; }
.warn-box { background:#fdecea; border:1.5px solid #ffcdd2; border-radius:10px; padding:12px 14px; margin-bottom:16px; }
.warn-title { font-weight:700; color:#c62828; font-size:.83rem; margin-bottom:3px; display:flex; align-items:center; gap:5px; }
.warn-text  { font-size:.81rem; color:#555; line-height:1.5; margin:0; }
.mfoot { padding:14px 26px; border-top:1px solid #f0f0f0; display:flex; gap:10px; }
.btn-cancel  { flex:1; padding:11px; background:#f4f6f0; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#555; font-family:Arial,sans-serif; }
.btn-confirm { flex:2; padding:11px; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; }
.btn-confirm:disabled { background:#aaa; cursor:not-allowed; }
.done-box { background:#e8f5e9; border:1px solid #a5d6a7; color:#1b5e20; padding:14px; border-radius:10px; text-align:center; font-weight:600; }
`;

const CLEAR_ACTIONS = [
  { id: "guests",  Icon: RiGroupLine,             title: "Clear Guest & Reservation History", description: "Permanently deletes ALL reservation records and guest history. Rooms are reset to available.", warning: "ALL guest records and reservation history will be permanently deleted. This cannot be undone.", color: "#e65100", bg: "#fff3e0", border: "#ffcc80" },
  { id: "rooms",   Icon: RiHotelBedLine,           title: "Delete All Rooms",                  description: "Permanently deletes ALL room records. You will need to re-run the SQL to restore rooms.",           warning: "ALL rooms will be permanently deleted from the database. This cannot be undone.",              color: "#1565c0", bg: "#e3f2fd", border: "#90caf9" },
  { id: "revenue", Icon: RiMoneyDollarCircleLine,  title: "Clear Revenue Data",                description: "Wipes all payment records from checked-out reservations. Amounts reset to zero.",                   warning: "All payment data from checked-out reservations will be reset to 0.",                          color: "#6a1b9a", bg: "#f3e5f5", border: "#ce93d8" },
  { id: "all",     Icon: RiDeleteBinLine,          title: "Clear Everything",                  description: "Permanently deletes ALL guests, rooms, and revenue data. The system will be completely empty.",     warning: "EVERYTHING will be permanently wiped — guests, reservations, all rooms, and all revenue.",   color: "#c62828", bg: "#fce4ec", border: "#ef9a9a" },
];

export default function Settings({ user, userRole }) {
  const [hotelName,    setHotelName]    = useState("Grand Hotel");
  const [hotelEmail,   setHotelEmail]   = useState("");
  const [hotelPhone,   setHotelPhone]   = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [savingInfo,   setSavingInfo]   = useState(false);
  const [infoMsg,      setInfoMsg]      = useState("");
  const [modal,        setModal]        = useState(null);
  const [password,     setPassword]     = useState("");
  const [pwError,      setPwError]      = useState("");
  const [confirming,   setConfirming]   = useState(false);
  const [doneMsg,      setDoneMsg]      = useState("");
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [changingPw,   setChangingPw]   = useState(false);
  const [pwChangeMsg,  setPwChangeMsg]  = useState("");
  const [pwChangeErr,  setPwChangeErr]  = useState("");

  const isAdmin = userRole === "admin";

  const handleClear = async () => {
    setPwError("");
    if (!password) { setPwError("Please enter the admin password."); return; }
    setConfirming(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: user?.email, password });
    if (authError) { setPwError("Incorrect password. Please try again."); setConfirming(false); return; }
    const { data: profile } = await supabase.from("users").select("role").eq("id", user?.id).single();
    if (!profile || profile.role !== "admin") { setPwError("Only admins can perform this action."); setConfirming(false); return; }
    try {
      if (modal.id === "guests" || modal.id === "all") {
        await supabase.from("reservations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("rooms").update({ status: "available" }).neq("id", "00000000-0000-0000-0000-000000000000");
      }
      if (modal.id === "rooms" || modal.id === "all")
        await supabase.from("rooms").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (modal.id === "revenue")
        await supabase.from("reservations").update({ amount_paid: 0, total_amount: 0, extra_charges: 0 }).eq("status", "checked_out");
      setDoneMsg("Data cleared successfully!");
      setConfirming(false);
      setTimeout(() => { setModal(null); setDoneMsg(""); }, 2000);
    } catch(e) { setPwError("Error: " + e.message); setConfirming(false); }
  };

  const handleChangePassword = async () => {
    setPwChangeErr(""); setPwChangeMsg("");
    if (!currentPw || !newPw || !confirmPw) { setPwChangeErr("Please fill in all fields."); return; }
    if (newPw !== confirmPw) { setPwChangeErr("New passwords do not match."); return; }
    if (newPw.length < 8) { setPwChangeErr("Password must be at least 8 characters."); return; }
    setChangingPw(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: user?.email, password: currentPw });
    if (authError) { setPwChangeErr("Current password is incorrect."); setChangingPw(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwChangeErr(error.message); setChangingPw(false); return; }
    setPwChangeMsg("Password changed successfully!");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setChangingPw(false);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <h2 className="page-title">Settings</h2>
        <p className="page-sub">Manage hotel information and system preferences</p>

        <div className="two-col">
          <div className="col">
            {/* Hotel Information */}
            <div className="card">
              <div className="card-hdr">
                <div className="card-icon"><RiHotelLine size={20} color="#07713c" /></div>
                <div>
                  <p className="card-title">Hotel Information</p>
                  <p className="card-sub">{isAdmin ? "Edit hotel details shown on receipts" : "View-only — contact admin to edit"}</p>
                </div>
              </div>
              {infoMsg && <div className="alert-ok">{infoMsg}</div>}
              <div className="fi-group">
                {[
                  { label: "Hotel Name",      val: hotelName,    set: setHotelName,    type: "text",  ph: "Grand Hotel" },
                  { label: "Contact Email",   val: hotelEmail,   set: setHotelEmail,   type: "email", ph: "hotel@email.com" },
                  { label: "Contact Phone",   val: hotelPhone,   set: setHotelPhone,   type: "text",  ph: "+63 9XX XXX XXXX" },
                ].map(({ label, val, set, type, ph }) => (
                  <div key={label}>
                    <label className="flabel">{label}</label>
                    <input type={type} className={`fi${!isAdmin?" readonly":""}`} value={val}
                      onChange={e => isAdmin && set(e.target.value)} readOnly={!isAdmin} placeholder={ph} />
                  </div>
                ))}
                <div>
                  <label className="flabel">Address</label>
                  <textarea className={`fi${!isAdmin?" readonly":""}`} rows={2} style={{ resize: "vertical" }}
                    value={hotelAddress} onChange={e => isAdmin && setHotelAddress(e.target.value)} readOnly={!isAdmin} placeholder="Hotel address..." />
                </div>
                {isAdmin && (
                  <button className="btn-save" disabled={savingInfo} onClick={async () => {
                    setSavingInfo(true);
                    await new Promise(r => setTimeout(r, 600));
                    setSavingInfo(false);
                    setInfoMsg("Hotel information saved!");
                    setTimeout(() => setInfoMsg(""), 2500);
                  }}>
                    <RiSaveLine size={15} />{savingInfo ? "Saving..." : "Save Information"}
                  </button>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="card">
              <div className="card-hdr">
                <div className="card-icon"><RiLockLine size={20} color="#07713c" /></div>
                <div>
                  <p className="card-title">Change Password</p>
                  <p className="card-sub">Update your account password</p>
                </div>
              </div>
              {pwChangeErr && <div className="alert-err">⚠ {pwChangeErr}</div>}
              {pwChangeMsg && <div className="alert-ok">✓ {pwChangeMsg}</div>}
              <div className="fi-group">
                {[["Current Password", currentPw, setCurrentPw], ["New Password", newPw, setNewPw], ["Confirm New Password", confirmPw, setConfirmPw]].map(([label, val, setter]) => (
                  <div key={label}>
                    <label className="flabel">{label}</label>
                    <input type="password" className="fi" value={val} onChange={e => setter(e.target.value)} placeholder="••••••••" />
                  </div>
                ))}
                <button className="btn-pw" disabled={changingPw} onClick={handleChangePassword}>
                  <RiKeyLine size={15} />{changingPw ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="col">
              <div className="card">
                <div className="danger-title">
                  <RiErrorWarningLine size={20} color="#c62828" />
                  <h3 style={{ margin: 0, fontSize: ".95rem", fontWeight: "700", color: "#c62828" }}>Danger Zone</h3>
                </div>
                <p className="danger-sub">These actions are irreversible. Admin password required for every action.</p>
                {CLEAR_ACTIONS.map(action => (
                  <div key={action.id} className="dz-item" style={{ background: action.bg, borderColor: action.border }}>
                    <div className="dz-row">
                      <div className="dz-info">
                        <div className="dz-name" style={{ color: action.color }}>
                          <action.Icon size={16} />{action.title}
                        </div>
                        <p className="dz-desc">{action.description}</p>
                      </div>
                      <button className="dz-btn" style={{ background: action.color }}
                        onClick={() => { setModal(action); setPassword(""); setPwError(""); setDoneMsg(""); }}>
                        Clear
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {modal && (
        <div className="mo" onClick={() => setModal(null)}>
          <div className="mb" onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background: `linear-gradient(135deg,${modal.color},${modal.color}cc)` }}>
              <div className="mh-icon" style={{ background: "rgba(255,255,255,.15)" }}>
                <modal.Icon size={22} color="#fff" />
              </div>
              <p className="mh-title">{modal.title}</p>
              <p className="mh-sub">Admin authentication required</p>
            </div>
            <div className="mbody">
              {doneMsg ? (
                <div className="done-box">✓ {doneMsg}</div>
              ) : (
                <>
                  <div className="warn-box">
                    <div className="warn-title"><RiErrorWarningLine size={14} />Warning</div>
                    <p className="warn-text">{modal.warning}</p>
                  </div>
                  <div>
                    <label className="flabel">Enter Admin Password to Confirm</label>
                    <input type="password" className="fi" value={password}
                      onChange={e => { setPassword(e.target.value); setPwError(""); }}
                      placeholder="••••••••" onKeyDown={e => e.key==="Enter" && handleClear()} autoFocus
                      style={{ borderColor: pwError?"#e53935":"#ccdacc" }} />
                    {pwError && <p style={{ margin: "5px 0 0", fontSize: ".81rem", color: "#e53935" }}>⚠ {pwError}</p>}
                  </div>
                </>
              )}
            </div>
            {!doneMsg && (
              <div className="mfoot">
                <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
                <button className="btn-confirm" style={{ background: confirming||!password?"#aaa":modal.color }}
                  onClick={handleClear} disabled={confirming||!password}>
                  {confirming ? "Verifying..." : "Yes, Confirm"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
