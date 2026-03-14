import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const STATUS_CFG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20",  label: "Confirmed"   },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0",  label: "Checked In"  },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a",  label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828",  label: "Cancelled"   },
  pending:     { bg: "#fff8e1", color: "#f57f17",  label: "Pending"     },
};

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
.rg-sub  { font-size:.73rem; color:#8a9a8a; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.cell-room { font-weight:700; font-size:.86rem; color:#07713c; }
.cell-date { font-size:.84rem; color:#6b7a6b; }
.cell-amt  { font-weight:700; font-size:.86rem; color:#07713c; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; text-transform:capitalize; }
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
.mbody::-webkit-scrollbar { width:4px; }
.mfoot { padding:14px 28px; border-top:1px solid #e4ebe4; display:flex; gap:12px; flex-shrink:0; }
.sc2 { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:14px; border:1px solid #e4ebe4; }
.sc2-title { font-size:.7rem; font-weight:700; color:#07713c; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
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
.tot-banner { margin-top:12px; background:#07713c; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; }
`;

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editRes,      setEditRes]      = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "",
    room_id: "", check_in: "", check_out: "",
    status: "confirmed", notes: "",
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: r }, { data: rm }] = await Promise.all([
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("room_number"),
    ]);
    setReservations(r || []);
    setRooms(rm || []);
    setLoading(false);
  };

  const selectableRooms = rooms.filter(r => (editRes && r.id === editRes.room_id) || r.status === "available");
  const selectedRoom    = rooms.find(r => r.id === form.room_id);
  const calcNights      = () => (!form.check_in || !form.check_out) ? 0 : Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / (1000 * 60 * 60 * 24));
  const calcTotal       = () => selectedRoom ? calcNights() * parseFloat(selectedRoom.price) : 0;

  const openAdd = () => {
    setEditRes(null);
    setForm({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: "", check_out: "", status: "confirmed", notes: "" });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (res) => {
    setEditRes(res);
    setForm({ guest_name: res.guest_name, guest_email: res.guest_email || "", guest_phone: res.guest_phone || "", room_id: res.room_id || "", check_in: res.check_in, check_out: res.check_out, status: res.status, notes: res.notes || "" });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.guest_name)  { setError("Guest name is required."); return; }
    if (!form.room_id)     { setError("Please select a room."); return; }
    if (!form.check_in || !form.check_out) { setError("Check-in and check-out dates are required."); return; }
    if (new Date(form.check_out) <= new Date(form.check_in)) { setError("Check-out must be after check-in."); return; }
    setSaving(true);
    const rm = rooms.find(r => r.id === form.room_id);
    const payload = {
      guest_name: form.guest_name, guest_email: form.guest_email,
      guest_phone: form.guest_phone, room_id: form.room_id,
      room_number: rm?.room_number, check_in: form.check_in,
      check_out: form.check_out, status: form.status,
      total_amount: calcTotal(), notes: form.notes,
    };
    if (editRes) {
      const { error: e } = await supabase.from("reservations").update(payload).eq("id", editRes.id);
      if (e) { setError(e.message); setSaving(false); return; }
    } else {
      const { error: e } = await supabase.from("reservations").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
    }
    const statusToRoom = { confirmed: "reserved", pending: "reserved", checked_in: "occupied", checked_out: "available", cancelled: "available" };
    await supabase.from("rooms").update({ status: statusToRoom[form.status] || "reserved" }).eq("id", form.room_id);
    if (editRes && editRes.room_id && editRes.room_id !== form.room_id) {
      await supabase.from("rooms").update({ status: "available" }).eq("id", editRes.room_id);
    }
    setSuccess(editRes ? "Reservation updated!" : "Reservation created!");
    setSaving(false);
    fetchAll();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
  };

  const handleDelete = async (res) => {
    if (!window.confirm("Delete this reservation?")) return;
    await supabase.from("reservations").delete().eq("id", res.id);
    if (res.room_id) await supabase.from("rooms").update({ status: "available" }).eq("id", res.room_id);
    fetchAll();
  };

  const filtered = reservations.filter(r => {
    const ms = r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
               (r.room_number || "").includes(search) ||
               (r.guest_email || "").toLowerCase().includes(search.toLowerCase());
    return ms && (filterStatus === "all" || r.status === filterStatus);
  });

  const cols = "2fr .8fr 1fr 1fr .8fr 1fr 1fr .8fr";

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Reservations</h2>
            <p className="page-sub">Manage all guest reservations</p>
          </div>
          <button className="btn-primary" onClick={openAdd}>＋ New Reservation</button>
        </div>

        <div className="sc-4">
          {[
            { lbl: "Total",      val: reservations.length,                                     ico: "📅", bg: "#e8f5e9", c: "#1b5e20" },
            { lbl: "Confirmed",  val: reservations.filter(r => r.status === "confirmed").length,ico: "✅", bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Checked In", val: reservations.filter(r => r.status === "checked_in").length,ico:"🏠",bg: "#f3e5f5", c: "#6a1b9a" },
            { lbl: "Cancelled",  val: reservations.filter(r => r.status === "cancelled").length,ico: "❌", bg: "#fce4ec", c: "#c62828" },
          ].map(({ lbl, val, ico, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row"><span className="sc-ico">{ico}</span><span className="sc-lbl" style={{ color: c }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" type="text" placeholder="🔍  Search guest, room, email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fselect" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="tc">
          <div className="tc-hdr">
            <div className="tc-title">All Reservations</div>
            <span className="tc-badge">{filtered.length} results</span>
          </div>
          <div className="tc-head" style={{ gridTemplateColumns: cols }}>
            {["Guest","Room","Check-In","Check-Out","Nights","Total","Status","Actions"].map(h => (
              <div key={h} className="th">{h}</div>
            ))}
          </div>
          <div className="tc-scroll">
            {loading ? (
              <div className="empty">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">No reservations found.</div>
            ) : filtered.map(res => {
              const s = STATUS_CFG[res.status] || STATUS_CFG.pending;
              const nights = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24));
              return (
                <div key={res.id} className="tr" style={{ gridTemplateColumns: cols }}>
                  <div className="rg">
                    <div className="av">{(res.guest_name || "G").slice(0, 2).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="rg-name">{res.guest_name}</div>
                      {res.guest_email && <div className="rg-sub">{res.guest_email}</div>}
                    </div>
                  </div>
                  <div className="cell-room">{res.room_number || "—"}</div>
                  <div className="cell-date">{res.check_in}</div>
                  <div className="cell-date">{res.check_out}</div>
                  <div style={{ fontSize: ".84rem", color: "#6b7a6b" }}>{nights}n</div>
                  <div className="cell-amt">₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
                  <div><span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span></div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="ba ba-edit" onClick={() => openEdit(res)}>✏️</button>
                    <button className="ba ba-del"  onClick={() => handleDelete(res)}>🗑️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div>
                <p className="mh-title">{editRes ? "✏️ Edit Reservation" : "📅 New Reservation"}</p>
                <p className="mh-sub">{editRes ? "Update reservation details" : "Fill in the details below"}</p>
              </div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {error   && <div className="alert-err">✕ {error}</div>}
              {success && <div className="alert-ok">✓ {success}</div>}

              <div className="sc2">
                <div className="sc2-title">👤 Guest Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label className="flabel">Full Name *</label>
                    <input className="fi" value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} placeholder="e.g. Juan Dela Cruz" />
                  </div>
                  <div>
                    <label className="flabel">Email</label>
                    <input type="email" className="fi" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} placeholder="guest@email.com" />
                  </div>
                  <div>
                    <label className="flabel">Phone</label>
                    <input className="fi" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} placeholder="+63 9XX XXX XXXX" />
                  </div>
                </div>
              </div>

              <div className="sc2">
                <div className="sc2-title">🛏️ Room & Dates</div>
                <div style={{ marginBottom: "14px" }}>
                  <label className="flabel">Select Room *</label>
                  <select className="fi" value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} style={{ cursor: "pointer" }}>
                    <option value="">— Choose an available room —</option>
                    {selectableRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                </div>
                {selectedRoom && (
                  <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "700", color: "#07713c" }}>Room {selectedRoom.room_number}</span>
                      <span style={{ color: "#6b7a6b", fontSize: ".85rem", marginLeft: "10px" }}>{selectedRoom.type} · Floor {selectedRoom.floor}</span>
                    </div>
                    <span style={{ fontWeight: "700", color: "#07713c" }}>₱{parseFloat(selectedRoom.price).toLocaleString()}/night</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label className="flabel">Check-In *</label>
                    <input type="date" className="fi" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} />
                  </div>
                  <div>
                    <label className="flabel">Check-Out *</label>
                    <input type="date" className="fi" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} />
                  </div>
                </div>
                {calcNights() > 0 && (
                  <div className="tot-banner">
                    <span style={{ color: "rgba(255,255,255,.72)", fontSize: ".86rem" }}>
                      {calcNights()} nights × ₱{selectedRoom ? parseFloat(selectedRoom.price).toLocaleString() : 0}
                    </span>
                    <span style={{ color: "#fff", fontWeight: "700" }}>Total: ₱{calcTotal().toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="sc2">
                <div className="sc2-title">📋 Status & Notes</div>
                <div style={{ marginBottom: "14px" }}>
                  <label className="flabel">Status</label>
                  <select className="fi" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ cursor: "pointer" }}>
                    {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flabel">Notes (Optional)</label>
                  <textarea className="fi" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests..." rows={3} style={{ resize: "vertical" }} />
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editRes ? "Save Changes" : "Create Reservation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}