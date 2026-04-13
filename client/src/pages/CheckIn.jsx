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

const sectionTitle = (color = "#07713c") => ({
  fontSize: "0.78rem", fontWeight: "700", color,
  textTransform: "uppercase", letterSpacing: "0.8px",
  marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px",
});

const card = {
  background: "white", borderRadius: "12px", padding: "16px 20px",
  marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

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
    const merged = [...fromReservations, ...fromGuestPortal].sort(
      (a, b) => new Date(a.check_in) - new Date(b.check_in)
    );

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
      const baseTotal  = parseFloat(selected?.total_amount || 0);

      const newCheckinCharges      = (additionalCharges || []).filter(c => !c.from_reservation);
      const newCheckinChargesTotal = newCheckinCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
      const totalBill              = baseTotal + newCheckinChargesTotal;

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
      let reservationIdForOrders = checkedId;

      if (tableName === "newGuest") {
        const { data: newRes, error: insertErr } = await supabase
          .from("reservations")
          .insert([{
            guest_name:         selected.guest_name,
            guest_email:        selected.guest_email || selected.email || "",
            guest_phone:        selected.guest_phone || selected.phone || "",
            room_id:            selected.room_id,
            room_number:        selected.room_number,
            check_in:           selected.check_in,
            check_out:          selected.check_out || null,
            notes:              selected.notes || null,
            status:             "checked_in",
            total_amount:       totalBill,
            additional_charges: JSON.stringify(mergedCharges),
            amount_paid:        paidAmt,
            pay_later:          payLater || isPartial,
            payment_method:     payLater ? "pay_at_checkout" : paymentMethod,
            remaining_balance:  remainingAtCheckIn,
            checkin_balance:    remainingAtCheckIn,
          }])
          .select("id")
          .single();

        if (insertErr) { alert("Check-in failed: " + insertErr.message); setProcessing(false); return; }

        reservationIdForOrders = newRes.id;
        await supabase.from("newGuest").delete().eq("id", checkedId);

      } else {
        const { error: updateErr } = await supabase
          .from("reservations")
          .update({
            status:             "checked_in",
            payment_method:     payLater ? "pay_at_checkout" : paymentMethod,
            amount_paid:        paidAmt,
            pay_later:          payLater || isPartial,
            total_amount:       totalBill,
            additional_charges: JSON.stringify(mergedCharges),
            remaining_balance:  remainingAtCheckIn,
            checkin_balance:    remainingAtCheckIn,
          })
          .eq("id", checkedId);

        if (updateErr) { alert("Check-in failed: " + updateErr.message); setProcessing(false); return; }
      }

      await supabase.from("rooms").update({ status: "occupied" }).eq("id", selected.room_id);

      try { await activateQueuedOrders(reservationIdForOrders, selected.guest_name, selected.room_number); }
      catch (orderErr) { console.warn("activateQueuedOrders warning:", orderErr); }

      logActivity({
        action:      `Checked in guest: ${selected.guest_name}`,
        category:    "check_in",
        details:     `Room ${selected.room_number} | ${payLater ? "Pay at checkout" : `Paid ₱${paidAmt.toLocaleString()}`} | Source: ${tableName}`,
        entity_type: "reservation",
        entity_id:   reservationIdForOrders,
      });

      const ciReceipt = {
        guestName:    selected.guest_name,
        roomNumber:   selected.room_number,
        checkInDate:  selected.check_in,
        checkOutDate: selected.check_out || null,
        nights:       selected.check_out ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000) : null,
        guestPhone:    selected.guest_phone || selected.phone || "",
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

      printCheckInReceipt(ciReceipt, { name: user?.full_name || user?.email || "Staff", role: user?.role || "" });
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
    await supabase.from(table).update({
      room_id:     editRoomId,
      room_number: newRoom.room_number,
    }).eq("id", editTarget.id);
    setSavingEdit(false);
    setShowEditRoom(false);
    setEditTarget(null);
    setEditRoomId("");
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const table = deleteTarget._source || "reservations";
    await supabase.from(table).delete().eq("id", deleteTarget.id);
    await logActivity({
      action:      `Deleted pending reservation: ${deleteTarget.guest_name}`,
      category:    "delete",
      details:     `Room ${deleteTarget.room_number} | Source: ${table}`,
      entity_type: table,
      entity_id:   deleteTarget.id,
    });
    setDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
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
    const walkInChargesTotal = (walkIn.additional_charges || []).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    const totalWithCharges   = total + walkInChargesTotal;
    const amtReceived        = parseFloat(walkIn.amount_received || 0);
    const paidAmt            = walkInPayLater ? 0 : (amtReceived > 0 ? Math.min(amtReceived, totalWithCharges) : totalWithCharges);
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
      additional_charges: JSON.stringify((walkIn.additional_charges || []).map(c => ({ ...c, from_checkin: true }))),
      remaining_balance:  remainingAtCheckIn,
      checkin_balance:    remainingAtCheckIn,
    });

    if (error) { setWalkInError(error.message); setSavingWalkIn(false); return; }

    await supabase.from("rooms").update({ status: "occupied" }).eq("id", walkIn.room_id);

    logActivity({
      action: `Walk-in check-in: ${walkIn.guest_name}`,
      category: "check_in",
      details: `Room ${room?.room_number} | Total ₱${totalWithCharges.toLocaleString()}`,
      entity_type: "reservation",
    });

    const wiReceipt = {
      guestName: walkIn.guest_name, roomNumber: room?.room_number,
      checkInDate: walkIn.check_in, checkOutDate: walkIn.check_out || null,
      nights: walkIn.check_out ? Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000) : null,
      guestPhone: walkIn.guest_phone || "", guestNotes: walkIn.notes || "",
      roomCharge: total, resCharges: [], walkInCharges: walkIn.additional_charges || [],
      grandTotal: totalWithCharges, amountPaid: paidAmt,
      payMethod: walkInPayLater ? "pay_at_checkout" : "cash",
    };

    setSavingWalkIn(false);
    setShowWalkIn(false);
    setWalkIn({ guest_name: "", guest_email: "", guest_phone: "", room_id: "", check_in: today, check_out: "", notes: "", additional_charges: [] });
    printCheckInReceipt(wiReceipt, { name: user?.full_name || user?.email || "Staff", role: user?.role || "" });
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
          <div className="ci-room">{res.room_number || "—"}</div>
          <div className="ci-type-badge">
            <div className="ci-type-val">{resNights != null ? `${resNights}n` : "Open"}</div>
          </div>
        </div>

        <div className="ci-body">
          {isOverdue && (
            <div style={{ background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: "7px", padding: "7px 12px", marginBottom: "8px", fontSize: ".78rem", color: "#e65100", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600" }}>
              ⚠️ Overdue — guest was expected on {res.check_in}. Please follow up or reassign.
            </div>
          )}
          {isPortal && (
            <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "7px", padding: "5px 12px", marginBottom: "8px", fontSize: ".74rem", color: "#2e7d32", display: "flex", alignItems: "center", gap: "6px" }}>
              🌐 Submitted via Guest Portal
            </div>
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
              <div className="ci-info-val" style={{ color: "#07713c" }}>₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
            </div>
            {res.notes ? (
              <div className="ci-info" style={{ background: "#fffdf0", border: "1px solid #f0de7a", display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                <span style={{ fontSize: "0.8rem", flexShrink: 0 }}>📝</span>
                <div style={{ minWidth: 0 }}>
                  <div className="ci-info-lbl" style={{ color: "#b45309" }}>Notes</div>
                  <div className="ci-info-val" style={{ color: "#7a6500", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.notes}</div>
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
            <span className="status-tag" style={{
              background: isOverdue ? "#fff3e0" : isToday ? "#ecfdf5" : "#e3f2fd",
              color:      isOverdue ? "#e65100" : isToday ? "#07713c" : "#1565c0",
            }}>
              {isOverdue ? "⚠ Overdue" : isToday ? "Today" : "Upcoming"}
            </span>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Delete */}
              <button
                onClick={() => { setDeleteTarget(res); setShowDeleteConfirm(true); }}
                title="Delete reservation"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "7px 11px", background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: "8px", cursor: "pointer", fontSize: ".78rem", fontWeight: "700", color: "#dc2626", fontFamily: "Arial,sans-serif", transition: "all .15s" }}
                onMouseOver={e => { e.currentTarget.style.background = "#fee2e2"; }}
                onMouseOut={e =>  { e.currentTarget.style.background = "#fff5f5"; }}
              >
                <RiDeleteBinLine size={14} />
              </button>

              {/* Edit Room */}
              <button
                onClick={() => { setEditTarget(res); setEditRoomId(res.room_id || ""); setShowEditRoom(true); }}
                title="Change room assignment"
                style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "7px 13px", background: "#fff", border: "1.5px solid #ccdacc", borderRadius: "8px", cursor: "pointer", fontSize: ".78rem", fontWeight: "700", color: "#4a6a4a", fontFamily: "Arial,sans-serif", transition: "all .15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#07713c"; e.currentTarget.style.color = "#07713c"; }}
                onMouseOut={e =>  { e.currentTarget.style.borderColor = "#ccdacc"; e.currentTarget.style.color = "#4a6a4a"; }}
              >
                ✏️ Edit Room
              </button>

              {/* Check In */}
              <button className="btn-ci" onClick={() => openCheckIn(res)}>
                <RiLoginBoxLine size={14} />Check In
              </button>
            </div>
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

        {/* ── Edit Room Modal ── */}
        {showEditRoom && editTarget && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", overflowY: "auto" }}>
            <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "min(520px, 95vw)", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif", overflow: "hidden" }}>

              <div style={{ background: "linear-gradient(135deg,#07713c,#0a9150)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700" }}>Change Room Assignment</h3>
                  <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>{editTarget.guest_name}</p>
                </div>
                <button onClick={() => { setShowEditRoom(false); setEditTarget(null); setEditRoomId(""); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>×</button>
              </div>

              <div style={{ padding: "24px 30px" }}>

                {/* Current info */}
                <div style={card}>
                  <div style={sectionTitle("#07713c")}>Current Assignment</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      ["Guest",     editTarget.guest_name],
                      ["Room",      editTarget.room_number ? `Room ${editTarget.room_number}` : "Not assigned"],
                      ["Check-In",  editTarget.check_in],
                      ["Check-Out", editTarget.check_out || "Open Stay"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room picker */}
                <div style={card}>
                  <div style={sectionTitle("#07713c")}>Select New Room</div>
                  <select
                    value={editRoomId}
                    onChange={e => setEditRoomId(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "0.9rem", fontFamily: "Arial,sans-serif", outline: "none", background: "white", cursor: "pointer", transition: "border 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#07713c"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  >
                    <option value="">— Select a room —</option>
                    {availableRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night
                      </option>
                    ))}
                  </select>

                  {availableRooms.length === 0 && (
                    <div style={{ fontSize: ".8rem", color: "#e65100", marginTop: "8px", padding: "10px 14px", background: "#fff3e0", borderRadius: "8px", border: "1px solid #ffb74d" }}>
                      ⚠ No available rooms right now. Free up a room first.
                    </div>
                  )}

                  {/* Preview */}
                  {editRoomId && (() => {
                    const r = rooms.find(rm => rm.id === editRoomId);
                    return r ? (
                      <div style={{ marginTop: "12px", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontWeight: "700", color: "#07713c", fontSize: "0.95rem" }}>Room {r.room_number}</div>
                          <div style={{ color: "#555", fontSize: "0.82rem", marginTop: "2px" }}>{r.type} · Floor {r.floor}</div>
                        </div>
                        <div style={{ fontWeight: "700", color: "#07713c" }}>₱{parseFloat(r.price).toLocaleString()}/night</div>
                      </div>
                    ) : null;
                  })()}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => { setShowEditRoom(false); setEditTarget(null); setEditRoomId(""); }} style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditRoom}
                    disabled={savingEdit || !editRoomId}
                    style={{ flex: 2, padding: "13px", background: savingEdit || !editRoomId ? "#aaa" : "#07713c", border: "none", borderRadius: "10px", cursor: savingEdit || !editRoomId ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif" }}
                  >
                    {savingEdit ? "Saving..." : "Save Room Change"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {showDeleteConfirm && deleteTarget && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "min(440px, 95vw)", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif", overflow: "hidden" }}>

              <div style={{ background: "linear-gradient(135deg,#c62828,#e53935)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700" }}>Delete Reservation</h3>
                  <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>This action cannot be undone</p>
                </div>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>×</button>
              </div>

              <div style={{ padding: "24px 30px" }}>
                <div style={{ ...card, background: "#fff5f5", border: "1.5px solid #fca5a5" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    {[
                      ["Guest",    deleteTarget.guest_name],
                      ["Room",     deleteTarget.room_number ? `Room ${deleteTarget.room_number}` : "—"],
                      ["Check-In", deleteTarget.check_in],
                      ["Source",   deleteTarget._source === "newGuest" ? "Guest Portal" : "Reservation"],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "white", borderRadius: "8px", padding: "10px 12px" }}>
                        <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                        <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: ".82rem", color: "#c62828", fontWeight: "600", padding: "10px 12px", background: "#fce4ec", borderRadius: "8px" }}>
                    ⚠ Deleting this will permanently remove the reservation from the system.
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }} style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{ flex: 2, padding: "13px", background: deleting ? "#aaa" : "#c62828", border: "none", borderRadius: "10px", cursor: deleting ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
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