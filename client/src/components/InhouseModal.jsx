import React, { useState } from "react";
import {
  RiUserLine, RiCalendarLine, RiAddCircleLine,
  RiMoneyDollarCircleLine, RiStickyNoteLine, RiTimeLine,
  RiCheckboxCircleLine, RiDeleteBinLine, RiLoginBoxLine,
  RiCalendar2Line, RiSaveLine, RiRestaurantLine,
} from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";

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
  extDate,
  onExtDateChange,
  extending,
  onSaveDateChange,
  refundInfo,
  refundConfirmed,
  setRefundConfirmed,
}) {
  const [showAddOns, setShowAddOns] = useState(false);

  if (!selected) return null;

  const restaurantChargesCount = charges.filter(c => c.from_restaurant).length;

  return (
    <>
      <div className="mo" onClick={onClose}>
        <div className="mb" style={{ position: "relative" }} onClick={e => e.stopPropagation()}>

          {/* Header */}
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

              {/* LEFT COLUMN */}
              <div className="mbody-left">

                {/* Guest Info */}
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

                {/* Stay & Payment */}
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
                    <div className="info-lbl"><RiMoneyDollarCircleLine size={10} />Total Bill</div>
                    <div className="info-val" style={{ fontSize: "1.1rem", color: "#07713c" }}>
                      ₱{parseFloat(selected.total_amount || 0).toLocaleString()}
                    </div>
                    </div>
                  </div>
                          
                  {/* Change Check-Out Date */}
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
                        placeholder="Select new date"
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
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="note-box">
                    <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                    <span><strong>Notes:</strong> {selected.notes}</span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="mbody-right">

                {/* Additional Charges */}
                <div className="msec" style={{ flex: 1 }}>
                  {/* Section title + Restaurant button */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div className="msec-title" style={{ marginBottom: 0 }}>
                      <RiAddCircleLine size={13} />Additional Charges
                    </div>
                    <button
                      onClick={() => setShowAddOns(true)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "6px 12px", background: "#fff8e1",
                        border: "1.5px solid #f59e0b", borderRadius: "8px",
                        cursor: "pointer", fontSize: ".74rem", fontWeight: "700",
                        color: "#b45309", fontFamily: "Arial,sans-serif",
                        position: "relative", flexShrink: 0,
                      }}
                    >
                      <RiRestaurantLine size={13} />
                      Add Food
                      {restaurantChargesCount > 0 && (
                        <span style={{
                          position: "absolute", top: "-7px", right: "-7px",
                          background: "#07713c", color: "#fff", borderRadius: "50%",
                          width: "17px", height: "17px", fontSize: ".6rem", fontWeight: "700",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {restaurantChargesCount}
                        </span>
                      )}
                    </button>
                  </div>

                
                  {charges.filter(c => c.from_reservation).length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontSize: ".66rem", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "5px" }}>
                        From Reservation (included in rate)
                      </div>
                      {charges.filter(c => c.from_reservation).map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 10px", background: "#f4f6f0", border: "1px solid #e4ebe4", borderRadius: "7px", marginBottom: "4px" }}>
                          <span style={{ fontSize: ".82rem", color: "#777" }}>{c.name}</span>
                          <span style={{ fontWeight: "600", color: "#888", fontSize: ".82rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  
                  {charges.filter(c => !c.from_reservation).length > 0 ? (
                    <div style={{ marginBottom: "10px", maxHeight: "180px", overflowY: "auto" }}>
                      {charges.filter(c => c.from_reservation).length > 0 && (
                        <div style={{ fontSize: ".66rem", fontWeight: "700", color: "#07713c", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "5px" }}>
                          Added During Stay
                        </div>
                      )}
                      {charges.filter(c => !c.from_reservation).map(c => (
                        <div key={c.id} className="charge-row" style={{
                          background: c.from_restaurant ? "#fffbeb" : undefined,
                          border: c.from_restaurant ? "1px solid #fde68a" : undefined,
                        }}>
                          <span className="charge-name" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {c.from_restaurant && <RiRestaurantLine size={11} color="#b45309" />}
                            {c.name}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span className="charge-amt">₱{parseFloat(c.amount).toLocaleString()}</span>
                            <button className="charge-del" onClick={() => onDeleteCharge(c.id)}>
                              <RiDeleteBinLine size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#aaa", fontSize: ".82rem", marginBottom: "10px", fontStyle: "italic" }}>
                      No in-house charges yet.
                    </div>
                  )}

                  <div className="add-row">
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
                    <div className="total-lbl">Remaining Balance</div>
                    <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)", marginTop: "2px" }}>
                      {(() => {
                        const inHouseCount = charges.filter(c => !c.from_reservation).length;
                        return inHouseCount > 0 ? `Room rate + ${inHouseCount} in-house charge${inHouseCount > 1 ? "s" : ""}` : "Room rate";
                      })()}
                    </div>
                  </div>
                  <span className="total-amt">₱{total.toLocaleString()}</span>
                </div>
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
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.newTotal).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fce4b0", borderRadius: 9, padding: "12px 16px", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, color: "#c47000", fontSize: ".92rem" }}>Refund to Guest</span>
                      <span style={{ fontWeight: 800, color: "#c62828", fontSize: "1.2rem" }}>₱{parseFloat(refundInfo.diff).toLocaleString()}</span>
                    </div>
                    <div
                      onClick={() => setRefundConfirmed(r => !r)}
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
                      ✚ Additional Charge Required
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#5a8a6a", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Already Paid</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.originalNights} night{refundInfo.originalNights !== 1 ? "s" : ""}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.alreadyPaid).toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: ".68rem", color: "#5a8a6a", fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>New Total</div>
                        <div style={{ fontSize: ".88rem", color: "#555" }}>{refundInfo.newNights} night{refundInfo.newNights !== 1 ? "s" : ""}</div>
                        <div style={{ fontSize: "1rem", fontWeight: 700, color: "#333", marginTop: 2 }}>₱{parseFloat(refundInfo.newTotal).toLocaleString()}</div>
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

      {/* Restaurant Add-Ons Picker */}
      {showAddOns && (
        <RestaurantAddOnsModal
          reservationId={selected?.id}
          guestName={selected?.guest_name}
          roomNumber={selected?.room_number}
          isCheckedIn={true}  
          onClose={() => setShowAddOns(false)}
          onConfirm={(charges) => {
            charges.forEach(c => {

              onAddCharge({ name: c.name, amount: c.amount, from_restaurant: true });
            });
            setShowAddOns(false);
          }}
        />
      )}
    </>
  );
}