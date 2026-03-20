import React, { useState, useEffect } from "react";
import {
  RiLoginBoxLine, RiWalkLine, RiUserLine, RiHotelBedLine,
  RiCalendarLine, RiTimeLine, RiAddLine, RiDeleteBinLine,
  RiCheckboxCircleLine, RiMoneyDollarCircleLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";

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
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.sec-hdr { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.sec-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.sec-title { font-size:.92rem; font-weight:700; color:#333; margin:0; }

/* ── VERTICAL CARD ── */
.ci-card { background:#fff; border-radius:14px; border:1px solid #e4ebe4; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.06); display:flex; margin-bottom:10px; transition:box-shadow .2s; }
.ci-card:hover { box-shadow:0 4px 18px rgba(0,0,0,.10); }
.ci-left { background:linear-gradient(180deg,#07713c,#0a9150); padding:16px 14px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:88px; flex-shrink:0; }
.ci-left.overdue { background:linear-gradient(180deg,#e65100,#ff9800); }
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
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.52); backdrop-filter:blur(2px); }
.mo-wi { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,.52); backdrop-filter:blur(2px); padding:20px; overflow-y:auto; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-width:480px; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.22); }
.mb-wi { background:#f4f6f0; border-radius:20px; width:100%; max-width:560px; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.22); margin:auto; }
.mh { padding:20px 24px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; }
.mh-green { background:linear-gradient(135deg,#07713c,#0a9150); }
.mh-blue  { background:linear-gradient(135deg,#1565c0,#1976d2); }
.mh-title { color:#fff; font-size:1rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.8rem; margin:3px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:18px 22px; overflow-y:auto; }
.mfoot { padding:13px 22px; border-top:1px solid #e4ebe4; display:flex; gap:10px; flex-shrink:0; }
.msec { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:12px; border:1px solid #e4ebe4; }
.msec-title { font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.msec-title-green { color:#07713c; }
.msec-title-blue  { color:#1565c0; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.info-cell { background:#f4f6f0; border-radius:8px; padding:9px 12px; }
.info-lbl  { font-size:.65rem; color:#8a9a8a; font-weight:700; text-transform:uppercase; margin-bottom:2px; }
.info-val  { font-size:.88rem; font-weight:600; color:#222; }
.flabel { display:block; font-size:.76rem; font-weight:700; color:#3a6a3a; margin-bottom:4px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; transition:border-color .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.pay-opt { flex:1; padding:11px; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; transition:all .15s; }
.pay-opt.active-green { border-color:#07713c; background:#ecfdf5; }
.pay-opt.active-blue  { border-color:#1565c0; background:#e3f2fd; }
.pay-opt-title { font-weight:700; font-size:.84rem; color:#333; }
.pay-opt-sub   { font-size:.73rem; color:#aaa; margin-top:2px; }
.pm-btn { flex:1; padding:8px; border:1.5px solid #ccdacc; border-radius:8px; background:#fff; cursor:pointer; font-size:.74rem; font-weight:700; color:#888; font-family:Arial,sans-serif; transition:all .15s; }
.pm-btn.active { border-color:#07713c; background:#ecfdf5; color:#07713c; }
.total-bar-blue { background:#1565c0; border-radius:10px; padding:11px 16px; display:flex; justify-content:space-between; align-items:center; margin-top:10px; }
.warn-box { background:#fffde7; border:1px solid #fff176; border-radius:8px; padding:10px 14px; font-size:.82rem; color:#f59e0b; font-weight:600; }
.charge-row { display:flex; justify-content:space-between; align-items:center; padding:7px 11px; background:#f0f7ff; border:1px solid #bbdefb; border-radius:7px; margin-bottom:5px; }
.charge-name { font-size:.82rem; color:#333; }
.charge-amt  { font-weight:700; color:#1565c0; font-size:.82rem; }
.charge-del  { background:none; border:none; cursor:pointer; color:#e53935; padding:2px 4px; border-radius:4px; display:flex; align-items:center; }
.charge-del:hover { background:#fce4ec; }
.add-row { display:flex; gap:7px; align-items:center; }
.add-fi-blue { flex:1; padding:9px 12px; border:1.5px dashed #90caf9; border-radius:8px; font-size:.84rem; outline:none; font-family:Arial,sans-serif; color:#333; }
.add-fi-blue:focus { border-color:#1565c0; }
.add-fi-blue::placeholder { color:#a8b8a8; font-style:italic; }
.add-btn-blue { padding:9px 16px; background:#1565c0; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; }
.add-btn-blue:disabled { background:#aaa; cursor:not-allowed; }
.alert-ok  { padding:9px 14px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.83rem; margin-bottom:12px; }
.alert-err { padding:9px 14px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.83rem; margin-bottom:12px; }
.btn-cancel  { flex:1; padding:11px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-confirm-green { flex:2; padding:11px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.btn-confirm-blue  { flex:2; padding:11px; background:#1565c0; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.btn-confirm-green:disabled, .btn-confirm-blue:disabled { background:#aaa; cursor:not-allowed; }
.btn-ci { display:inline-flex; align-items:center; gap:5px; padding:8px 18px; background:#07713c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.82rem; font-weight:700; font-family:Arial,sans-serif; }
.btn-ci:hover { background:#05592f; }
.btn-walkin { padding:10px 20px; background:#1565c0; color:#fff; border:none; border-radius:9px; cursor:pointer; font-size:.86rem; font-weight:700; font-family:Arial,sans-serif; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(21,101,192,.28); }
.btn-walkin:hover { background:#0d47a1; }
`;

function AddChargeBlue({ onAdd }) {
  const [name, setName]     = React.useState("");
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
  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [showWalkIn,   setShowWalkIn]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [paymentMethod,setPaymentMethod]= useState("cash");
  const [amountPaid,   setAmountPaid]   = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");
  const [payLater,     setPayLater]     = useState(false);
  const [walkInPayLater,setWalkInPayLater] = useState(false);
  const [walkIn, setWalkIn] = useState({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: new Date().toISOString().split("T")[0], check_out: "", notes: "", additional_charges: [] });
  const [walkInError,  setWalkInError]  = useState("");
  const [savingWalkIn, setSavingWalkIn] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: resData }, { data: roomData }] = await Promise.all([
      supabase.from("reservations").select("*").in("status", ["confirmed","pending"]).order("check_in"),
      supabase.from("rooms").select("*").order("room_number"),
    ]);
    setReservations(resData || []);
    setRooms(roomData || []);
    setLoading(false);
  };

  const availableRooms = rooms.filter(r => r.status === "available");

  const openCheckIn = (res) => {
    setSelected(res);
    setAmountPaid(res.total_amount?.toString() || "");
    setPaymentMethod("cash"); setPayLater(false); setSuccessMsg("");
    setShowModal(true);
  };

  const handleCheckIn = async () => {
    if (!payLater && !amountPaid) return;
    setProcessing(true);
    const checkedId = selected.id;
    await supabase.from("reservations").update({
      status: "checked_in",
      payment_method: payLater ? "pay_at_checkout" : paymentMethod,
      amount_paid: payLater ? 0 : parseFloat(amountPaid),
      pay_later: payLater,
    }).eq("id", checkedId);
    await supabase.from("rooms").update({ status: "occupied" }).eq("id", selected.room_id);
    await logActivity({ action: `Checked in guest: ${selected.guest_name}`, category: "check_in", details: `Room ${selected.room_number} | ${selected.check_in} → ${selected.check_out} | ${payLater ? "Pay at checkout" : `Paid ₱${amountPaid}`}`, entity_type: "reservation", entity_id: checkedId });
    // Remove from list immediately
    setReservations(prev => prev.filter(r => r.id !== checkedId));
    setProcessing(false);
    setShowModal(false);
    setSelected(null);
    // Refresh in background
    setTimeout(() => fetchData(), 500);
  };

  const calcWalkInTotal = () => {
    const room = rooms.find(r => r.id === walkIn.room_id);
    if (!room || !walkIn.check_in) return 0;
    if (!walkIn.check_out) return parseFloat(room.price); // show per-night rate for open stays
    return Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) * parseFloat(room.price);
  };

  const handleWalkIn = async () => {
    setWalkInError("");
    if (!walkIn.guest_name || !walkIn.room_id || !walkIn.check_in) { setWalkInError("Please fill in guest name, room, and check-in date."); return; }
    if (walkIn.check_out && new Date(walkIn.check_out) <= new Date(walkIn.check_in)) { setWalkInError("Check-out must be after check-in."); return; }
    setSavingWalkIn(true);
    const room = rooms.find(r => r.id === walkIn.room_id);
    const nights = walkIn.check_out
      ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)
      : 1; // default 1 night for open-ended stays
    const total = nights * parseFloat(room?.price || 0);
    const { error } = await supabase.from("reservations").insert({
      guest_name: walkIn.guest_name, guest_email: walkIn.guest_email, guest_phone: walkIn.guest_phone,
      room_id: walkIn.room_id, room_number: room?.room_number, check_in: walkIn.check_in,
      ...(walkIn.check_out ? { check_out: walkIn.check_out } : {}),
      status: "checked_in", total_amount: total, notes: walkIn.notes,
      amount_paid: walkInPayLater ? 0 : total, pay_later: walkInPayLater,
      payment_method: walkInPayLater ? "pay_at_checkout" : "cash",
      additional_charges: JSON.stringify(walkIn.additional_charges || []),
    });
    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }
    await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);
    await logActivity({ action: `Walk-in check-in: ${walkIn.guest_name}`, category: "check_in", details: `Room ${room?.room_number} | ${walkIn.check_in} → ${walkIn.check_out} | Total ₱${total.toLocaleString()}`, entity_type: "reservation" });
    setSavingWalkIn(false); setShowWalkIn(false);
    setWalkIn({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: today, check_out: "", notes: "", additional_charges: [] });
    fetchData();
  };

  const filtered = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number || "").includes(search) ||
    (r.guest_phone || "").includes(search)
  );

  const todayArr    = filtered.filter(r => r.check_in === today);
  const overdueArr  = filtered.filter(r => r.check_in < today);
  const upcomingArr = filtered.filter(r => r.check_in > today);
  const nights      = selected ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000) : 0;

  /* ── VERTICAL CARD ── */
  const GuestCard = ({ res }) => {
    const isOverdue  = res.check_in < today;
    const isToday    = res.check_in === today;
    const leftClass  = isOverdue ? "ci-left overdue" : isToday ? "ci-left" : "ci-left upcoming";
    const tagBg      = isOverdue ? "#fff3e0" : isToday ? "#ecfdf5" : "#e3f2fd";
    const tagColor   = isOverdue ? "#e65100" : isToday ? "#07713c" : "#1565c0";
    const tagLabel   = isOverdue ? "Overdue" : isToday ? "Today" : "Upcoming";
    const resNights  = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000);
    return (
      <div className="ci-card">
        <div className={leftClass}>
          <div className="ci-room-lbl">Room</div>
          <div className="ci-room">{res.room_number || "—"}</div>
          <div className="ci-type-badge">
            <div className="ci-type-val">{resNights}n</div>
          </div>
        </div>
        <div className="ci-body">
          <div className="ci-info-grid">
            <div className="ci-info" style={{ gridColumn: "span 2" }}>
              <div className="ci-info-lbl"><RiUserLine size={10} />Guest</div>
              <div className="ci-info-val" style={{ fontSize: ".9rem", fontWeight: "700" }}>{res.guest_name}</div>
            </div>
            <div className="ci-info">
              <div className="ci-info-lbl"><RiCalendarLine size={10} />Check-In</div>
              <div className="ci-info-val">{res.check_in}</div>
            </div>
            <div className="ci-info">
              <div className="ci-info-lbl"><RiCalendarLine size={10} />Check-Out</div>
              <div className="ci-info-val">{res.check_out}</div>
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
            <span className="status-tag" style={{ background: tagBg, color: tagColor }}>{tagLabel}</span>
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
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Check-In</h2>
            <p className="page-sub">Process guest arrivals and walk-ins</p>
          </div>
          <button className="btn-walkin" onClick={() => setShowWalkIn(true)}>
            <RiWalkLine size={16} />Walk-In Guest
          </button>
        </div>

        <div className="sc-4">
          {[
            { label: "Today's Arrivals", val: reservations.filter(r => r.check_in === today).length, Icon: RiCalendarLine,       bg: "#e8f5e9", c: "#07713c" },
            { label: "Overdue",          val: reservations.filter(r => r.check_in < today).length,   Icon: RiTimeLine,           bg: "#fff3e0", c: "#e65100" },
            { label: "Upcoming",         val: reservations.filter(r => r.check_in > today).length,   Icon: RiCalendarLine,       bg: "#e3f2fd", c: "#1565c0" },
            { label: "Available Rooms",  val: availableRooms.length,                                  Icon: RiHotelBedLine,       bg: "#f3e5f5", c: "#6a1b9a" },
          ].map(({ label, val, Icon, bg, c }) => (
            <div key={label} className="sc" style={{ background: bg }}>
              <div className="sc-row"><Icon size={18} color={c} /><span className="sc-lbl" style={{ color: c }}>{label}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" placeholder="Search guest name, room, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <RiCheckboxCircleLine size={48} color="#07713c" style={{ marginBottom: "12px" }} />
            <div style={{ fontWeight: "700", color: "#333", fontSize: "1rem" }}>No pending check-ins!</div>
            <div style={{ color: "#aaa", marginTop: "6px", fontSize: ".85rem" }}>All reservations have been processed.</div>
          </div>
        ) : (
          <>
            <Section title="Overdue — Not Yet Checked In" data={overdueArr}  dot="#e65100" />
            <Section title="Today's Arrivals"              data={todayArr}    dot="#07713c" />
            <Section title="Upcoming Arrivals"             data={upcomingArr} dot="#1565c0" />
          </>
        )}

        {/* Check-In Modal */}
        {showModal && selected && (
          <div className="mo">
            <div className="mb">
              <div className="mh mh-green">
                <div>
                  <p className="mh-title">Process Check-In</p>
                  <p className="mh-sub">Confirm guest arrival and collect payment</p>
                </div>
                <button className="mx" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="mbody">
                {successMsg && <div className="alert-ok">✓ {successMsg}</div>}
                <div className="msec">
                  <div className="msec-title msec-title-green"><RiUserLine size={13} />Guest Summary</div>
                  <div className="info-grid">
                    {[["Guest", selected.guest_name], ["Room", `Room ${selected.room_number}`], ["Check-In", selected.check_in], ["Check-Out", selected.check_out], ["Duration", `${nights} night${nights!==1?"s":""}`], ["Total", `₱${parseFloat(selected.total_amount||0).toLocaleString()}`]].map(([k,v]) => (
                      <div key={k} className="info-cell"><div className="info-lbl">{k}</div><div className="info-val">{v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="msec">
                  <div className="msec-title msec-title-green"><RiMoneyDollarCircleLine size={13} />Payment Option</div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    {[{val: false, label: "Pay Now", sub: "Collect on check-in"}, {val: true, label: "Pay at Check-Out", sub: "Guest pays when leaving"}].map(opt => (
                      <div key={String(opt.val)} className={`pay-opt${payLater===opt.val?" active-green":""}`} onClick={() => setPayLater(opt.val)}>
                        <div className="pay-opt-title">{opt.label}</div>
                        <div className="pay-opt-sub">{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                  {!payLater && (
                    <>
                      <div style={{ marginBottom: "10px" }}>
                        <label className="flabel">Payment Method</label>
                        <div style={{ display: "flex", gap: "7px" }}>
                          {["cash","card","gcash","bank_transfer"].map(m => (
                            <button key={m} className={`pm-btn${paymentMethod===m?" active":""}`} onClick={() => setPaymentMethod(m)}>
                              {m==="cash"?"Cash":m==="card"?"Card":m==="gcash"?"GCash":"Bank"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="flabel">Amount to Collect (₱)</label>
                        <input type="number" className="fi" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="Enter amount" />
                      </div>
                    </>
                  )}
                  {payLater && <div className="warn-box">Payment will be collected at Check-Out.</div>}
                </div>
              </div>
              <div className="mfoot">
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-confirm-green" onClick={handleCheckIn} disabled={processing || (!payLater && !amountPaid)}>
                  <RiLoginBoxLine size={15} />{processing ? "Processing..." : "Confirm Check-In"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Walk-In Modal */}
        {showWalkIn && (
          <div className="mo-wi" onClick={() => setShowWalkIn(false)}>
            <div className="mb-wi" onClick={e => e.stopPropagation()}>
              <div className="mh mh-blue">
                <div>
                  <p className="mh-title">Walk-In Guest</p>
                  <p className="mh-sub">Guest arrives without prior reservation</p>
                </div>
                <button className="mx" onClick={() => setShowWalkIn(false)}>×</button>
              </div>
              <div className="mbody">
                {walkInError && <div className="alert-err">⚠ {walkInError}</div>}
                <div className="msec">
                  <div className="msec-title msec-title-blue"><RiUserLine size={13} />Guest Information</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ gridColumn: "1/-1" }}>
                      <label className="flabel">Full Name <span style={{ color: "#e53935" }}>*</span></label>
                      <input className="fi" value={walkIn.guest_name} onChange={e => setWalkIn({...walkIn, guest_name: e.target.value})} placeholder="e.g. Juan Dela Cruz" />
                    </div>
                    <div>
                      <label className="flabel">Email</label>
                      <input type="email" className="fi" value={walkIn.guest_email} onChange={e => setWalkIn({...walkIn, guest_email: e.target.value})} placeholder="guest@email.com" />
                    </div>
                    <div>
                      <label className="flabel">Phone</label>
                      <input className="fi" value={walkIn.guest_phone} onChange={e => setWalkIn({...walkIn, guest_phone: e.target.value})} placeholder="+63 9XX XXX XXXX" />
                    </div>
                  </div>
                </div>
                <div className="msec">
                  <div className="msec-title msec-title-blue"><RiHotelBedLine size={13} />Room & Dates</div>
                  <div style={{ marginBottom: "10px" }}>
                    <label className="flabel">Select Room <span style={{ color: "#e53935" }}>*</span></label>
                    <select className="fi" style={{ cursor: "pointer" }} value={walkIn.room_id} onChange={e => setWalkIn({...walkIn, room_id: e.target.value})}>
                      <option value="">— Choose an available room —</option>
                      {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night</option>)}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="flabel">Check-In <span style={{ color: "#e53935" }}>*</span></label>
                      <input type="date" className="fi" value={walkIn.check_in} onChange={e => setWalkIn({...walkIn, check_in: e.target.value})} />
                    </div>
                    <div>
                      <label className="flabel">Check-Out <span style={{ fontSize: ".7rem", color: "#8a9a8a", fontWeight: "400", textTransform: "none" }}>(optional — leave blank for open stay)</span></label>
                      <input type="date" className="fi" value={walkIn.check_out} onChange={e => setWalkIn({...walkIn, check_out: e.target.value})} />
                    </div>
                  </div>
                  {calcWalkInTotal() > 0 && (
                    <div className="total-bar-blue">
                      <span style={{ color: "rgba(255,255,255,.75)", fontSize: ".86rem" }}>
                        {walkIn.check_out
                          ? `${Math.round((new Date(walkIn.check_out)-new Date(walkIn.check_in))/86400000)} nights`
                          : "Open-ended · per night"}
                      </span>
                      <span style={{ color: "#fff", fontWeight: "700" }}>₱{calcWalkInTotal().toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="msec">
                  <div className="msec-title msec-title-blue"><RiMoneyDollarCircleLine size={13} />Payment Option</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {[{val: false, label: "Pay Now", sub: "Collect on check-in"}, {val: true, label: "Pay at Check-Out", sub: "Guest pays when leaving"}].map(opt => (
                      <div key={String(opt.val)} className={`pay-opt${walkInPayLater===opt.val?" active-blue":""}`} onClick={() => setWalkInPayLater(opt.val)}>
                        <div className="pay-opt-title">{opt.label}</div>
                        <div className="pay-opt-sub">{opt.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="msec">
                  <div className="msec-title msec-title-blue">Notes / Special Requests</div>
                  <textarea className="fi" rows={2} style={{ resize: "vertical" }} value={walkIn.notes} onChange={e => setWalkIn({...walkIn, notes: e.target.value})} placeholder="Any special requests..." />
                </div>
                <div className="msec">
                  <div className="msec-title msec-title-blue"><RiMoneyDollarCircleLine size={13} />Additional Charges</div>
                  {(walkIn.additional_charges||[]).length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      {(walkIn.additional_charges||[]).map(c => (
                        <div key={c.id} className="charge-row">
                          <span className="charge-name">{c.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="charge-amt">₱{parseFloat(c.amount).toLocaleString()}</span>
                            <button className="charge-del" onClick={() => setWalkIn({...walkIn, additional_charges: walkIn.additional_charges.filter(x => x.id !== c.id)})}>
                              <RiDeleteBinLine size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <AddChargeBlue onAdd={charge => setWalkIn({...walkIn, additional_charges: [...(walkIn.additional_charges||[]), charge]})} />
                </div>
              </div>
              <div className="mfoot">
                <button className="btn-cancel" onClick={() => setShowWalkIn(false)}>Cancel</button>
                <button className="btn-confirm-blue" onClick={handleWalkIn} disabled={savingWalkIn}>
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