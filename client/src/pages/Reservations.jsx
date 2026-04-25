import React, { useState, useEffect } from "react";
import {
  RiCalendarLine, RiCheckboxCircleLine, RiHome4Line, RiCloseCircleLine,
  RiPencilLine, RiDeleteBinLine, RiSearchLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import ReservationModal from "../components/reservationModal";

const STATUS_CONFIG = {
  confirmed:   { bg: "#e8f5e9", color: "#07713c", label: "Confirmed"   },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0", label: "Checked In"  },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a", label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828", label: "Cancelled"   },
  pending:     { bg: "#fdf8e1", color: "#7a5f00", label: "Pending"     },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c; --green-dark: #055a2f; --green-light: #e8f5ee;
  --gold: #dbba14; --gold-light: #fdf8e1;
  --bg: #f2f5f0; --white: #ffffff; --border: #e2e8e2;
  --text: #1a2e1a; --text-sec: #5a6e5a; --text-muted: #8fa08f;
  --radius: 14px; --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.11);
}

.rv-root { padding: 24px 28px 48px; font-family: 'Roboto', sans-serif; background: var(--bg); min-height: 100%; }

/* ── HEADER ── */
.rv-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.rv-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.rv-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 24px;
  background: var(--gold); border-radius: 2px; flex-shrink: 0;
}
.rv-sub { font-size: .84rem; color: var(--text-muted); margin: 5px 0 0; }

.rv-btn-new {
  padding: 10px 20px; background: var(--green); color: #fff;
  border: none; border-radius: 10px; cursor: pointer;
  font-size: .86rem; font-weight: 700; font-family: 'Roboto', sans-serif;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  box-shadow: 0 4px 14px rgba(7,113,60,.22);
  transition: background .2s, transform .15s;
  position: relative; overflow: hidden;
}
.rv-btn-new::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rv-btn-new:hover { background: var(--green-dark); transform: translateY(-1px); }
.rv-btn-new:hover::after { opacity: 1; }

/* ── STAT CARDS ── */
.rv-sc-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.rv-sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.rv-sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.rv-sc::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rv-sc:hover::after { opacity: 1; }
.rv-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rv-sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.rv-sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── FILTER BAR ── */
.rv-fbar {
  background: var(--white); border-radius: var(--radius);
  padding: 13px 20px; margin-bottom: 20px;
  border: 1px solid var(--border); box-shadow: var(--shadow);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.rv-search-wrap { flex: 1; min-width: 180px; position: relative; display: flex; align-items: center; }
.rv-search-icon { position: absolute; left: 11px; color: var(--text-muted); pointer-events: none; }
.rv-finput {
  padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px;
  font-size: .86rem; font-family: 'Roboto', sans-serif; color: var(--text);
  outline: none; background: var(--bg); transition: border-color .2s, box-shadow .2s;
}
.rv-finput.with-icon { padding-left: 34px; width: 100%; }
.rv-finput:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); background: var(--white); }
.rv-finput::placeholder { color: var(--text-muted); font-style: italic; }

/* ── TABLE CARD ── */
.rv-table-card {
  background: var(--white); border-radius: var(--radius);
  box-shadow: var(--shadow); border: 1px solid var(--border); overflow: hidden;
}
.rv-table { width: 100%; border-collapse: collapse; font-family: 'Roboto', sans-serif; }
.rv-thead tr { background: var(--green-light); border-bottom: 2px solid var(--border); }
.rv-thead th {
  padding: 12px 16px; text-align: left;
  font-size: .63rem; color: var(--text-muted);
  font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
}
.rv-tr { border-bottom: 1px solid #f4f7f4; transition: background .15s; }
.rv-tr:last-child { border-bottom: none; }
.rv-tr:hover { background: #f5fdf5; }
.rv-td { padding: 13px 16px; }
.rv-guest-name { font-weight: 600; font-size: .9rem; color: var(--text); }
.rv-guest-email { font-size: .76rem; color: var(--text-muted); margin-top: 2px; }
.rv-room-num { font-weight: 700; color: var(--green); }
.rv-date { font-size: .86rem; color: var(--text-sec); }
.rv-open-badge {
  font-size: .72rem; font-weight: 700;
  background: var(--gold-light); color: #7a5f00;
  padding: 2px 8px; border-radius: 20px;
  border: 1px solid rgba(219,186,20,.3);
}
.rv-nights { font-size: .86rem; color: var(--text-sec); }
.rv-total { font-weight: 700; color: var(--green); }
.rv-status-pill { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: .7rem; font-weight: 700; }
.rv-actions { display: flex; gap: 6px; }
.rv-btn-action {
  padding: 6px 11px; border-radius: 7px; border: 1.5px solid;
  cursor: pointer; font-size: .74rem; font-weight: 700;
  font-family: 'Roboto', sans-serif; display: inline-flex; align-items: center;
  transition: background .15s;
}
.rv-btn-edit { border-color: rgba(219,186,20,.4); color: #7a5f00; background: var(--gold-light); }
.rv-btn-edit:hover { background: rgba(219,186,20,.2); }
.rv-btn-del  { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
.rv-btn-del:hover  { background: #fee2e2; }
.rv-empty { padding: 48px; text-align: center; color: var(--text-muted); font-size: .88rem; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) { .rv-sc-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px) {
  .rv-root { padding: 20px 20px 48px; }
  .rv-table { font-size: .85rem; }
  .rv-thead th, .rv-td { padding: 10px 12px; }
}
@media (max-width: 640px) {
  .rv-sc-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .rv-root { padding: 16px 14px 48px; }
  .rv-title { font-size: 1.3rem; }
  .rv-fbar { flex-direction: column; align-items: stretch; }
  .rv-search-wrap { min-width: unset; }
  .rv-finput:not(.with-icon) { width: 100%; }
}
@media (max-width: 420px) {
  .rv-sc-4 { grid-template-columns: 1fr; }
}
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

    // Add payment history for 30% downpayment at reservation
if (!editRes && form.partial_payment && form.check_out) {
  const { data: newRes } = await supabase
    .from("reservations")
    .select("id, payment_history")
    .eq("guest_name", form.guest_name.trim())
    .eq("room_id", form.room_id)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (newRes) {
    const history = (() => { try { return JSON.parse(newRes.payment_history || "[]"); } catch { return []; } })();
    const downpayment = calcDownpayment();
    history.push({
      type:   "inhouse_payment",
      amount: downpayment,
      date:   new Date().toISOString().split("T")[0],
      note:   `30% downpayment collected at reservation · ₱${downpayment.toLocaleString()}`,
    });
    await supabase.from("reservations")
      .update({ payment_history: JSON.stringify(history) })
      .eq("id", newRes.id);
  }
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
    <>
      <style>{CSS}</style>
      <div className="rv-root">

        <div className="rv-hdr">
          <div>
            <h2 className="rv-title">Reservations</h2>
            <p className="rv-sub">Manage all guest reservations</p>
          </div>
          <button className="rv-btn-new" onClick={openAdd}>
            ＋ New Reservation
          </button>
        </div>

        <div className="rv-sc-4">
          {[
            { label: "Total",      value: stats.total,      Icon: RiCalendarLine,       bg: "#e8f5e9", color: "#07713c" },
            { label: "Confirmed",  value: stats.confirmed,  Icon: RiCheckboxCircleLine, bg: "#e3f2fd", color: "#1565c0" },
            { label: "Checked In", value: stats.checked_in, Icon: RiHome4Line,          bg: "#f3e5f5", color: "#6a1b9a" },
            { label: "Cancelled",  value: stats.cancelled,  Icon: RiCloseCircleLine,    bg: "#fce4ec", color: "#c62828" },
          ].map(({ label, value, Icon, bg, color }) => (
            <div key={label} className="rv-sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="rv-sc-row">
                <Icon size={18} color={color} />
                <span className="rv-sc-lbl" style={{ color }}>{label}</span>
              </div>
              <div className="rv-sc-val">{value}</div>
            </div>
          ))}
        </div>

        <div className="rv-fbar">
          <div className="rv-search-wrap">
            <RiSearchLine size={15} className="rv-search-icon" style={{position:'absolute',left:11,pointerEvents:'none',color:'var(--text-muted)'}} />
            <input
              type="text"
              className="rv-finput with-icon"
              placeholder="Search guest, room, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="rv-finput" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="rv-table-card">
          <table className="rv-table">
            <thead className="rv-thead">
              <tr>
                {["Guest","Room","Check-In","Check-Out","Nights","Total","Status","Actions"].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="rv-empty">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="rv-empty">No reservations found.</td></tr>
              ) : filtered.map(res => {
                const s = STATUS_CONFIG[res.status] || STATUS_CONFIG.pending;
                const nights = res.check_out
                  ? Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000)
                  : 0;
                return (
                  <tr key={res.id} className="rv-tr">
                    <td className="rv-td">
                      <div className="rv-guest-name">{res.guest_name}</div>
                      {res.guest_email && <div className="rv-guest-email">{res.guest_email}</div>}
                    </td>
                    <td className="rv-td rv-room-num">{res.room_number || "—"}</td>
                    <td className="rv-td rv-date">{res.check_in}</td>
                    <td className="rv-td rv-date">
                      {res.check_out || <span className="rv-open-badge">Open</span>}
                    </td>
                    <td className="rv-td">
                      {res.check_out
                        ? <span className="rv-nights">{nights}n</span>
                        : <span className="rv-open-badge">Open</span>
                      }
                    </td>
                    <td className="rv-td rv-total">₱{parseFloat(res.total_amount || 0).toLocaleString()}</td>
                    <td className="rv-td">
                      <span className="rv-status-pill" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="rv-td">
                      <div className="rv-actions">
                        <button className="rv-btn-action rv-btn-edit" onClick={() => openEdit(res)} title="Edit">
                          <RiPencilLine size={13} />
                        </button>
                        <button className="rv-btn-action rv-btn-del" onClick={() => handleDelete(res)} title="Delete">
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
    </>
  );
}