import React, { useState, useEffect } from "react";
import {
  RiLoginBoxLine, RiWalkLine, RiUserLine, RiHotelBedLine,
  RiCalendarLine, RiTimeLine,
  RiCheckboxCircleLine, RiMoneyDollarCircleLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import { printCheckInReceipt } from "../receiptPrinter ";
import CheckInModal from "../components/checkInModal";
import WalkInModal  from "../components/walkInModal";
import activateQueuedOrders from "../utils/activateQueuedOrders";

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
`;

export default function CheckIn({ user }) {
  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");

  const [showModal,  setShowModal]  = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [processing, setProcessing] = useState(false);

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

  const openCheckIn = (res) => {
    setSelected(res);
    setShowModal(true);
  };

  const handleCheckIn = async ({ paidAmt, payLater, isPartial, paymentMethod, additionalCharges }) => {
    setProcessing(true);
    const checkedId = selected.id;

    const baseTotal = parseFloat(selected?.total_amount || 0);

    const newCheckinCharges = (additionalCharges || []).filter(c => !c.from_reservation);
    const newCheckinChargesTotal = newCheckinCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);

    const totalBill = baseTotal + newCheckinChargesTotal;

    const existingCharges = (() => {
      try { return JSON.parse(selected.additional_charges || "[]"); } catch { return []; }
    })();

    const mergedCharges = [
      ...existingCharges,
      ...newCheckinCharges
        .filter(c => !existingCharges.some(ec => ec.id === c.id))
        .map(c => ({ ...c, from_checkin: true })),
    ];

    const remainingAtCheckIn = Math.max(0, totalBill - paidAmt);

    await supabase.from("reservations").update({
      status:             "checked_in",
      payment_method:     payLater ? "pay_at_checkout" : paymentMethod,
      amount_paid:        paidAmt,
      pay_later:          payLater || isPartial,
      total_amount:       totalBill,
      additional_charges: JSON.stringify(mergedCharges),
      remaining_balance:  remainingAtCheckIn,
      checkin_balance:    remainingAtCheckIn,
    }).eq("id", checkedId);

    await supabase.from("rooms").update({ status: "occupied" }).eq("id", selected.room_id);

    await activateQueuedOrders(selected.id, selected.guest_name, selected.room_number);

    logActivity({
      action:      `Checked in guest: ${selected.guest_name}`,
      category:    "check_in",
      details:     `Room ${selected.room_number} | ${payLater ? "Pay at checkout" : `Paid ₱${paidAmt.toLocaleString()}`}`,
      entity_type: "reservation",
      entity_id:   checkedId,
    });

    const ciReceipt = {
      guestName:    selected.guest_name,
      roomNumber:   selected.room_number,
      checkInDate:  selected.check_in,
      checkOutDate: selected.check_out || null,
      nights:       selected.check_out
        ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)
        : null,
      guestPhone:    selected.guest_phone || "",
      guestNotes:    selected.notes || "",
      roomCharge:    baseTotal,
      resCharges:    existingCharges.filter(c => c.from_reservation),
      walkInCharges: additionalCharges || [],
      grandTotal:    totalBill,
      amountPaid:    paidAmt,
      payMethod:     payLater ? "pay_at_checkout" : paymentMethod,
    };

    setReservations(prev => prev.filter(r => r.id !== checkedId));
    setProcessing(false);
    setShowModal(false);
    setSelected(null);

    printCheckInReceipt(
      ciReceipt,
      { name: user?.full_name || user?.email || "Staff", role: user?.role || "" }
    );

    setTimeout(() => fetchData(), 500);
  };

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
    const total = nights * parseFloat(room?.price || 0);

    const walkInChargesTotal = (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const totalWithCharges   = total + walkInChargesTotal;
    const amtReceived        = parseFloat(walkIn.amount_received || 0);

    const paidAmt = walkInPayLater ? 0 : (amtReceived > 0 ? Math.min(amtReceived, totalWithCharges) : totalWithCharges);
    const remainingAtCheckIn = Math.max(0, totalWithCharges - paidAmt);

    const { error } = await supabase.from("reservations").insert({
      guest_name:         walkIn.guest_name,
      guest_email:        walkIn.guest_email,
      guest_phone:        walkIn.guest_phone,
      room_id:            walkIn.room_id,
      room_number:        room?.room_number,
      check_in:           walkIn.check_in,
      ...(walkIn.check_out ? { check_out: walkIn.check_out } : {}),
      status:             "checked_in",
      total_amount:       totalWithCharges,
      notes:              walkIn.notes,
      amount_paid:        paidAmt,
      pay_later:          walkInPayLater || (!walkInPayLater && amtReceived > 0 && amtReceived < totalWithCharges),
      payment_method:     walkInPayLater ? "pay_at_checkout" : "cash",
      additional_charges: JSON.stringify(walkIn.additional_charges || []),
      remaining_balance:  remainingAtCheckIn,
      checkin_balance:    remainingAtCheckIn,
    });

    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }

    await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);

    logActivity({
      action:      `Walk-in check-in: ${walkIn.guest_name}`,
      category:    "check_in",
      details:     `Room ${room?.room_number} | Total ₱${totalWithCharges.toLocaleString()}`,
      entity_type: "reservation",
    });

    const wiReceipt = {
      guestName:    walkIn.guest_name,
      roomNumber:   room?.room_number,
      checkInDate:  walkIn.check_in,
      checkOutDate: walkIn.check_out || null,
      nights:       walkIn.check_out
        ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)
        : null,
      guestPhone:    walkIn.guest_phone || "",
      guestNotes:    walkIn.notes || "",
      roomCharge:    total,
      resCharges:    [],
      walkInCharges: walkIn.additional_charges || [],
      grandTotal:    totalWithCharges,
      amountPaid:    paidAmt,
      payMethod:     walkInPayLater ? "pay_at_checkout" : "cash",
    };

    setSavingWalkIn(false);
    setShowWalkIn(false);
    setWalkIn({
      guest_name: "", guest_email: "", guest_phone: "",
      room_id: "", check_in: today, check_out: "", notes: "", additional_charges: [],
    });

    printCheckInReceipt(
      wiReceipt,
      { name: user?.full_name || user?.email || "Staff", role: user?.role || "" }
    );

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
              color:      isOverdue ? "#e65100" : isToday ? "#07713c" : "#1565c0",
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

        <div className="fbar">
          <input className="finput" placeholder="Search guest name, room, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

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

        {showModal && selected && (
          <CheckInModal
            selected={selected}
            onClose={() => { setShowModal(false); setSelected(null); }}
            onConfirm={handleCheckIn}
            processing={processing}
          />
        )}

        {showWalkIn && (
          <WalkInModal
            walkIn={walkIn}                 setWalkIn={setWalkIn}
            walkInPayLater={walkInPayLater} setWalkInPayLater={setWalkInPayLater}
            walkInError={walkInError}
            savingWalkIn={savingWalkIn}
            availableRooms={availableRooms}
            calcWalkInTotal={calcWalkInTotal}
            calcWalkInRoomOnly={calcWalkInRoomOnly}
            onClose={() => setShowWalkIn(false)}
            onConfirm={handleWalkIn}
          />
        )}

      </div>
    </>
  );
}