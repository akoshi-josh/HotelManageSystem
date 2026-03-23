import React, { useState, useEffect } from "react";
import {
  RiLoginBoxLine, RiWalkLine, RiUserLine, RiHotelBedLine,
  RiCalendarLine, RiTimeLine, RiAddLine, RiDeleteBinLine,
  RiCheckboxCircleLine, RiMoneyDollarCircleLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";

/* ─── shared inline styles (mirrors CheckOut) ─── */
const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
  borderRadius: "8px", fontSize: "0.9rem", outline: "none",
  fontFamily: "Arial,sans-serif", boxSizing: "border-box",
  background: "white", transition: "border 0.2s",
};
const labelStyle = {
  display: "block", fontSize: "0.8rem", fontWeight: "700",
  color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px",
};
const sectionTitle = (color = "#07713c") => ({
  fontSize: "0.78rem", fontWeight: "700", color,
  textTransform: "uppercase", letterSpacing: "0.8px",
  marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px",
});
const card = {
  background: "white", borderRadius: "12px", padding: "16px 20px",
  marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.page-sub   { font-size:.83rem; color:#8a9a8a; }
.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sc-lbl { font-size:.78rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { background:#fff; border-radius:14px; padding:13px 20px; margin-bottom:20px; border:1px solid #e4ebe4; }
.finput { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#333; outline:none; }
.finput:focus { border-color:#07713c; }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.sec-hdr { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.sec-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.sec-title { font-size:.92rem; font-weight:700; color:#333; margin:0; }
.ci-card { background:#fff; border-radius:14px; border:1px solid #e4ebe4; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.06); display:flex; margin-bottom:10px; }
.ci-left { background:linear-gradient(180deg,#07713c,#0a9150); padding:16px 14px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:88px; flex-shrink:0; }
.ci-left.overdue  { background:linear-gradient(180deg,#e65100,#ff9800); }
.ci-left.upcoming { background:linear-gradient(180deg,#1565c0,#1976d2); }
.ci-room { font-size:1.6rem; font-weight:700; color:#fff; line-height:1; }
.ci-room-lbl { font-size:.58rem; color:rgba(255,255,255,.65); text-transform:uppercase; letter-spacing:.5px; margin-bottom:4px; }
.ci-type-badge { background:rgba(255,255,255,.18); border-radius:7px; padding:4px 9px; margin-top:8px; text-align:center; }
.ci-type-val { font-size:.7rem; color:#fff; font-weight:700; }
.ci-body { padding:14px 18px; flex:1; min-width:0; }
.ci-info-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:10px; }
.ci-info { background:#f4f6f0; border-radius:8px; padding:8px 10px; }
.ci-info-lbl { font-size:.63rem; color:#8a9a8a; font-weight:700; text-transform:uppercase; display:flex; align-items:center; gap:3px; margin-bottom:2px; }
.ci-info-val { font-size:.84rem; font-weight:600; color:#222; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ci-bottom { display:flex; justify-content:flex-end; align-items:center; }
.status-tag { padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; margin-right:auto; }
.empty { background:#fff; border-radius:14px; padding:60px; text-align:center; border:1px solid #e4ebe4; }
.btn-ci { display:inline-flex; align-items:center; gap:5px; padding:8px 18px; background:#07713c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.82rem; font-weight:700; font-family:Arial,sans-serif; }
.btn-walkin { padding:10px 20px; background:#1565c0; color:#fff; border:none; border-radius:9px; cursor:pointer; font-size:.86rem; font-weight:700; font-family:Arial,sans-serif; display:inline-flex; align-items:center; gap:6px; }
.mo-wi { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,.52); backdrop-filter:blur(2px); padding:20px; overflow-y:auto; }
.mb-wi { background:#f4f6f0; border-radius:20px; width:100%; max-width:560px; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.22); margin:auto; }
.mh-blue { background:linear-gradient(135deg,#1565c0,#1976d2); padding:20px 24px; border-radius:20px 20px 0 0; display:flex; justify-content:space-between; align-items:center; }
.mh-title { color:#fff; font-size:1rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.8rem; margin:3px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; }
.mbody { padding:18px 22px; overflow-y:auto; }
.msec { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:12px; border:1px solid #e4ebe4; }
.msec-title-blue { font-size:.68rem; font-weight:700; color:#1565c0; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.flabel { display:block; font-size:.76rem; font-weight:700; color:#3a6a3a; margin-bottom:4px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; }
.pay-opt { flex:1; padding:11px; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; }
.pay-opt.active-blue { border-color:#1565c0; background:#e3f2fd; }
.pay-opt-title { font-weight:700; font-size:.84rem; color:#333; }
.pay-opt-sub   { font-size:.73rem; color:#aaa; margin-top:2px; }
.total-bar-blue { background:#1565c0; border-radius:10px; padding:11px 16px; display:flex; justify-content:space-between; align-items:center; margin-top:10px; }
.add-row { display:flex; gap:7px; align-items:center; }
.add-fi-blue { flex:1; padding:9px 12px; border:1.5px dashed #90caf9; border-radius:8px; font-size:.84rem; outline:none; font-family:Arial,sans-serif; color:#333; }
.add-fi-blue::placeholder { color:#a8b8a8; font-style:italic; }
.add-btn-blue { padding:9px 16px; background:#1565c0; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; }
.add-btn-blue:disabled { background:#aaa; cursor:not-allowed; }
.charge-row { display:flex; justify-content:space-between; align-items:center; padding:7px 11px; background:#f0f7ff; border:1px solid #bbdefb; border-radius:7px; margin-bottom:5px; }
.charge-del { background:none; border:none; cursor:pointer; color:#e53935; padding:2px 4px; border-radius:4px; display:flex; align-items:center; }
.alert-err { padding:9px 14px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.83rem; margin-bottom:12px; }
.pm-btn { flex:1; padding:8px 4px; border:2px solid #e8e8e8; border-radius:8px; background:white; cursor:pointer; font-size:.75rem; font-weight:700; color:#888; font-family:Arial,sans-serif; }
.pm-btn.act { border-color:#07713c; background:#ecfdf5; color:#07713c; }
`;

function AddChargeBlue({ onAdd }) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  return (
    <div className="add-row">
      <input className="add-fi-blue" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Extra pillow, Room service..." onKeyDown={e => e.key === "Enter" && handle()} />
      <input type="number" className="add-fi-blue" style={{ flex: "0 0 100px" }} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₱ Amount" onKeyDown={e => e.key === "Enter" && handle()} />
      <button className="add-btn-blue" onClick={handle} disabled={!name.trim() || !amount}><RiAddLine size={13} />Add</button>
    </div>
  );
}

export default function CheckIn() {
  const [reservations,   setReservations]   = useState([]);
  const [rooms,          setRooms]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");

  /* regular check-in modal */
  const [showModal,      setShowModal]      = useState(false);
  const [selected,       setSelected]       = useState(null);
  const [processing,     setProcessing]     = useState(false);
  const [payLater,       setPayLater]       = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState("cash");
  const [fullyPaid,      setFullyPaid]      = useState(false);
  const [amountReceived, setAmountReceived] = useState("");

  /* walk-in modal */
  const [showWalkIn,     setShowWalkIn]     = useState(false);
  const [walkInPayLater, setWalkInPayLater] = useState(false);
  const [walkIn, setWalkIn] = useState({
    guest_name: "", guest_email: "", guest_phone: "",
    room_id: "", check_in: new Date().toISOString().split("T")[0],
    check_out: "", notes: "", additional_charges: [],
  });
  const [walkInError,  setWalkInError]  = useState("");
  const [savingWalkIn, setSavingWalkIn] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchData(); }, []); // eslint-disable-line

  const fetchData = async () => {
    setLoading(true);
    const [{ data: resData }, { data: roomData }] = await Promise.all([
      supabase.from("reservations").select("*").in("status", ["confirmed", "pending"]).order("check_in"),
      supabase.from("rooms").select("*").order("room_number"),
    ]);
    setReservations(resData || []);
    setRooms(roomData || []);
    setLoading(false);
  };

  const availableRooms = rooms.filter(r => r.status === "available");

  /* ── open regular check-in modal ── */
  const openCheckIn = (res) => {
    setSelected(res);
    setPayLater(false);
    setPaymentMethod("cash");
    setFullyPaid(false);
    setAmountReceived("");
    setShowModal(true);
  };

  /* ── derived payment values ── */
  const getResCharges = (res) => { try { return JSON.parse(res?.additional_charges || "[]"); } catch { return []; } };
  // total_amount already includes additional_charges (added in Reservations calcTotal)
  // DO NOT add resChargesTotal again — that would double-count them
  const totalBill = parseFloat(selected?.total_amount || 0);
  const amtReceived = parseFloat(amountReceived || 0);
  const change      = fullyPaid ? 0 : Math.max(0, amtReceived - totalBill);
  const balance     = fullyPaid ? 0 : Math.max(0, totalBill - amtReceived);

  /* ── confirm check-in ── */
  const handleCheckIn = async () => {
    setProcessing(true);
    const checkedId = selected.id;
    const paidAmt   = payLater ? 0 : fullyPaid ? totalBill : amtReceived;
    const isPartial = !payLater && !fullyPaid && paidAmt < totalBill && paidAmt > 0;

    await supabase.from("reservations").update({
      status:         "checked_in",
      payment_method: payLater ? "pay_at_checkout" : paymentMethod,
      amount_paid:    paidAmt,
      pay_later:      payLater || isPartial,
    }).eq("id", checkedId);

    await supabase.from("rooms").update({ status: "occupied" }).eq("id", selected.room_id);

    logActivity({
      action:      `Checked in guest: ${selected.guest_name}`,
      category:    "check_in",
      details:     `Room ${selected.room_number} | ${payLater ? "Pay at checkout" : `Paid ₱${paidAmt.toLocaleString()}`}`,
      entity_type: "reservation",
      entity_id:   checkedId,
    });

    setReservations(prev => prev.filter(r => r.id !== checkedId));
    setProcessing(false);
    setShowModal(false);
    setSelected(null);
    setTimeout(() => fetchData(), 500);
  };

  /* ── walk-in ── */
  const calcWalkInTotal = () => {
    const room = rooms.find(r => r.id === walkIn.room_id);
    if (!room || !walkIn.check_in) return 0;
    const nights = walkIn.check_out
      ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)
      : 1;
    const roomTotal    = nights * parseFloat(room.price);
    const chargesTotal = (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    return roomTotal + chargesTotal;
  };
  const calcWalkInRoomOnly = () => {
    const room = rooms.find(r => r.id === walkIn.room_id);
    if (!room || !walkIn.check_in) return 0;
    const nights = walkIn.check_out
      ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)
      : 1;
    return nights * parseFloat(room.price);
  };

  const handleWalkIn = async () => {
    setWalkInError("");
    if (!walkIn.guest_name || !walkIn.room_id || !walkIn.check_in) {
      setWalkInError("Please fill in guest name, room, and check-in date."); return;
    }
    if (walkIn.check_out && new Date(walkIn.check_out) <= new Date(walkIn.check_in)) {
      setWalkInError("Check-out must be after check-in."); return;
    }
    setSavingWalkIn(true);
    const room   = rooms.find(r => r.id === walkIn.room_id);
    const nights = walkIn.check_out
      ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)
      : 1;
    const total  = nights * parseFloat(room?.price || 0);

    const walkInChargesTotal = (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const totalWithCharges = total + walkInChargesTotal;
    const amtReceived = parseFloat(walkIn.amount_received || 0);

    const { error } = await supabase.from("reservations").insert({
      guest_name:  walkIn.guest_name, guest_email: walkIn.guest_email,
      guest_phone: walkIn.guest_phone, room_id: walkIn.room_id,
      room_number: room?.room_number,  check_in:   walkIn.check_in,
      ...(walkIn.check_out ? { check_out: walkIn.check_out } : {}),
      status: "checked_in",
      // total_amount = room rate only (charges tracked separately in additional_charges)
      total_amount: total,
      notes: walkIn.notes,
      amount_paid:    walkInPayLater ? 0 : (amtReceived > 0 ? Math.min(amtReceived, totalWithCharges) : totalWithCharges),
      pay_later:      walkInPayLater || (!walkInPayLater && amtReceived > 0 && amtReceived < totalWithCharges),
      payment_method: walkInPayLater ? "pay_at_checkout" : "cash",
      // Walk-in charges go into additional_charges (same field as in-house charges)
      additional_charges: JSON.stringify(walkIn.additional_charges || []),
    });

    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }

    await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);
    logActivity({
      action: `Walk-in check-in: ${walkIn.guest_name}`, category: "check_in",
      details: `Room ${room?.room_number} | Total ₱${total.toLocaleString()}`,
      entity_type: "reservation",
    });

    setSavingWalkIn(false);
    setShowWalkIn(false);
    setWalkIn({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: today, check_out: "", notes: "", additional_charges: [] });
    fetchData();
  };

  const filtered    = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number || "").includes(search) ||
    (r.guest_phone || "").includes(search)
  );
  const todayArr    = filtered.filter(r => r.check_in === today);
  const overdueArr  = filtered.filter(r => r.check_in < today);
  const upcomingArr = filtered.filter(r => r.check_in > today);
  const nights      = selected ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000) : 0;

  const GuestCard = ({ res }) => {
    const isOverdue = res.check_in < today;
    const isToday   = res.check_in === today;
    const resNights = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000);
    return (
      <div className="ci-card">
        <div className={`ci-left${isOverdue ? " overdue" : isToday ? "" : " upcoming"}`}>
          <div className="ci-room-lbl">Room</div>
          <div className="ci-room">{res.room_number || "—"}</div>
          <div className="ci-type-badge"><div className="ci-type-val">{resNights}n</div></div>
        </div>
        <div className="ci-body">
          <div className="ci-info-grid">
            <div className="ci-info" style={{ gridColumn: "span 2" }}>
              <div className="ci-info-lbl"><RiUserLine size={10} />Guest</div>
              <div className="ci-info-val" style={{ fontWeight: "700" }}>{res.guest_name}</div>
            </div>
            <div className="ci-info">
              <div className="ci-info-lbl"><RiCalendarLine size={10} />Check-In</div>
              <div className="ci-info-val">{res.check_in}</div>
            </div>
            <div className="ci-info">
              <div className="ci-info-lbl"><RiCalendarLine size={10} />Check-Out</div>
              <div className="ci-info-val">{res.check_out || "Open"}</div>
            </div>
            <div className="ci-info">
              <div className="ci-info-lbl"><RiMoneyDollarCircleLine size={10} />Total</div>
              <div className="ci-info-val" style={{ color: "#07713c" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
            </div>
            {res.guest_phone && (
              <div className="ci-info">
                <div className="ci-info-lbl"><RiUserLine size={10} />Phone</div>
                <div className="ci-info-val">{res.guest_phone}</div>
              </div>
            )}
          </div>
          <div className="ci-bottom">
            <span className="status-tag" style={{
              background: isOverdue ? "#fff3e0" : isToday ? "#ecfdf5" : "#e3f2fd",
              color: isOverdue ? "#e65100" : isToday ? "#07713c" : "#1565c0",
            }}>{isOverdue ? "Overdue" : isToday ? "Today" : "Upcoming"}</span>
            <button className="btn-ci" onClick={() => openCheckIn(res)}>
              <RiLoginBoxLine size={14} />Check In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, data, dot }) => data.length > 0 && (
    <div style={{ marginBottom: "24px" }}>
      <div className="sec-hdr">
        <div className="sec-dot" style={{ background: dot }} />
        <h3 className="sec-title">{title} ({data.length})</h3>
      </div>
      {data.map(r => <GuestCard key={r.id} res={r} />)}
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="page">

        {/* ── Page header ── */}
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Check-In</h2>
            <p className="page-sub">Process guest arrivals and walk-ins</p>
          </div>
          <button className="btn-walkin" onClick={() => setShowWalkIn(true)}>
            <RiWalkLine size={16} />Walk-In Guest
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="sc-4">
          {[
            { label: "Today's Arrivals", val: reservations.filter(r => r.check_in === today).length, Icon: RiCalendarLine, bg: "#e8f5e9", c: "#07713c" },
            { label: "Overdue",          val: reservations.filter(r => r.check_in < today).length,   Icon: RiTimeLine,    bg: "#fff3e0", c: "#e65100" },
            { label: "Upcoming",         val: reservations.filter(r => r.check_in > today).length,   Icon: RiCalendarLine,bg: "#e3f2fd", c: "#1565c0" },
            { label: "Available Rooms",  val: availableRooms.length,                                  Icon: RiHotelBedLine,bg: "#f3e5f5", c: "#6a1b9a" },
          ].map(({ label, val, Icon, bg, c }) => (
            <div key={label} className="sc" style={{ background: bg }}>
              <div className="sc-row"><Icon size={18} color={c} /><span className="sc-lbl" style={{ color: c }}>{label}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="fbar">
          <input className="finput" placeholder="Search guest name, room, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* ── Guest list ── */}
        {loading ? (
          <div className="empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <RiCheckboxCircleLine size={48} color="#07713c" style={{ marginBottom: "12px" }} />
            <div style={{ fontWeight: "700", color: "#333" }}>No pending check-ins!</div>
            <div style={{ color: "#aaa", marginTop: "6px", fontSize: ".85rem" }}>All reservations have been processed.</div>
          </div>
        ) : (
          <>
            <Section title="Overdue — Not Yet Checked In" data={overdueArr}  dot="#e65100" />
            <Section title="Today's Arrivals"              data={todayArr}    dot="#07713c" />
            <Section title="Upcoming Arrivals"             data={upcomingArr} dot="#1565c0" />
          </>
        )}

        {/* ════════════════════════════════════════
            CHECK-IN MODAL — same style as CheckOut
            ════════════════════════════════════════ */}
        {showModal && selected && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", overflowY: "auto" }}>
            <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "520px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif" }}>

              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#07713c,#0a9150)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                    <RiLoginBoxLine size={20} /> Process Check-In
                  </h3>
                  <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>Confirm guest arrival and collect payment</p>
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>×</button>
              </div>

              <div style={{ padding: "24px 30px" }}>

                {/* Reservation Summary */}
                <div style={card}>
                  <div style={sectionTitle("#07713c")}><RiUserLine size={13} /> Reservation Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      ["Guest",     selected.guest_name],
                      ["Room",      `Room ${selected.room_number}`],
                      ["Check-In",  selected.check_in],
                      ["Check-Out", selected.check_out || "Open Stay"],
                      ["Duration",  selected.check_out ? `${Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)} nights` : "Open-ended"],
                      ["Room Rate", `₱${parseFloat(selected.total_amount || 0).toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Reservation charges breakdown — baked into total_amount, shown for reference */}
                  {getResCharges(selected).length > 0 && (
                    <div style={{ marginTop: "12px", borderTop: "1px dashed #e0e0e0", paddingTop: "12px" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#888", textTransform: "uppercase", marginBottom: "6px", letterSpacing: "0.4px" }}>
                        Charges Included in Room Rate
                      </div>
                      {getResCharges(selected).map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.83rem", color: "#555", padding: "4px 0", borderBottom: "1px dashed #f0f0f0" }}>
                          <span>• {c.name}</span>
                          <span style={{ fontWeight: "600", color: "#07713c" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "700", marginTop: "8px", paddingTop: "6px", borderTop: "1px solid #e0e0e0" }}>
                        <span style={{ color: "#333" }}>Total (Room + Charges)</span>
                        <span style={{ color: "#07713c" }}>₱{totalBill.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "4px", fontStyle: "italic" }}>
                        Already included in the room rate above.
                      </div>
                    </div>
                  )}
                </div>

                {/* Pay Now / Pay at Checkout toggle */}
                <div style={card}>
                  <div style={sectionTitle("#07713c")}><RiMoneyDollarCircleLine size={13} /> Payment Option</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
                    {[
                      { val: false, label: "Pay Now",          sub: "Collect full or partial now" },
                      { val: true,  label: "Pay at Check-Out", sub: "Collect when guest leaves"   },
                    ].map(opt => (
                      <div key={String(opt.val)}
                        onClick={() => setPayLater(opt.val)}
                        style={{ flex: 1, padding: "11px", border: `1.5px solid ${payLater === opt.val ? "#07713c" : "#ccdacc"}`, borderRadius: "10px", cursor: "pointer", background: payLater === opt.val ? "#ecfdf5" : "#fff" }}>
                        <div style={{ fontWeight: "700", fontSize: ".84rem", color: "#333" }}>{opt.label}</div>
                        <div style={{ fontSize: ".73rem", color: "#aaa", marginTop: "2px" }}>{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── PAY NOW section — exactly like CheckOut ── */}
                {!payLater && (
                  <>
                    {/* Payment method */}
                    <div style={card}>
                      <div style={sectionTitle("#07713c")}><RiMoneyDollarCircleLine size={13} /> Payment Method</div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        {["cash", "card", "gcash", "bank_transfer"].map(m => (
                          <button key={m} onClick={() => setPaymentMethod(m)}
                            style={{ flex: 1, padding: "8px 4px", border: `2px solid ${paymentMethod === m ? "#07713c" : "#e8e8e8"}`, borderRadius: "8px", background: paymentMethod === m ? "#ecfdf5" : "white", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", color: paymentMethod === m ? "#07713c" : "#888", fontFamily: "Arial,sans-serif" }}>
                            {m === "cash" ? "Cash" : m === "card" ? "Card" : m === "gcash" ? "GCash" : "Bank"}<br />
                            <span style={{ fontSize: "0.65rem", fontWeight: "400", color: "#aaa" }}>
                              {m === "cash" ? "💵" : m === "card" ? "💳" : m === "gcash" ? "📱" : "🏦"}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Collect Payment — identical to CheckOut */}
                    <div style={card}>
                      <div style={sectionTitle("#07713c")}><RiMoneyDollarCircleLine size={13} /> Collect Payment</div>

                      {/* Fully paid toggle */}
                      <div
                        onClick={() => { setFullyPaid(f => !f); if (!fullyPaid) setAmountReceived(totalBill.toString()); }}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${fullyPaid ? "#4caf50" : "#e8e8e8"}`, background: fullyPaid ? "#e8f5e9" : "#f8f9fa", cursor: "pointer", marginBottom: "14px", transition: "all 0.2s" }}>
                        <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${fullyPaid ? "#4caf50" : "#ccc"}`, background: fullyPaid ? "#4caf50" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {fullyPaid && <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "700" }}>✓</span>}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", fontSize: "0.9rem", color: fullyPaid ? "#1b5e20" : "#333" }}>Guest has fully paid</div>
                          <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "1px" }}>Mark as fully settled — no balance at check-out</div>
                        </div>
                      </div>

                      {/* Amount input when NOT fully paid */}
                      {!fullyPaid && (
                        <>
                          <div style={{ marginBottom: "12px" }}>
                            <label style={labelStyle}>Amount Received (₱)</label>
                            <input
                              type="number"
                              value={amountReceived}
                              onChange={e => setAmountReceived(e.target.value)}
                              placeholder="Enter amount given by guest"
                              style={{ ...inputStyle, fontSize: "1rem", fontWeight: "700" }}
                              onFocus={e => e.target.style.borderColor = "#07713c"}
                              onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                            />
                          </div>

                          {/* Change to return */}
                          {change > 0 && (
                            <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                              <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: "0.9rem" }}>💵 Change to return</span>
                              <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{change.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Partial — balance at checkout */}
                          {amtReceived > 0 && balance > 0 && (
                            <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ color: "#e65100", fontWeight: "700", fontSize: "0.88rem" }}>⚠ Balance due at Check-Out</span>
                              <span style={{ color: "#e65100", fontWeight: "800", fontSize: "1.1rem" }}>₱{balance.toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}

                      {/* Fully paid confirmation */}
                      {fullyPaid && (
                        <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                          <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "0.95rem" }}>✅ Payment fully settled — ₱{totalBill.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Pay at checkout note */}
                {payLater && (
                  <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px" }}>
                    <div style={{ fontWeight: "700", fontSize: ".88rem", color: "#f57f17", marginBottom: "3px" }}>Full payment at Check-Out</div>
                    <div style={{ fontSize: ".8rem", color: "#888" }}>Total of ₱{totalBill.toLocaleString()} will be collected when guest leaves.</div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => setShowModal(false)}
                    style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckIn}
                    disabled={processing || (!payLater && !fullyPaid && (!amountReceived || amtReceived <= 0))}
                    style={{ flex: 2, padding: "13px", background: processing ? "#aaa" : "#07713c", border: "none", borderRadius: "10px", cursor: processing ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                    <RiLoginBoxLine size={16} />
                    {processing ? "Processing..." : "Confirm Check-In"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════
            WALK-IN MODAL
            ════════════════════ */}
        {showWalkIn && (
          <div className="mo-wi" onClick={() => setShowWalkIn(false)}>
            <div className="mb-wi" onClick={e => e.stopPropagation()}>
              <div className="mh-blue">
                <div>
                  <p className="mh-title">Walk-In Guest</p>
                  <p className="mh-sub">Guest arrives without prior reservation</p>
                </div>
                <button className="mx" onClick={() => setShowWalkIn(false)}>×</button>
              </div>
              <div className="mbody">
                {walkInError && <div className="alert-err">⚠ {walkInError}</div>}

                <div className="msec">
                  <div className="msec-title-blue"><RiUserLine size={13} />Guest Information</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="flabel">Full Name <span style={{ color: "#e53935" }}>*</span></label>
                      <input className="fi" value={walkIn.guest_name} onChange={e => setWalkIn({ ...walkIn, guest_name: e.target.value })} placeholder="e.g. Juan Dela Cruz" />
                    </div>
                    <div>
                      <label className="flabel">Email</label>
                      <input type="email" className="fi" value={walkIn.guest_email} onChange={e => setWalkIn({ ...walkIn, guest_email: e.target.value })} placeholder="guest@email.com" />
                    </div>
                    <div>
                      <label className="flabel">Phone</label>
                      <input className="fi" value={walkIn.guest_phone} onChange={e => setWalkIn({ ...walkIn, guest_phone: e.target.value })} placeholder="+63 9XX XXX XXXX" />
                    </div>
                  </div>
                </div>

                <div className="msec">
                  <div className="msec-title-blue"><RiHotelBedLine size={13} />Room & Dates</div>
                  <div style={{ marginBottom: "10px" }}>
                    <label className="flabel">Select Room <span style={{ color: "#e53935" }}>*</span></label>
                    <select className="fi" style={{ cursor: "pointer" }} value={walkIn.room_id} onChange={e => setWalkIn({ ...walkIn, room_id: e.target.value })}>
                      <option value="">— Choose an available room —</option>
                      {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="flabel">Check-In <span style={{ color: "#e53935" }}>*</span></label>
                      <input type="date" className="fi" value={walkIn.check_in} onChange={e => setWalkIn({ ...walkIn, check_in: e.target.value })} />
                    </div>
                    <div>
                      <label className="flabel">Check-Out <span style={{ fontSize: ".7rem", color: "#8a9a8a", fontWeight: "400", textTransform: "none" }}>(optional)</span></label>
                      <input type="date" className="fi" value={walkIn.check_out} onChange={e => setWalkIn({ ...walkIn, check_out: e.target.value })} />
                    </div>
                  </div>
                  {calcWalkInRoomOnly() > 0 && (
                    <div className="total-bar-blue" style={{ marginTop: "10px" }}>
                      <span style={{ color: "rgba(255,255,255,.75)", fontSize: ".86rem" }}>
                        {walkIn.check_out ? `${Math.round((new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)} nights` : "Open-ended · per night"}
                      </span>
                      <span style={{ color: "#fff", fontWeight: "700" }}>₱{calcWalkInRoomOnly().toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="msec">
                  <div className="msec-title-blue"><RiMoneyDollarCircleLine size={13} />Payment Option</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {[
                      { val: false, label: "Pay Now",          sub: "Collect on check-in"       },
                      { val: true,  label: "Pay at Check-Out", sub: "Guest pays when leaving" },
                    ].map(opt => (
                      <div key={String(opt.val)} className={`pay-opt${walkInPayLater === opt.val ? " active-blue" : ""}`} onClick={() => setWalkInPayLater(opt.val)}>
                        <div className="pay-opt-title">{opt.label}</div>
                        <div className="pay-opt-sub">{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                  {/* Amount received input — only when Pay Now */}
                  {!walkInPayLater && (
                    <>
                      {/* Bill breakdown if there are additional charges */}
                      {(walkIn.additional_charges || []).length > 0 && (
                        <div style={{ marginTop: "12px", background: "#f4f6f0", borderRadius: "10px", padding: "12px 14px" }}>
                          <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#555", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px" }}>Bill Breakdown</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", color: "#555", marginBottom: "4px" }}>
                            <span>Room Rate</span>
                            <span style={{ fontWeight: "600" }}>₱{calcWalkInRoomOnly().toLocaleString()}</span>
                          </div>
                          {(walkIn.additional_charges || []).map(c => (
                            <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", color: "#555", marginBottom: "4px" }}>
                              <span>• {c.name}</span>
                              <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: "700", borderTop: "1px solid #ddd", paddingTop: "6px", marginTop: "4px" }}>
                            <span style={{ color: "#333" }}>Total to Collect</span>
                            <span style={{ color: "#1565c0" }}>₱{calcWalkInTotal().toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      <div style={{ marginTop: "12px", marginBottom: "10px" }}>
                        <label className="flabel" style={{ display:"block", fontSize:".8rem", fontWeight:"700", color:"#555", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.4px" }}>Amount Received (₱)</label>
                        <input
                          type="number"
                          className="fi"
                          style={{ fontSize: "1rem", fontWeight: "700" }}
                          value={walkIn.amount_received || ""}
                          onChange={e => setWalkIn({ ...walkIn, amount_received: e.target.value })}
                          placeholder="Enter amount given by guest"
                          onFocus={e => e.target.style.borderColor = "#1565c0"}
                          onBlur={e => e.target.style.borderColor = "#ccdacc"}
                        />
                      </div>
                      {parseFloat(walkIn.amount_received || 0) > calcWalkInTotal() && calcWalkInTotal() > 0 && (
                        <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: "0.9rem" }}>💵 Change to return</span>
                          <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{(parseFloat(walkIn.amount_received) - calcWalkInTotal()).toLocaleString()}</span>
                        </div>
                      )}
                      {parseFloat(walkIn.amount_received || 0) > 0 && parseFloat(walkIn.amount_received || 0) < calcWalkInTotal() && (
                        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#e65100", fontWeight: "700", fontSize: "0.88rem" }}>⚠ Balance due at Check-Out</span>
                          <span style={{ color: "#e65100", fontWeight: "800", fontSize: "1.1rem" }}>₱{(calcWalkInTotal() - parseFloat(walkIn.amount_received)).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="msec">
                  <div className="msec-title-blue">Notes / Special Requests</div>
                  <textarea className="fi" rows={2} style={{ resize: "vertical" }} value={walkIn.notes} onChange={e => setWalkIn({ ...walkIn, notes: e.target.value })} placeholder="Any special requests..." />
                </div>

                <div className="msec">
                  <div className="msec-title-blue"><RiMoneyDollarCircleLine size={13} />Additional Charges</div>
                  {(walkIn.additional_charges || []).map(c => (
                    <div key={c.id} className="charge-row">
                      <span style={{ fontSize: ".82rem", color: "#333" }}>{c.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "700", color: "#1565c0", fontSize: ".82rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                        <button className="charge-del" onClick={() => setWalkIn({ ...walkIn, additional_charges: walkIn.additional_charges.filter(x => x.id !== c.id) })}>
                          <RiDeleteBinLine size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <AddChargeBlue onAdd={charge => setWalkIn({ ...walkIn, additional_charges: [...(walkIn.additional_charges || []), charge] })} />
                </div>
              </div>

              <div style={{ padding: "13px 22px", borderTop: "1px solid #e4ebe4", display: "flex", gap: "10px" }}>
                <button onClick={() => setShowWalkIn(false)}
                  style={{ flex: 1, padding: "11px", background: "#fff", border: "1.5px solid #ccdacc", borderRadius: "10px", cursor: "pointer", fontSize: ".88rem", fontWeight: "600", color: "#4a6a4a", fontFamily: "Arial,sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleWalkIn} disabled={savingWalkIn}
                  style={{ flex: 2, padding: "11px", background: savingWalkIn ? "#aaa" : "#1565c0", border: "none", borderRadius: "10px", cursor: savingWalkIn ? "not-allowed" : "pointer", fontSize: ".88rem", fontWeight: "700", color: "#fff", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <RiWalkLine size={15} />{savingWalkIn ? "Checking In..." : "Check In Now"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}