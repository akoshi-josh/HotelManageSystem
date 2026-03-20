import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import {
  RiCalendarLine, RiCheckboxCircleLine, RiHome4Line, RiCloseCircleLine,
  RiPencilLine, RiDeleteBinLine,
} from "react-icons/ri";

const STATUS_CONFIG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20", label: "Confirmed" },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0", label: "Checked In" },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a", label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828", label: "Cancelled" },
  pending:     { bg: "#fff8e1", color: "#f57f17", label: "Pending" },
};

function AddChargeInline({ onAdd }) {
  const [name, setName]     = React.useState("");
  const [amount, setAmount] = React.useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Room service, Extra bed..."
        style={{ flex: 2, padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()} />
      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="₱ Amount"
        style={{ flex: 1, padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()} />
      <button onClick={handle} disabled={!name.trim() || !amount}
        style={{ padding: "9px 16px", background: name.trim() && amount ? "#2d6a2d" : "#e0e0e0", color: name.trim() && amount ? "white" : "#aaa", border: "none", borderRadius: "8px", cursor: name.trim() && amount ? "pointer" : "not-allowed", fontWeight: "700", fontSize: "0.82rem", fontFamily: "Arial,sans-serif", whiteSpace: "nowrap" }}>
        + Add
      </button>
    </div>
  );
}

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRes, setEditRes] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form, setForm] = useState({
    guest_name: "", guest_email: "", guest_phone: "",
    room_id: "", check_in: "", check_out: "",
    status: "confirmed", notes: "", additional_charges: []
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [{ data: resData }, { data: roomData }] = await Promise.all([
      supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("room_number"),
    ]);
    setReservations(resData || []);
    setRooms(roomData || []);
    setLoading(false);
  };

  const getSelectableRooms = () => rooms.filter(r => {
    if (editRes && r.id === editRes.room_id) return true;
    return r.status === "available";
  });

  const calcNights = () => {
    if (!form.check_in || !form.check_out) return 0;
    return Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / (1000 * 60 * 60 * 24));
  };

  const calcTotal = () => {
    const room = rooms.find(r => r.id === form.room_id);
    if (!room) return 0;
    return calcNights() * parseFloat(room.price);
  };

  const selectedRoom = rooms.find(r => r.id === form.room_id);

  const openAdd = () => {
    setEditRes(null);
    setForm({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: "", check_out: "", status: "confirmed", notes: "", additional_charges: [] });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (res) => {
    setEditRes(res);
    setForm({
      guest_name: res.guest_name, guest_email: res.guest_email || "",
      guest_phone: res.guest_phone || "", room_id: res.room_id || "",
      check_in: res.check_in, check_out: res.check_out,
      status: res.status, notes: res.notes || "",
      additional_charges: (() => { try { return JSON.parse(res.additional_charges || "[]"); } catch { return []; } })()
    });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.guest_name)  { setError("Guest name is required."); return; }
    if (!form.room_id)     { setError("Please select a room."); return; }
    if (!form.check_in)    { setError("Check-in date is required."); return; }
    if (!form.check_out)   { setError("Check-out date is required."); return; }
    if (new Date(form.check_out) <= new Date(form.check_in)) { setError("Check-out must be after check-in."); return; }
    setSaving(true);
    const room = rooms.find(r => r.id === form.room_id);
    const payload = {
      guest_name: form.guest_name, guest_email: form.guest_email,
      guest_phone: form.guest_phone, room_id: form.room_id,
      room_number: room?.room_number, check_in: form.check_in,
      check_out: form.check_out, status: form.status,
      total_amount: calcTotal(), notes: form.notes,
      additional_charges: JSON.stringify(form.additional_charges || [])
    };
    if (editRes) {
      const { error: updateError } = await supabase.from("reservations").update(payload).eq("id", editRes.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from("reservations").insert(payload);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }
    const roomStatusMap = { confirmed: "reserved", pending: "reserved", checked_in: "occupied", checked_out: "available", cancelled: "available" };
    await supabase.from("rooms").update({ status: roomStatusMap[form.status] || "reserved" }).eq("id", form.room_id);
    if (editRes && editRes.room_id && editRes.room_id !== form.room_id)
      await supabase.from("rooms").update({ status: "available" }).eq("id", editRes.room_id);
    await logActivity({
      action: editRes ? `Updated reservation: ${form.guest_name}` : `Created reservation: ${form.guest_name}`,
      category: editRes ? "edit" : "reservation",
      details: `Room ${room?.room_number} | ${form.check_in} → ${form.check_out} | ₱${calcTotal().toLocaleString()}`,
      entity_type: "reservation", entity_id: editRes?.id || ""
    });
    setSuccess(editRes ? "Reservation updated!" : "Reservation created!");
    setSaving(false); fetchAll();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
  };

  const handleDelete = async (res) => {
    if (!window.confirm("Delete this reservation?")) return;
    await supabase.from("reservations").delete().eq("id", res.id);
    if (res.room_id) await supabase.from("rooms").update({ status: "available" }).eq("id", res.room_id);
    await logActivity({ action: `Deleted reservation: ${res.guest_name}`, category: "delete", details: `Room ${res.room_number} | ${res.check_in} → ${res.check_out}`, entity_type: "reservation", entity_id: res.id });
    fetchAll();
  };

  const filtered = reservations.filter(r => {
    const matchSearch =
      r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.room_number || "").includes(search) ||
      (r.guest_email || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === "all" || r.status === filterStatus);
  });

  const stats = {
    total:      reservations.length,
    confirmed:  reservations.filter(r => r.status === "confirmed").length,
    checked_in: reservations.filter(r => r.status === "checked_in").length,
    cancelled:  reservations.filter(r => r.status === "cancelled").length,
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
    borderRadius: "8px", fontSize: "0.9rem", outline: "none",
    fontFamily: "Arial,sans-serif", boxSizing: "border-box", background: "white", transition: "border 0.2s"
  };
  const labelStyle = {
    display: "block", fontSize: "0.8rem", fontWeight: "700",
    color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px"
  };
  const selectableRooms = getSelectableRooms();

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Arial,sans-serif", background: "#f0f2f0", minHeight: "100vh" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#1a3c1a" }}>Reservations</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.9rem" }}>Manage all guest reservations</p>
        </div>
        <button onClick={openAdd} style={{ padding: "12px 24px", background: "#2d6a2d", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "700", fontFamily: "Arial,sans-serif", boxShadow: "0 4px 12px rgba(45,106,45,0.3)" }}>
          ＋ New Reservation
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total",      value: stats.total,      Icon: RiCalendarLine,       bg: "#e8f5e9", color: "#1b5e20" },
          { label: "Confirmed",  value: stats.confirmed,  Icon: RiCheckboxCircleLine, bg: "#e3f2fd", color: "#1565c0" },
          { label: "Checked In", value: stats.checked_in, Icon: RiHome4Line,          bg: "#f3e5f5", color: "#6a1b9a" },
          { label: "Cancelled",  value: stats.cancelled,  Icon: RiCloseCircleLine,    bg: "#fce4ec", color: "#c62828" },
        ].map(({ label, value, Icon, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: "14px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: "0.85rem", color, fontWeight: "600" }}>{label}</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1a1a1a" }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "14px", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "20px", display: "flex", gap: "16px", alignItems: "center" }}>
        <input type="text" placeholder="🔍  Search guest, room, email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, ...inputStyle }}
          onFocus={e => e.target.style.borderColor = "#2d6a2d"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "Arial,sans-serif", background: "white" }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial,sans-serif" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #f0f0f0" }}>
              {["Guest","Room","Check-In","Check-Out","Nights","Total","Status","Actions"].map(h => (
                <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.78rem", color: "#888", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No reservations found.</td></tr>
            ) : filtered.map(res => {
              const s = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
              const nights = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / (1000 * 60 * 60 * 24));
              return (
                <tr key={res.id} style={{ borderBottom: "1px solid #f5f5f5" }}
                  onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseOut={e => e.currentTarget.style.background = "white"}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "600", fontSize: "0.92rem", color: "#222" }}>{res.guest_name}</div>
                    {res.guest_email && <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "2px" }}>{res.guest_email}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>{res.room_number || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{res.check_in}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{res.check_out}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{nights}n</td>
                  <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.76rem", fontWeight: "700", background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openEdit(res)} style={{ padding: "6px 12px", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#f57f17", fontFamily: "Arial,sans-serif" }} title="Edit"><RiPencilLine size={13} /></button>
                      <button onClick={() => handleDelete(res)} style={{ padding: "6px 12px", background: "#fce4ec", border: "1px solid #ef9a9a", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#c62828", fontFamily: "Arial,sans-serif" }} title="Delete"><RiDeleteBinLine size={13} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "600px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif" }}>
            <div style={{ background: "linear-gradient(135deg, #1e4d1e, #2d6a2d)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "white" }}>{editRes ? "Edit Reservation" : "New Reservation"}</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>{editRes ? "Update reservation details" : "Fill in the details to create a new reservation"}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ padding: "28px 30px" }}>
              {error   && <div style={{ background: "#fff3f3", border: "1px solid #ffcdd2", color: "#c62828", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.88rem" }}>⚠️ {error}</div>}
              {success && <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#1b5e20", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.88rem" }}>✅ {success}</div>}

              {/* Guest Info */}
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>👤 Guest Information</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Full Name <span style={{ color: "#e53935" }}>*</span></label>
                    <input type="text" value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} placeholder="e.g. Juan Dela Cruz" style={inputStyle} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} placeholder="guest@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="text" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} placeholder="+63 9XX XXX XXXX" style={inputStyle} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                </div>
              </div>

              {/* Room & Dates */}
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>🛏️ Room & Dates</div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Select Room <span style={{ color: "#e53935" }}>*</span></label>
                  <select value={form.room_id} onChange={e => setForm({ ...form, room_id: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="">— Choose an available room —</option>
                    {selectableRooms.length === 0 ? <option disabled>No available rooms right now</option>
                      : selectableRooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night</option>)}
                  </select>
                  {selectableRooms.length === 0 && <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#e65100" }}>⚠️ All rooms are currently occupied or under maintenance.</p>}
                </div>
                {selectedRoom && (
                  <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "700", color: "#1a3c1a", fontSize: "0.95rem" }}>Room {selectedRoom.room_number}</span>
                      <span style={{ color: "#555", fontSize: "0.85rem", marginLeft: "10px" }}>{selectedRoom.type} · Floor {selectedRoom.floor}</span>
                    </div>
                    <span style={{ fontWeight: "700", color: "#1a3c1a", fontSize: "0.95rem" }}>₱{parseFloat(selectedRoom.price).toLocaleString()}/night</span>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Check-In Date <span style={{ color: "#e53935" }}>*</span></label>
                    <input type="date" value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Check-Out Date <span style={{ color: "#e53935" }}>*</span></label>
                    <input type="date" value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} style={inputStyle} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                </div>
                {calcNights() > 0 && (
                  <div style={{ marginTop: "14px", background: "#1a3c1a", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>{calcNights()} night{calcNights() !== 1 ? "s" : ""} × ₱{selectedRoom ? parseFloat(selectedRoom.price).toLocaleString() : 0}</div>
                    <div style={{ color: "white", fontWeight: "700", fontSize: "1.1rem" }}>Total: ₱{calcTotal().toLocaleString()}</div>
                  </div>
                )}
              </div>

              {/* Status & Notes */}
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>Status & Notes</div>
                <div style={{ marginBottom: "14px" }}>
                  <label style={labelStyle}>Reservation Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Notes / Special Requests</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any special requests, preferences, or notes..." rows={3} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                </div>
              </div>

              {/* Additional Charges */}
              <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "14px" }}>Additional Charges / Requests</div>
                {(form.additional_charges || []).length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    {(form.additional_charges || []).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f8fdf8", border: "1px solid #e8f5e8", borderRadius: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.85rem", color: "#333" }}>{c.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontWeight: "700", color: "#2d6a2d", fontSize: "0.85rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                          <button onClick={() => setForm({ ...form, additional_charges: (form.additional_charges || []).filter(x => x.id !== c.id) })} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: "1rem", lineHeight: 1, padding: "0 2px" }}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <AddChargeInline onAdd={charge => setForm({ ...form, additional_charges: [...(form.additional_charges || []), charge] })} />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "13px", background: saving ? "#aaa" : "#2d6a2d", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", boxShadow: saving ? "none" : "0 4px 12px rgba(45,106,45,0.35)" }}>
                  {saving ? "Saving..." : editRes ? "Save Changes" : "Create Reservation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}