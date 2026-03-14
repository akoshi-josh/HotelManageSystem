import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const ROOM_STATUS = {
  available:   { bg: "#e8f5e9", color: "#1b5e20", label: "Available"   },
  occupied:    { bg: "#fce4ec", color: "#c62828", label: "Occupied"    },
  maintenance: { bg: "#fff3e0", color: "#e65100", label: "Maintenance" },
  reserved:    { bg: "#e3f2fd", color: "#1565c0", label: "Reserved"    },
};

const TYPE_ICONS = { Standard: "🛏️", Deluxe: "✨", Suite: "👑" };

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.sc-ico { font-size:1.2rem; }
.sc-lbl { font-size:.8rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { display:flex; gap:14px; align-items:center; background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; }
.finput { flex:1; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.fselect { padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; cursor:pointer; }
.fselect:focus { border-color:#07713c; }
.btn-primary { padding:11px 22px; background:#07713c; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); white-space:nowrap; }
.btn-primary:hover { background:#05592f; }
.room-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }
.room-card { background:#fff; border-radius:16px; overflow:hidden; border:1px solid #e4ebe4; box-shadow:0 2px 8px rgba(0,0,0,.05); transition:transform .2s,box-shadow .2s; }
.room-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(7,113,60,.12); }
.room-top { background:linear-gradient(135deg,#07713c,#0a9150); padding:20px 22px; color:#fff; }
.room-body { padding:20px 22px; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
.ba { display:inline-flex; align-items:center; gap:3px; padding:5px 11px; border-radius:7px; border:1.5px solid; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; cursor:pointer; transition:background .15s; }
.ba-edit { border-color:#fde68a; color:#92400e; background:#fffbeb; }
.ba-edit:hover { background:#fef3c7; }
.ba-del  { border-color:#fca5a5; color:#dc2626; background:#fff; }
.ba-del:hover  { background:#fef2f2; }
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
.flabel { display:block; font-size:.78rem; font-weight:700; color:#3a6a3a; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#07713c; box-sizing:border-box; transition:border-color .2s,box-shadow .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.btn-cancel { flex:1; padding:12px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-cancel:hover { background:#f4f6f0; }
.btn-confirm { flex:2; padding:12px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); }
.btn-confirm:hover:not(:disabled) { background:#05592f; }
.btn-confirm:disabled { background:#a8b8a8; cursor:not-allowed; box-shadow:none; }
.alert-ok  { padding:10px 15px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.84rem; margin-bottom:14px; }
.alert-err { padding:10px 15px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.84rem; margin-bottom:14px; }
`;

export default function Rooms() {
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editRoom,     setEditRoom]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [form, setForm] = useState({
    room_number: "", type: "Standard", floor: "",
    price: "", status: "available", description: "",
  });

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    const { data } = await supabase.from("rooms").select("*").order("room_number");
    setRooms(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditRoom(null);
    setForm({ room_number: "", type: "Standard", floor: "", price: "", status: "available", description: "" });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (r) => {
    setEditRoom(r);
    setForm({ room_number: r.room_number, type: r.type, floor: r.floor, price: r.price, status: r.status, description: r.description || "" });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.room_number || !form.type || !form.floor || !form.price) {
      setError("Room number, type, floor and price are required."); return;
    }
    setSaving(true);
    const payload = {
      room_number: form.room_number, type: form.type,
      floor: parseInt(form.floor), price: parseFloat(form.price),
      status: form.status, description: form.description,
    };
    if (editRoom) {
      const { error: e } = await supabase.from("rooms").update(payload).eq("id", editRoom.id);
      if (e) { setError(e.message); setSaving(false); return; }
      setSuccess("Room updated successfully!");
    } else {
      const { error: e } = await supabase.from("rooms").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
      setSuccess("Room added successfully!");
    }
    setSaving(false);
    fetchRooms();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    fetchRooms();
  };

  const filtered = rooms.filter(r => {
    const ms = r.room_number.toLowerCase().includes(search.toLowerCase()) ||
               r.type.toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === "all" || r.status === filterStatus) &&
                 (filterType   === "all" || r.type   === filterType);
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Room Management</h2>
            <p className="page-sub">Manage all hotel rooms and their status</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>＋ Add Room</button>
        </div>

        <div className="sc-4">
          {[
            { lbl: "Total Rooms",  val: rooms.length,                                       ico: "🛏️", bg: "#e8f5e9", c: "#1b5e20" },
            { lbl: "Available",   val: rooms.filter(r => r.status === "available").length,  ico: "✅", bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Occupied",    val: rooms.filter(r => r.status === "occupied").length,   ico: "🔴", bg: "#fce4ec", c: "#c62828" },
            { lbl: "Maintenance", val: rooms.filter(r => r.status === "maintenance").length,ico: "🔧", bg: "#fff3e0", c: "#e65100" },
          ].map(({ lbl, val, ico, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row"><span className="sc-ico">{ico}</span><span className="sc-lbl" style={{ color: c }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" type="text" placeholder="🔍  Search room number or type..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fselect" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(ROOM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="fselect" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {["Standard","Deluxe","Suite"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading rooms...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No rooms found.</div>
        ) : (
          <div className="room-grid">
            {filtered.map(r => {
              const s = ROOM_STATUS[r.status] || ROOM_STATUS.available;
              return (
                <div key={r.id} className="room-card">
                  <div className="room-top">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: ".78rem", opacity: 0.7, marginBottom: "4px" }}>Room</div>
                        <div style={{ fontSize: "2rem", fontWeight: "700" }}>{r.room_number}</div>
                      </div>
                      <span style={{ fontSize: "2rem" }}>{TYPE_ICONS[r.type] || "🛏️"}</span>
                    </div>
                  </div>
                  <div className="room-body">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span style={{ fontSize: ".9rem", fontWeight: "600", color: "#333" }}>{r.type}</span>
                      <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: ".85rem", color: "#8a9a8a", marginBottom: "6px" }}>Floor {r.floor}</div>
                    {r.description && (
                      <div style={{ fontSize: ".82rem", color: "#9aaa9a", marginBottom: "12px", lineHeight: "1.5" }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#07713c", marginBottom: "14px" }}>
                      ₱{parseFloat(r.price).toLocaleString()}
                      <span style={{ fontSize: ".74rem", fontWeight: "400", color: "#9aaa9a" }}>/night</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="ba ba-edit" style={{ flex: 1, justifyContent: "center" }} onClick={() => openEdit(r)}>✏️ Edit</button>
                      <button className="ba ba-del"  style={{ flex: 1, justifyContent: "center" }} onClick={() => handleDelete(r.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" style={{ maxWidth: "460px" }} onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div>
                <p className="mh-title">{editRoom ? "✏️ Edit Room" : "🛏️ Add New Room"}</p>
                <p className="mh-sub">Fill in the room details</p>
              </div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {error   && <div className="alert-err">✕ {error}</div>}
              {success && <div className="alert-ok">✓ {success}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "14px" }}>
                <div>
                  <label className="flabel">Room Number</label>
                  <input className="fi" value={form.room_number} onChange={e => setForm({ ...form, room_number: e.target.value })} placeholder="e.g. 101" />
                </div>
                <div>
                  <label className="flabel">Floor</label>
                  <input type="number" className="fi" value={form.floor} onChange={e => setForm({ ...form, floor: e.target.value })} placeholder="e.g. 1" />
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="flabel">Price / Night (₱)</label>
                  <input type="number" className="fi" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 1500" />
                </div>
                <div>
                  <label className="flabel">Room Type</label>
                  <select className="fi" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ cursor: "pointer" }}>
                    {["Standard","Deluxe","Suite"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flabel">Status</label>
                  <select className="fi" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ cursor: "pointer" }}>
                    {Object.entries(ROOM_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="flabel">Description (Optional)</label>
                <textarea className="fi" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="e.g. Ocean view room..." rows={3} style={{ resize: "vertical" }} />
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editRoom ? "Save Changes" : "Add Room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}