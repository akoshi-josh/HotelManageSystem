import React, { useState, useEffect } from "react";
import {
  RiCalendarLine, RiCheckboxCircleLine, RiHome4Line, RiCloseCircleLine,
  RiPencilLine, RiDeleteBinLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import ReservationModal from "../components/reservationModal";

const STATUS_CONFIG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20", label: "Confirmed" },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0", label: "Checked In" },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a", label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828", label: "Cancelled" },
  pending:     { bg: "#fff8e1", color: "#f57f17", label: "Pending" },
};

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
  borderRadius: "8px", fontSize: "0.9rem", outline: "none",
  fontFamily: "Arial,sans-serif", boxSizing: "border-box", background: "white", transition: "border 0.2s",
};

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
    status: "confirmed", notes: "", additional_charges: [],
    partial_payment: false,
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
    return Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / 86400000);
  };
  const calcRoomOnly = () => {
    const room = rooms.find(r => r.id === form.room_id);
    if (!room) return 0;
    return calcNights() * parseFloat(room.price);
  };
  const calcTotal = () => {
    const chargesTotal = (form.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    return calcRoomOnly() + chargesTotal;
  };
  const calcDownpayment      = () => Math.ceil(calcRoomOnly() * 0.30);
  const calcRemainingBalance = () => calcTotal() - calcDownpayment();

  const openAdd = () => {
    setEditRes(null);
    setForm({
      guest_name: "", guest_email: "", guest_phone: "",
      room_id: "", check_in: "", check_out: "",
      status: "confirmed", notes: "", additional_charges: [], partial_payment: true,
    });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (res) => {
    setEditRes(res);
    setForm({
      guest_name:  res.guest_name,
      guest_email: res.guest_email  || "",
      guest_phone: res.guest_phone  || "",
      room_id:     res.room_id      || "",
      check_in:    res.check_in,
      check_out:   res.check_out    || "",
      status:      res.status,
      notes:       res.notes        || "",
      additional_charges: (() => { try { return JSON.parse(res.additional_charges || "[]"); } catch { return []; } })(),
      partial_payment: res.partial_payment || false,
    });
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleSave = async () => {
    setError("");
    if (!form.guest_name) { setError("Guest name is required."); return; }
    if (form.guest_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.guest_email)) {
        setError("Please enter a valid email address (e.g. name@example.com)."); return;
      }
    }
    if (!form.room_id)  { setError("Please select a room."); return; }
    if (!form.check_in) { setError("Check-in date is required."); return; }
    if (form.check_out && new Date(form.check_out) <= new Date(form.check_in)) {
      setError("Check-out must be after check-in."); return;
    }

    setSaving(true);
    const room = rooms.find(r => r.id === form.room_id);
    const payload = {
      guest_name:   form.guest_name,
      guest_email:  form.guest_email,
      guest_phone:  form.guest_phone,
      room_id:      form.room_id,
      room_number:  room?.room_number,
      check_in:     form.check_in,
      ...(form.check_out ? { check_out: form.check_out } : {}),
      status:       form.status,
      total_amount: calcTotal(),
      notes:        form.notes,
      additional_charges: JSON.stringify(
        (form.additional_charges || []).map(c => ({ ...c, from_reservation: true }))
      ),
      ...(form.partial_payment && form.check_out
        ? { amount_paid: calcDownpayment(), pay_later: true }
        : {}),
    };

    if (editRes) {
      const { error: updateError } = await supabase.from("reservations").update(payload).eq("id", editRes.id);
      if (updateError) { setError(updateError.message); setSaving(false); return; }
    } else {
      const { error: insertError } = await supabase.from("reservations").insert(payload);
      if (insertError) { setError(insertError.message); setSaving(false); return; }
    }

    const roomStatusMap = {
      confirmed: "reserved", pending: "reserved",
      checked_in: "occupied", checked_out: "available", cancelled: "available",
    };
    await supabase.from("rooms").update({ status: roomStatusMap[form.status] || "reserved" }).eq("id", form.room_id);
    if (editRes && editRes.room_id && editRes.room_id !== form.room_id)
      await supabase.from("rooms").update({ status: "available" }).eq("id", editRes.room_id);

    await logActivity({
      action:      editRes ? `Updated reservation: ${form.guest_name}` : `Created reservation: ${form.guest_name}`,
      category:    editRes ? "edit" : "reservation",
      details:     `Room ${room?.room_number} | ${form.check_in} → ${form.check_out} | ₱${calcTotal().toLocaleString()}`,
      entity_type: "reservation",
      entity_id:   editRes?.id || "",
    });

    setSuccess(editRes ? "Reservation updated!" : "Reservation created!");
    setSaving(false);

    if (!editRes && form.guest_email) {
      const nights = form.check_out
        ? Math.max(0, (new Date(form.check_out) - new Date(form.check_in)) / 86400000)
        : 0;
      try {
        const emailRes = await fetch("http://localhost:5000/api/send-reservation-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guest_name:   form.guest_name,
            guest_email:  form.guest_email,
            room_number:  room?.room_number,
            room_type:    room?.type,
            check_in:     form.check_in,
            check_out:    form.check_out || null,
            nights,
            total_amount: calcTotal() || parseFloat(room?.price || 0),
            notes:        form.notes,
          }),
        });
        const emailData = await emailRes.json();
        if (!emailRes.ok) {
          console.error("Email failed:", emailData.error);
          alert("Reservation saved! But email failed: " + emailData.error);
        }
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e.message);
      }
    }

    fetchAll();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
  };

  const handleDelete = async (res) => {
    if (!window.confirm("Delete this reservation?")) return;
    await supabase.from("reservations").delete().eq("id", res.id);
    if (res.room_id) await supabase.from("rooms").update({ status: "available" }).eq("id", res.room_id);
    await logActivity({
      action:      `Deleted reservation: ${res.guest_name}`,
      category:    "delete",
      details:     `Room ${res.room_number} | ${res.check_in} → ${res.check_out}`,
      entity_type: "reservation",
      entity_id:   res.id,
    });
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

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Arial,sans-serif", background: "#f0f2f0", minHeight: "100vh" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#1a3c1a" }}>Reservations</h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.9rem" }}>Manage all guest reservations</p>
        </div>
        <button
          onClick={openAdd}
          style={{ padding: "12px 24px", background: "#2d6a2d", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "0.9rem", fontWeight: "700", fontFamily: "Arial,sans-serif", boxShadow: "0 4px 12px rgba(45,106,45,0.3)" }}
        >
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
        <input
          type="text" placeholder="🔍  Search guest, room, email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, ...inputStyle }}
          onFocus={e => e.target.style.borderColor = "#2d6a2d"}
          onBlur={e => e.target.style.borderColor = "#e8e8e8"}
        />
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "Arial,sans-serif", background: "white" }}
        >
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
              const nights = res.check_out ? Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000) : 0;
              return (
                <tr key={res.id} style={{ borderBottom: "1px solid #f5f5f5" }}
                  onMouseOver={e => e.currentTarget.style.background = "#fafafa"}
                  onMouseOut={e => e.currentTarget.style.background = "white"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontWeight: "600", fontSize: "0.92rem", color: "#222" }}>{res.guest_name}</div>
                    {res.guest_email && <div style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "2px" }}>{res.guest_email}</div>}
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>{res.room_number || "—"}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{res.check_in}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{res.check_out || <span style={{ color: "#f57f17", fontStyle: "italic" }}>Open</span>}</td>
                  <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>
                    {res.check_out
                      ? `${nights}n`
                      : <span style={{ fontSize: "0.75rem", color: "#f57f17", fontWeight: "700", background: "#fff8e1", padding: "2px 7px", borderRadius: "8px", border: "1px solid #ffe082" }}>Open</span>
                    }
                  </td>
                  <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "0.76rem", fontWeight: "700", background: s.bg, color: s.color }}>{s.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => openEdit(res)} style={{ padding: "6px 12px", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#f57f17", fontFamily: "Arial,sans-serif" }} title="Edit">
                        <RiPencilLine size={13} />
                      </button>
                      <button onClick={() => handleDelete(res)} style={{ padding: "6px 12px", background: "#fce4ec", border: "1px solid #ef9a9a", borderRadius: "7px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", color: "#c62828", fontFamily: "Arial,sans-serif" }} title="Delete">
                        <RiDeleteBinLine size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ReservationModal
          editRes={editRes}
          form={form}
          setForm={setForm}
          rooms={rooms}
          saving={saving}
          error={error}
          success={success}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          calcNights={calcNights}
          calcRoomOnly={calcRoomOnly}
          calcTotal={calcTotal}
          calcDownpayment={calcDownpayment}
          calcRemainingBalance={calcRemainingBalance}
          selectableRooms={getSelectableRooms()}
        />
      )}

    </div>
  );
}