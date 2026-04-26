import { useState } from "react";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";
import {
  RiUserLine,
  RiLoginBoxLine,
  RiCalendarLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiMoneyDollarCircleLine,
  RiCalendar2Line,
  RiSaveLine,
  RiStickyNoteLine,
  RiAddCircleLine,
  RiRestaurantLine,
  RiDeleteBinLine,
  RiCashLine,
  RiCheckLine,
} from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";
import RoomPickerModal from "./RoomPickerModal";
import { printInHouseReceipt } from "../receiptPrinter ";

export default function InhouseModal({
  selected,
  onClose,
  charges,
  total,
  stayed,
  left,
  isToday,
  today,
  reqName, setReqName,
  reqAmt, setReqAmt,
  saving,
  onAddCharge,
  onDeleteCharge,
  onAddChargeObject,
  extDate,
  onExtDateChange,
  extending,
  onSaveDateChange,
  refundInfo,
  refundConfirmed,
  setRefundConfirmed,
  availableRooms,
  onRoomTransfer,
  onPayNow,
  user
}) {
  const [showRestaurant,  setShowRestaurant]  = useState(false);
  const [showRoomPicker,  setShowRoomPicker]  = useState(false);
  const [showTransfer,    setShowTransfer]    = useState(false);
  const [transferRoomId,  setTransferRoomId]  = useState("");
  const [transferDate,    setTransferDate]    = useState(today);
  const [transferring,    setTransferring]    = useState(false);
  const [transferPreview, setTransferPreview] = useState(null);
  const [showPayNow,      setShowPayNow]      = useState(false);
  const [amountReceived,  setAmountReceived]  = useState("");
  const [payingNow,       setPayingNow]       = useState(false);
  const [paySuccess,      setPaySuccess]      = useState(false);

  if (!selected) return null;

  const allChargesParsed = (() => {
    try { return JSON.parse(selected.additional_charges || "[]"); } catch { return []; }
  })();

  const fixedChargesSum = allChargesParsed
    .filter(c => c.from_reservation || c.from_checkin)
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const roomRateOnly = Math.max(0, parseFloat(selected.total_amount || 0) - fixedChargesSum);

  const currentPricePerNight = parseFloat(selected.rooms?.price ?? 0);

  const calcTransferPreview = (roomId, date) => {
    if (!roomId || !date || !selected.check_in) return null;
    const newRoom = availableRooms?.find(r => r.id === roomId);
    if (!newRoom) return null;

    const checkIn    = new Date(selected.check_in + "T00:00:00");
    const checkOut   = selected.check_out ? new Date(selected.check_out + "T00:00:00") : null;
    const transferDt = new Date(date + "T00:00:00");
    const todayDt    = new Date(today + "T00:00:00");

    const totalNights     = checkOut ? Math.round((checkOut - checkIn) / 86400000) : null;
    const nightsConsumed  = Math.max(0, Math.round((transferDt - checkIn) / 86400000));
    const nightsRemaining = totalNights ? Math.max(0, totalNights - nightsConsumed) : null;

    const isSameDay = transferDt.getTime() === todayDt.getTime() && nightsConsumed === 0;

    const oldRate = currentPricePerNight;
    const newRate = parseFloat(newRoom.price);

    let extraCharge = 0;
    let refund = 0;
    let newTotalAmount = 0;

    if (isSameDay) {
      newTotalAmount = totalNights ? totalNights * newRate : newRate;
      const oldTotal = totalNights ? totalNights * oldRate : oldRate;
      const diff = newTotalAmount - oldTotal;
      if (diff > 0) extraCharge = diff;
      else if (diff < 0) refund = Math.abs(diff);
    } else {
      const consumedCost  = nightsConsumed * oldRate;
      const remainingCost = nightsRemaining ? nightsRemaining * newRate : newRate;
      newTotalAmount = consumedCost + remainingCost + fixedChargesSum;
      const oldTotal = parseFloat(selected.total_amount || 0);
      const diff = newTotalAmount - oldTotal;
      if (diff > 0) extraCharge = diff;
      else if (diff < 0) refund = Math.abs(diff);
    }

    return {
      newRoom,
      newRate,
      oldRate,
      isSameDay,
      nightsConsumed,
      nightsRemaining,
      totalNights,
      extraCharge,
      refund,
      newTotalAmount,
    };
  };

  const handleTransferRoomChange = (roomId) => {
    setTransferRoomId(roomId);
    setTransferPreview(calcTransferPreview(roomId, transferDate));
  };

  const handleTransferDateChange = (date) => {
    setTransferDate(date);
    setTransferPreview(calcTransferPreview(transferRoomId, date));
  };

  const handleConfirmTransfer = async () => {
    if (!transferPreview || !transferRoomId) return;
    setTransferring(true);
    await onRoomTransfer(transferPreview, transferRoomId, transferDate);
    setTransferring(false);
    setShowTransfer(false);
    setTransferRoomId("");
    setTransferDate(today);
    setTransferPreview(null);
  };

  const openPayNow = () => {
    setAmountReceived(total > 0 ? total.toString() : "0");
    setPaySuccess(false);
    setShowPayNow(true);
  };

  const handlePayNow = async () => {
    console.log("USER OBJECT:", user);
    if (!selected || payingNow) return;
    const paying = parseFloat(amountReceived || 0);
    if (paying <= 0) return;
    setPayingNow(true);

    const prevPaid      = parseFloat(selected.amount_paid ?? 0);
    const newAmountPaid = prevPaid + paying;
    const newBalance    = Math.max(0, parseFloat(selected.remaining_balance ?? 0) - paying);
    const isFullyPaid   = newBalance === 0;

    await supabase.from("reservations").update({
      amount_paid:       newAmountPaid,
      remaining_balance: newBalance,
      checkin_balance:   newBalance,
      pay_later:         isFullyPaid ? false : selected.pay_later,
      payment_method:    "cash",
    }).eq("id", selected.id);

    await logActivity({
      action:      `In-house payment: ${selected.guest_name}`,
      category:    "payment",
      details:     `Room ${selected.room_number} | Paid ₱${paying.toLocaleString()} via cash | New balance: ₱${newBalance.toLocaleString()}`,
      entity_type: "reservation",
      entity_id:   selected.id,
    });

    if (onPayNow) await onPayNow(selected.id, newAmountPaid, newBalance, "cash", paying);

    printInHouseReceipt(
  {
    guestName:    selected.guest_name,
    roomNumber:   selected.room_number,
    checkInDate:  selected.check_in,
    checkOutDate: selected.check_out || null,
    charges:      [{ name: "Cash Payment Collected", amount: paying }],
    amountPaid:   paying,
    payMethod:    "cash",
    notes:        `New balance after payment: ₱${newBalance.toLocaleString()}`,
  },
  {
  name: user?.full_name || user?.name || user?.email || "Staff",
  role: user?.role || user?.user_metadata?.role || "Front Desk",
}
);
setPayingNow(false);
setPaySuccess(true);

    setPayingNow(false);
    setPaySuccess(true);
    setTimeout(() => {
      setShowPayNow(false);
      setPaySuccess(false);
    }, 1800);
  };

  return (
    <>
      <div className="mo" onClick={onClose}>
        <div className="mb" style={{ position: "relative" }} onClick={e => e.stopPropagation()}>

          <div className="mh">
            <div>
              <div style={{ fontSize: ".7rem", color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "4px" }}>Room Number</div>
              <div className="mh-room">{selected.room_number}</div>
              <div className="mh-type">{selected.rooms?.type || ""} · Floor {selected.rooms?.floor || ""}</div>
            </div>
            <div className="mh-meta">
              <div className="mh-badge">
                <div className="mh-nights-num">{stayed}</div>
                <div className="mh-nights-lbl">night{stayed !== 1 ? "s" : ""} stayed</div>
              </div>
              <div className="mh-badge">
                <div className="mh-nights-num" style={{ color: left === 0 ? "#ffd54f" : "#fff" }}>
                  {left === null ? "∞" : left === 0 ? "Today" : `${left}d`}
                </div>
                <div className="mh-nights-lbl">{left === null ? "open stay" : left === 0 ? "checkout" : "days left"}</div>
              </div>
              <button className="mx" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="mbody">
            <div className="mbody-grid">

              <div className="mbody-left">

                <div className="msec">
                  <div className="msec-title"><RiUserLine size={13} />Guest Information</div>
                  <div className="info-grid">
                    <div className="info-cell" style={{ gridColumn: "span 2" }}>
                      <div className="info-lbl"><RiUserLine size={10} />Guest Name</div>
                      <div className="info-val" style={{ fontSize: ".95rem" }}>{selected.guest_name}</div>
                    </div>
                    {selected.guest_phone && (
                      <div className="info-cell" style={{ gridColumn: "span 2" }}>
                        <div className="info-lbl">Phone</div>
                        <div className="info-val">{selected.guest_phone}</div>
                      </div>
                    )}
                    <div className="info-cell">
                      <div className="info-lbl"><RiLoginBoxLine size={10} />Check-In</div>
                      <div className="info-val">{selected.check_in}</div>
                    </div>
                    <div className="info-cell">
                      <div className="info-lbl"><RiCalendarLine size={10} />Check-Out</div>
                      <div className="info-val" style={{ color: isToday ? "#e65100" : "#222", fontWeight: isToday ? "700" : "600" }}>
                        {selected.check_out || <span className="open-stay-badge">Open Stay</span>}{isToday ? " ★" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="msec">
                  <div className="msec-title"><RiTimeLine size={13} />Stay & Payment</div>
                  <div className="info-grid">
                    <div className="info-cell">
                      <div className="info-lbl"><RiTimeLine size={10} />Days Left</div>
                      <div className="info-val" style={{ color: left === 0 ? "#e65100" : "#07713c", fontSize: "1.1rem" }}>
                        {!selected.check_out ? <span className="open-stay-badge">Open Stay</span>
                          : left === 0 ? "Today" : `${left}d`}
                      </div>
                    </div>
                    <div className="info-cell">
                      <div className="info-lbl"><RiCheckboxCircleLine size={10} />Payment</div>
                      <div className="info-val" style={{ color: selected.pay_later ? "#e65100" : "#07713c" }}>
                        {selected.pay_later ? "At Check-Out" : "Paid"}
                      </div>
                    </div>
                    <div className="info-cell" style={{ gridColumn: "span 2" }}>
                      <div className="info-lbl"><RiMoneyDollarCircleLine size={10} />Room Rate</div>
                      <div className="info-val" style={{ fontSize: "1.1rem", color: "#07713c" }}>
                        ₱{roomRateOnly.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="extend-box">
                    <div className="extend-title"><RiCalendar2Line size={13} />
                      {selected.check_out ? "Change Check-Out Date" : "Set Check-Out Date"}
                    </div>
                    <div className="extend-row">
                      <input
                        type="date"
                        className="extend-input"
                        value={extDate}
                        min={selected.check_in || today}
                        onChange={e => onExtDateChange(e.target.value)}
                      />
                      <button
                        className="extend-btn"
                        onClick={onSaveDateChange}
                        disabled={extending || !extDate || (refundInfo && refundInfo.diff > 0 && !refundConfirmed)}
                      >
                        <RiSaveLine size={13} />
                        {extending ? "Saving..." : "Save"}
                      </button>
                    </div>
                    {selected.check_out && (
                      <div style={{ fontSize: ".74rem", color: "#1565c0", marginTop: "6px" }}>
                        Current: {selected.check_out}
                      </div>
                    )}
                  </div>

                  {/* Room Transfer Box */}
                  <div style={{ marginTop: "10px", background: "#f3e5f5", border: "1.5px solid #ce93d8", borderRadius: "10px", padding: "13px 15px" }}>
                    <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#6a1b9a", textTransform: "uppercase", letterSpacing: ".08em", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showTransfer ? "12px" : "0" }}>
                      <span>🔄 Room Transfer</span>
                      <button
                        onClick={() => setShowTransfer(t => !t)}
                        style={{ background: "#6a1b9a", color: "#fff", border: "none", borderRadius: "7px", padding: "4px 12px", cursor: "pointer", fontSize: ".72rem", fontWeight: "700", fontFamily: "Arial,sans-serif" }}
                      >
                        {showTransfer ? "Cancel" : "Transfer Room"}
                      </button>
                    </div>

                    {showTransfer && (
                      <>
                        <div style={{ marginBottom: "8px" }}>
                          <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#6a1b9a", textTransform: "uppercase", marginBottom: "4px" }}>Transfer Date</div>
                          <input
                            type="date"
                            value={transferDate}
                            min={today}
                            max={selected.check_out || undefined}
                            onChange={e => handleTransferDateChange(e.target.value)}
                            style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #ce93d8", borderRadius: "8px", fontSize: ".86rem", fontFamily: "Arial,sans-serif", outline: "none", color: "#333", background: "#fff" }}
                          />
                        </div>

                        <div style={{ marginBottom: "10px" }}>
                          <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#6a1b9a", textTransform: "uppercase", marginBottom: "4px" }}>Select New Room</div>
                          {(() => {
                            const pickedRoom = (availableRooms || []).find(r => r.id === transferRoomId);
                            return (
                              <button
                                type="button"
                                onClick={() => setShowRoomPicker(true)}
                                style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #ce93d8", borderRadius: "8px", fontSize: ".86rem", fontFamily: "Arial,sans-serif", outline: "none", background: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", color: pickedRoom ? "#222" : "#a8b8a8", fontStyle: pickedRoom ? "normal" : "italic", textAlign: "left" }}
                              >
                                <span>
                                  {pickedRoom
                                    ? `Room ${pickedRoom.room_number} | ${pickedRoom.type} | Floor ${pickedRoom.floor} | ₱${parseFloat(pickedRoom.price).toLocaleString()}/night`
                                    : "— Choose an available room —"
                                  }
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "#888", fontStyle: "normal" }}>Browse ▾</span>
                              </button>
                            );
                          })()}
                        </div>

                        {transferPreview && (
                          <div style={{ background: "#fff", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px", border: "1px solid #e1bee7" }}>
                            <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#6a1b9a", textTransform: "uppercase", marginBottom: "8px" }}>Transfer Preview</div>
                            <div style={{ fontSize: ".82rem", color: "#555", marginBottom: "4px" }}>
                              <span style={{ color: "#888" }}>From:</span> Room {selected.room_number} · ₱{transferPreview.oldRate.toLocaleString()}/night
                            </div>
                            <div style={{ fontSize: ".82rem", color: "#555", marginBottom: "6px" }}>
                              <span style={{ color: "#888" }}>To:</span> Room {transferPreview.newRoom.room_number} · ₱{transferPreview.newRate.toLocaleString()}/night
                            </div>
                            {transferPreview.isSameDay ? (
                              <div style={{ fontSize: ".78rem", color: "#6a1b9a", fontStyle: "italic", marginBottom: "6px" }}>
                                Same-day transfer — all {transferPreview.totalNights} night{transferPreview.totalNights !== 1 ? "s" : ""} at new rate
                              </div>
                            ) : (
                              <div style={{ fontSize: ".78rem", color: "#555", marginBottom: "6px" }}>
                                {transferPreview.nightsConsumed} night{transferPreview.nightsConsumed !== 1 ? "s" : ""} at ₱{transferPreview.oldRate.toLocaleString()} + {transferPreview.nightsRemaining} night{transferPreview.nightsRemaining !== 1 ? "s" : ""} at ₱{transferPreview.newRate.toLocaleString()}
                              </div>
                            )}
                            {transferPreview.extraCharge > 0 && (
                              <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "7px", padding: "7px 10px", display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
                                <span style={{ color: "#e65100", fontWeight: "700" }}>Extra to Collect</span>
                                <span style={{ color: "#e65100", fontWeight: "700" }}>₱{transferPreview.extraCharge.toLocaleString()}</span>
                              </div>
                            )}
                            {transferPreview.refund > 0 && (
                              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "7px", padding: "7px 10px", display: "flex", justifyContent: "space-between", fontSize: ".82rem" }}>
                                <span style={{ color: "#f57f17", fontWeight: "700" }}>Refund to Guest</span>
                                <span style={{ color: "#f57f17", fontWeight: "700" }}>₱{transferPreview.refund.toLocaleString()}</span>
                              </div>
                            )}
                            {transferPreview.extraCharge === 0 && transferPreview.refund === 0 && (
                              <div style={{ fontSize: ".78rem", color: "#07713c", fontWeight: "600" }}>No price difference — same total.</div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={handleConfirmTransfer}
                          disabled={!transferRoomId || !transferPreview || transferring}
                          style={{ width: "100%", padding: "9px", background: (!transferRoomId || !transferPreview || transferring) ? "#aaa" : "#6a1b9a", color: "#fff", border: "none", borderRadius: "8px", cursor: (!transferRoomId || !transferPreview || transferring) ? "not-allowed" : "pointer", fontWeight: "700", fontSize: ".84rem", fontFamily: "Arial,sans-serif" }}
                        >
                          {transferring ? "Transferring..." : "Confirm Room Transfer"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {selected.notes && (
                  <div className="note-box">
                    <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span><strong>Notes:</strong> {selected.notes}</span>
                  </div>
                )}
              </div>

              <div className="mbody-right">
                <div className="msec" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div className="msec-title" style={{ marginBottom: 0 }}><RiAddCircleLine size={13} />Additional Charges</div>
                    <button
                      onClick={() => setShowRestaurant(true)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#fff8e1", border: "1.5px solid #f59e0b", borderRadius: "8px", cursor: "pointer", fontSize: "0.76rem", fontWeight: "700", color: "#b45309", fontFamily: "Arial,sans-serif" }}
                    >
                      <RiRestaurantLine size={13} /> Order from Restaurant
                    </button>
                  </div>

                  {charges.length > 0 && (
                    <div style={{ marginBottom: "10px", flex: 1, overflowY: "auto" }}>
                      <div style={{ fontSize: ".66rem", fontWeight: "700", color: "#07713c", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "5px" }}>
                        Guest Orders & Requests
                      </div>
                      {charges.map(c => (
                        <div key={c.id} className="charge-row">
                          <span className="charge-name">{c.name.replace(/^\[Restaurant\] /, "")}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="charge-amt">₱{parseFloat(c.amount).toLocaleString()}</span>
                            <button className="charge-del" onClick={() => onDeleteCharge(c.id)}>
                              <RiDeleteBinLine size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="add-row" style={{ marginTop: "auto" }}>
                    <input className="add-fi" value={reqName} onChange={e => setReqName(e.target.value)}
                      placeholder="Description..." onKeyDown={e => e.key === "Enter" && onAddCharge()} />
                    <input type="number" className="add-fi" style={{ flex: "0 0 90px" }} value={reqAmt}
                      onChange={e => setReqAmt(e.target.value)} placeholder="₱"
                      onKeyDown={e => e.key === "Enter" && onAddCharge()} />
                    <button className="add-btn" onClick={onAddCharge} disabled={saving || !reqName.trim() || !reqAmt}>
                      {saving ? "..." : "+ Add"}
                    </button>
                  </div>
                </div>

                <div className="total-bar">
                  <div>
                    <div className="total-lbl">Balance Due</div>
                    <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)", marginTop: "2px" }}>
                      {charges.length > 0
                        ? `Remaining balance + ${charges.length} charge${charges.length > 1 ? "s" : ""}`
                        : "Remaining balance from check-in"
                      }
                    </div>
                  </div>
                  <span className="total-amt">₱{total.toLocaleString()}</span>
                </div>

                {total > 0 && !showPayNow && (
                  <button
                    onClick={openPayNow}
                    style={{ width: "100%", marginTop: "10px", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#e8f5e9", border: "1.5px solid #a7f3d0", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: ".84rem", color: "#07713c", fontFamily: "Arial,sans-serif", transition: "background .15s" }}
                    onMouseOver={e => e.currentTarget.style.background = "#d0f0da"}
                    onMouseOut={e => e.currentTarget.style.background = "#e8f5e9"}
                  >
                    <RiCashLine size={16} /> Collect Payment Now
                  </button>
                )}

                {showPayNow && (
                  <div style={{ marginTop: "10px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#07713c", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><RiCashLine size={13} /> Collect Payment</span>
                      <button onClick={() => setShowPayNow(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "1rem", lineHeight: 1 }}>×</button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: "8px", padding: "8px 12px", marginBottom: "10px", border: "1px solid #d1fae5" }}>
                      <span style={{ fontSize: ".8rem", color: "#555" }}>Current Balance Due</span>
                      <span style={{ fontWeight: "800", color: "#07713c", fontSize: "1rem" }}>₱{total.toLocaleString()}</span>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#07713c", textTransform: "uppercase", marginBottom: "5px" }}>Amount Received (₱)</div>
                      <input
                        type="number"
                        value={amountReceived}
                        onChange={e => setAmountReceived(e.target.value)}
                        min="0"
                        step="0.01"
                        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #86efac", borderRadius: "8px", fontSize: ".95rem", fontFamily: "Arial,sans-serif", outline: "none", color: "#222", fontWeight: "700", background: "#fff" }}
                      />
                      {parseFloat(amountReceived || 0) > total && (
                        <div style={{ fontSize: ".74rem", color: "#f57f17", marginTop: "4px", fontStyle: "italic" }}>
                          ⚠ Amount exceeds balance — ₱{(parseFloat(amountReceived) - total).toLocaleString()} will be change.
                        </div>
                      )}
                      {parseFloat(amountReceived || 0) < total && parseFloat(amountReceived || 0) > 0 && (
                        <div style={{ fontSize: ".74rem", color: "#1565c0", marginTop: "4px", fontStyle: "italic" }}>
                          Partial payment — ₱{(total - parseFloat(amountReceived)).toLocaleString()} will remain as balance.
                        </div>
                      )}
                    </div>

                    {paySuccess ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px", background: "#07713c", borderRadius: "9px", color: "#fff", fontWeight: "700", fontSize: ".88rem" }}>
                        <RiCheckLine size={18} /> Payment Recorded!
                      </div>
                    ) : (
                      <button
                        onClick={handlePayNow}
                        disabled={payingNow || !parseFloat(amountReceived || 0)}
                        style={{ width: "100%", padding: "11px", background: (payingNow || !parseFloat(amountReceived || 0)) ? "#aaa" : "#07713c", color: "#fff", border: "none", borderRadius: "9px", cursor: (payingNow || !parseFloat(amountReceived || 0)) ? "not-allowed" : "pointer", fontWeight: "700", fontSize: ".88rem", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
                      >
                        <RiCashLine size={16} />
                        {payingNow ? "Processing..." : `Confirm ₱${parseFloat(amountReceived || 0).toLocaleString()} Payment`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {refundInfo && extDate && (
              <div style={{ marginTop: 14 }}>
                {refundInfo.diff > 0 ? (
                  <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#f57f17", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                      ⚠ Refund Required
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div style={{ background: "#fffde7", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#9a8a50", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Original</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.originalNights} night{refundInfo.originalNights !== 1 ? "s" : ""} × ₱{parseFloat(refundInfo.pricePerNight).toLocaleString()}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.alreadyPaid).toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#fffde7", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#9a8a50", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>New</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.newNights} night{refundInfo.newNights !== 1 ? "s" : ""} × ₱{parseFloat(refundInfo.pricePerNight).toLocaleString()}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{(refundInfo.newNights * refundInfo.pricePerNight).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fce4b0", borderRadius: 9, padding: "12px 16px", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#c47000", fontSize: ".92rem" }}>Refund to Guest</span>
                      <span style={{ fontWeight: 800, color: "#c62828", fontSize: "1.2rem" }}>₱{parseFloat(refundInfo.diff).toLocaleString()}</span>
                    </div>
                    <div onClick={() => setRefundConfirmed(r => !r)}
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "11px 14px", borderRadius: 9, background: refundConfirmed ? "#ecfdf5" : "#fff", border: `1.5px solid ${refundConfirmed ? "#4caf50" : "#e0e0e0"}`, transition: "all .2s" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${refundConfirmed ? "#4caf50" : "#ccc"}`, background: refundConfirmed ? "#4caf50" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {refundConfirmed && <span style={{ color: "#fff", fontSize: ".7rem", fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{ fontSize: ".83rem", fontWeight: 600, color: refundConfirmed ? "#1b5e20" : "#555" }}>
                        I confirm ₱{parseFloat(refundInfo.diff).toLocaleString()} has been / will be refunded to the guest
                      </span>
                    </div>
                    {!refundConfirmed && (
                      <div style={{ fontSize: ".75rem", color: "#f57f17", marginTop: 7, fontStyle: "italic" }}>
                        ⚠ Tick the confirmation above before saving.
                      </div>
                    )}
                  </div>
                ) : refundInfo.diff < 0 ? (
                  <div style={{ background: "#e8f5e9", border: "1.5px solid #a7f3d0", borderRadius: 12, padding: "18px 20px" }}>
                    <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#07713c", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>
                      ✚ Extension Charge
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#5a8a6a", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Room Rate Per Night</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.extraNights} extra night{refundInfo.extraNights !== 1 ? "s" : ""}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.pricePerNight).toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#5a8a6a", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Total Charges</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.extraNights} night{refundInfo.extraNights !== 1 ? "s" : ""} × ₱{parseFloat(refundInfo.pricePerNight).toLocaleString()}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.totalCharges).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#c8f0d8", borderRadius: 9, padding: "12px 16px" }}>
                      <span style={{ fontWeight: 700, color: "#07713c", fontSize: ".92rem" }}>Extra to Collect from Guest</span>
                      <span style={{ fontWeight: 800, color: "#07713c", fontSize: "1.2rem" }}>₱{Math.abs(parseFloat(refundInfo.diff)).toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "#f4f6f0", borderRadius: 10, padding: "11px 16px", fontSize: ".83rem", color: "#555", textAlign: "center" }}>
                    Same duration — no refund or extra charge needed.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mfoot">
            <button className="btn-close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {showRestaurant && (
        <RestaurantAddOnsModal
          reservationId={selected?.id}
          guestName={selected?.guest_name}
          roomNumber={selected?.room_number}
          isCheckedIn={true}
          onClose={() => setShowRestaurant(false)}
          onConfirm={(charges) => {
            onAddChargeObject(charges);
            setShowRestaurant(false);
          }}
        />
      )}
      {showRoomPicker && (
        <RoomPickerModal
          rooms={availableRooms}
          selectedRoomId={transferRoomId}
          onSelect={r => {
            handleTransferRoomChange(r.id);
            setShowRoomPicker(false);
          }}
          onClose={() => setShowRoomPicker(false)}
        />
      )}
    </>
  );
}