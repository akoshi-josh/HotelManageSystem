import React, { useState, useEffect } from "react";
import {
  RiHotelBedLine, RiTimeLine, RiMoneyDollarCircleLine, RiEyeLine, RiSearchLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import InhouseModal from "../components/InhouseModal";

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

.ih-root { padding: 24px 28px 48px; font-family: 'Roboto', sans-serif; background: var(--bg); min-height: 100%; }

/* ── HEADER ── */
.ih-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.ih-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.ih-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 24px;
  background: var(--gold); border-radius: 2px; flex-shrink: 0;
}
.ih-sub { font-size: .84rem; color: var(--text-muted); margin: 5px 0 0; }

/* ── STAT CARDS ── */
.sc-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; }
.sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.sc::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.sc:hover::after { opacity: 1; }
.sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── FILTER BAR ── */
.fbar {
  background: var(--white); border-radius: var(--radius);
  padding: 13px 20px; margin-bottom: 20px;
  border: 1px solid var(--border); box-shadow: var(--shadow);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.fbar-search-wrap { flex: 1; min-width: 180px; position: relative; display: flex; align-items: center; }
.finput {
  padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px;
  font-size: .86rem; font-family: 'Roboto', sans-serif; color: var(--text);
  outline: none; background: var(--bg); transition: border-color .2s, box-shadow .2s;
}
.finput.with-icon { padding-left: 34px; width: 100%; }
.finput:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); background: var(--white); }
.finput::placeholder { color: var(--text-muted); font-style: italic; }

/* ── TABLE CARD ── */
.ih-table {
  background: var(--white); border-radius: var(--radius);
  box-shadow: var(--shadow); border: 1px solid var(--border); overflow: hidden;
}
.ih-thead {
  display: grid;
  grid-template-columns: 80px 1.8fr 60px 110px 110px 110px 90px;
  padding: 12px 16px;
  background: var(--green-light);
  border-bottom: 2px solid var(--border);
}
.ih-th { font-size: .63rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
.ih-tbody { overflow-y: auto; max-height: 60vh; }
.ih-tbody::-webkit-scrollbar { width: 4px; }
.ih-tbody::-webkit-scrollbar-thumb { background: #d1e8d1; border-radius: 10px; }
.ih-tr {
  display: grid;
  grid-template-columns: 80px 1.8fr 60px 110px 110px 110px 90px;
  padding: 12px 16px; align-items: center;
  border-bottom: 1px solid #f4f7f4; transition: background .15s; cursor: default;
}
.ih-tr:last-child { border-bottom: none; }
.ih-tr:hover { background: #f5fdf5; }
.ih-td { font-size: .86rem; color: var(--text-sec); }

/* ── CELL ELEMENTS ── */
.room-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--green); color: #fff;
  font-weight: 700; font-size: .88rem; border-radius: 9px;
  padding: 5px 12px; min-width: 52px; font-family: 'Roboto', sans-serif;
}
.guest-name { font-weight: 600; font-size: .9rem; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.floor-badge { display: inline-block; background: var(--green-light); color: var(--green); font-weight: 700; font-size: .75rem; padding: 3px 9px; border-radius: 20px; }
.date-val { font-size: .86rem; color: var(--text-sec); }
.checkout-today { font-size: .8rem; color: #c62828; font-weight: 700; background: #fce4ec; padding: 3px 10px; border-radius: 20px; }
.open-stay-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: var(--gold-light); color: #7a5f00; border-radius: 20px; font-size: .72rem; font-weight: 700; border: 1px solid rgba(219,186,20,.3); }
.rate-val { font-weight: 700; color: var(--green); font-size: .86rem; }

.view-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 13px; background: var(--green); color: #fff;
  border: none; border-radius: 8px; cursor: pointer;
  font-size: .74rem; font-weight: 700; font-family: 'Roboto', sans-serif;
  position: relative; overflow: hidden;
  transition: background .2s, transform .15s;
}
.view-btn::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.view-btn:hover { background: var(--green-dark); transform: translateY(-1px); }
.view-btn:hover::after { opacity: 1; }

/* ── EMPTY STATE ── */
.empty { text-align: center; padding: 56px; color: var(--text-muted); font-size: .88rem; }
.empty-ico { width: 56px; height: 56px; border-radius: 50%; background: var(--green-light); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }

/* ── MODAL ── */
.mo { position: fixed; inset: 0; z-index: 999; display: flex; align-items: flex-start; justify-content: center; background: rgba(0,0,0,.55); backdrop-filter: blur(3px); padding: 16px; overflow-y: auto; }
.mb { background: var(--bg); border-radius: 20px; width: 100%; max-width: 780px; display: flex; flex-direction: column; box-shadow: 0 24px 80px rgba(0,0,0,.28); margin: auto; font-family: 'Roboto', sans-serif; }
.mh { padding: 22px 28px; border-radius: 20px 20px 0 0; background: var(--green); display: flex; justify-content: space-between; align-items: center; position: relative; }
.mh-room { font-size: 2.2rem; font-weight: 900; color: #fff; line-height: 1; }
.mh-type { font-size: .74rem; color: rgba(255,255,255,.7); margin-top: 4px; text-transform: uppercase; letter-spacing: .6px; }
.mh-meta { display: flex; gap: 16px; align-items: center; }
.mh-badge { background: rgba(255,255,255,.15); border-radius: 12px; padding: 10px 18px; text-align: center; }
.mh-nights-num { font-size: 1.6rem; font-weight: 900; color: #fff; line-height: 1; }
.mh-nights-lbl { font-size: .63rem; color: rgba(255,255,255,.65); text-transform: uppercase; margin-top: 1px; }
.mx { background: rgba(255,255,255,.15); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #fff; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.mx:hover { background: rgba(255,255,255,.28); }
.mbody { padding: 20px 26px; }
.mbody-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.mbody-left { display: flex; flex-direction: column; gap: 12px; }
.mbody-right { display: flex; flex-direction: column; gap: 12px; }
.msec { background: var(--white); border-radius: 12px; padding: 16px 18px; border: 1px solid var(--border); }
.msec-title { font-size: .68rem; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.info-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.info-cell { background: var(--bg); border-radius: 8px; padding: 9px 12px; }
.info-lbl { font-size: .64rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 3px; margin-bottom: 2px; }
.info-val { font-size: .86rem; font-weight: 600; color: var(--text); }
.charge-row { display: flex; justify-content: space-between; align-items: center; padding: 7px 11px; background: var(--green-light); border: 1px solid #c8e6c9; border-radius: 7px; margin-bottom: 5px; }
.charge-name { font-size: .82rem; color: var(--text); }
.charge-amt { font-weight: 700; color: var(--green); font-size: .82rem; }
.charge-del { background: none; border: none; cursor: pointer; color: #c62828; padding: 2px 4px; border-radius: 4px; display: flex; align-items: center; }
.charge-del:hover { background: #fce4ec; }
.total-bar { display: flex; justify-content: space-between; align-items: center; background: var(--green); border-radius: 10px; padding: 13px 18px; margin-top: 4px; }
.total-lbl { color: rgba(255,255,255,.8); font-size: .88rem; }
.total-amt { color: #fff; font-weight: 700; font-size: 1.2rem; }
.note-box { display: flex; gap: 7px; background: var(--gold-light); border: 1px solid rgba(219,186,20,.4); border-radius: 8px; padding: 9px 12px; font-size: .81rem; color: var(--text-sec); line-height: 1.4; }
.add-row { display: flex; gap: 7px; align-items: center; margin-top: 10px; }
.add-fi { flex: 1; padding: 8px 11px; border: 1.5px dashed #a7f3d0; border-radius: 8px; font-size: .84rem; outline: none; font-family: 'Roboto', sans-serif; color: var(--text); min-width: 0; }
.add-fi:focus { border-color: var(--green); }
.add-fi::placeholder { color: var(--text-muted); font-style: italic; }
.add-btn { padding: 8px 16px; background: var(--green); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: .82rem; font-family: 'Roboto', sans-serif; white-space: nowrap; }
.add-btn:disabled { background: #aaa; cursor: not-allowed; }
.mfoot { padding: 14px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; }
.btn-close { width: 100%; padding: 11px; background: var(--white); border: 1.5px solid var(--border); border-radius: 10px; cursor: pointer; font-size: .88rem; font-weight: 600; color: var(--text-sec); font-family: 'Roboto', sans-serif; }
.extend-box { background: #e3f2fd; border: 1.5px solid #90caf9; border-radius: 10px; padding: 13px 15px; margin-top: 10px; }
.extend-title { font-size: .68rem; font-weight: 700; color: #1565c0; text-transform: uppercase; letter-spacing: .08em; display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
.extend-row { display: flex; gap: 8px; align-items: center; }
.extend-input { flex: 1; padding: 8px 12px; border: 1.5px solid #90caf9; border-radius: 8px; font-size: .86rem; font-family: 'Roboto', sans-serif; outline: none; color: var(--text); background: var(--white); }
.extend-input:focus { border-color: #1565c0; box-shadow: 0 0 0 3px rgba(21,101,192,.1); }
.extend-btn { padding: 8px 16px; background: #1565c0; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: .82rem; font-family: 'Roboto', sans-serif; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.extend-btn:disabled { background: #aaa; cursor: not-allowed; }

/* ── RESPONSIVE ── */
@media (max-width: 860px) {
  .sc-3 { grid-template-columns: repeat(2, 1fr); }
  .ih-thead { grid-template-columns: 80px 1.8fr 110px 110px 90px; }
  .ih-tr    { grid-template-columns: 80px 1.8fr 110px 110px 90px; }
  .ih-col-floor { display: none; }
}
@media (max-width: 680px) {
  .ih-root { padding: 16px 14px 48px; }
  .ih-title { font-size: 1.3rem; }
  .sc-3 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .fbar { flex-direction: column; align-items: stretch; }
  .fbar-search-wrap { min-width: unset; }
  .ih-thead { grid-template-columns: 70px 1fr 100px 80px; padding: 10px 12px; }
  .ih-tr    { grid-template-columns: 70px 1fr 100px 80px; padding: 10px 12px; }
  .ih-col-checkin { display: none; }
  .ih-td { font-size: .82rem; }
  .mbody-grid { grid-template-columns: 1fr; }
  .mh { flex-direction: column; gap: 12px; align-items: flex-start; }
  .mh-meta { width: 100%; justify-content: flex-start; }
  .info-grid-3 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 420px) {
  .sc-3 { grid-template-columns: 1fr; }
  .ih-thead { grid-template-columns: 70px 1fr 80px; padding: 10px; }
  .ih-tr    { grid-template-columns: 70px 1fr 80px; padding: 10px; }
  .ih-col-rate { display: none; }
}
`;

export default function InHouse({ highlightId, user }) {  
  const [guests,          setGuests]          = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [selected,        setSelected]        = useState(null);
  const [reqName,         setReqName]         = useState("");
  const [reqAmt,          setReqAmt]          = useState("");
  const [saving,          setSaving]          = useState(false);
  const [extending,       setExtending]       = useState(false);
  const [extDate,         setExtDate]         = useState("");
  const [refundInfo,      setRefundInfo]      = useState(null);
  const [refundConfirmed, setRefundConfirmed] = useState(false);
  const [availableRooms,  setAvailableRooms]  = useState([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*, rooms(type, floor, price)")
      .eq("status", "checked_in")
      .order("check_in");
    setGuests((data || []).filter(r => r.status === "checked_in"));

    const { data: roomData } = await supabase
      .from("rooms")
      .select("*")
      .eq("status", "available")
      .order("room_number");
    setAvailableRooms(roomData || []);

    setLoading(false);
  };

  const getCharges = (res) => {
    try { return JSON.parse(res?.additional_charges || "[]"); } catch { return []; }
  };

    const isInhouseCharge = (c) => !c.from_reservation;

  const calcTotal = (res) => {
    return parseFloat(res.remaining_balance ?? 0);
  };


const computeNewBalance = (res, chargesList) => {
  const currentBalance = parseFloat(res.remaining_balance ?? 0);
  const currentInhouseSum = getCharges(res)
    .filter(c => isInhouseCharge(c))
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const newInhouseSum = chargesList
    .filter(c => isInhouseCharge(c))
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const diff = newInhouseSum - currentInhouseSum;
  return parseFloat((currentBalance + diff).toFixed(2));
};
  const nightsStayed = (checkIn) => Math.max(1, Math.floor((new Date() - new Date(checkIn)) / 86400000));
  const nightsLeft   = (checkOut) => checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date()) / 86400000)) : null;

  const handleAddCharge = async () => {
    if (!reqName.trim() || !reqAmt || !selected) return;
    setSaving(true);

    const { data: fresh } = await supabase
      .from("reservations")
      .select("*, rooms(type, floor, price)")
      .eq("id", selected.id)
      .single();

    const existing  = getCharges(fresh);
    const newCharge = {
      id:     Date.now(),
      name:   reqName.trim(),
      amount: parseFloat(reqAmt),
    };
    const updated    = [...existing, newCharge];
    const newBalance = computeNewBalance(fresh, updated);

    await supabase.from("reservations").update({
      additional_charges: JSON.stringify(updated),
      remaining_balance:  newBalance,
    }).eq("id", selected.id);

    await logActivity({
      action:      `Added charge to Room ${selected.room_number}: ${reqName.trim()}`,
      category:    "charge",
      details:     `Guest: ${selected.guest_name} | Amount: ₱${parseFloat(reqAmt).toLocaleString()} | New Balance: ₱${newBalance.toLocaleString()}`,
      entity_type: "reservation",
      entity_id:   selected.id,
    });

    setSaving(false);
    setReqName(""); setReqAmt("");

    setSelected({
      ...fresh,
      additional_charges: JSON.stringify(updated),
      remaining_balance:  newBalance,
    });
    fetchGuests();
  };

  const handleDeleteCharge = async (chargeId) => {
    if (!selected) return;

    const existing   = getCharges(selected);
    const updated    = existing.filter(c => c.id !== chargeId);
    const newBalance = computeNewBalance(selected, updated);

    await supabase.from("reservations").update({
      additional_charges: JSON.stringify(updated),
      remaining_balance:  newBalance,
    }).eq("id", selected.id);

    setSelected({
      ...selected,
      additional_charges: JSON.stringify(updated),
      remaining_balance:  newBalance,
    });
    fetchGuests();
  };

  const handleAddChargeObject = async (newCharges) => {
    if (!newCharges?.length || !selected) return;
    setSaving(true);

    const { data: fresh } = await supabase
      .from("reservations")
      .select("*, rooms(type, floor, price)")
      .eq("id", selected.id)
      .single();

    const existing = getCharges(fresh);
    const tagged   = newCharges.map(c => ({
      id:              `rst-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:            c.name,
      amount:          parseFloat(c.amount),
      from_restaurant: true,
    }));
    const updated    = [...existing, ...tagged];
    const newBalance = computeNewBalance(fresh, updated);

    await supabase.from("reservations").update({
      additional_charges: JSON.stringify(updated),
      remaining_balance:  newBalance,
    }).eq("id", selected.id);

    // Save restaurant orders to restaurant_orders table
const restaurantOnly = tagged.filter(c => c.from_restaurant);
if (restaurantOnly.length > 0) {
  await supabase.from("restaurant_orders").insert([{
    reservation_id: selected.id,
    guest_name:     selected.guest_name,
    room_number:    String(selected.room_number || ""),
    items: restaurantOnly.map(c => ({
      id:       c.id,
      name:     c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""),
      price:    c.amount,
      qty:      1,
      subtotal: parseFloat(c.amount),
    })),
    total_amount: restaurantOnly.reduce((s, c) => s + parseFloat(c.amount), 0),
    status: "pending",
  }]);
}

    setSaving(false);
    setSelected({ ...fresh, additional_charges: JSON.stringify(updated), remaining_balance: newBalance });
    fetchGuests();


  };

  const calcPreview = (newDate) => {
    if (!selected || !newDate || !selected.check_in) return null;

    const parseDate   = (d) => new Date(d + "T00:00:00");
    const checkInDate = parseDate(selected.check_in);
    const newCheckOut = parseDate(newDate);

    if (newCheckOut <= checkInDate) return null;

    const originalNights = selected.check_out
      ? Math.round((parseDate(selected.check_out) - checkInDate) / 86400000)
      : 0;

    const newNights     = Math.round((newCheckOut - checkInDate) / 86400000);
    const extraNights   = newNights - originalNights;
    const pricePerNight = parseFloat(selected.rooms?.price ?? 0);

    if (extraNights === 0) {
      return { newNights, originalNights, pricePerNight, extraNights: 0, totalCharges: 0, alreadyPaid: 0, diff: 0 };
    }

    if (extraNights > 0) {
      const totalCharges = extraNights * pricePerNight;
      return { newNights, originalNights, pricePerNight, extraNights, totalCharges, alreadyPaid: 0, diff: -totalCharges };
    }

    const refundNights = Math.abs(extraNights);
    const refundAmount = refundNights * pricePerNight;
    const alreadyPaid  = parseFloat(selected.amount_paid || 0);
    return { newNights, originalNights, pricePerNight, extraNights, totalCharges: 0, alreadyPaid, diff: refundAmount };
  };

  const handleExtDateChange = (val) => {
    setExtDate(val);
    setRefundConfirmed(false);
    if (!val || !selected?.check_in) { setRefundInfo(null); return; }
    setRefundInfo(calcPreview(val));
  };

  const handleSaveDateChange = async () => {
    console.log("saving...", { extDate, selected: selected?.id, preview: calcPreview(extDate) });
    if (!selected || !extDate) return;
    const preview = calcPreview(extDate);
    if (!preview) return;
    if (preview.diff > 0 && !refundConfirmed) return;

    setExtending(true);

    try {
      const allCharges = getCharges(selected);
      const nonRoomSum = allCharges
        .filter(c => c.from_reservation || c.from_checkin)
        .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

      const newNights      = Math.round((new Date(extDate + "T00:00:00") - new Date(selected.check_in + "T00:00:00")) / 86400000);
      const pricePerNight  = parseFloat(selected.rooms?.price ?? 0);
      const newRoomTotal   = newNights * pricePerNight;
      const newTotalAmount = newRoomTotal + nonRoomSum;

      const currentBalance        = parseFloat(selected.remaining_balance ?? 0);
      const currentCheckinBalance = parseFloat(selected.checkin_balance ?? selected.remaining_balance ?? 0);

      const newRemaining      = preview.extraNights > 0
        ? currentBalance + preview.totalCharges
        : currentBalance - Math.abs(preview.diff);
      const newCheckinBalance = preview.extraNights > 0
        ? currentCheckinBalance + preview.totalCharges
        : currentCheckinBalance - Math.abs(preview.diff);

await supabase.from("reservations").update({
  check_out:         extDate,
  total_amount:      newTotalAmount,
  remaining_balance: Math.max(0, newRemaining),
  checkin_balance:   Math.max(0, newCheckinBalance),
  room_rate:         parseFloat(selected.room_rate || 0) + (preview.extraNights > 0 ? preview.totalCharges : -Math.abs(preview.diff)),
}).eq("id", selected.id);

      const existingHistory = (() => { try { return JSON.parse(selected.payment_history || "[]"); } catch { return []; } })();
        if (preview.extraNights > 0) {
          existingHistory.push({
            type:   "date_change_charge",
            amount: preview.totalCharges,
            date:   today,
            note:   `Extended to ${extDate} (+${preview.extraNights} night${preview.extraNights !== 1 ? "s" : ""})`,
          });
        } else if (preview.diff > 0) {
          existingHistory.push({
            type:   "date_change_refund",
            amount: preview.diff,
            date:   today,
            note:   `Shortened to ${extDate} (−${Math.abs(preview.extraNights)} night${Math.abs(preview.extraNights) !== 1 ? "s" : ""})`,
          });
        }
        await supabase.from("reservations")
          .update({ payment_history: JSON.stringify(existingHistory) })
          .eq("id", selected.id);

      await logActivity({
        action:      `Changed check-out date: ${selected.guest_name}`,
        category:    "edit",
        details:     `Room ${selected.room_number} | New checkout: ${extDate} | Extra nights: ${preview.extraNights || 0} | Extra charge: ₱${(preview.totalCharges || 0).toLocaleString()}`,
        entity_type: "reservation",
        entity_id:   selected.id,
      });

      const { data } = await supabase.from("reservations").select("*, rooms(type, floor, price)").eq("id", selected.id).single();
      setSelected(data);
      setExtDate("");
      setRefundInfo(null);
      setRefundConfirmed(false);
      fetchGuests();
    } catch (err) {
      console.error("Error saving date change:", err);
    } finally {
      setExtending(false);
    }
  };

  const handleRoomTransfer = async (preview, newRoomId, transferDate) => {
    if (!selected || !preview) return;

    const newRoom = preview.newRoom;
    const currentBalance    = parseFloat(selected.remaining_balance ?? 0);
    const currentCheckinBal = parseFloat(selected.checkin_balance ?? selected.remaining_balance ?? 0);

    const newRemaining  = preview.extraCharge > 0
      ? currentBalance + preview.extraCharge
      : preview.refund > 0
        ? Math.max(0, currentBalance - preview.refund)
        : currentBalance;

    const newCheckinBal = preview.extraCharge > 0
      ? currentCheckinBal + preview.extraCharge
      : preview.refund > 0
        ? Math.max(0, currentCheckinBal - preview.refund)
        : currentCheckinBal;

await supabase.from("reservations").update({
  room_id:           newRoomId,
  room_number:       newRoom.room_number,
  total_amount:      preview.newTotalAmount,
  remaining_balance: newRemaining,
  checkin_balance:   newCheckinBal,
  room_rate:         parseFloat(selected.room_rate || 0) + (preview.extraCharge > 0 ? preview.extraCharge : preview.refund > 0 ? -preview.refund : 0),
}).eq("id", selected.id);

    await supabase.from("rooms").update({ status: "available" }).eq("id", selected.room_id);
    await supabase.from("rooms").update({ status: "occupied"  }).eq("id", newRoomId);

   const existingHistory = (() => { try { return JSON.parse(selected.payment_history || "[]"); } catch { return []; } })();
      if (preview.extraCharge > 0) {
        existingHistory.push({
          type:   "room_transfer_charge",
          amount: preview.extraCharge,
          date:   today,
          note:   `Transferred Room ${selected.room_number} → Room ${newRoom.room_number}`,
        });
      } else if (preview.refund > 0) {
        existingHistory.push({
          type:   "room_transfer_refund",
          amount: preview.refund,
          date:   today,
          note:   `Transferred Room ${selected.room_number} → Room ${newRoom.room_number}`,
        });
      }
      await supabase.from("reservations")
        .update({ payment_history: JSON.stringify(existingHistory) })
        .eq("id", selected.id);

    await logActivity({
      action:      `Room transfer: ${selected.guest_name}`,
      category:    "edit",
      details:     `Room ${selected.room_number} → Room ${newRoom.room_number} | Transfer date: ${transferDate} | ${preview.extraCharge > 0 ? `Extra: ₱${preview.extraCharge.toLocaleString()}` : preview.refund > 0 ? `Refund: ₱${preview.refund.toLocaleString()}` : "No price change"}`,
      entity_type: "reservation",
      entity_id:   selected.id,
    });

    const { data } = await supabase.from("reservations").select("*, rooms(type, floor, price)").eq("id", selected.id).single();
    setSelected(data);
    fetchGuests();
  };

const handleInhousePayment = async (reservationId, newAmountPaid, newBalance, paymentMethod, paid) => {
  const { data } = await supabase
    .from("reservations")
    .select("*, rooms(type, floor, price)")
    .eq("id", reservationId)
    .single();

  if (data) {
    const history = (() => { try { return JSON.parse(data.payment_history || "[]"); } catch { return []; } })();
    history.push({
      type:   "inhouse_payment",
      amount: paid,
      date:   today,
      note:   "Cash collected inhouse",
    });
    await supabase.from("reservations")
      .update({ payment_history: JSON.stringify(history) })
      .eq("id", reservationId);

    setSelected({ ...data, payment_history: JSON.stringify(history), remaining_balance: newBalance });
  }
  fetchGuests();
};

  const openModal  = (res) => { setSelected(res); setReqName(""); setReqAmt(""); setExtDate(""); setRefundInfo(null); setRefundConfirmed(false); };
  const closeModal = () => setSelected(null);

  const filtered = guests.filter(g =>
    g.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (g.room_number || "").includes(search)
  );

  const checkingOutToday = guests.filter(g => g.check_out === today).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="ih-root">

        {/* ── HEADER ── */}
        <div className="ih-hdr">
          <div>
            <h2 className="ih-title">In-House Guests</h2>
            <p className="ih-sub">Guests currently staying — click View for full details</p>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="sc-3">
          {[
            { lbl: "Currently Staying",  val: guests.length,    Icon: RiHotelBedLine,        bg: "#e8f5e9", color: "#07713c" },
            { lbl: "Checking Out Today", val: checkingOutToday, Icon: RiTimeLine,             bg: "#fce4ec", color: "#c62828" },
            { lbl: "Total Add. Charges", val: `₱${guests.reduce((s, g) => s + getCharges(g).filter(c => isInhouseCharge(c)).reduce((a, c) => a + parseFloat(c.amount || 0), 0), 0).toLocaleString()}`, Icon: RiMoneyDollarCircleLine, bg: "#f3e5f5", color: "#6a1b9a" },
          ].map(({ lbl, val, Icon, bg, color }) => (
            <div key={lbl} className="sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="sc-row"><Icon size={18} color={color} /><span className="sc-lbl" style={{ color }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div className="fbar">
          <div className="fbar-search-wrap">
            <RiSearchLine size={15} style={{ position: "absolute", left: 11, pointerEvents: "none", color: "var(--text-muted)" }} />
            <input
              className="finput with-icon"
              placeholder="Search guest name or room number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="ih-table">
          <div className="ih-thead">
            <div className="ih-th">Room</div>
            <div className="ih-th">Guest Name</div>
            <div className="ih-th ih-col-floor">Floor</div>
            <div className="ih-th ih-col-checkin">Check-In</div>
            <div className="ih-th">Check-Out</div>
            <div className="ih-th ih-col-rate">Room Rate</div>
            <div className="ih-th"></div>
          </div>
          <div className="ih-tbody">
            {loading ? (
              <div className="empty">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-ico"><RiHotelBedLine size={26} color="#07713c" /></div>
                <div style={{ fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>No guests checked in</div>
                <div style={{ fontSize: ".83rem" }}>Check-in guests from the Check-In page.</div>
              </div>
            ) : filtered.map(res => {
              const isCheckingOutToday = res.check_out === today;
              return (
                <div key={res.id} className="ih-tr" style={{ background: res.id === highlightId ? "var(--gold-light)" : undefined, outline: res.id === highlightId ? "2px solid var(--gold)" : "none", transition: "all 0.3s" }}>
                  <div className="ih-td"><span className="room-badge">{res.room_number}</span></div>
                  <div className="ih-td guest-name">{res.guest_name}</div>
                  <div className="ih-td ih-col-floor"><span className="floor-badge">{res.rooms?.floor ?? "—"}</span></div>
                  <div className="ih-td ih-col-checkin"><span className="date-val">{res.check_in}</span></div>
                  <div className="ih-td">
                    {!res.check_out
                      ? <span className="open-stay-badge">Open</span>
                      : isCheckingOutToday
                        ? <span className="checkout-today">Today</span>
                        : <span className="date-val">{res.check_out}</span>
                    }
                  </div>
                  <div className="ih-td ih-col-rate"><span className="rate-val">₱{parseFloat(res.total_amount || 0).toLocaleString()}</span></div>
                  <div className="ih-td">
                    <button className="view-btn" onClick={() => openModal(res)}>
                      <RiEyeLine size={13} /> View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {selected && (
        <InhouseModal
          selected={selected}
          user={user}
          onClose={closeModal}
          charges={getCharges(selected)}
          total={calcTotal(selected)}
          stayed={nightsStayed(selected.check_in)}
          left={nightsLeft(selected.check_out)}
          isToday={selected.check_out ? selected.check_out === today : false}
          today={today}
          reqName={reqName}
          setReqName={setReqName}
          reqAmt={reqAmt}
          setReqAmt={setReqAmt}
          saving={saving}
          onAddCharge={handleAddCharge}
          onAddChargeObject={handleAddChargeObject}
          onDeleteCharge={handleDeleteCharge}
          extDate={extDate}
          onExtDateChange={handleExtDateChange}
          extending={extending}
          onSaveDateChange={handleSaveDateChange}
          refundInfo={refundInfo}
          refundConfirmed={refundConfirmed}
          setRefundConfirmed={setRefundConfirmed}
          availableRooms={availableRooms}
          onRoomTransfer={handleRoomTransfer}
          onPayNow={handleInhousePayment}
        />
      )}
    </>
  );
}