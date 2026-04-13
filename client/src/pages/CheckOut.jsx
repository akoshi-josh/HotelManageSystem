import React, { useState, useEffect } from "react";
import {
  RiUserLine, RiHotelBedLine, RiCalendarLine, RiLogoutBoxLine,
  RiErrorWarningLine, RiTimeLine, RiMoneyDollarCircleLine,
  RiStickyNoteLine, RiCheckboxCircleLine, RiSearchLine, RiAlertLine,
  RiToolsLine, RiCheckDoubleLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import { printCheckOutReceipt } from "../receiptPrinter ";
import CheckOutModal from "../components/checkOutModal";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c;
  --green-light: #e8f5ee;
  --gold: #dbba14;
  --gold-light: #fdf8e1;
  --orange: #e65100;
  --orange-light: #fff3e0;
  --red: #c62828;
  --blue: #1565c0;
  --blue-light: #e3f2fd;
  --bg: #f2f5f0;
  --white: #ffffff;
  --border: #e2e8e2;
  --text: #1a2e1a;
  --text-sec: #5a6e5a;
  --text-muted: #8fa08f;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.11);
}

.co-page {
  padding: 28px 32px 48px;
  font-family: 'Roboto', sans-serif;
  background: var(--bg);
  min-height: 100%;
}

/* ── HEADER ── */
.co-hdr { margin-bottom: 22px; }
.co-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.co-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 24px;
  background: var(--gold); border-radius: 2px; flex-shrink: 0;
}
.co-sub { font-size: .85rem; color: var(--text-muted); margin: 5px 0 0; }

/* ── STAT CARDS ── */
.co-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
}
.co-sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.co-sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.co-sc::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.co-sc:hover::after { opacity: 1; }
.co-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.co-sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.co-sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── SEARCH BAR ── */
.co-search-wrap {
  background: var(--white); border-radius: var(--radius);
  padding: 14px 20px; box-shadow: var(--shadow);
  border: 1px solid var(--border); margin-bottom: 20px;
  position: relative; display: flex; align-items: center;
}
.co-search-icon { position: absolute; left: 32px; color: var(--text-muted); pointer-events: none; }
.co-search-input {
  width: 100%; padding: 10px 14px 10px 36px;
  border: 1.5px solid var(--border); border-radius: 10px;
  font-size: .9rem; font-family: 'Roboto', sans-serif;
  color: var(--text); outline: none; background: var(--bg);
  transition: border-color .2s, box-shadow .2s;
}
.co-search-input:focus {
  border-color: var(--orange); box-shadow: 0 0 0 3px rgba(230,81,0,.1);
  background: var(--white);
}
.co-search-input::placeholder { color: var(--text-muted); font-style: italic; }

/* ── SECTION HEADER ── */
.co-section-hdr {
  display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
}
.co-section-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.co-section-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--text); }
.co-section-count {
  font-size: .7rem; font-weight: 700; padding: 2px 9px;
  border-radius: 20px; background: var(--bg); color: var(--text-muted);
  border: 1px solid var(--border);
}

/* ── TABLE ── */
.co-table-wrap {
  background: var(--white); border-radius: var(--radius);
  overflow: hidden; box-shadow: var(--shadow);
  border: 1px solid var(--border); margin-bottom: 22px;
}
.co-table {
  width: 100%; border-collapse: collapse;
  font-family: 'Roboto', sans-serif;
}
.co-thead tr { background: var(--green-light); border-bottom: 2px solid var(--border); }
.co-thead th {
  padding: 11px 16px; text-align: left;
  font-size: .65rem; color: var(--text-muted);
  font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
}
.co-tr {
  border-bottom: 1px solid #f4f7f4; transition: background .15s;
}
.co-tr:last-child { border-bottom: none; }
.co-tr:hover { background: #f6fcf6; }
.co-tr.highlighted { background: #fffbeb; outline: 2px solid #f59e0b; }
.co-td { padding: 13px 16px; }
.co-guest-name { font-weight: 600; font-size: .9rem; color: var(--text); }
.co-guest-sub  { font-size: .75rem; color: var(--text-muted); margin-top: 1px; }

/* ── STAYING CARD ── */
.co-staying-card {
  background: var(--white); border-radius: var(--radius);
  overflow: hidden; box-shadow: var(--shadow);
  border: 1px solid var(--border);
  display: flex; transition: all .2s; margin-bottom: 12px;
}
.co-staying-card.highlighted { background: #fffbeb; border-color: #f59e0b; box-shadow: 0 0 0 2px #f59e0b; }
.co-staying-left {
  background: var(--blue); padding: 18px 16px;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  min-width: 88px; flex-shrink: 0;
}
.co-staying-room-lbl { font-size: .58rem; color: rgba(255,255,255,.6); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px; }
.co-staying-room-num { font-size: 1.7rem; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -0.02em; }
.co-staying-nights-box {
  background: rgba(255,255,255,.15); border-radius: var(--radius-sm);
  padding: 5px 10px; margin-top: 10px; text-align: center;
}
.co-staying-nights-num { font-size: 1rem; font-weight: 700; color: #fff; line-height: 1; }
.co-staying-nights-lbl { font-size: .55rem; color: rgba(255,255,255,.6); text-transform: uppercase; }
.co-staying-left-sub  { margin-top: 7px; font-size: .58rem; text-align: center; }

.co-staying-body { padding: 14px 18px; flex: 1; min-width: 0; }
.co-staying-info-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 8px; margin-bottom: 10px;
}
.co-info-box { background: var(--bg); border-radius: var(--radius-sm); padding: 8px 10px; }
.co-info-lbl { font-size: .6rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; display: flex; align-items: center; gap: 3px; margin-bottom: 2px; }
.co-info-val { font-size: .82rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.co-staying-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }

/* ── STATUS BADGES ── */
.co-badge-cleared   { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; background: var(--green-light); color: var(--green); border-radius: var(--radius-sm); font-size: .73rem; font-weight: 700; border: 1px solid #a7f3d0; }
.co-badge-inspecting { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; background: #fff8e1; color: #f57f17; border-radius: var(--radius-sm); font-size: .73rem; font-weight: 700; }
.co-badge-damage    { display: inline-flex; align-items: center; gap: 4px; padding: 5px 11px; background: #fce4ec; color: var(--red); border-radius: var(--radius-sm); font-size: .73rem; font-weight: 700; }

.co-btn-inspect {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 14px; background: #f3e5f5; color: #6a1b9a;
  border: 1.5px solid #ce93d8; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .8rem; font-weight: 700;
  font-family: 'Roboto', sans-serif; transition: background .15s;
}
.co-btn-inspect:hover { background: #ede0f7; }
.co-btn-inspect:disabled { opacity: .6; cursor: not-allowed; }

.co-btn-checkout {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 16px; background: var(--orange); color: #fff;
  border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .82rem; font-weight: 700;
  font-family: 'Roboto', sans-serif;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(230,81,0,.25);
}
.co-btn-checkout:hover { background: #bf360c; transform: translateY(-1px); }
.co-btn-checkout-blue {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 16px; background: var(--blue); color: #fff;
  border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .82rem; font-weight: 700;
  font-family: 'Roboto', sans-serif;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(21,101,192,.25);
}
.co-btn-checkout-blue:hover { background: #0d47a1; transform: translateY(-1px); }

/* ── EMPTY STATE ── */
.co-empty {
  background: var(--white); border-radius: var(--radius);
  padding: 60px; text-align: center;
  box-shadow: var(--shadow); border: 1px solid var(--border);
}
.co-empty-icon {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--green-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid rgba(7,113,60,.15);
}

/* ── INSPECTION WARNING MODAL ── */
.co-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 20px;
}
.co-modal-box {
  background: var(--white); border-radius: 18px; width: 420px;
  box-shadow: 0 24px 80px rgba(0,0,0,.28);
  font-family: 'Roboto', sans-serif; overflow: hidden;
}
.co-modal-hdr {
  padding: 22px 26px;
  display: flex; align-items: center; gap: 12px;
}
.co-modal-hdr-icon {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(255,255,255,.2);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.co-modal-body { padding: 22px 26px; }
.co-modal-btn {
  width: 100%; padding: 12px 16px; border-radius: 10px;
  cursor: pointer; font-size: .88rem; font-weight: 700;
  font-family: 'Roboto', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: opacity .15s;
}
.co-modal-btn:hover { opacity: .9; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .co-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .co-page { padding: 20px 20px 48px; }
  .co-staying-info-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .co-page { padding: 16px 14px 48px; }
  .co-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
  .co-title { font-size: 1.3rem; }
  .co-staying-card { flex-direction: column; }
  .co-staying-left { flex-direction: row; gap: 16px; min-width: unset; padding: 14px 18px; justify-content: flex-start; }
  .co-staying-info-grid { grid-template-columns: 1fr 1fr; }
  .co-table { font-size: .85rem; }
  .co-thead th, .co-td { padding: 10px 12px; }
}
@media (max-width: 420px) {
  .co-stats { grid-template-columns: 1fr; }
  .co-staying-info-grid { grid-template-columns: 1fr; }
}
`;

function InspectionWarningModal({ res, onRequestInspection, onProceed, onCancel }) {
  const status       = res.inspection_status;
  const isRequested  = status === "requested";
  const hasDamage    = status === "has_damage";
  const notRequested = !status;

  const headerBg = hasDamage
    ? "linear-gradient(135deg,#c62828,#e53935)"
    : isRequested
    ? "linear-gradient(135deg,#f57f17,#ffa000)"
    : "linear-gradient(135deg,#e65100,#ff9800)";

  const title = hasDamage
    ? "Damage Found — Not Yet Cleared"
    : isRequested
    ? "Inspection Still In Progress"
    : "Room Not Yet Inspected";

  const body = hasDamage
    ? "Maintenance has reported damage in this room. The inspection is not cleared yet. Proceeding now may result in unresolved damage charges."
    : isRequested
    ? "An inspection has been requested but is still in progress. The room has not been cleared yet. Proceeding now may miss damage or missing items."
    : "This room has not been inspected before check-out. It is recommended to request an inspection first to check for any damage or missing items.";

  const sub = hasDamage
    ? "Resolve the damage charges before checking out, or proceed at your own risk."
    : isRequested
    ? "Wait for maintenance to complete the inspection, or proceed at your own risk."
    : "You can still proceed, but any damage discovered later cannot be charged to this guest.";

  return (
    <div className="co-modal-overlay">
      <div className="co-modal-box">
        <div className="co-modal-hdr" style={{ background: headerBg }}>
          <div className="co-modal-hdr-icon">
            <RiAlertLine size={22} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "1rem" }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: ".8rem", marginTop: "2px" }}>
              Room {res.room_number} · {res.guest_name}
            </div>
          </div>
        </div>
        <div className="co-modal-body">
          <p style={{ margin: "0 0 6px", fontSize: ".9rem", color: "#333", lineHeight: 1.6 }}>{body}</p>
          <p style={{ margin: "0 0 20px", fontSize: ".83rem", color: "#888" }}>{sub}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notRequested && (
              <button className="co-modal-btn" onClick={onRequestInspection}
                style={{ background: "#6a1b9a", color: "white", border: "none" }}>
                <RiSearchLine size={16} /> Request Inspection First
              </button>
            )}
            <button className="co-modal-btn" onClick={onProceed}
              style={{ background: "#fff3e0", color: "#e65100", border: "1.5px solid #ffcc80" }}>
              <RiLogoutBoxLine size={16} /> Proceed Without Inspection
            </button>
            <button className="co-modal-btn" onClick={onCancel}
              style={{ background: "white", color: "#888", border: "1.5px solid #e0e0e0" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckOut({ highlightRoom, user }) {
  const [reservations,  setReservations]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [selected,      setSelected]      = useState(null);
  const [processing,    setProcessing]    = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [extraCharges,  setExtraCharges]  = useState("");
  const [extraNote,     setExtraNote]     = useState("");
  const [amountReceived,setAmountReceived]= useState("");
  const [fullyPaid,     setFullyPaid]     = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [requesting,    setRequesting]    = useState(null);
  const [editingCharge, setEditingCharge] = useState(null);
  const [highlighted,   setHighlighted]   = useState(null);
  const [showInspectionWarning, setShowInspectionWarning] = useState(false);
  const [pendingCheckoutRes,    setPendingCheckoutRes]    = useState(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchData(false);
    const poll = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("checkout-live")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "reservations" },
        (payload) => {
          const n = payload.new;
          const o = payload.old;
          if (
            n.inspection_status  !== o.inspection_status  ||
            n.inspection_charges !== o.inspection_charges ||
            n.inspection_notes   !== o.inspection_notes
          ) {
            setReservations(prev => prev.map(r => r.id === n.id ? { ...r, ...n } : r));
            setSelected(prev => prev && prev.id === n.id ? { ...prev, ...n } : prev);
          }
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (highlightRoom?.room_number) {
      setHighlighted(highlightRoom.room_number);
      setTimeout(() => setHighlighted(null), 4000);
    }
  }, [highlightRoom]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    const { data } = await supabase
      .from("reservations").select("*")
      .eq("status", "checked_in").order("check_out");
    const incoming = data || [];
    setReservations(prev => {
      if (prev.length !== incoming.length) return incoming;
      const changed = incoming.some((r, i) =>
        !prev[i] ||
        prev[i].id                 !== r.id                 ||
        prev[i].inspection_status  !== r.inspection_status  ||
        prev[i].inspection_charges !== r.inspection_charges ||
        prev[i].total_amount       !== r.total_amount       ||
        prev[i].check_out          !== r.check_out
      );
      return changed ? incoming : prev;
    });
    if (!silent) setLoading(false);
  };

  const getInspectionCharges = (res) => { try { return JSON.parse(res?.inspection_charges  || "[]"); } catch { return []; } };
  const getAdditionalCharges = (res) => { try { return JSON.parse(res?.additional_charges  || "[]"); } catch { return []; } };

  const saveChargePrice = async (res, idx, newAmount) => {
    const charges = getInspectionCharges(res);
    charges[idx] = { ...charges[idx], amount: parseFloat(newAmount) || 0, tbd: false };
    await supabase.from("reservations")
      .update({ inspection_charges: JSON.stringify(charges) })
      .eq("id", res.id);
    setReservations(prev => prev.map(r => r.id === res.id
      ? { ...r, inspection_charges: JSON.stringify(charges) } : r
    ));
    if (selected && selected.id === res.id) {
      setSelected(prev => ({ ...prev, inspection_charges: JSON.stringify(charges) }));
    }
    setEditingCharge(null);
  };

  const handleRequestInspection = async (res) => {
    setRequesting(res.id);
    await supabase.from("reservations").update({ inspection_status: "requested" }).eq("id", res.id);
    await supabase.from("notifications").insert({
      type:        "inspection_request",
      title:       `Room ${res.room_number} — Inspection Requested`,
      message:     `Guest: ${res.guest_name} · Check-out: ${res.check_out || "Open stay"} · Please inspect before check-out.`,
      entity_type: "reservation",
      entity_id:   res.id,
      room_number: res.room_number,
      guest_name:  res.guest_name,
      nav_target:  "Maintenance",
    });
    setReservations(prev => prev.map(r => r.id === res.id ? { ...r, inspection_status: "requested" } : r));
    setRequesting(null);
  };

  const handleCheckOutClick = (res) => {
    if (res.inspection_status === "cleared") { openCheckOut(res); }
    else { setPendingCheckoutRes(res); setShowInspectionWarning(true); }
  };

  const proceedWithoutInspection = () => {
    setShowInspectionWarning(false);
    openCheckOut(pendingCheckoutRes);
    setPendingCheckoutRes(null);
  };

  const requestInspectionFromWarning = async () => {
    if (pendingCheckoutRes) await handleRequestInspection(pendingCheckoutRes);
    setShowInspectionWarning(false);
    setPendingCheckoutRes(null);
  };

  const openCheckOut = (res) => {
    setSelected(res);
    setExtraCharges(""); setExtraNote(""); setPaymentMethod("cash");
    setFullyPaid(false); setSuccessMsg("");
    const balance = parseFloat(res.total_amount || 0) - parseFloat(res.amount_paid || 0);
    setAmountReceived(balance > 0 ? balance.toString() : "0");
    setShowModal(true);
  };

  const handleCheckOut = async () => {
    if (!selected) return;
    setProcessing(true);
    const snap = {
      id: selected.id, guestName: selected.guest_name, roomNumber: selected.room_number,
      roomId: selected.room_id, basTotal: parseFloat(selected.total_amount || 0),
      alreadyPaid: parseFloat(selected.amount_paid || 0), extraAmt: parseFloat(extraCharges || 0),
      extraNoteVal: extraNote, payMethod: paymentMethod,
      addCharges: getAdditionalCharges(selected), inspCharges: getInspectionCharges(selected),
    };
    const snapAddTotal  = snap.addCharges.filter(c => !c.from_reservation).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const snapInspTotal = snap.inspCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const snapGrandTotal = snap.basTotal + snap.extraAmt + snapAddTotal + snapInspTotal;

    const { error: resError } = await supabase.from("reservations").update({
      status: "checked_out", total_amount: snapGrandTotal,
      payment_method: snap.payMethod, amount_paid: snapGrandTotal,
      extra_charges: snap.extraAmt, extra_charges_note: snap.extraNoteVal,
      checked_out_at: new Date().toISOString(),
    }).eq("id", snap.id);

    if (resError) { alert("Checkout failed: " + resError.message); setProcessing(false); return; }

    await supabase.from("rooms").update({ status: "needs_cleaning" }).eq("id", snap.roomId);
    setReservations(prev => prev.filter(r => r.id !== snap.id));
    setShowModal(false); setSelected(null); setProcessing(false);
    setExtraCharges(""); setExtraNote(""); setFullyPaid(false); setAmountReceived("");

    logActivity({
      action: `Checked out guest: ${snap.guestName}`, category: "check_out",
      details: `Room ${snap.roomNumber} | Total ₱${snapGrandTotal.toLocaleString()} | Extra ₱${snap.extraAmt.toLocaleString()}`,
      entity_type: "reservation", entity_id: snap.id,
    });

    printCheckOutReceipt(
      {
        guestName: snap.guestName, roomNumber: snap.roomNumber,
        checkInDate: selected?.check_in || "", checkOutDate: selected?.check_out || new Date().toISOString().split("T")[0],
        roomCharge: snap.basTotal, resCharges: snap.addCharges.filter(c => c.from_reservation),
        inHouseCharges: snap.addCharges.filter(c => !c.from_reservation),
        inspCharges: snap.inspCharges, extraAmt: snap.extraAmt, extraNote: snap.extraNoteVal,
        alreadyPaid: snap.alreadyPaid, grandTotal: snapGrandTotal, payMethod: snap.payMethod,
        guestNotes: selected?.notes || "",
      },
      { name: user?.full_name || user?.email || "Staff", role: user?.role || "" }
    );
  };

  const filtered     = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number || "").includes(search)
  );
  const overdueList  = filtered.filter(r => r.check_out < today);
  const todayList    = filtered.filter(r => r.check_out === today);
  const upcomingList = filtered.filter(r => r.check_out > today);

  const nightsStayed = (checkIn)  => Math.max(1, Math.floor((new Date() - new Date(checkIn)) / 86400000));
  const nightsLeft   = (checkOut) => Math.max(0, Math.ceil((new Date(checkOut) - new Date()) / 86400000));

  const InspectionBadge = ({ res }) => {
    if (res.inspection_status === "cleared")
      return <span className="co-badge-cleared"><RiCheckDoubleLine size={12} /> Cleared</span>;
    if (res.inspection_status === "requested")
      return <span className="co-badge-inspecting"><RiToolsLine size={12} /> Inspecting...</span>;
    if (res.inspection_status === "has_damage")
      return <span className="co-badge-damage"><RiAlertLine size={12} /> Damage Found</span>;
    return (
      <button className="co-btn-inspect" onClick={() => handleRequestInspection(res)} disabled={requesting === res.id}>
        <RiSearchLine size={13} />{requesting === res.id ? "..." : "Inspect"}
      </button>
    );
  };

  const SectionTable = ({ title, data, dot }) => data.length > 0 && (
    <div style={{ marginBottom: "22px" }}>
      <div className="co-section-hdr">
        <div className="co-section-dot" style={{ background: dot }} />
        <h3 className="co-section-title">{title}</h3>
        <span className="co-section-count">{data.length}</span>
      </div>
      <div className="co-table-wrap">
        <table className="co-table">
          <thead className="co-thead">
            <tr>
              {["Guest","Room","Check-In","Check-Out","Nights","Total","Type","Action"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(res => {
              const nights    = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000);
              const isOverdue = res.check_out < today;
              return (
                <tr
                  key={res.id}
                  className={`co-tr${highlighted === res.room_number ? " highlighted" : ""}`}
                >
                  <td className="co-td">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: isOverdue ? "#c62828" : "var(--orange)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: ".82rem", flexShrink: 0, border: "2px solid rgba(219,186,20,.35)" }}>
                        {res.guest_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="co-guest-name">{res.guest_name}</div>
                        {res.guest_phone && <div className="co-guest-sub">{res.guest_phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="co-td" style={{ fontWeight: "700", color: "var(--green)" }}>{res.room_number || "—"}</td>
                  <td className="co-td" style={{ fontSize: ".86rem", color: "var(--text-sec)" }}>{res.check_in}</td>
                  <td className="co-td" style={{ fontSize: ".86rem", color: isOverdue ? "var(--red)" : "var(--text-sec)", fontWeight: isOverdue ? "700" : "400" }}>{res.check_out}</td>
                  <td className="co-td" style={{ fontSize: ".86rem" }}>{nights} night{nights !== 1 ? "s" : ""}</td>
                  <td className="co-td" style={{ fontWeight: "700", color: "var(--green)" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</td>
                  <td className="co-td">
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: ".72rem", fontWeight: "700", background: isOverdue ? "#fce4ec" : "#fff8e1", color: isOverdue ? "var(--red)" : "#f57f17" }}>
                      {isOverdue ? "Overdue" : "Today"}
                    </span>
                  </td>
                  <td className="co-td">
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <InspectionBadge res={res} />
                      <button className="co-btn-checkout" onClick={() => handleCheckOutClick(res)}>
                        <RiLogoutBoxLine size={14} /> Check Out
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const StayingCard = ({ res }) => {
    const stayed   = nightsStayed(res.check_in);
    const left     = nightsLeft(res.check_out);
    const charges  = getAdditionalCharges(res);
    const addTotal = charges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    return (
      <div className={`co-staying-card${highlighted === res.room_number ? " highlighted" : ""}`}>
        <div className="co-staying-left">
          <div className="co-staying-room-lbl">Room</div>
          <div className="co-staying-room-num">{res.room_number}</div>
          <div className="co-staying-nights-box">
            <div className="co-staying-nights-num">{stayed}</div>
            <div className="co-staying-nights-lbl">night{stayed !== 1 ? "s" : ""}</div>
          </div>
          <div className="co-staying-left-sub" style={{ color: left <= 2 ? "#ffd54f" : "rgba(255,255,255,.5)", fontWeight: left <= 2 ? "700" : "400", fontSize: ".58rem" }}>
            {left === 0 ? "Checkout today" : `${left}d left`}
          </div>
        </div>
        <div className="co-staying-body">
          <div className="co-staying-info-grid">
            {[
              { Icon: RiUserLine,              lbl: "Guest",     val: res.guest_name,                                                       warn: false },
              { Icon: RiCalendarLine,          lbl: "Check-Out", val: res.check_out,                                                        warn: left <= 1 },
              { Icon: RiMoneyDollarCircleLine, lbl: "Room Rate", val: `₱${parseFloat(res.total_amount || 0).toLocaleString()}`,             warn: false },
              { Icon: RiCheckboxCircleLine,    lbl: "Payment",   val: res.pay_later ? "At Check-Out" : "Paid",                             warn: res.pay_later },
            ].map(({ Icon, lbl, val, warn }) => (
              <div key={lbl} className="co-info-box">
                <div className="co-info-lbl"><Icon size={10} />{lbl}</div>
                <div className="co-info-val" style={{ color: warn ? "var(--orange)" : "var(--text)" }}>{val}</div>
              </div>
            ))}
          </div>
          {res.notes && (
            <div style={{ display: "flex", gap: "6px", background: "#fffde7", border: "1px solid #fff176", borderRadius: "7px", padding: "7px 10px", marginBottom: "10px", fontSize: ".78rem", color: "#555", lineHeight: 1.4 }}>
              <RiStickyNoteLine size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
              {res.notes}
            </div>
          )}
          <div className="co-staying-footer">
            {addTotal > 0 ? (
              <span style={{ fontSize: ".75rem", color: "#6a1b9a", fontWeight: "600", background: "#f3e5f5", padding: "3px 9px", borderRadius: "10px" }}>
                +₱{addTotal.toLocaleString()} extra charges
              </span>
            ) : <span />}
            <div style={{ display: "flex", gap: "7px", alignItems: "center", flexWrap: "wrap" }}>
              <InspectionBadge res={res} />
              <button className="co-btn-checkout-blue" onClick={() => handleCheckOutClick(res)}>
                <RiLogoutBoxLine size={13} /> Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="co-page">

        <div className="co-hdr">
          <h2 className="co-title">Check-Out</h2>
          <p className="co-sub">Process guest departures and collect final payments</p>
        </div>

        <div className="co-stats">
          {[
            { label: "Currently Staying",  value: reservations.length,                                   Icon: RiUserLine,         bg: "#e8f5e9", color: "#1b5e20" },
            { label: "Overdue Check-Outs", value: reservations.filter(r => r.check_out < today).length, Icon: RiErrorWarningLine, bg: "#fce4ec", color: "#c62828" },
            { label: "Checking Out Today", value: reservations.filter(r => r.check_out === today).length,Icon: RiLogoutBoxLine,    bg: "#fff3e0", color: "#e65100" },
            { label: "Upcoming",           value: reservations.filter(r => r.check_out > today).length, Icon: RiCalendarLine,     bg: "#e3f2fd", color: "#1565c0" },
          ].map(({ label, value, Icon, bg, color }) => (
            <div key={label} className="co-sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="co-sc-row">
                <Icon size={18} color={color} />
                <span className="co-sc-lbl" style={{ color }}>{label}</span>
              </div>
              <div className="co-sc-val">{value}</div>
            </div>
          ))}
        </div>

        <div className="co-search-wrap">
          <RiSearchLine size={15} className="co-search-icon" />
          <input
            type="text"
            className="co-search-input"
            placeholder="Search guest name or room number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)", fontFamily: "Roboto, sans-serif" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="co-empty">
            <div className="co-empty-icon">
              <RiHotelBedLine size={32} color="#1b5e20" />
            </div>
            <div style={{ fontWeight: "700", color: "var(--text)", fontSize: "1.05rem" }}>No guests currently checked in</div>
            <div style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: ".88rem" }}>All rooms are available.</div>
          </div>
        ) : (
          <>
            <SectionTable title="Overdue — Should Have Checked Out" data={overdueList} dot="#c62828" />
            <SectionTable title="Checking Out Today"                data={todayList}   dot="#e65100" />
            {upcomingList.length > 0 && (
              <div style={{ marginBottom: "22px" }}>
                <div className="co-section-hdr">
                  <div className="co-section-dot" style={{ background: "#1565c0" }} />
                  <h3 className="co-section-title">Still Staying</h3>
                  <span className="co-section-count">{upcomingList.length}</span>
                </div>
                <div>
                  {upcomingList.map(r => <StayingCard key={r.id} res={r} />)}
                </div>
              </div>
            )}
          </>
        )}

        {showInspectionWarning && pendingCheckoutRes && (
          <InspectionWarningModal
            res={pendingCheckoutRes}
            onRequestInspection={requestInspectionFromWarning}
            onProceed={proceedWithoutInspection}
            onCancel={() => { setShowInspectionWarning(false); setPendingCheckoutRes(null); }}
          />
        )}

        {showModal && selected && (
          <CheckOutModal
            selected={selected}
            onClose={() => setShowModal(false)}
            onConfirm={handleCheckOut}
            processing={processing}
            successMsg={successMsg}
            extraCharges={extraCharges}     setExtraCharges={setExtraCharges}
            extraNote={extraNote}           setExtraNote={setExtraNote}
            paymentMethod={paymentMethod}   setPaymentMethod={setPaymentMethod}
            amountReceived={amountReceived} setAmountReceived={setAmountReceived}
            fullyPaid={fullyPaid}           setFullyPaid={setFullyPaid}
            editingCharge={editingCharge}   setEditingCharge={setEditingCharge}
            onSaveChargePrice={saveChargePrice}
            getAdditionalCharges={getAdditionalCharges}
            getInspectionCharges={getInspectionCharges}
          />
        )}
      </div>
    </>
  );
}