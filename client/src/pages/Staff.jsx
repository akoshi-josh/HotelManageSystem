import React, { useState, useEffect } from "react";
import {
  RiGroupLine, RiCheckboxCircleLine, RiCloseCircleLine,
  RiPencilLine, RiUserAddLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.sc-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.sc-ico { display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sc-lbl { font-size:.8rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { display:flex; gap:14px; align-items:center; background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; }
.finput { flex:1; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.btn-primary { padding:11px 22px; background:#07713c; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); white-space:nowrap; display:inline-flex; align-items:center; gap:7px; }
.btn-primary:hover { background:#05592f; }
.tc { background:#fff; border-radius:14px; border:1px solid #e4ebe4; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.tc-hdr { padding:16px 22px 12px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eef4ee; }
.tc-title { font-size:.92rem; font-weight:700; color:#07713c; }
.tc-badge { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; background:#ecfdf5; color:#07713c; border-radius:20px; padding:3px 10px; border:1px solid #d1fae5; }
.tc-head { display:grid; padding:8px 22px; background:#f8faf8; border-bottom:1px solid #eef4ee; }
.th { font-size:.64rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9a7a; }
.tc-scroll { overflow-y:auto; max-height:430px; }
.tc-scroll::-webkit-scrollbar { width:4px; }
.tc-scroll::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
.tr { display:grid; padding:12px 22px; align-items:center; border-bottom:1px solid #f2f7f2; transition:background .15s; }
.tr:last-child { border-bottom:none; }
.tr:hover { background:#f8fdf8; }
.rg { display:flex; align-items:center; gap:10px; min-width:0; }
.av { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#07713c,#5cb85c); color:#fff; font-weight:700; font-size:.84rem; display:flex; align-items:center; justify-content:center; }
.rg-name { font-size:.88rem; font-weight:600; color:#07713c; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; text-transform:capitalize; }
.ba { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:7px; border:1.5px solid; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; cursor:pointer; transition:background .15s; }
.ba-edit { border-color:#fde68a; color:#92400e; background:#fffbeb; }
.ba-edit:hover { background:#fef3c7; }
.empty { padding:48px; text-align:center; color:#9aaa9a; font-size:.88rem; }
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:16px; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.22); }
.mh { padding:22px 28px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; background:linear-gradient(135deg,#07713c,#0a9150); }
.mh-title { color:#fff; font-size:1.15rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.82rem; margin:4px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:22px 28px; overflow-y:auto; flex:1; }
.mfoot { padding:14px 28px; border-top:1px solid #e4ebe4; display:flex; gap:12px; flex-shrink:0; }
.sc2 { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:14px; border:1px solid #e4ebe4; }
.sc2-title { font-size:.7rem; font-weight:700; color:#07713c; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
.flabel { display:block; font-size:.78rem; font-weight:700; color:#3a6a3a; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#07713c; box-sizing:border-box; transition:border-color .2s,box-shadow .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.fi:disabled { background:#f5f8f5; color:#9aaa9a; }
.btn-cancel { flex:1; padding:12px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-cancel:hover { background:#f4f6f0; }
.btn-confirm { flex:2; padding:12px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); }
.btn-confirm:hover:not(:disabled) { background:#05592f; }
.btn-confirm:disabled { background:#a8b8a8; cursor:not-allowed; box-shadow:none; }
.alert-ok  { padding:10px 15px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.84rem; margin-bottom:14px; }
.alert-err { padding:10px 15px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.84rem; margin-bottom:14px; }
`;

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser,  setEditUser]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [search,    setSearch]    = useState("");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "staff", status: "active" });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    setLoading(true);
    const { data } = await supabase.from("users").select("*").order("created_at", { ascending: false });
    setStaffList(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditUser(null);
    setForm({ full_name: "", email: "", password: "", role: "staff", status: "active" });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ full_name: u.full_name, email: u.email, password: "", role: u.role, status: u.status });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.full_name || !form.email) { setError("Full name and email are required."); return; }
    if (!editUser && !form.password)    { setError("Password is required for new accounts."); return; }
    if (!editUser && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSaving(true);
    if (editUser) {
      const { error: e } = await supabase.from("users").update({ full_name: form.full_name, role: form.role, status: form.status }).eq("id", editUser.id);
      if (e) { setError("Failed to update user."); setSaving(false); return; }
      setSuccess("User updated successfully!");
    } else {
      try {
        const res = await fetch("http://localhost:5000/api/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: form.full_name, email: form.email, password: form.password, role: form.role, status: form.status }),
        });
        const result = await res.json();
        if (!res.ok) { setError(result.error || "Failed to create user."); setSaving(false); return; }
        setSuccess("Staff account created successfully!");
      } catch (err) {
        setError("Cannot connect to server. Make sure the server is running.");
        setSaving(false); return;
      }
    }
    setSaving(false);
    fetchStaff();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1500);
  };

  const toggleStatus = async (u) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    await supabase.from("users").update({ status: newStatus }).eq("id", u.id);
    fetchStaff();
  };

  const filtered = staffList.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const STAT_CARDS = [
    { lbl: "Total Staff", val: staffList.length,                                       Icon: RiGroupLine,          bg: "#e8f5e9", c: "#1b5e20" },
    { lbl: "Active",      val: staffList.filter(s => s.status === "active").length,   Icon: RiCheckboxCircleLine, bg: "#e3f2fd", c: "#1565c0" },
    { lbl: "Inactive",    val: staffList.filter(s => s.status === "inactive").length, Icon: RiCloseCircleLine,    bg: "#fff3e0", c: "#e65100" },
  ];

  const cols = "2fr 2fr 1fr 1fr 1.2fr 1.5fr";

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Staff Management</h2>
            <p className="page-sub">Manage staff and receptionist accounts</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>
            <RiUserAddLine size={16} /> Add Staff
          </button>
        </div>

        <div className="sc-3">
          {STAT_CARDS.map(({ lbl, val, Icon, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row">
                <span className="sc-ico"><Icon size={20} color={c} /></span>
                <span className="sc-lbl" style={{ color: c }}>{lbl}</span>
              </div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" type="text" placeholder="Search by name, email or role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title">All Staff</div>
            <span className="tc-badge">{filtered.length} members</span>
          </div>
          <div className="tc-head" style={{ gridTemplateColumns: cols }}>
            {["Name","Email","Role","Status","Created","Actions"].map(h => <div key={h} className="th">{h}</div>)}
          </div>
          <div className="tc-scroll">
            {loading ? (
              <div className="empty">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">No staff found.</div>
            ) : filtered.map(s => (
              <div key={s.id} className="tr" style={{ gridTemplateColumns: cols }}>
                <div className="rg">
                  <div className="av">{s.full_name.slice(0, 2).toUpperCase()}</div>
                  <span className="rg-name">{s.full_name}</span>
                </div>
                <div style={{ fontSize: ".84rem", color: "#6b7a6b" }}>{s.email}</div>
                <div>
                  <span className="pill" style={{ background: s.role === "admin" ? "#ecfdf5" : "#e3f2fd", color: s.role === "admin" ? "#07713c" : "#1565c0" }}>
                    {s.role}
                  </span>
                </div>
                <div>
                  <span className="pill" style={{ background: s.status === "active" ? "#e8f5e9" : "#fce4ec", color: s.status === "active" ? "#1b5e20" : "#c62828" }}>
                    {s.status}
                  </span>
                </div>
                <div style={{ fontSize: ".82rem", color: "#8a9a8a" }}>{new Date(s.created_at).toLocaleDateString()}</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="ba ba-edit" onClick={() => openEdit(s)}>
                    <RiPencilLine size={13} /> Edit
                  </button>
                  <button
                    className="ba"
                    style={{ borderColor: s.status === "active" ? "#fca5a5" : "#a5d6a7", color: s.status === "active" ? "#dc2626" : "#1b5e20", background: "#fff" }}
                    onClick={() => toggleStatus(s)}
                  >
                    {s.status === "active"
                      ? <><RiCloseCircleLine size={13} /> Deactivate</>
                      : <><RiCheckboxCircleLine size={13} /> Activate</>
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" style={{ maxWidth: "460px" }} onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div>
                <p className="mh-title">{editUser ? "Edit Staff Account" : "Add New Staff"}</p>
                <p className="mh-sub">{editUser ? "Update staff details" : "Create a new staff account"}</p>
              </div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {error   && <div className="alert-err">✕ {error}</div>}
              {success && <div className="alert-ok">✓ {success}</div>}
              <div className="sc2">
                <div className="sc2-title">Account Details</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div><label className="flabel">Full Name</label><input className="fi" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Juan Dela Cruz" /></div>
                  <div>
                    <label className="flabel">Email Address</label>
                    <input type="email" className="fi" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g. juan@hotel.com" disabled={!!editUser} style={editUser ? { background: "#f5f8f5", color: "#9aaa9a" } : {}} />
                  </div>
                  {!editUser && <div><label className="flabel">Password</label><input type="password" className="fi" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 characters" /></div>}
                </div>
              </div>
              <div className="sc2">
                <div className="sc2-title">Role & Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div><label className="flabel">Role</label><select className="fi" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ cursor: "pointer" }}><option value="staff">Staff</option><option value="receptionist">Receptionist</option><option value="admin">Admin</option></select></div>
                  <div><label className="flabel">Status</label><select className="fi" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ cursor: "pointer" }}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editUser ? "Save Changes" : "Create Account"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}