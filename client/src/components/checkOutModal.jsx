import React from "react";
import {
  RiUserLine, RiLogoutBoxLine, RiAlertLine, RiMoneyDollarCircleLine,
  RiStickyNoteLine, RiCheckDoubleLine, RiPencilLine, RiCheckLine,
} from "react-icons/ri";

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
  borderRadius: "8px", fontSize: "0.9rem", outline: "none",
  fontFamily: "Arial,sans-serif", boxSizing: "border-box", background: "white", transition: "border 0.2s",
};
const labelStyle = {
  display: "block", fontSize: "0.8rem", fontWeight: "700",
  color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px",
};

export default function CheckOutModal({
  selected,
  onClose,
  onConfirm,
  processing,
  successMsg,
  extraCharges,   setExtraCharges,
  extraNote,      setExtraNote,
  paymentMethod,  setPaymentMethod,
  amountReceived, setAmountReceived,
  fullyPaid,      setFullyPaid,
  editingCharge,  setEditingCharge,
  onSaveChargePrice,
  getAdditionalCharges,
  getInspectionCharges,
}) {
  if (!selected) return null;

  const resChargesTotal = getAdditionalCharges(selected)
  .filter(c => c.from_reservation)
  .reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  
  const roomRate = parseFloat(selected?.total_amount || 0);
  
  const extraNow    = parseFloat(extraCharges || 0);

  const inHouseTotal = getAdditionalCharges(selected)
  .filter(c => !c.from_reservation)
  .reduce((s, c) => s + parseFloat(c.amount || 0), 0);


  const inspectionTotal = getInspectionCharges(selected)
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

    const displayRoomRate = roomRate - inHouseTotal - extraCharges - inspectionTotal - extraNow;  

  const grandTotal = parseFloat(selected?.remaining_balance ?? selected?.total_amount ?? 0) + inspectionTotal + extraNow;

  const total = parseFloat(selected?.total_amount || 0);

  const reservationDownpayment = parseFloat(selected?.reservation_downpayment || 0);
  const checkinPayment         = parseFloat(selected?.amount_paid || 0);


  const totalPaid = (() => {
    if (reservationDownpayment > 0) {
      
      return reservationDownpayment + checkinPayment;
    }

    return checkinPayment;
  })();
  const remainingBalance = grandTotal;

  const amtGiven = parseFloat(amountReceived || 0);
  const change   = fullyPaid ? 0 : Math.max(0, amtGiven - remainingBalance);

 
  const hasReservationDownpayment =
    reservationDownpayment > 0 ||
    (selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate);

  const paidInFullAtCheckIn = !selected?.pay_later && checkinPayment >= roomRate;

  const partialAtCheckIn = !selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate;

  // Confirm button is disabled when:
  // - currently processing, OR
  // - guest has not marked fully paid AND no valid amount has been entered
  const isConfirmDisabled = processing || (!fullyPaid && amtGiven <= 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "min(680px, 95vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif" }}>


        <div style={{ background: "linear-gradient(135deg,#bf360c,#e65100)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <RiLogoutBoxLine size={20} /> Process Check-Out
            </h3>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>Review charges and collect final payment</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>×</button>
        </div>

        <div style={{ padding: "24px 30px" }}>

          {successMsg && (
            <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#1b5e20", padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.88rem", fontWeight: "600" }}>
              ✅ {successMsg}
            </div>
          )}

          {!selected.inspection_status && (
            <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.83rem", color: "#f57f17", fontWeight: "600" }}>
              <RiAlertLine size={15} color="#f57f17" /> Room was not inspected before check-out.
            </div>
          )}

        
          <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
              <RiUserLine size={13} /> Reservation Summary
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {[
                ["Guest",     selected.guest_name],
                ["Room",      `Room ${selected.room_number}`],
                ["Check-In",  selected.check_in],
                ["Check-Out", selected.check_out],
                ["Duration",  `${Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)} nights`],
                ["Room Rate", `₱${roomRate.toLocaleString()}`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                  <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

       
          <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
              Extra Charges at Check-Out (Optional)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={labelStyle}>Amount (₱)</label>
                <input type="number" value={extraCharges} onChange={e => setExtraCharges(e.target.value)}
                  placeholder="0.00" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#e65100"}
                  onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
              </div>
              <div>
                <label style={labelStyle}>Reason</label>
                <input value={extraNote} onChange={e => setExtraNote(e.target.value)}
                  placeholder="e.g. Room service, minibar" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#e65100"}
                  onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
              </div>
            </div>
          </div>

   
          <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
              <RiMoneyDollarCircleLine size={13} /> Payment Method
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {["cash", "card", "gcash", "bank_transfer"].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  style={{ flex: 1, padding: "8px 4px", border: `2px solid ${paymentMethod === m ? "#e65100" : "#e8e8e8"}`, borderRadius: "8px", background: paymentMethod === m ? "#fff3e0" : "white", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", color: paymentMethod === m ? "#e65100" : "#888", fontFamily: "Arial,sans-serif" }}>
                  {m === "cash" ? "Cash" : m === "card" ? "Card" : m === "gcash" ? "GCash" : "Bank"}<br />
                  <span style={{ fontSize: "0.65rem", fontWeight: "400", color: "#aaa" }}>
                    {m === "cash" ? "💵" : m === "card" ? "💳" : m === "gcash" ? "📱" : "🏦"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          
          {selected?.notes && (
            <div style={{ background: "#fffde7", border: "1px solid #fff176", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "0.83rem", color: "#555" }}>
              <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span><strong>Guest Notes:</strong> {selected.notes}</span>
            </div>
          )}

         
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
                                if (e.key === "Enter") onSaveChargePrice(selected, i, e.target.value);
                                if (e.key === "Escape") setEditingCharge(null);
                              }}
                              id={`charge-edit-${i}`}
                            />
                            <button onClick={() => onSaveChargePrice(selected, i, document.getElementById(`charge-edit-${i}`)?.value)}
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

  
          <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>
              Bill Breakdown
            </div>


            {selected?.refund_amount > 0 && selected?.original_checkout && (
              <div style={{ background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px" }}>
                <div style={{ fontSize: ".7rem", fontWeight: 700, color: "#f57f17", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                  ⚠ Stay Was Shortened — Refund Applied
                </div>
                {[
                  ["Original Check-Out",      selected.original_checkout],
                  ["New Check-Out",            selected.check_out],
                  ["Last Payment (Original)", `₱${parseFloat(selected.original_amount || 0).toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", color: "#555", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #ffe082" }}>
                    <span>{k}</span><span style={{ fontWeight: 700, color: "#333" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".92rem", fontWeight: 700, color: "#c62828", paddingTop: 4 }}>
                  <span>Refund Issued to Guest</span>
                  <span>−₱{parseFloat(selected.refund_amount).toLocaleString()}</span>
                </div>
              </div>
            )}


            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
              <span style={{ color: "#555" }}>Room Rate</span>
              <span style={{ fontWeight: "600", color: "#333" }}>₱{displayRoomRate.toLocaleString()}</span>
            </div>

         
            {getAdditionalCharges(selected).filter(c => c.from_reservation).length > 0 && (
              <div style={{ paddingBottom: "4px" }}>
                {getAdditionalCharges(selected).filter(c => c.from_reservation).map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.79rem", color: "#999", padding: "2px 0 2px 14px" }}>
                    <span>• {c.name} <span style={{ fontSize: ".68rem", color: "#bbb" }}>(included in rate)</span></span>
                    <span style={{ color: "#bbb" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

          
            {inHouseTotal > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                  <span style={{ color: "#6a1b9a", fontWeight: "600" }}>In-House Charges</span>
                  <span style={{ fontWeight: "600", color: "#6a1b9a" }}>₱{inHouseTotal.toLocaleString()}</span>
                </div>
                {getAdditionalCharges(selected).filter(c => !c.from_reservation).map(c => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.79rem", color: "#888", padding: "2px 0 2px 14px" }}>
                    <span>• {c.name}</span>
                    <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                  </div>
                ))}
              </>
            )}

         
            {inspectionTotal > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                <span style={{ color: "#c62828", fontWeight: "600" }}>Damage / Inspection Charges</span>
                <span style={{ fontWeight: "600", color: "#c62828" }}>₱{inspectionTotal.toLocaleString()}</span>
              </div>
            )}

          
            {extraNow > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px dashed #f0f0f0", fontSize: "0.9rem" }}>
                <span style={{ color: "#555" }}>Extra at Check-Out{extraNote ? ` (${extraNote})` : ""}</span>
                <span style={{ fontWeight: "600", color: "#333" }}>₱{extraNow.toLocaleString()}</span>
              </div>
            )}

         
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", borderTop: "2px solid #eee", marginTop: "4px", fontSize: "0.95rem" }}>
              <span style={{ fontWeight: "700", color: "#333" }}>Total</span>
              <span style={{ fontWeight: "700", color: "#333" }}>₱{total.toLocaleString()}</span>
            </div>

            {paidInFullAtCheckIn && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "0.9rem", marginTop: "4px" }}>
                <span style={{ color: "#555" }}>Paid in Full at Check-In</span>
                <span style={{ fontWeight: "600", color: "#4caf50" }}>−₱{checkinPayment.toLocaleString()}</span>
              </div>
            )}

          
            {partialAtCheckIn && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: "0.9rem", marginTop: "4px" }}>
                <span style={{ color: "#555" }}>Partial Payment at Check-In</span>
                <span style={{ fontWeight: "600", color: "#4caf50" }}>−₱{checkinPayment.toLocaleString()}</span>
              </div>
            )}

    
            {!hasReservationDownpayment && !paidInFullAtCheckIn && !partialAtCheckIn && totalPaid === 0 && (
              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "8px 12px", marginTop: "8px", fontSize: "0.8rem", color: "#f57f17", fontWeight: "600" }}>
                No payment collected yet — full amount due at check-out.
              </div>
            )}

           
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 16px", marginTop: "12px",
              background: remainingBalance > 0 ? "#fff3e0" : "#e8f5e9",
              border: `2px solid ${remainingBalance > 0 ? "#ffb74d" : "#a5d6a7"}`,
              borderRadius: "10px",
            }}>
              <div>
                <div style={{ fontWeight: "700", color: remainingBalance > 0 ? "#e65100" : "#1b5e20", fontSize: "1rem" }}>
                  {remainingBalance > 0 ? "Remaining Balance Due" : "Fully Settled ✓"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "3px" }}>
                  {remainingBalance > 0 && totalPaid > 0
                    ? `₱${grandTotal.toLocaleString()} total − ₱${totalPaid.toLocaleString()} already paid`
                    : remainingBalance > 0
                      ? "Full amount to collect now"
                      : "No outstanding balance"
                  }
                </div>
              </div>
              <span style={{ fontWeight: "800", color: remainingBalance > 0 ? "#e65100" : "#1b5e20", fontSize: "1.4rem" }}>
                ₱{remainingBalance.toLocaleString()}
              </span>
            </div>
          </div>

     
          <div style={{ background: "white", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#e65100", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px" }}>
              <RiMoneyDollarCircleLine size={13} /> Collect Payment
            </div>

            <div
              onClick={() => { setFullyPaid(!fullyPaid); if (!fullyPaid) setAmountReceived(remainingBalance.toString()); }}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${fullyPaid ? "#4caf50" : "#e8e8e8"}`, background: fullyPaid ? "#e8f5e9" : "#f8f9fa", cursor: "pointer", marginBottom: "14px", transition: "all 0.2s" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${fullyPaid ? "#4caf50" : "#ccc"}`, background: fullyPaid ? "#4caf50" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {fullyPaid && <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "700" }}>✓</span>}
              </div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "0.9rem", color: fullyPaid ? "#1b5e20" : "#333" }}>
                  Guest has paid the remaining balance
                </div>
                <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "1px" }}>
                  Collecting ₱{remainingBalance.toLocaleString()} now
                </div>
              </div>
            </div>

            {!fullyPaid && (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <label style={labelStyle}>Amount Received (₱)</label>
                  <input type="number" value={amountReceived} onChange={e => setAmountReceived(e.target.value)}
                    placeholder={`Remaining balance: ₱${remainingBalance.toLocaleString()}`}
                    style={{ ...inputStyle, fontSize: "1rem", fontWeight: "700", MozAppearance: "textfield" }}
                    onFocus={e => e.target.style.borderColor = "#e65100"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
                  <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
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
              <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px" }}>
                <div style={{ fontWeight: "700", fontSize: "0.92rem", color: "#1b5e20", marginBottom: "8px" }}>
                  ✅ Payment fully settled
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {[
                    ["Grand Total",   `₱${grandTotal.toLocaleString()}`],
                    ["Paid Earlier",  `₱${totalPaid.toLocaleString()}`],
                    ["Collected Now", `₱${remainingBalance.toLocaleString()}`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ background: "white", borderRadius: "7px", padding: "7px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: "0.63rem", color: "#aaa", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>{lbl}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1b5e20" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={isConfirmDisabled}
              style={{ flex: 2, padding: "13px", background: isConfirmDisabled ? "#aaa" : "#e65100", border: "none", borderRadius: "10px", cursor: isConfirmDisabled ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", boxShadow: isConfirmDisabled ? "none" : "0 4px 12px rgba(230,81,0,0.3)" }}>
              <RiLogoutBoxLine size={16} />
              {processing ? "Processing..." : "Confirm Check-Out & Mark Paid"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}