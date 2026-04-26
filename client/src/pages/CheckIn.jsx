import React, { useState, useEffect } from "react";
import {
  RiLoginBoxLine, RiWalkLine, RiUserLine, RiHotelBedLine,
  RiCalendarLine, RiTimeLine,
  RiCheckboxCircleLine, RiMoneyDollarCircleLine, RiDeleteBinLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import { printCheckInReceipt } from "../receiptPrinter ";
import CheckInModal from "../components/checkInModal";
import WalkInModal  from "../components/walkInModal";
import activateQueuedOrders from "../utils/activateQueuedOrders";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c; --green-dark: #055a2f; --green-light: #e8f5ee;
  --gold: #dbba14; --gold-light: #fdf8e1;
  --blue: #1565c0; --blue-light: #e3f2fd;
  --orange: #e65100; --orange-light: #fff3e0;
  --red: #c62828;
  --bg: #f2f5f0; --white: #ffffff; --border: #e2e8e2;
  --text: #1a2e1a; --text-sec: #5a6e5a; --text-muted: #8fa08f;
  --radius: 14px; --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.11);
}

.ci-page { padding: 24px 28px 48px; font-family: 'Roboto', sans-serif; background: var(--bg); min-height: 100%; }

/* ── HEADER ── */
.ci-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.ci-page-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.ci-page-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 24px; background: var(--gold);
  border-radius: 2px; flex-shrink: 0;
}
.ci-page-sub { font-size: .84rem; color: var(--text-muted); margin: 5px 0 0; }

.ci-btn-walkin {
  padding: 10px 20px; background: var(--blue); color: #fff;
  border: none; border-radius: 10px; cursor: pointer;
  font-size: .86rem; font-weight: 700; font-family: 'Roboto', sans-serif;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  box-shadow: 0 4px 14px rgba(21,101,192,.22);
  transition: background .2s, transform .15s;
  position: relative; overflow: hidden;
}
.ci-btn-walkin::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--gold); opacity: 0; transition: opacity .2s;
}
.ci-btn-walkin:hover { background: #0d47a1; transform: translateY(-1px); }
.ci-btn-walkin:hover::after { opacity: 1; }

/* ── STAT CARDS ── */
.ci-sc-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.ci-sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent; transition: transform .15s, box-shadow .15s;
}
.ci-sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.ci-sc::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--gold); opacity: 0; transition: opacity .2s;
}
.ci-sc:hover::after { opacity: 1; }
.ci-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.ci-sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.ci-sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── FILTER BAR ── */
.ci-fbar {
  background: var(--white); border-radius: var(--radius);
  padding: 13px 20px; margin-bottom: 20px;
  border: 1px solid var(--border); box-shadow: var(--shadow);
  position: relative; display: flex; align-items: center;
}
.ci-fbar-icon { position: absolute; left: 32px; color: var(--text-muted); pointer-events: none; }
.ci-finput {
  width: 100%; padding: 9px 14px 9px 36px;
  border: 1.5px solid var(--border); border-radius: 9px;
  font-size: .88rem; font-family: 'Roboto', sans-serif; color: var(--text);
  outline: none; background: var(--bg); transition: border-color .2s, box-shadow .2s;
}
.ci-finput:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); background: var(--white); }
.ci-finput::placeholder { color: var(--text-muted); font-style: italic; }

/* ── SECTION HEADER ── */
.ci-sec-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.ci-sec-dot  { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.ci-sec-title { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
.ci-sec-count {
  font-size: .68rem; font-weight: 700;
  padding: 2px 9px; border-radius: 20px;
  background: var(--bg); color: var(--text-muted); border: 1px solid var(--border);
}

/* ── GUEST CARD ── */
.ci-card {
  background: var(--white); border-radius: var(--radius);
  border: 1px solid var(--border); overflow: hidden;
  box-shadow: var(--shadow); display: flex; margin-bottom: 10px;
  transition: box-shadow .2s, transform .15s;
}
.ci-card:hover { box-shadow: var(--shadow-md); }

.ci-left {
  background: linear-gradient(180deg, var(--green) 0%, #0a9150 100%);
  padding: 16px 14px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  min-width: 90px; flex-shrink: 0; position: relative; overflow: hidden;
}
.ci-left::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--gold);
}
.ci-left.overdue  { background: linear-gradient(180deg, var(--orange) 0%, #ff9800 100%); }
.ci-left.upcoming { background: linear-gradient(180deg, var(--blue) 0%, #1976d2 100%); }

.ci-room-lbl { font-size: .58rem; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
.ci-room-num { font-size: 1.6rem; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -0.02em; }
.ci-type-badge { background: rgba(255,255,255,.15); border-radius: 7px; padding: 4px 9px; margin-top: 8px; text-align: center; border: 1px solid rgba(219,186,20,.25); }
.ci-type-val   { font-size: .7rem; color: #fff; font-weight: 700; }

.ci-body { padding: 14px 18px; flex: 1; min-width: 0; }

.ci-overdue-banner {
  background: var(--orange-light); border: 1px solid #ffb74d;
  border-radius: 7px; padding: 7px 12px; margin-bottom: 8px;
  font-size: .76rem; color: var(--orange); display: flex; align-items: center; gap: 6px; font-weight: 600;
}
.ci-portal-banner {
  background: var(--green-light); border: 1px solid #a5d6a7;
  border-radius: 7px; padding: 5px 12px; margin-bottom: 8px;
  font-size: .72rem; color: var(--green); display: flex; align-items: center; gap: 6px;
}

.ci-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
.ci-info { background: var(--bg); border-radius: var(--radius-sm); padding: 8px 10px; }
.ci-info-lbl {
  font-size: .62rem; color: var(--text-muted); font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  display: flex; align-items: center; gap: 3px; margin-bottom: 2px;
}
.ci-info-val { font-size: .84rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.ci-bottom { display: flex; justify-content: flex-end; align-items: center; gap: 8px; flex-wrap: wrap; }

.ci-status-tag { padding: 3px 10px; border-radius: 20px; font-size: .7rem; font-weight: 700; margin-right: auto; }

.ci-btn-del {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 11px; background: #fff5f5;
  border: 1.5px solid #fca5a5; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .76rem; font-weight: 700; color: #dc2626;
  font-family: 'Roboto', sans-serif; transition: background .15s;
}
.ci-btn-del:hover { background: #fee2e2; }

.ci-btn-edit-room {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 13px; background: var(--gold-light);
  border: 1.5px solid rgba(219,186,20,.4); border-radius: var(--radius-sm);
  cursor: pointer; font-size: .76rem; font-weight: 700; color: #7a5f00;
  font-family: 'Roboto', sans-serif; transition: background .15s;
}
.ci-btn-edit-room:hover { background: rgba(219,186,20,.2); }

.ci-btn-checkin {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 18px; background: var(--green); color: #fff;
  border: none; border-radius: var(--radius-sm); cursor: pointer;
  font-size: .82rem; font-weight: 700; font-family: 'Roboto', sans-serif;
  box-shadow: 0 2px 8px rgba(7,113,60,.22); transition: background .15s, transform .1s;
  position: relative; overflow: hidden;
}
.ci-btn-checkin::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: var(--gold); opacity: 0; transition: opacity .2s;
}
.ci-btn-checkin:hover { background: var(--green-dark); transform: translateY(-1px); }
.ci-btn-checkin:hover::after { opacity: 1; }

/* ── EMPTY STATE ── */
.ci-empty {
  background: var(--white); border-radius: var(--radius);
  padding: 60px; text-align: center;
  border: 1px solid var(--border); box-shadow: var(--shadow);
}

/* ── INLINE MODALS (Edit Room + Delete Confirm) ── */
.ci-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.52);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px; overflow-y: auto;
  font-family: 'Roboto', sans-serif;
}
.ci-modal-box {
  background: var(--bg); border-radius: 20px;
  box-shadow: 0 24px 80px rgba(0,0,0,.24);
  overflow: hidden; margin: auto;
}
.ci-modal-hdr {
  padding: 22px 28px; display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.ci-modal-hdr::before {
  content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,.12); top: -70px; right: -50px; pointer-events: none;
}
.ci-modal-hdr::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--gold);
}
.ci-modal-hdr-green { background: var(--green); }
.ci-modal-hdr-red   { background: var(--red); }
.ci-modal-hdr-title { margin: 0; color: white; font-size: 1.1rem; font-weight: 700; position: relative; z-index: 1; }
.ci-modal-hdr-sub   { margin: 4px 0 0; color: rgba(255,255,255,.65); font-size: .8rem; position: relative; z-index: 1; }
.ci-modal-hdr-close {
  background: rgba(255,255,255,.12); border: none;
  width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; color: white; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; flex-shrink: 0; position: relative; z-index: 1;
}
.ci-modal-hdr-close:hover { background: rgba(255,255,255,.26); }

.ci-modal-body { padding: 22px 28px; }

.ci-modal-section {
  background: var(--white); border-radius: var(--radius-sm);
  padding: 14px 16px; margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.06); border: 1px solid var(--border);
}
.ci-modal-sec-title {
  font-size: .7rem; font-weight: 700; color: var(--green);
  text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.ci-modal-sec-title::before {
  content: ''; display: inline-block; width: 12px; height: 2px;
  background: var(--gold); border-radius: 1px;
}
.ci-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ci-modal-meta {
  background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px;
}
.ci-modal-meta-lbl { color: var(--text-muted); font-size: .72rem; font-weight: 700; text-transform: uppercase; }
.ci-modal-meta-val { font-weight: 600; color: var(--text); margin-top: 2px; font-size: .87rem; }

.ci-modal-select {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; font-family: 'Roboto', sans-serif;
  outline: none; background: var(--white); color: var(--text);
  cursor: pointer; transition: border-color .2s, box-shadow .2s;
}
.ci-modal-select:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); }

.ci-modal-room-preview {
  margin-top: 12px; background: var(--green-light);
  border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.ci-modal-room-preview::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: var(--gold);
}
.ci-modal-no-rooms {
  font-size: .8rem; color: var(--orange); margin-top: 8px;
  padding: 10px 14px; background: var(--orange-light);
  border-radius: var(--radius-sm); border: 1px solid #ffb74d;
}

.ci-modal-footer { display: flex; gap: 12px; }
.ci-modal-btn-cancel {
  flex: 1; padding: 11px; background: var(--white);
  border: 1.5px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Roboto', sans-serif; transition: border-color .15s;
}
.ci-modal-btn-cancel:hover { border-color: #b0c8b0; }
.ci-modal-btn-confirm {
  flex: 2; padding: 11px; border: none; border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 700; color: white;
  font-family: 'Roboto', sans-serif; display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: background .2s; position: relative; overflow: hidden;
}
.ci-modal-btn-confirm::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 2px; background: var(--gold); opacity: 0; transition: opacity .2s;
}
.ci-modal-btn-confirm:not(:disabled):hover::after { opacity: 1; }
.ci-modal-btn-confirm:disabled { cursor: not-allowed; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) { .ci-sc-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px)  { .ci-page { padding: 20px 20px 48px; } }
@media (max-width: 640px) {
  .ci-sc-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .ci-page  { padding: 16px 14px 48px; }
  .ci-title { font-size: 1.3rem; }
  .ci-card  { flex-direction: column; }
  .ci-left  { flex-direction: row; gap: 16px; min-width: unset; padding: 12px 16px; justify-content: flex-start; }
  .ci-info-grid { grid-template-columns: 1fr 1fr; }
  .ci-bottom { justify-content: flex-start; }
}
@media (max-width: 420px) {
  .ci-sc-4 { grid-template-columns: 1fr; }
  .ci-info-grid { grid-template-columns: 1fr; }
}
`;

export default function CheckIn({ user }) {
  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");

  const [showModal,  setShowModal]  = useState(false);
  const [selected,   setSelected]   = useState(null);
  const [processing, setProcessing] = useState(false);

  const [showEditRoom, setShowEditRoom] = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);
  const [editRoomId,   setEditRoomId]   = useState("");
  const [savingEdit,   setSavingEdit]   = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget,      setDeleteTarget]      = useState(null);
  const [deleting,          setDeleting]          = useState(false);

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [
      { data: resData },
      { data: newGuestData },
      { data: roomData },
    ] = await Promise.all([
      supabase.from("reservations").select("*").in("status", ["confirmed", "pending"]).order("check_in"),
      supabase.from("newGuest").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").order("room_number"),
    ]);

    const fromReservations = (resData || []).map(r => ({ ...r, _source: "reservations" }));
    const fromGuestPortal  = (newGuestData || []).map(r => ({ ...r, _source: "newGuest" }));
    const merged = [...fromReservations, ...fromGuestPortal].sort((a, b) => new Date(a.check_in) - new Date(b.check_in));

    setReservations(merged);
    setRooms(roomData || []);
    setLoading(false);
  };

  const availableRooms = rooms.filter(r => r.status === "available");

  const openCheckIn = (res) => { setSelected(res); setShowModal(true); };

  const handleCheckIn = async ({ paidAmt, payLater, isPartial, paymentMethod, additionalCharges }) => {
    setProcessing(true);
    try {
      const checkedId  = selected.id;
      const tableName  = selected._source || "reservations";
      const baseTotal = parseFloat(selected?.total_amount || 0);
const pureRoomRate = baseTotal - (() => {
  try {
    return JSON.parse(selected.additional_charges || "[]")
      .filter(c => c.from_reservation)
      .reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  } catch { return 0; }
})();
      const newCheckinCharges      = (additionalCharges || []).filter(c => !c.from_reservation);
      const newCheckinChargesTotal = newCheckinCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
      const totalBill              = baseTotal + newCheckinChargesTotal;
      const existingCharges        = (() => { try { return JSON.parse(selected.additional_charges || "[]"); } catch { return []; } })();
      const mergedCharges = [
        ...existingCharges,
        ...newCheckinCharges.filter(c => !existingCharges.some(ec => ec.id === c.id)).map(c => ({ ...c, from_checkin: true })),
      ];
      const remainingAtCheckIn = Math.max(0, totalBill - paidAmt);
      let reservationIdForOrders = checkedId;

      if (tableName === "newGuest") {
        const { data: newRes, error: insertErr } = await supabase.from("reservations").insert([{
          guest_name: selected.guest_name, guest_email: selected.guest_email || selected.email || "",
          guest_phone: selected.guest_phone || selected.phone || "", room_id: selected.room_id,
          room_number: selected.room_number, check_in: selected.check_in, check_out: selected.check_out || null,
          notes: selected.notes || null, status: "checked_in", total_amount: totalBill,
          additional_charges: JSON.stringify(mergedCharges), amount_paid: paidAmt,
          pay_later: payLater || isPartial, payment_method: payLater ? "pay_at_checkout" : paymentMethod,
          remaining_balance: remainingAtCheckIn, checkin_balance: remainingAtCheckIn,
          room_rate: pureRoomRate,
          }]).select("id").single();
        if (insertErr) { alert("Check-in failed: " + insertErr.message); setProcessing(false); return; }
        reservationIdForOrders = newRes.id;
        await supabase.from("newGuest").delete().eq("id", checkedId);
      } else {
        const { error: updateErr } = await supabase.from("reservations").update({
          status: "checked_in", payment_method: payLater ? "pay_at_checkout" : paymentMethod,
          amount_paid: paidAmt, pay_later: payLater || isPartial, total_amount: totalBill,
          additional_charges: JSON.stringify(mergedCharges), remaining_balance: remainingAtCheckIn, checkin_balance: remainingAtCheckIn,
          room_rate: pureRoomRate,
          }).eq("id", checkedId);
        if (updateErr) { alert("Check-in failed: " + updateErr.message); setProcessing(false); return; }
      }

      await supabase.from("rooms").update({ status: "occupied" }).eq("id", selected.room_id);
      try { await activateQueuedOrders(reservationIdForOrders, selected.guest_name, selected.room_number); } catch (orderErr) { console.warn("activateQueuedOrders warning:", orderErr); }

if (paidAmt > 0) {
  const { data: paidRes } = await supabase
    .from("reservations")
    .select("id, payment_history")
    .eq("id", reservationIdForOrders)
    .single();

  if (paidRes) {
    const history = (() => { try { return JSON.parse(paidRes.payment_history || "[]"); } catch { return []; } })();

    const alreadyHasDownpayment = history.some(h => h.note?.includes("downpayment collected at reservation"));
    const alreadyHasCheckin     = history.some(h => h.note?.includes("Cash collected at check-in"));

    if (!alreadyHasCheckin) {
      // If has downpayment, only record the remaining amount paid at check-in
      const downpaymentAmt = alreadyHasDownpayment
        ? history.find(h => h.note?.includes("downpayment collected at reservation"))?.amount || 0
        : 0;
      const checkinAmt = paidAmt - downpaymentAmt;

      if (checkinAmt > 0) {
        history.push({
          type:   "inhouse_payment",
          amount: checkinAmt,
          date:   today,
          note:   `Cash collected at check-in · ₱${checkinAmt.toLocaleString()}`,
        });
        await supabase.from("reservations")
          .update({ payment_history: JSON.stringify(history) })
          .eq("id", paidRes.id);
      }
    }
  }
}
      logActivity({ action: `Checked in guest: ${selected.guest_name}`, category: "check_in", details: `Room ${selected.room_number} | ${payLater ? "Pay at checkout" : `Paid ₱${paidAmt.toLocaleString()}`} | Source: ${tableName}`, entity_type: "reservation", entity_id: reservationIdForOrders });

      const ciReceipt = {
        guestName: selected.guest_name, roomNumber: selected.room_number,
        checkInDate: selected.check_in, checkOutDate: selected.check_out || null,
        nights: selected.check_out ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000) : null,
        guestPhone: selected.guest_phone || selected.phone || "", guestNotes: selected.notes || "",
        roomCharge: baseTotal, resCharges: existingCharges.filter(c => c.from_reservation),
        walkInCharges: additionalCharges || [], grandTotal: totalBill, amountPaid: paidAmt,
        payMethod: payLater ? "pay_at_checkout" : paymentMethod,
      };

      setReservations(prev => prev.filter(r => r.id !== checkedId));
      setProcessing(false); setShowModal(false); setSelected(null);
      printCheckInReceipt(ciReceipt, { name: user?.full_name || user?.name || user?.email || user?.user_metadata?.full_name || "Staff", role: user?.role || user?.user_metadata?.role || "Staff" });
      setTimeout(() => fetchData(), 500);
    } catch (err) {
      console.error("handleCheckIn unexpected error:", err);
      alert("Something went wrong: " + (err.message || "Unknown error"));
      setProcessing(false);
    }
  };

  const handleSaveEditRoom = async () => {
    if (!editRoomId || !editTarget) { setShowEditRoom(false); return; }
    const newRoom = rooms.find(r => r.id === editRoomId);
    if (!newRoom) return;
    setSavingEdit(true);
    const table = editTarget._source || "reservations";
    await supabase.from(table).update({ room_id: editRoomId, room_number: newRoom.room_number }).eq("id", editTarget.id);
    setSavingEdit(false); setShowEditRoom(false); setEditTarget(null); setEditRoomId("");
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const table = deleteTarget._source || "reservations";
    await supabase.from(table).delete().eq("id", deleteTarget.id);
    await logActivity({ action: `Deleted pending reservation: ${deleteTarget.guest_name}`, category: "delete", details: `Room ${deleteTarget.room_number} | Source: ${table}`, entity_type: table, entity_id: deleteTarget.id });
    setDeleting(false); setShowDeleteConfirm(false); setDeleteTarget(null);
    fetchData();
  };

  const calcWalkInTotal = () => {
    const room = rooms.find(r => r.id === walkIn.room_id);
    if (!room || !walkIn.check_in) return 0;
    const nights = walkIn.check_out ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) : 1;
    return nights * parseFloat(room.price) + (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  };
  const calcWalkInRoomOnly = () => {
    const room = rooms.find(r => r.id === walkIn.room_id);
    if (!room || !walkIn.check_in) return 0;
    const nights = walkIn.check_out ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) : 1;
    return nights * parseFloat(room.price);
  };

  const handleWalkIn = async () => {
    setWalkInError("");
    if (!walkIn.guest_name || !walkIn.room_id || !walkIn.check_in) { setWalkInError("Please fill in guest name, room, and check-in date."); return; }
    if (walkIn.check_out && new Date(walkIn.check_out) <= new Date(walkIn.check_in)) { setWalkInError("Check-out must be after check-in."); return; }
    setSavingWalkIn(true);
    const room   = rooms.find(r => r.id === walkIn.room_id);
    const nights = walkIn.check_out ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) : 1;
    const total  = nights * parseFloat(room?.price || 0);
    const walkInChargesTotal   = (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const totalWithCharges     = total + walkInChargesTotal;
    const amtReceived          = parseFloat(walkIn.amount_received || 0);
    const paidAmt              = walkInPayLater ? 0 : (amtReceived > 0 ? Math.min(amtReceived, totalWithCharges) : totalWithCharges);
    const remainingAtCheckIn   = Math.max(0, totalWithCharges - paidAmt);

    const { error } = await supabase.from("reservations").insert({
      guest_name: walkIn.guest_name, guest_email: walkIn.guest_email, guest_phone: walkIn.guest_phone,
      room_id: walkIn.room_id, room_number: room?.room_number, check_in: walkIn.check_in,
      ...(walkIn.check_out ? { check_out: walkIn.check_out } : {}),
      status: "checked_in", total_amount: totalWithCharges, notes: walkIn.notes,
      amount_paid: paidAmt, pay_later: walkInPayLater || (!walkInPayLater && amtReceived > 0 && amtReceived < totalWithCharges),
      payment_method: walkInPayLater ? "pay_at_checkout" : "cash",
      additional_charges: JSON.stringify((walkIn.additional_charges || []).map(c => ({ ...c, from_checkin: true }))),
      remaining_balance: remainingAtCheckIn, checkin_balance: remainingAtCheckIn,
      room_rate: total,
      });    

    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }
    await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);

    // Save restaurant orders directly as pending (guest is already checked in)
const restaurantCharges = (walkIn.additional_charges || []).filter(c => c.from_restaurant);
if (restaurantCharges.length > 0) {
  const { data: newRes } = await supabase
    .from("reservations")
    .select("id, room_number")
    .eq("guest_name", walkIn.guest_name)
    .eq("room_id", walkIn.room_id)
    .eq("status", "checked_in")
    .single();

  if (newRes) {
    await supabase.from("restaurant_orders").insert([{
      reservation_id: newRes.id,
      guest_name:     walkIn.guest_name,
      room_number:    String(room?.room_number || ""),
      items: restaurantCharges.map(c => ({
        id:       c.restaurant_item_id || c.id,
        name:     c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""),
        price:    c.unit_price || c.amount,
        qty:      c.qty || 1,
        subtotal: parseFloat(c.amount),
      })),
      total_amount: restaurantCharges.reduce((s, c) => s + parseFloat(c.amount), 0),
      status: "pending",
    }]);
  }
}

    logActivity({ action: `Walk-in check-in: ${walkIn.guest_name}`, category: "check_in", details: `Room ${room?.room_number} | Total ₱${totalWithCharges.toLocaleString()}`, entity_type: "reservation" });
    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }
await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);

// Add payment history entry if payment was made at check-in
if (!walkInPayLater && paidAmt > 0) {
  const { data: newRes } = await supabase
    .from("reservations")
    .select("id, payment_history")
    .eq("guest_name", walkIn.guest_name)
    .eq("room_id", walkIn.room_id)
    .eq("status", "checked_in")
    .single();

  if (newRes) {
    const history = (() => { try { return JSON.parse(newRes.payment_history || "[]"); } catch { return []; } })();
    history.push({
      type:   "inhouse_payment",
      amount: paidAmt,
      date:   today,
      note:   `Cash collected at check-in · ₱${paidAmt.toLocaleString()}`,
    });
    await supabase.from("reservations")
      .update({ payment_history: JSON.stringify(history) })
      .eq("id", newRes.id);
  }
}

    const wiReceipt = {
      guestName: walkIn.guest_name, roomNumber: room?.room_number,
      checkInDate: walkIn.check_in, checkOutDate: walkIn.check_out || null,
      nights: walkIn.check_out ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) : null,
      guestPhone: walkIn.guest_phone || "", guestNotes: walkIn.notes || "",
      roomCharge: total, resCharges: [], walkInCharges: walkIn.additional_charges || [],
      grandTotal: totalWithCharges, amountPaid: paidAmt, payMethod: walkInPayLater ? "pay_at_checkout" : "cash",
    };

    setSavingWalkIn(false); setShowWalkIn(false);
    setWalkIn({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: today, check_out: "", notes: "", additional_charges: [] });
    printCheckInReceipt(wiReceipt, { name: user?.full_name || user?.user_metadata?.full_name || user?.name || user?.email || "Staff", role: user?.role || user?.user_metadata?.role || "" });
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
    const resNights = res.check_out ? Math.max(0, Math.round((new Date(res.check_out) - new Date(res.check_in)) / 86400000)) : null;
    const isPortal  = res._source === "newGuest";

    return (
      <div className="ci-card">
        <div className={`ci-left${isOverdue ? " overdue" : isToday ? "" : " upcoming"}`}>
          <div className="ci-room-lbl">Room</div>
          <div className="ci-room-num">{res.room_number || "—"}</div>
          <div className="ci-type-badge">
            <div className="ci-type-val">{resNights != null ? `${resNights}n` : "Open"}</div>
          </div>
        </div>

        <div className="ci-body">
          {isOverdue && (
            <div className="ci-overdue-banner">
              ⚠️ Overdue — guest was expected on {res.check_in}. Please follow up or reassign.
            </div>
          )}
          {isPortal && (
            <div className="ci-portal-banner">🌐 Submitted via Guest Portal</div>
          )}

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
              <div className="ci-info-val" style={{ color: "var(--green)" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
            </div>
            {res.notes ? (
              <div className="ci-info" style={{ background: "#fffdf0", border: "1px solid #f0de7a", display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                <span style={{ fontSize: ".8rem", flexShrink: 0 }}>📝</span>
                <div style={{ minWidth: 0 }}>
                  <div className="ci-info-lbl" style={{ color: "#b45309" }}>Notes</div>
                  <div className="ci-info-val" style={{ color: "#7a6500", fontWeight: "500" }}>{res.notes}</div>
                </div>
              </div>
            ) : res.guest_phone ? (
              <div className="ci-info">
                <div className="ci-info-lbl"><RiUserLine size={10} />Phone</div>
                <div className="ci-info-val">{res.guest_phone}</div>
              </div>
            ) : null}
          </div>

          <div className="ci-bottom">
            <span
              className="ci-status-tag"
              style={{
                background: isOverdue ? "var(--orange-light)" : isToday ? "var(--green-light)" : "var(--blue-light)",
                color:      isOverdue ? "var(--orange)"       : isToday ? "var(--green)"       : "var(--blue)",
              }}
            >
              {isOverdue ? "⚠ Overdue" : isToday ? "Today" : "Upcoming"}
            </span>

            <button className="ci-btn-del" onClick={() => { setDeleteTarget(res); setShowDeleteConfirm(true); }} title="Delete reservation">
              <RiDeleteBinLine size={14} />
            </button>
            <button className="ci-btn-edit-room" onClick={() => { setEditTarget(res); setEditRoomId(res.room_id || ""); setShowEditRoom(true); }}>
              ✏ Edit Room
            </button>
            <button className="ci-btn-checkin" onClick={() => openCheckIn(res)}>
              <RiLoginBoxLine size={14} />Check In
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, data, dot }) => data.length > 0 && (
    <div style={{ marginBottom: "24px" }}>
      <div className="ci-sec-hdr">
        <div className="ci-sec-dot" style={{ background: dot }} />
        <h3 className="ci-sec-title">{title}</h3>
        <span className="ci-sec-count">{data.length}</span>
      </div>
      {data.map(r => <GuestCard key={r.id} res={r} />)}
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="ci-page">

        <div className="ci-hdr">
          <div>
            <h2 className="ci-page-title">Check-In</h2>
            <p className="ci-page-sub">Process guest arrivals and walk-ins</p>
          </div>
          <button className="ci-btn-walkin" onClick={() => setShowWalkIn(true)}>
            <RiWalkLine size={16} />Walk-In Guest
          </button>
        </div>

        <div className="ci-sc-4">
          {[
            { label: "Today's Arrivals", val: reservations.filter(r => r.check_in === today).length, Icon: RiCalendarLine, bg: "#e8f5e9", c: "#07713c" },
            { label: "Overdue",          val: reservations.filter(r => r.check_in < today).length,   Icon: RiTimeLine,    bg: "#fff3e0", c: "#e65100" },
            { label: "Upcoming",         val: reservations.filter(r => r.check_in > today).length,   Icon: RiCalendarLine,bg: "#e3f2fd", c: "#1565c0" },
            { label: "Available Rooms",  val: availableRooms.length,                                  Icon: RiHotelBedLine,bg: "#fdf8e1", c: "#7a5f00" },
          ].map(({ label, val, Icon, bg, c }) => (
            <div key={label} className="ci-sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="ci-sc-row"><Icon size={18} color={c} /><span className="ci-sc-lbl" style={{ color: c }}>{label}</span></div>
              <div className="ci-sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="ci-fbar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ci-fbar-icon" style={{position:'absolute',left:32,pointerEvents:'none',color:'var(--text-muted)'}}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input className="ci-finput" placeholder="Search guest name, room, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="ci-empty"><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="ci-empty">
            <RiCheckboxCircleLine size={48} color="var(--green)" style={{ marginBottom: "12px" }} />
            <div style={{ fontWeight: "700", color: "var(--text)", fontFamily: "Roboto,sans-serif" }}>No pending check-ins!</div>
            <div style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: ".85rem", fontFamily: "Roboto,sans-serif" }}>All reservations have been processed.</div>
          </div>
        ) : (
          <>
            <Section title="Overdue — Not Yet Checked In" data={overdueArr}  dot="var(--orange)" />
            <Section title="Today's Arrivals"              data={todayArr}    dot="var(--green)" />
            <Section title="Upcoming Arrivals"             data={upcomingArr} dot="var(--blue)" />
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

        {showEditRoom && editTarget && (
          <div className="ci-modal-overlay" onClick={() => { setShowEditRoom(false); setEditTarget(null); setEditRoomId(""); }}>
            <div className="ci-modal-box" style={{ width: "min(520px, 95vw)" }} onClick={e => e.stopPropagation()}>
              <div className="ci-modal-hdr ci-modal-hdr-green">
                <div>
                  <p className="ci-modal-hdr-title">Change Room Assignment</p>
                  <p className="ci-modal-hdr-sub">{editTarget.guest_name}</p>
                </div>
                <button className="ci-modal-hdr-close" onClick={() => { setShowEditRoom(false); setEditTarget(null); setEditRoomId(""); }}>×</button>
              </div>
              <div className="ci-modal-body">
                <div className="ci-modal-section">
                  <div className="ci-modal-sec-title">Current Assignment</div>
                  <div className="ci-modal-grid">
                    {[["Guest", editTarget.guest_name], ["Room", editTarget.room_number ? `Room ${editTarget.room_number}` : "Not assigned"], ["Check-In", editTarget.check_in], ["Check-Out", editTarget.check_out || "Open Stay"]].map(([k, v]) => (
                      <div key={k} className="ci-modal-meta">
                        <div className="ci-modal-meta-lbl">{k}</div>
                        <div className="ci-modal-meta-val">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ci-modal-section">
                  <div className="ci-modal-sec-title">Select New Room</div>
                  <select className="ci-modal-select" value={editRoomId} onChange={e => setEditRoomId(e.target.value)}>
                    <option value="">— Select a room —</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                  {availableRooms.length === 0 && (
                    <div className="ci-modal-no-rooms">⚠ No available rooms right now. Free up a room first.</div>
                  )}
                  {editRoomId && (() => {
                    const r = rooms.find(rm => rm.id === editRoomId);
                    return r ? (
                      <div className="ci-modal-room-preview">
                        <div>
                          <div style={{ fontWeight: "700", color: "var(--green)", fontSize: ".95rem" }}>Room {r.room_number}</div>
                          <div style={{ color: "var(--text-sec)", fontSize: ".82rem", marginTop: "2px" }}>{r.type} · Floor {r.floor}</div>
                        </div>
                        <div style={{ fontWeight: "700", color: "var(--green)" }}>₱{parseFloat(r.price).toLocaleString()}/night</div>
                      </div>
                    ) : null;
                  })()}
                </div>
                <div className="ci-modal-footer">
                  <button className="ci-modal-btn-cancel" onClick={() => { setShowEditRoom(false); setEditTarget(null); setEditRoomId(""); }}>Cancel</button>
                  <button
                    className="ci-modal-btn-confirm"
                    onClick={handleSaveEditRoom}
                    disabled={savingEdit || !editRoomId}
                    style={{ background: savingEdit || !editRoomId ? "#aaa" : "var(--green)" }}
                  >
                    {savingEdit ? "Saving..." : "Save Room Change"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && deleteTarget && (
          <div className="ci-modal-overlay" onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>
            <div className="ci-modal-box" style={{ width: "min(440px, 95vw)" }} onClick={e => e.stopPropagation()}>
              <div className="ci-modal-hdr ci-modal-hdr-red">
                <div>
                  <p className="ci-modal-hdr-title">Delete Reservation</p>
                  <p className="ci-modal-hdr-sub">This action cannot be undone</p>
                </div>
                <button className="ci-modal-hdr-close" onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>×</button>
              </div>
              <div className="ci-modal-body">
                <div className="ci-modal-section" style={{ background: "#fff5f5", borderColor: "#fca5a5" }}>
                  <div className="ci-modal-grid" style={{ marginBottom: "12px" }}>
                    {[["Guest", deleteTarget.guest_name], ["Room", deleteTarget.room_number ? `Room ${deleteTarget.room_number}` : "—"], ["Check-In", deleteTarget.check_in], ["Source", deleteTarget._source === "newGuest" ? "Guest Portal" : "Reservation"]].map(([k, v]) => (
                      <div key={k} className="ci-modal-meta">
                        <div className="ci-modal-meta-lbl">{k}</div>
                        <div className="ci-modal-meta-val">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "var(--red)", fontWeight: "600", padding: "10px 12px", background: "#fce4ec", borderRadius: "var(--radius-sm)" }}>
                    ⚠ Deleting this will permanently remove the reservation from the system.
                  </div>
                </div>
                <div className="ci-modal-footer">
                  <button className="ci-modal-btn-cancel" onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}>Cancel</button>
                  <button
                    className="ci-modal-btn-confirm"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ background: deleting ? "#aaa" : "var(--red)" }}
                  >
                    <RiDeleteBinLine size={16} />
                    {deleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}