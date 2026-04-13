import React from "react";
import {
  RiUserLine, RiLogoutBoxLine, RiAlertLine, RiMoneyDollarCircleLine,
  RiStickyNoteLine, RiCheckDoubleLine, RiPencilLine, RiCheckLine,
} from "react-icons/ri";

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
  --white: #ffffff;
  --bg: #f4f6f0;
  --border: #e2e8e2;
  --text: #1a2e1a;
  --text-sec: #5a6e5a;
  --text-muted: #8fa08f;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
}

.com-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  font-family: 'Roboto', sans-serif;
}

.com-box {
  background: var(--bg);
  border-radius: 20px;
  width: min(680px, 95vw);
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,.28);
}
.com-box::-webkit-scrollbar { width: 4px; }
.com-box::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 10px; }

/* ── HEADER ── */
.com-hdr {
  background: linear-gradient(135deg, #bf360c, #e65100);
  border-radius: 20px 20px 0 0;
  padding: 22px 28px;
  display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.com-hdr::before {
  content: ''; position: absolute;
  width: 200px; height: 200px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,.15);
  top: -80px; right: -60px; pointer-events: none;
}
.com-hdr::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold);
}
.com-hdr-title {
  margin: 0; color: white; font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px;
}
.com-hdr-sub { margin: 4px 0 0; color: rgba(255,255,255,.65); font-size: .8rem; }
.com-hdr-close {
  background: rgba(255,255,255,.15); border: none;
  width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; color: white; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; position: relative; z-index: 1; flex-shrink: 0;
}
.com-hdr-close:hover { background: rgba(255,255,255,.28); }

/* ── BODY ── */
.com-body { padding: 22px 28px; }

/* ── SECTION CARD ── */
.com-section {
  background: var(--white); border-radius: var(--radius);
  padding: 16px 20px; margin-bottom: 14px;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border);
}
.com-section-title {
  font-size: .72rem; font-weight: 700; color: var(--orange);
  text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.com-section-title::before {
  content: ''; display: inline-block;
  width: 14px; height: 2px; background: var(--gold); border-radius: 1px;
}

/* ── INFO GRID ── */
.com-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.com-info-box {
  background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px;
}
.com-info-lbl { color: var(--text-muted); font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.com-info-val { font-weight: 600; color: var(--text); margin-top: 2px; font-size: .86rem; }

/* ── INPUT / LABEL ── */
.com-label {
  display: block; font-size: .72rem; font-weight: 700;
  color: var(--text-sec); margin-bottom: 5px;
  text-transform: uppercase; letter-spacing: .06em;
}
.com-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; outline: none; font-family: 'Roboto', sans-serif;
  background: var(--white); color: var(--text); transition: border-color .2s, box-shadow .2s;
}
.com-input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(230,81,0,.1); }
.com-input::placeholder { color: var(--text-muted); font-style: italic; }

/* ── PAYMENT METHODS ── */
.com-pay-grid { display: flex; gap: 10px; }
.com-pay-btn {
  flex: 1; padding: 9px 4px; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .74rem; font-weight: 700;
  font-family: 'Roboto', sans-serif; transition: all .15s;
  text-align: center;
}

/* ── BILL ROWS ── */
.com-bill-row {
  display: flex; justify-content: space-between;
  padding: 7px 0; border-bottom: 1px dashed #eee; font-size: .88rem;
}
.com-bill-row:last-of-type { border-bottom: none; }
.com-bill-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 0 6px; border-top: 2px solid #eee; margin-top: 4px; font-size: .94rem;
}

/* ── BALANCE BOX ── */
.com-balance {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 16px; margin-top: 12px; border-radius: 10px; border: 2px solid;
}

/* ── ALERTS ── */
.com-alert-warn {
  background: #fff8e1; border: 1.5px solid #ffe082;
  border-radius: 10px; padding: 10px 14px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px; font-size: .82rem; color: #f57f17; font-weight: 600;
}
.com-alert-success {
  background: var(--green-light); border: 1px solid #a5d6a7;
  color: #1b5e20; padding: 12px 16px; border-radius: var(--radius-sm);
  margin-bottom: 14px; font-size: .87rem; font-weight: 600;
}
.com-alert-cleared {
  background: var(--green-light); border: 1px solid #a7f3d0;
  border-radius: 10px; padding: 10px 16px; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px; font-size: .84rem; color: #065f46; font-weight: 600;
}
.com-alert-damage {
  background: #fce4ec; border: 1.5px solid #ef9a9a;
  border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
}

/* ── PAID TOGGLE ── */
.com-paid-toggle {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 10px; border: 2px solid;
  cursor: pointer; margin-bottom: 14px; transition: all .2s;
}
.com-paid-check {
  width: 22px; height: 22px; border-radius: 50%; border: 2px solid;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: all .2s;
}

/* ── PAID SUMMARY ── */
.com-paid-summary {
  background: var(--green-light); border: 1px solid #a5d6a7;
  border-radius: 10px; padding: 12px 16px;
}
.com-paid-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 8px; }
.com-paid-box {
  background: white; border-radius: 7px; padding: 7px 10px; text-align: center;
}

/* ── CHANGE BOX ── */
.com-change {
  background: var(--green-light); border: 1px solid #a5d6a7;
  border-radius: 10px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center;
}

/* ── REFUND BOX ── */
.com-refund-box {
  background: #fff8e1; border: 1.5px solid #ffe082;
  border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
}

/* ── FOOTER BTNS ── */
.com-footer { display: flex; gap: 12px; }
.com-btn-cancel {
  flex: 1; padding: 13px; background: white;
  border: 2px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Roboto', sans-serif;
  transition: border-color .15s;
}
.com-btn-cancel:hover { border-color: #c8d8c8; }
.com-btn-confirm {
  flex: 2; padding: 13px; border: none; border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 700;
  color: white; font-family: 'Roboto', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: background .15s, transform .1s;
}
.com-btn-confirm:not(:disabled):hover { transform: translateY(-1px); }
.com-btn-confirm:disabled { cursor: not-allowed; }

/* ── CHARGE ITEMS ── */
.com-charge-item {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .82rem; padding: 5px 8px; background: white;
  border-radius: 7px; margin-bottom: 4px; border: 1px solid #ffcdd2;
}
.com-charge-edit-input {
  width: 90px; padding: 4px 8px; border: 1.5px solid var(--red);
  border-radius: 6px; font-size: .82rem; outline: none;
  font-family: 'Roboto', sans-serif;
}
.com-charge-save-btn {
  background: var(--green); border: none; border-radius: 6px;
  padding: 4px 8px; cursor: pointer; color: white;
  display: flex; align-items: center;
}
.com-edit-btn {
  border: none; border-radius: 6px; padding: 4px 7px;
  cursor: pointer; display: flex; align-items: center; gap: 3px;
  font-size: .7rem; font-weight: 700; font-family: 'Roboto', sans-serif;
}

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .com-body { padding: 16px 18px; }
  .com-hdr  { padding: 18px 20px; }
  .com-info-grid { grid-template-columns: 1fr 1fr; }
  .com-pay-grid  { flex-wrap: wrap; }
  .com-pay-btn   { min-width: calc(50% - 5px); }
  .com-paid-grid { grid-template-columns: 1fr; gap: 6px; }
}
@media (max-width: 420px) {
  .com-info-grid { grid-template-columns: 1fr; }
  .com-footer    { flex-direction: column; }
  .com-btn-cancel, .com-btn-confirm { flex: none; width: 100%; }
}
`;

export default function CheckOutModal({
  selected, onClose, onConfirm, processing, successMsg,
  extraCharges, setExtraCharges, extraNote, setExtraNote,
  paymentMethod, setPaymentMethod, amountReceived, setAmountReceived,
  fullyPaid, setFullyPaid, editingCharge, setEditingCharge,
  onSaveChargePrice, getAdditionalCharges, getInspectionCharges,
}) {
  if (!selected) return null;

  const resChargesTotal = getAdditionalCharges(selected)
    .filter(c => c.from_reservation)
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const roomRate   = parseFloat(selected?.total_amount || 0);
  const extraNow   = parseFloat(extraCharges || 0);

  const inHouseTotal = getAdditionalCharges(selected)
    .filter(c => !c.from_reservation)
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const inspectionTotal = getInspectionCharges(selected)
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const displayRoomRate = roomRate - inHouseTotal - resChargesTotal;

  const grandTotal = parseFloat(selected?.remaining_balance ?? selected?.total_amount ?? 0) + inspectionTotal + extraNow;
  const total      = parseFloat(selected?.total_amount || 0);

  const reservationDownpayment = parseFloat(selected?.reservation_downpayment || 0);
  const checkinPayment         = parseFloat(selected?.amount_paid || 0);

  const totalPaid = (() => {
    if (reservationDownpayment > 0) return reservationDownpayment + checkinPayment;
    return checkinPayment;
  })();

  const remainingBalance = grandTotal;
  const amtGiven = parseFloat(amountReceived || 0);
  const change   = fullyPaid ? 0 : Math.max(0, amtGiven - remainingBalance);

  const hasReservationDownpayment = reservationDownpayment > 0 ||
    (selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate);
  const paidInFullAtCheckIn = !selected?.pay_later && checkinPayment >= roomRate;
  const partialAtCheckIn    = !selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate;
  const isConfirmDisabled   = processing || (!fullyPaid && amtGiven <= 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="com-overlay">
        <div className="com-box">

          <div className="com-hdr">
            <div style={{ position: "relative", zIndex: 1 }}>
              <h3 className="com-hdr-title">
                <RiLogoutBoxLine size={20} /> Process Check-Out
              </h3>
              <p className="com-hdr-sub">Review charges and collect final payment</p>
            </div>
            <button className="com-hdr-close" onClick={onClose}>×</button>
          </div>

          <div className="com-body">

            {successMsg && (
              <div className="com-alert-success">✅ {successMsg}</div>
            )}

            {!selected.inspection_status && (
              <div className="com-alert-warn">
                <RiAlertLine size={15} color="#f57f17" /> Room was not inspected before check-out.
              </div>
            )}

            <div className="com-section">
              <div className="com-section-title"><RiUserLine size={13} /> Reservation Summary</div>
              <div className="com-info-grid">
                {[
                  ["Guest",     selected.guest_name],
                  ["Room",      `Room ${selected.room_number}`],
                  ["Check-In",  selected.check_in],
                  ["Check-Out", selected.check_out],
                  ["Duration",  `${Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)} nights`],
                  ["Room Rate", `₱${displayRoomRate.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} className="com-info-box">
                    <div className="com-info-lbl">{k}</div>
                    <div className="com-info-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="com-section">
              <div className="com-section-title">Extra Charges at Check-Out (Optional)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="com-label">Amount (₱)</label>
                  <input type="number" className="com-input" value={extraCharges}
                    onChange={e => setExtraCharges(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="com-label">Reason</label>
                  <input className="com-input" value={extraNote}
                    onChange={e => setExtraNote(e.target.value)} placeholder="e.g. Room service, minibar" />
                </div>
              </div>
            </div>

            <div className="com-section">
              <div className="com-section-title"><RiMoneyDollarCircleLine size={13} /> Payment Method</div>
              <div className="com-pay-grid">
                {["cash", "card", "gcash", "bank_transfer"].map(m => (
                  <button key={m} className="com-pay-btn"
                    onClick={() => setPaymentMethod(m)}
                    style={{
                      border: `2px solid ${paymentMethod === m ? "var(--orange)" : "var(--border)"}`,
                      background: paymentMethod === m ? "var(--orange-light)" : "white",
                      color: paymentMethod === m ? "var(--orange)" : "var(--text-muted)",
                    }}>
                    {m === "cash" ? "Cash" : m === "card" ? "Card" : m === "gcash" ? "GCash" : "Bank"}<br />
                    <span style={{ fontSize: ".65rem", fontWeight: "400", color: "var(--text-muted)" }}>
                      {m === "cash" ? "💵" : m === "card" ? "💳" : m === "gcash" ? "📱" : "🏦"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {selected?.notes && (
              <div style={{ background: "#fffde7", border: "1px solid #fff176", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px", display: "flex", gap: "8px", alignItems: "flex-start", fontSize: ".82rem", color: "#555" }}>
                <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                <span><strong>Guest Notes:</strong> {selected.notes}</span>
              </div>
            )}

            {selected?.inspection_status === "has_damage" && (
              <div className="com-alert-damage">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <RiAlertLine size={16} color="#c62828" />
                  <span style={{ fontWeight: "700", color: "#c62828", fontSize: ".88rem" }}>Damage Reported by Maintenance</span>
                </div>
                {selected.inspection_notes && (
                  <div style={{ fontSize: ".82rem", color: "#555", marginBottom: "10px", background: "#fff5f5", padding: "8px 10px", borderRadius: "7px" }}>
                    {selected.inspection_notes}
                  </div>
                )}
                {getInspectionCharges(selected).length > 0 && (
                  <div>
                    <div style={{ fontSize: ".7rem", fontWeight: "700", color: "#c62828", textTransform: "uppercase", marginBottom: "6px" }}>Damage Charges</div>
                    {getInspectionCharges(selected).map((c, i) => (
                      <div key={i} className="com-charge-item">
                        <span style={{ color: "#333" }}>• {c.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {editingCharge?.index === i ? (
                            <>
                              <input type="number" autoFocus defaultValue={c.tbd ? "" : c.amount}
                                className="com-charge-edit-input" id={`charge-edit-${i}`}
                                onKeyDown={e => {
                                  if (e.key === "Enter") onSaveChargePrice(selected, i, e.target.value);
                                  if (e.key === "Escape") setEditingCharge(null);
                                }}
                              />
                              <button className="com-charge-save-btn"
                                onClick={() => onSaveChargePrice(selected, i, document.getElementById(`charge-edit-${i}`)?.value)}>
                                <RiCheckLine size={13} />
                              </button>
                            </>
                          ) : (
                            <>
                              {c.tbd
                                ? <span style={{ fontSize: ".7rem", fontWeight: "700", color: "#f57f17", background: "#fff8e1", padding: "2px 7px", borderRadius: "8px", border: "1px solid #ffe082" }}>TBD</span>
                                : <span style={{ fontWeight: "700", color: "#c62828" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                              }
                              <button className="com-edit-btn"
                                onClick={() => setEditingCharge({ index: i })}
                                style={{ background: c.tbd ? "#f57f17" : "var(--bg)", color: c.tbd ? "white" : "var(--text-sec)" }}>
                                <RiPencilLine size={11} />{c.tbd ? "Set Price" : "Edit"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {getInspectionCharges(selected).some(c => c.tbd) && (
                      <div style={{ fontSize: ".73rem", color: "#f57f17", marginTop: "6px", fontStyle: "italic" }}>
                        ⚠ Some charges are TBD — click "Set Price" to enter the final amount before checkout.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selected?.inspection_status === "cleared" && (
              <div className="com-alert-cleared">
                <RiCheckDoubleLine size={16} color="var(--green)" /> Room inspected and cleared — no damage reported.
              </div>
            )}

            <div className="com-section">
              <div className="com-section-title">Bill Breakdown</div>

              {selected?.refund_amount > 0 && selected?.original_checkout && (
                <div className="com-refund-box">
                  <div style={{ fontSize: ".68rem", fontWeight: 700, color: "#f57f17", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10 }}>
                    ⚠ Stay Was Shortened — Refund Applied
                  </div>
                  {[
                    ["Original Check-Out",      selected.original_checkout],
                    ["New Check-Out",            selected.check_out],
                    ["Last Payment (Original)", `₱${parseFloat(selected.original_amount || 0).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", color: "#555", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #ffe082" }}>
                      <span>{k}</span><span style={{ fontWeight: 700, color: "#333" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", fontWeight: 700, color: "#c62828", paddingTop: 4 }}>
                    <span>Refund Issued to Guest</span>
                    <span>−₱{parseFloat(selected.refund_amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="com-bill-row">
                <span style={{ color: "var(--text-sec)" }}>Room Rate</span>
                <span style={{ fontWeight: "600" }}>₱{displayRoomRate.toLocaleString()}</span>
              </div>

              {getAdditionalCharges(selected).filter(c => c.from_reservation).length > 0 && (
                <div style={{ paddingBottom: "4px" }}>
                  {getAdditionalCharges(selected).filter(c => c.from_reservation).map(c => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".77rem", color: "#999", padding: "2px 0 2px 14px" }}>
                      <span>• {c.name} <span style={{ fontSize: ".67rem", color: "#bbb" }}>(included in rate)</span></span>
                      <span style={{ color: "#bbb" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {inHouseTotal > 0 && (
                <>
                  <div className="com-bill-row">
                    <span style={{ color: "#6a1b9a", fontWeight: "600" }}>In-House Charges</span>
                    <span style={{ fontWeight: "600", color: "#6a1b9a" }}>₱{inHouseTotal.toLocaleString()}</span>
                  </div>
                  {getAdditionalCharges(selected).filter(c => !c.from_reservation).map(c => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".77rem", color: "#888", padding: "2px 0 2px 14px" }}>
                      <span>• {c.name}</span>
                      <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </>
              )}

              {inspectionTotal > 0 && (
                <div className="com-bill-row">
                  <span style={{ color: "#c62828", fontWeight: "600" }}>Damage / Inspection Charges</span>
                  <span style={{ fontWeight: "600", color: "#c62828" }}>₱{inspectionTotal.toLocaleString()}</span>
                </div>
              )}

              {extraNow > 0 && (
                <div className="com-bill-row">
                  <span style={{ color: "var(--text-sec)" }}>Extra at Check-Out{extraNote ? ` (${extraNote})` : ""}</span>
                  <span style={{ fontWeight: "600" }}>₱{extraNow.toLocaleString()}</span>
                </div>
              )}

              <div className="com-bill-total">
                <span style={{ fontWeight: "700" }}>Total</span>
                <span style={{ fontWeight: "700" }}>₱{total.toLocaleString()}</span>
              </div>

              {paidInFullAtCheckIn && (
                <div className="com-bill-row" style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--text-sec)" }}>Paid in Full at Check-In</span>
                  <span style={{ fontWeight: "600", color: "#4caf50" }}>−₱{checkinPayment.toLocaleString()}</span>
                </div>
              )}

              {partialAtCheckIn && (
                <div className="com-bill-row" style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--text-sec)" }}>Partial Payment at Check-In</span>
                  <span style={{ fontWeight: "600", color: "#4caf50" }}>−₱{checkinPayment.toLocaleString()}</span>
                </div>
              )}

              {!hasReservationDownpayment && !paidInFullAtCheckIn && !partialAtCheckIn && totalPaid === 0 && (
                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "8px", padding: "8px 12px", marginTop: "8px", fontSize: ".78rem", color: "#f57f17", fontWeight: "600" }}>
                  No payment collected yet — full amount due at check-out.
                </div>
              )}

              <div className="com-balance"
                style={{
                  background: remainingBalance > 0 ? "#fff3e0" : "var(--green-light)",
                  borderColor: remainingBalance > 0 ? "#ffb74d" : "#a5d6a7",
                }}>
                <div>
                  <div style={{ fontWeight: "700", color: remainingBalance > 0 ? "var(--orange)" : "var(--green)", fontSize: "1rem" }}>
                    {remainingBalance > 0 ? "Remaining Balance Due" : "Fully Settled ✓"}
                  </div>
                  <div style={{ fontSize: ".73rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    {remainingBalance > 0 && totalPaid > 0
                      ? `₱${grandTotal.toLocaleString()} total − ₱${totalPaid.toLocaleString()} already paid`
                      : remainingBalance > 0 ? "Full amount to collect now" : "No outstanding balance"
                    }
                  </div>
                </div>
                <span style={{ fontWeight: "900", color: remainingBalance > 0 ? "var(--orange)" : "var(--green)", fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
                  ₱{remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="com-section" style={{ marginBottom: "20px" }}>
              <div className="com-section-title"><RiMoneyDollarCircleLine size={13} /> Collect Payment</div>

              <div className="com-paid-toggle"
                onClick={() => { setFullyPaid(!fullyPaid); if (!fullyPaid) setAmountReceived(remainingBalance.toString()); }}
                style={{
                  borderColor: fullyPaid ? "#4caf50" : "var(--border)",
                  background: fullyPaid ? "var(--green-light)" : "#f8f9fa",
                }}>
                <div className="com-paid-check"
                  style={{ borderColor: fullyPaid ? "#4caf50" : "#ccc", background: fullyPaid ? "#4caf50" : "white" }}>
                  {fullyPaid && <span style={{ color: "white", fontSize: ".72rem", fontWeight: "700" }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: ".9rem", color: fullyPaid ? "#1b5e20" : "var(--text)" }}>
                    Guest has paid the remaining balance
                  </div>
                  <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: "1px" }}>
                    Collecting ₱{remainingBalance.toLocaleString()} now
                  </div>
                </div>
              </div>

              {!fullyPaid && (
                <>
                  <div style={{ marginBottom: "12px" }}>
                    <label className="com-label">Amount Received (₱)</label>
                    <input type="number" className="com-input" value={amountReceived}
                      onChange={e => setAmountReceived(e.target.value)}
                      placeholder={`Remaining balance: ₱${remainingBalance.toLocaleString()}`}
                      style={{ fontSize: "1rem", fontWeight: "700" }} />
                    <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}`}</style>
                  </div>
                  {change > 0 && (
                    <div className="com-change">
                      <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: ".9rem" }}>💵 Change to return</span>
                      <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{change.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {fullyPaid && (
                <div className="com-paid-summary">
                  <div style={{ fontWeight: "700", fontSize: ".9rem", color: "#1b5e20", marginBottom: "8px" }}>
                    ✅ Payment fully settled
                  </div>
                  <div className="com-paid-grid">
                    {[
                      ["Grand Total",   `₱${grandTotal.toLocaleString()}`],
                      ["Paid Earlier",  `₱${totalPaid.toLocaleString()}`],
                      ["Collected Now", `₱${remainingBalance.toLocaleString()}`],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="com-paid-box">
                        <div style={{ fontSize: ".62rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>{lbl}</div>
                        <div style={{ fontSize: ".84rem", fontWeight: "700", color: "#1b5e20" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="com-footer">
              <button className="com-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="com-btn-confirm" onClick={onConfirm} disabled={isConfirmDisabled}
                style={{
                  background: isConfirmDisabled ? "#aaa" : "var(--orange)",
                  boxShadow: isConfirmDisabled ? "none" : "0 4px 12px rgba(230,81,0,.3)",
                }}>
                <RiLogoutBoxLine size={16} />
                {processing ? "Processing..." : "Confirm Check-Out & Mark Paid"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}