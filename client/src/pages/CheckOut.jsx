import React, { useState, useEffect } from "react";
import {
  RiUserLine, RiHotelBedLine, RiCalendarLine, RiLogoutBoxLine,
  RiErrorWarningLine, RiTimeLine, RiMoneyDollarCircleLine,
  RiStickyNoteLine, RiCheckboxCircleLine, RiSearchLine, RiAlertLine,
  RiToolsLine, RiCheckDoubleLine, RiPencilLine, RiCheckLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import { printCheckOutReceipt } from "../receiptPrinter ";

const inputStyle = { width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: "Arial,sans-serif", boxSizing: "border-box", background: "white", transition: "border 0.2s" };
const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" };

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "18px", width: "420px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "Arial,sans-serif", overflow: "hidden" }}>
        <div style={{ background: headerBg, padding: "22px 26px", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <RiAlertLine size={22} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: "700", fontSize: "1rem" }}>{title}</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", marginTop: "2px" }}>
              Room {res.room_number} · {res.guest_name}
            </div>
          </div>
        </div>
        <div style={{ padding: "22px 26px" }}>
          <p style={{ margin: "0 0 6px", fontSize: "0.9rem", color: "#333", lineHeight: 1.6 }}>{body}</p>
          <p style={{ margin: "0 0 20px", fontSize: "0.83rem", color: "#888" }}>{sub}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {notRequested && (
              <button onClick={onRequestInspection}
                style={{ width: "100%", padding: "12px 16px", background: "#6a1b9a", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "0.88rem", fontWeight: "700", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
                <RiSearchLine size={16} /> Request Inspection First
              </button>
            )}
            <button onClick={onProceed}
              style={{ width: "100%", padding: "12px 16px", background: "#fff3e0", color: "#e65100", border: "1.5px solid #ffcc80", borderRadius: "10px", cursor: "pointer", fontSize: "0.88rem", fontWeight: "700", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
              <RiLogoutBoxLine size={16} /> Proceed Without Inspection
            </button>
            <button onClick={onCancel}
              style={{ width: "100%", padding: "10px 16px", background: "white", color: "#888", border: "1.5px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600", fontFamily: "Arial,sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckOut({ highlightRoom, user }) {
  const [reservations,   setReservations]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [showModal,      setShowModal]      = useState(false);
  const [selected,       setSelected]       = useState(null);
  const [processing,     setProcessing]     = useState(false);
  const [paymentMethod,  setPaymentMethod]  = useState("cash");
  const [extraCharges,   setExtraCharges]   = useState("");
  const [extraNote,      setExtraNote]      = useState("");
  const [amountReceived, setAmountReceived] = useState("");
  const [fullyPaid,      setFullyPaid]      = useState(false);
  const [successMsg,     setSuccessMsg]     = useState("");
  const [requesting,     setRequesting]     = useState(null);
  const [editingCharge,  setEditingCharge]  = useState(null);
  const [highlighted,    setHighlighted]    = useState(null);
  const [showInspectionWarning, setShowInspectionWarning] = useState(false);
  const [pendingCheckoutRes,    setPendingCheckoutRes]    = useState(null);

  const today = new Date().toISOString().split("T")[0];

  // ── Initial load only (no loading spinner on polls)
  useEffect(() => {
    fetchData(false);
    const poll = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(poll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime: inspection status updates instantly
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (highlightRoom?.room_number) {
      setHighlighted(highlightRoom.room_number);
      setTimeout(() => setHighlighted(null), 4000);
    }
  }, [highlightRoom]);

  // ── silent=true: no loading spinner, only update state if data changed
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

  const getInspectionCharges = (res) => { try { return JSON.parse(res?.inspection_charges || "[]"); } catch { return []; } };

  const saveChargePrice = async (res, idx, newAmount) => {
    const charges = getInspectionCharges(res);
    charges[idx] = { ...charges[idx], amount: parseFloat(newAmount) || 0, tbd: false };
    await supabase.from("reservations")
      .update({ inspection_charges: JSON.stringify(charges) })
      .eq("id", res.id);
    setReservations(prev => prev.map(r => r.id === res.id
      ? { ...r, inspection_charges: JSON.stringify(charges) }
      : r
    ));
    if (selected && selected.id === res.id) {
      setSelected(prev => ({ ...prev, inspection_charges: JSON.stringify(charges) }));
    }
    setEditingCharge(null);
  };

  const handleRequestInspection = async (res) => {
    setRequesting(res.id);
    await supabase.from("reservations")
      .update({ inspection_status: "requested" })
      .eq("id", res.id);
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
    if (res.inspection_status === "cleared") {
      openCheckOut(res);
    } else {
      setPendingCheckoutRes(res);
      setShowInspectionWarning(true);
    }
  };

  const proceedWithoutInspection = () => {
    setShowInspectionWarning(false);
    openCheckOut(pendingCheckoutRes);
    setPendingCheckoutRes(null);
  };

  const requestInspectionFromWarning = async () => {
    if (pendingCheckoutRes) {
      await handleRequestInspection(pendingCheckoutRes);
    }
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

  const getAdditionalCharges = (res) => { try { return JSON.parse(res?.additional_charges || "[]"); } catch { return []; } };
  // Walk-in guests: additional_charges = charges added AT check-in (already in total_amount? No — walk-in saves them separately)
  // For checkout, additional_charges = in-house charges added DURING stay (from InHouse page)
  // These are separate from total_amount and need to be added to the bill

  const basTotal        = parseFloat(selected?.total_amount || 0);
  const alreadyPaid     = parseFloat(selected?.amount_paid  || 0);
  const extra           = parseFloat(extraCharges           || 0);
  // additional_charges contains both reservation charges (from_reservation=true, already in total_amount)
  // and in-house charges (from_reservation=false/undefined, need to be added to bill)
  const additionalTotal = selected
    ? getAdditionalCharges(selected).filter(c => !c.from_reservation).reduce((s, c) => s + parseFloat(c.amount || 0), 0)
    : 0;
  const inspectionTotal = selected ? getInspectionCharges(selected).reduce((s,c)=>s+parseFloat(c.amount||0),0) : 0;
  const grandTotal      = basTotal + extra + additionalTotal + inspectionTotal;
  const balanceDue      = Math.max(0, grandTotal - alreadyPaid);
  const change          = fullyPaid ? 0 : Math.max(0, parseFloat(amountReceived || 0) - balanceDue);

  const handleCheckOut = async () => {
    if (!selected) return;
    setProcessing(true);

    const snap = {
      id:               selected.id,
      guestName:        selected.guest_name,
      roomNumber:       selected.room_number,
      roomId:           selected.room_id,
      basTotal:         parseFloat(selected.total_amount || 0),
      alreadyPaid:      parseFloat(selected.amount_paid  || 0),
      extraAmt:         parseFloat(extraCharges || 0),
      extraNoteVal:     extraNote,
      payMethod:        paymentMethod,
      addCharges:       getAdditionalCharges(selected),
      inspCharges:      getInspectionCharges(selected),
    };
    // snapAddTotal = in-house charges only (from_reservation=false), reservation charges already in basTotal
    const snapAddTotal   = snap.addCharges.filter(c => !c.from_reservation).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const snapInspTotal  = snap.inspCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const snapGrandTotal = snap.basTotal + snap.extraAmt + snapAddTotal + snapInspTotal;

    const { error: resError } = await supabase
      .from("reservations")
      .update({
        status:             "checked_out",
        total_amount:       snapGrandTotal,
        payment_method:     snap.payMethod,
        amount_paid:        snapGrandTotal,
        extra_charges:      snap.extraAmt,
        extra_charges_note: snap.extraNoteVal,
        checked_out_at:     new Date().toISOString(),
      })
      .eq("id", snap.id);

    if (resError) {
      alert("Checkout failed: " + resError.message);
      setProcessing(false);
      return;
    }

    await supabase.from("rooms").update({ status: "needs_cleaning" }).eq("id", snap.roomId);

    setReservations(prev => prev.filter(r => r.id !== snap.id));
    setShowModal(false);
    setSelected(null);
    setProcessing(false);
    setExtraCharges("");
    setExtraNote("");
    setFullyPaid(false);
    setAmountReceived("");

    logActivity({
      action:      `Checked out guest: ${snap.guestName}`,
      category:    "check_out",
      details:     `Room ${snap.roomNumber} | Total ₱${snapGrandTotal.toLocaleString()} | Extra ₱${snap.extraAmt.toLocaleString()}`,
      entity_type: "reservation",
      entity_id:   snap.id,
    });

    // ── Auto-print receipt after checkout ──
    printCheckOutReceipt(
      {
        guestName:      snap.guestName,
        roomNumber:     snap.roomNumber,
        checkInDate:    selected?.check_in  || "",
        checkOutDate:   selected?.check_out || new Date().toISOString().split("T")[0],
        roomCharge:     snap.basTotal,
        resCharges:     snap.addCharges.filter(c => c.from_reservation),
        inHouseCharges: snap.addCharges.filter(c => !c.from_reservation),
        inspCharges:    snap.inspCharges,
        extraAmt:       snap.extraAmt,
        extraNote:      snap.extraNoteVal,
        alreadyPaid:    snap.alreadyPaid,
        grandTotal:     snapGrandTotal,
        payMethod:      snap.payMethod,
        guestNotes:     selected?.notes || "",
      },
      { name: user?.full_name || user?.email || "Staff", role: user?.role || "" }
    );
  };



  const filtered = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number || "").includes(search)
  );

  const overdueList  = filtered.filter(r => r.check_out < today);
  const todayList    = filtered.filter(r => r.check_out === today);
  const upcomingList = filtered.filter(r => r.check_out > today);

  const nightsStayed = (checkIn)  => Math.max(1, Math.floor((new Date() - new Date(checkIn)) / 86400000));
  const nightsLeft   = (checkOut) => Math.max(0, Math.ceil((new Date(checkOut) - new Date()) / 86400000));

  /* ── TABLE ROW ── */
  const GuestRow = ({ res }) => {
    const nights    = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000);
    const isOverdue = res.check_out < today;
    return (
      <tr style={{ borderBottom: "1px solid #f5f5f5", background: highlighted === res.room_number ? "#fff8e1" : "white", transition: "background 0.5s", outline: highlighted === res.room_number ? "2px solid #f59e0b" : "none" }}
        onMouseOver={e => { if (highlighted !== res.room_number) e.currentTarget.style.background = "#fafafa"; }}
        onMouseOut={e => { if (highlighted !== res.room_number) e.currentTarget.style.background = "white"; }}>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#e65100,#ff9800)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>
              {res.guest_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: "600", fontSize: "0.92rem" }}>{res.guest_name}</div>
              {res.guest_phone && <div style={{ fontSize: "0.78rem", color: "#aaa" }}>{res.guest_phone}</div>}
            </div>
          </div>
        </td>
        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>{res.room_number || "—"}</td>
        <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{res.check_in}</td>
        <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: isOverdue ? "#e53935" : "#555", fontWeight: isOverdue ? "700" : "400" }}>{res.check_out}</td>
        <td style={{ padding: "14px 16px", fontSize: "0.88rem" }}>{nights} night{nights !== 1 ? "s" : ""}</td>
        <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</td>
        <td style={{ padding: "14px 16px" }}>
          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", background: isOverdue ? "#fce4ec" : "#fff8e1", color: isOverdue ? "#c62828" : "#f57f17" }}>
            {isOverdue ? "Overdue" : "Today"}
          </span>
        </td>
        <td style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {res.inspection_status === "cleared" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "#ecfdf5", color: "#07713c", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                <RiCheckDoubleLine size={12} /> Cleared
              </span>
            ) : res.inspection_status === "requested" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "#fff8e1", color: "#f57f17", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                <RiToolsLine size={12} /> Inspecting...
              </span>
            ) : res.inspection_status === "has_damage" ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "#fce4ec", color: "#c62828", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                <RiAlertLine size={12} /> Damage Found
              </span>
            ) : (
              <button onClick={() => handleRequestInspection(res)} disabled={requesting === res.id} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "8px 12px", background: "#f3e5f5", color: "#6a1b9a", border: "1.5px solid #ce93d8", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", fontFamily: "Arial,sans-serif" }}>
                <RiSearchLine size={13} />{requesting === res.id ? "..." : "Inspect"}
              </button>
            )}
            <button onClick={() => handleCheckOutClick(res)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: "#e65100", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700", fontFamily: "Arial,sans-serif" }}>
              <RiLogoutBoxLine size={14} /> Check Out
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const SectionTable = ({ title, data, dot }) => data.length > 0 && (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: dot }} />
        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#333" }}>{title} ({data.length})</h3>
      </div>
      <div style={{ background: "white", borderRadius: "14px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Arial,sans-serif" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #f0f0f0" }}>
              {["Guest","Room","Check-In","Check-Out","Nights","Total","Type","Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.78rem", color: "#888", fontWeight: "700", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>{data.map(r => <GuestRow key={r.id} res={r} />)}</tbody>
        </table>
      </div>
    </div>
  );

  /* ── VERTICAL CARD (still staying) ── */
  const StayingCard = ({ res }) => {
    const stayed   = nightsStayed(res.check_in);
    const left     = nightsLeft(res.check_out);
    const charges  = getAdditionalCharges(res);
    const addTotal = charges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    return (
      <div style={{ background: highlighted === res.room_number ? "#fff8e1" : "white", borderRadius: "14px", overflow: "hidden", boxShadow: highlighted === res.room_number ? "0 0 0 2px #f59e0b" : "0 2px 10px rgba(0,0,0,0.06)", border: highlighted === res.room_number ? "1px solid #f59e0b" : "1px solid #e4ebe4", display: "flex", transition: "all 0.5s" }}>
        <div style={{ background: "linear-gradient(180deg,#1565c0,#1976d2)", padding: "18px 16px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minWidth: "90px", flexShrink: 0 }}>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Room</div>
          <div style={{ fontSize: "1.7rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{res.room_number}</div>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px", padding: "5px 10px", marginTop: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{stayed}</div>
            <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>night{stayed !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ marginTop: "8px", fontSize: "0.6rem", color: left <= 2 ? "#ffd54f" : "rgba(255,255,255,0.55)", textAlign: "center", fontWeight: left <= 2 ? "700" : "400" }}>
            {left === 0 ? "Checkout today" : `${left}d left`}
          </div>
        </div>
        <div style={{ padding: "14px 18px", flex: 1, minWidth: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "10px" }}>
            {[
              { Icon: RiUserLine,              lbl: "Guest",     val: res.guest_name },
              { Icon: RiCalendarLine,          lbl: "Check-Out", val: res.check_out, warn: left <= 1 },
              { Icon: RiMoneyDollarCircleLine, lbl: "Room Rate", val: `₱${parseFloat(res.total_amount || 0).toLocaleString()}` },
              { Icon: RiCheckboxCircleLine,    lbl: "Payment",   val: res.pay_later ? "At Check-Out" : "Paid", warn: res.pay_later },
            ].map(({ Icon, lbl, val, warn }) => (
              <div key={lbl} style={{ background: "#f4f6f0", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ fontSize: "0.64rem", color: "#8a9a8a", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "3px", marginBottom: "2px" }}>
                  <Icon size={10} />{lbl}
                </div>
                <div style={{ fontSize: "0.84rem", fontWeight: "600", color: warn ? "#e65100" : "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</div>
              </div>
            ))}
          </div>
          {res.notes && (
            <div style={{ display: "flex", gap: "6px", background: "#fffde7", border: "1px solid #fff176", borderRadius: "7px", padding: "7px 10px", marginBottom: "10px", fontSize: "0.79rem", color: "#555", lineHeight: 1.4 }}>
              <RiStickyNoteLine size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
              {res.notes}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {addTotal > 0 ? (
              <span style={{ fontSize: "0.78rem", color: "#6a1b9a", fontWeight: "600", background: "#f3e5f5", padding: "3px 9px", borderRadius: "10px" }}>
                +₱{addTotal.toLocaleString()} extra charges
              </span>
            ) : <span />}
            <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
              {res.inspection_status === "cleared" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 11px", background: "#ecfdf5", color: "#07713c", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700", border: "1px solid #a7f3d0" }}>
                  <RiCheckDoubleLine size={12} /> Room Cleared
                </span>
              ) : res.inspection_status === "requested" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 11px", background: "#fff8e1", color: "#f57f17", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                  <RiToolsLine size={12} /> Inspecting...
                </span>
              ) : res.inspection_status === "has_damage" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 11px", background: "#fce4ec", color: "#c62828", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}>
                  <RiAlertLine size={12} /> Damage Found
                </span>
              ) : (
                <button onClick={() => handleRequestInspection(res)} disabled={requesting === res.id} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 14px", background: "#f3e5f5", color: "#6a1b9a", border: "1.5px solid #ce93d8", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "700", fontFamily: "Arial,sans-serif" }}>
                  <RiSearchLine size={13} />{requesting === res.id ? "..." : "Request Inspection"}
                </button>
              )}
              <button onClick={() => handleCheckOutClick(res)} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: "#1565c0", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.82rem", fontWeight: "700", fontFamily: "Arial,sans-serif" }}>
                <RiLogoutBoxLine size={13} /> Check Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Arial,sans-serif", background: "#f0f2f0", minHeight: "100vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#1a3c1a" }}>Check-Out</h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.9rem" }}>Process guest departures and collect final payments</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Currently Staying",  value: reservations.length,                                     Icon: RiUserLine,         bg: "#e8f5e9", color: "#1b5e20" },
          { label: "Overdue Check-Outs", value: reservations.filter(r => r.check_out < today).length,   Icon: RiErrorWarningLine, bg: "#fce4ec", color: "#c62828" },
          { label: "Checking Out Today", value: reservations.filter(r => r.check_out === today).length, Icon: RiLogoutBoxLine,    bg: "#fff3e0", color: "#e65100" },
          { label: "Upcoming",           value: reservations.filter(r => r.check_out > today).length,   Icon: RiCalendarLine,     bg: "#e3f2fd", color: "#1565c0" },
        ].map(({ label, value, Icon, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: "14px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <Icon size={18} color={color} />
              <span style={{ fontSize: "0.85rem", color, fontWeight: "600" }}>{label}</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1a1a1a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: "white", borderRadius: "14px", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <input type="text" placeholder="🔍  Search guest name or room number..."
          value={search} onChange={e => setSearch(e.target.value)} style={inputStyle}
          onFocus={e => e.target.style.borderColor = "#e65100"}
          onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: "14px", padding: "60px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <RiHotelBedLine size={32} color="#1b5e20" />
          </div>
          <div style={{ fontWeight: "700", color: "#333", fontSize: "1.1rem" }}>No guests currently checked in</div>
          <div style={{ color: "#aaa", marginTop: "6px" }}>All rooms are available.</div>
        </div>
      ) : (
        <>
          <SectionTable title="Overdue — Should Have Checked Out" data={overdueList} dot="#c62828" />
          <SectionTable title="Checking Out Today"                data={todayList}   dot="#e65100" />
          {upcomingList.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#1565c0" }} />
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "700", color: "#333" }}>Still Staying ({upcomingList.length})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {upcomingList.map(r => <StayingCard key={r.id} res={r} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* INSPECTION WARNING MODAL */}
      {showInspectionWarning && pendingCheckoutRes && (
        <InspectionWarningModal
          res={pendingCheckoutRes}
          onRequestInspection={requestInspectionFromWarning}
          onProceed={proceedWithoutInspection}
          onCancel={() => { setShowInspectionWarning(false); setPendingCheckoutRes(null); }}
        />
      )}

      {/* CHECK-OUT MODAL */}
      {showModal && selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "520px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif" }}>
            <div style={{ background: "linear-gradient(135deg,#bf360c,#e65100)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                  <RiLogoutBoxLine size={20} /> Process Check-Out
                </h3>
                <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>Review charges and collect final payment</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>×</button>
            </div>

            <div style={{ padding: "24px 30px" }}>
              {successMsg && (
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#1b5e20", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem", fontWeight: "600" }}>
                  ✅ {successMsg}
                </div>
              )}

              {/* No inspection banner */}
              {!selected.inspection_status && (
                <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.83rem", color: "#f57f17", fontWeight: "600" }}>
                  <RiAlertLine size={15} color="#f57f17" />
                  Room was not inspected before check-out.
                </div>
              )}

              {/* Summary */}
              <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <RiUserLine size={13} /> Reservation Summary
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    ["Guest",       selected.guest_name],
                    ["Room",        `Room ${selected.room_number}`],
                    ["Check-In",    selected.check_in],
                    ["Check-Out",   selected.check_out],
                    ["Duration",    `${Math.max(0,(new Date(selected.check_out)-new Date(selected.check_in))/86400000)} nights`],
                    ["Room Charge", `₱${parseFloat(selected.total_amount||0).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px" }}>
                      <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extra Charges */}
              <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>Extra Charges at Check-Out (Optional)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Amount (₱)</label>
                    <input type="number" value={extraCharges} onChange={e => setExtraCharges(e.target.value)} placeholder="0.00" style={inputStyle} onFocus={e => e.target.style.borderColor="#e65100"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Reason</label>
                    <input value={extraNote} onChange={e => setExtraNote(e.target.value)} placeholder="e.g. Room service, minibar" style={inputStyle} onFocus={e => e.target.style.borderColor="#e65100"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <RiMoneyDollarCircleLine size={13} /> Payment Method
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["cash","card","gcash","bank_transfer"].map(m => (
                    <button key={m} onClick={() => setPaymentMethod(m)} style={{ flex: 1, padding: "8px 4px", border: `2px solid ${paymentMethod===m?"#e65100":"#e8e8e8"}`, borderRadius: "8px", background: paymentMethod===m?"#fff3e0":"white", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", color: paymentMethod===m?"#e65100":"#888", fontFamily: "Arial,sans-serif" }}>
                      {m==="cash"?"Cash":m==="card"?"Card":m==="gcash"?"GCash":"Bank"}<br/>
                      <span style={{ fontSize: "0.65rem", fontWeight: "400", color: "#aaa" }}>{m==="cash"?"💵":m==="card"?"💳":m==="gcash"?"📱":"🏦"}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Guest Notes */}
              {selected?.notes && (
                <div style={{ background: "#fffde7", border: "1px solid #fff176", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.83rem", color: "#555" }}>
                  <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span><strong>Guest Notes:</strong> {selected.notes}</span>
                </div>
              )}

              {/* Inspection result banner */}
              {selected?.inspection_status === "has_damage" && (
                <div style={{ background: "#fce4ec", border: "1.5px solid #ef9a9a", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                    <RiAlertLine size={16} color="#c62828" />
                    <span style={{ fontWeight: "700", color: "#c62828", fontSize: "0.88rem" }}>Damage Reported by Maintenance</span>
                  </div>
                  {selected.inspection_notes && (
                    <div style={{ fontSize: "0.82rem", color: "#555", marginBottom: "10px", background: "#fff5f5", padding: "8px 10px", borderRadius: "7px" }}>
                      {selected.inspection_notes}
                    </div>
                  )}
                  {getInspectionCharges(selected).length > 0 && (
                    <div>
                      <div style={{ fontSize: ".72rem", fontWeight: "700", color: "#c62828", textTransform: "uppercase", marginBottom: "6px" }}>Damage Charges</div>
                      {getInspectionCharges(selected).map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.83rem", padding: "5px 8px", background: "#fff", borderRadius: "7px", marginBottom: "4px", border: "1px solid #ffcdd2" }}>
                          <span style={{ color: "#333" }}>• {c.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {editingCharge?.index === i ? (
                              <>
                                <input type="number" autoFocus defaultValue={c.tbd ? "" : c.amount}
                                  style={{ width: "90px", padding: "4px 8px", border: "1.5px solid #c62828", borderRadius: "6px", fontSize: ".83rem", outline: "none", fontFamily: "Arial,sans-serif" }}
                                  onKeyDown={e => {
                                    if (e.key === "Enter") saveChargePrice(selected, i, e.target.value);
                                    if (e.key === "Escape") setEditingCharge(null);
                                  }}
                                  id={`charge-edit-${i}`}
                                />
                                <button onClick={() => saveChargePrice(selected, i, document.getElementById(`charge-edit-${i}`)?.value)}
                                  style={{ background: "#07713c", border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
                                  <RiCheckLine size={13} />
                                </button>
                              </>
                            ) : (
                              <>
                                {c.tbd
                                  ? <span style={{ fontSize: ".72rem", fontWeight: "700", color: "#f57f17", background: "#fff8e1", padding: "2px 7px", borderRadius: "8px", border: "1px solid #ffe082" }}>TBD</span>
                                  : <span style={{ fontWeight: "700", color: "#c62828" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                                }
                                <button onClick={() => setEditingCharge({ index: i })}
                                  style={{ background: c.tbd ? "#f57f17" : "#f4f6f0", border: "none", borderRadius: "6px", padding: "4px 7px", cursor: "pointer", color: c.tbd ? "#fff" : "#555", display: "flex", alignItems: "center", gap: "3px", fontSize: ".72rem", fontWeight: "700" }}>
                                  <RiPencilLine size={11} />{c.tbd ? "Set Price" : "Edit"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {getInspectionCharges(selected).some(c => c.tbd) && (
                        <div style={{ fontSize: ".75rem", color: "#f57f17", marginTop: "6px", fontStyle: "italic" }}>
                          ⚠ Some charges are TBD — click "Set Price" to enter the final amount before checkout.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {selected?.inspection_status === "cleared" && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "10px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#065f46", fontWeight: "600" }}>
                  <RiCheckDoubleLine size={16} color="#07713c" /> Room inspected and cleared — no damage reported.
                </div>
              )}

              {/* Bill Breakdown */}
              <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>Bill Breakdown</div>

                {/* ── Refund banner: only shows when stay was shortened via In-House ── */}
                {selected?.refund_amount > 0 && selected?.original_checkout && (
                  <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px" }}>
                    <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#f57f17", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                      ⚠ Stay Was Shortened — Refund Applied
                    </div>
                    {[
                      ["Original Check-Out",       selected.original_checkout],
                      ["New Check-Out",             selected.check_out],
                      ["Last Payment (Original)",  `₱${parseFloat(selected.original_amount || 0).toLocaleString()}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "#555", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #ffe082" }}>
                        <span>{k}</span>
                        <span style={{ fontWeight: 700, color: "#333" }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".92rem", fontWeight: 700, color: "#c62828", paddingTop: 4 }}>
                      <span>Refund Issued to Guest</span>
                      <span>−₱{parseFloat(selected.refund_amount).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* ── Standard line items ── */}

                {/* Room Charge — basTotal */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                  <span style={{ color: "#555" }}>Room Charge</span>
                  <span style={{ fontWeight: "600", color: "#333" }}>₱{basTotal.toLocaleString()}</span>
                </div>

                {/* Reservation charges — already in Room Charge, shown as breakdown */}
                {getAdditionalCharges(selected).filter(c => c.from_reservation).length > 0 && (
                  <div style={{ marginBottom: "4px" }}>
                    {getAdditionalCharges(selected).filter(c => c.from_reservation).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.79rem", color: "#888", padding: "2px 0 2px 12px" }}>
                        <span>• {c.name} <span style={{ fontSize: ".7rem", color: "#bbb" }}>(reservation)</span></span>
                        <span style={{ fontWeight: "600", color: "#aaa" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* In-House Charges — added during stay via InHouse page */}
                {additionalTotal > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                      <span style={{ color: "#6a1b9a", fontWeight: "600" }}>In-House Charges (during stay)</span>
                      <span style={{ fontWeight: "600", color: "#6a1b9a" }}>₱{additionalTotal.toLocaleString()}</span>
                    </div>
                    {getAdditionalCharges(selected).filter(c => !c.from_reservation).map(c => (
                      <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.79rem", color: "#888", padding: "2px 0 2px 12px" }}>
                        <span>• {c.name}</span>
                        <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Inspection / Damage charges */}
                {getInspectionCharges(selected).reduce((s,c)=>s+parseFloat(c.amount||0),0) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                    <span style={{ color: "#c62828", fontWeight: "600" }}>Damage / Inspection Charges</span>
                    <span style={{ fontWeight: "600", color: "#c62828" }}>₱{getInspectionCharges(selected).reduce((s,c)=>s+parseFloat(c.amount||0),0).toLocaleString()}</span>
                  </div>
                )}

                {/* Extra charges added at checkout */}
                {extra > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                    <span style={{ color: "#555" }}>Extra Charges (Check-Out)</span>
                    <span style={{ fontWeight: "600", color: "#333" }}>₱{extra.toLocaleString()}</span>
                  </div>
                )}

                {/* Already paid at check-in */}
                {alreadyPaid > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                    <span style={{ color: "#555" }}>Paid at Check-In</span>
                    <span style={{ fontWeight: "600", color: "#4caf50" }}>-₱{alreadyPaid.toLocaleString()}</span>
                  </div>
                )}
                {selected?.pay_later && alreadyPaid === 0 && (
                  <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "8px 12px", marginTop: "8px", fontSize: "0.8rem", color: "#f57f17", fontWeight: "600" }}>
                    Guest opted to pay at check-out — no payment collected at check-in.
                  </div>
                )}
                {selected?.pay_later && alreadyPaid > 0 && (
                  <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: "8px", padding: "8px 12px", marginTop: "8px", fontSize: "0.8rem", color: "#1565c0", fontWeight: "600" }}>
                    Partial payment of ₱{alreadyPaid.toLocaleString()} collected at check-in. Remaining balance due now.
                  </div>
                )}
                {/* In-House charge details shown inline above */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontSize: "1.05rem" }}>
                  <span style={{ fontWeight: "700", color: "#333" }}>Balance Due</span>
                  <span style={{ fontWeight: "700", color: balanceDue > 0 ? "#e65100" : "#4caf50", fontSize: "1.2rem" }}>₱{balanceDue.toLocaleString()}</span>
                </div>
              </div>

              {/* Collect Payment */}
              <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <RiMoneyDollarCircleLine size={13} /> Collect Payment
                </div>
                <div onClick={() => { setFullyPaid(!fullyPaid); if (!fullyPaid) setAmountReceived(balanceDue.toString()); }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${fullyPaid?"#4caf50":"#e8e8e8"}`, background: fullyPaid?"#e8f5e9":"#f8f9fa", cursor: "pointer", marginBottom: "14px", transition: "all 0.2s" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${fullyPaid?"#4caf50":"#ccc"}`, background: fullyPaid?"#4caf50":"white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {fullyPaid && <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "700" }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "0.9rem", color: fullyPaid?"#1b5e20":"#333" }}>Guest has fully paid</div>
                    <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "1px" }}>Mark as fully settled — no change needed</div>
                  </div>
                </div>
                {!fullyPaid && (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <label style={labelStyle}>Amount Received (₱)</label>
                      <input type="number" value={amountReceived} onChange={e => setAmountReceived(e.target.value)}
                        placeholder="Enter amount given by guest" style={{ ...inputStyle, fontSize: "1rem", fontWeight: "700" }}
                        onFocus={e => e.target.style.borderColor="#e65100"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
                    </div>
                    {change > 0 && (
                      <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: "0.9rem" }}>💵 Change to return</span>
                        <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{change.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                {fullyPaid && (
                  <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "0.95rem" }}>✅ Payment fully settled — ₱{grandTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>Cancel</button>
                <button onClick={handleCheckOut} disabled={processing || (!fullyPaid && !amountReceived)}
                  style={{ flex: 2, padding: "13px", background: processing?"#aaa":"#e65100", border: "none", borderRadius: "10px", cursor: processing?"not-allowed":"pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", boxShadow: "0 4px 12px rgba(230,81,0,0.3)" }}>
                  <RiLogoutBoxLine size={16} />
                  {processing ? "Processing..." : "Confirm Check-Out & Mark Paid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}