import React from "react";
import {
  RiUserLine, RiLogoutBoxLine, RiAlertLine, RiMoneyDollarCircleLine,
  RiStickyNoteLine,  RiPencilLine, RiCheckLine,
  RiCalendarLine, RiHomeSmileLine, RiShieldCheckLine, RiTimeLine,
  RiCashLine, 
} from "react-icons/ri";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green:        #07713c;
  --green-dark:   #055a2f;
  --green-mid:    #0a8f4d;
  --green-light:  #e6f4ec;
  --green-pale:   #f0faf4;
  --gold:         #dbba14;
  --gold-light:   #fdf8e1;
  --gold-pale:    #fffef5;
  --white:        #ffffff;
  --bg:           #f5f8f5;
  --border:       #d4e8da;
  --border-light: #e8f4ec;
  --text:         #0d1f14;
  --text-sec:     #3d6649;
  --text-muted:   #7a9e85;
  --red:          #c62828;
  --orange:       #e65100;
  --radius:       14px;
  --radius-sm:    9px;
  --radius-xs:    6px;
  --shadow:       0 2px 16px rgba(7,113,60,0.08);
  --shadow-md:    0 8px 32px rgba(7,113,60,0.14);
  --shadow-lg:    0 20px 60px rgba(7,113,60,0.18);
}

.com-overlay {
  position: fixed; inset: 0;
  background: rgba(5, 30, 15, 0.72);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 16px;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.com-box {
  background: var(--bg);
  border-radius: 22px;
 width: min(900px, 95vw);
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  position: relative;
}
.com-box::-webkit-scrollbar { width: 5px; }
.com-box::-webkit-scrollbar-track { background: var(--green-pale); }
.com-box::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

/* ── HEADER ── */
.com-hdr {
  background: var(--green);
  border-radius: 22px 22px 0 0;
  padding: 24px 28px 20px;
  display: flex; justify-content: space-between; align-items: flex-start;
  position: relative; overflow: hidden;
}
.com-hdr::before {
  content: '';
  position: absolute; top: -40px; right: -40px;
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(219,186,20,0.12);
  pointer-events: none;
}
.com-hdr::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--gold) 0%, rgba(219,186,20,0.3) 100%);
}
.com-hdr-left { position: relative; z-index: 1; }
.com-hdr-badge {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(219,186,20,0.18); border: 1px solid rgba(219,186,20,0.35);
  border-radius: 20px; padding: 3px 10px; margin-bottom: 10px;
  font-size: .65rem; font-weight: 700; color: var(--gold);
  text-transform: uppercase; letter-spacing: .1em;
}
.com-hdr-title {
  margin: 0; color: white; font-size: 1.25rem; font-weight: 800;
  display: flex; align-items: center; gap: 10px; letter-spacing: -.02em;
}
.com-hdr-sub {
  margin: 6px 0 0; color: rgba(255,255,255,.55);
  font-size: .78rem; font-weight: 400;
}
.com-hdr-close {
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);
  width: 36px; height: 36px; border-radius: 50%;
  cursor: pointer; color: rgba(255,255,255,.8); font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s; position: relative; z-index: 1; flex-shrink: 0; margin-top: 2px;
}
.com-hdr-close:hover { background: rgba(255,255,255,.22); color: white; }

/* ── BODY ── */
.com-body { padding: 20px 24px 24px; }

/* ── SECTION CARD ── */
.com-section {
  background: var(--white); border-radius: var(--radius);
  padding: 16px 18px; margin-bottom: 12px;
  box-shadow: var(--shadow); border: 1px solid var(--border-light);
}

.com-section-title {
  font-size: .68rem; font-weight: 800; color: var(--green);
  text-transform: uppercase; letter-spacing: .12em; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.com-section-title-bar {
  width: 18px; height: 3px; background: var(--gold);
  border-radius: 2px; flex-shrink: 0;
}

/* ── GUEST SUMMARY GRID ── */
.com-info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
.com-info-box {
  background: var(--green-pale); border-radius: var(--radius-sm);
  padding: 10px 12px; border: 1px solid var(--border-light);
}
.com-info-lbl {
  color: var(--text-muted); font-size: .62rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  display: flex; align-items: center; gap: 3px; margin-bottom: 3px;
}
.com-info-val {
  font-weight: 700; color: var(--text); font-size: .84rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── INPUT / LABEL ── */
.com-label {
  display: block; font-size: .68rem; font-weight: 700;
  color: var(--text-sec); margin-bottom: 5px;
  text-transform: uppercase; letter-spacing: .08em;
}
.com-input {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .88rem; outline: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--white); color: var(--text);
  transition: border-color .2s, box-shadow .2s;
}
.com-input:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(7,113,60,.1);
}
.com-input::placeholder { color: var(--text-muted); font-style: italic; }



/* ── BILL ROWS ── */
.com-bill-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px dashed var(--border-light);
  font-size: .86rem;
}
.com-bill-row:last-of-type { border-bottom: none; }
.com-bill-total {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; background: var(--green-pale);
  border-radius: var(--radius-sm); margin-top: 8px;
  border: 1px solid var(--border);
}

/* ── HISTORY ITEMS ── */
.com-history-item {
  display: flex; justify-content: space-between; align-items: center;
  border-radius: var(--radius-sm); padding: 9px 12px; margin-bottom: 6px;
  transition: opacity .15s;
}
.com-history-item:last-child { margin-bottom: 0; }

/* ── BALANCE BOX ── */
.com-balance {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 18px; margin-top: 14px; border-radius: var(--radius);
  border: 2px solid; position: relative; overflow: hidden;
}
.com-balance::before {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(
    45deg, transparent, transparent 10px,
    rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px
  );
}

/* ── ALERTS ── */
.com-alert-warn {
  background: #fff8e1; border: 1.5px solid #ffe082;
  border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
  font-size: .8rem; color: #f57f17; font-weight: 600;
}
.com-alert-success {
  background: var(--green-light); border: 1px solid #a5d6a7;
  color: #1b5e20; padding: 12px 16px; border-radius: var(--radius-sm);
  margin-bottom: 12px; font-size: .86rem; font-weight: 600;
}
.com-alert-cleared {
  background: var(--green-pale); border: 1px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
  font-size: .82rem; color: var(--green); font-weight: 600;
}
.com-alert-damage {
  background: #fff5f5; border: 1.5px solid #ffcdd2;
  border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 12px;
}

/* ── PAID TOGGLE ── */
.com-paid-toggle {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 15px; border-radius: var(--radius-sm); border: 2px solid;
  cursor: pointer; margin-bottom: 12px; transition: all .2s;
}
.com-paid-check {
  width: 24px; height: 24px; border-radius: 50%; border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}

/* ── PAID SUMMARY ── */
.com-paid-summary {
  background: var(--green-pale); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 14px 16px;
}
.com-paid-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; margin-top: 10px;
}
.com-paid-box {
  background: white; border-radius: var(--radius-xs);
  padding: 9px 10px; text-align: center;
  border: 1px solid var(--border-light);
}

/* ── CHANGE BOX ── */
.com-change {
  background: var(--green-pale); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 13px 16px;
  display: flex; justify-content: space-between; align-items: center;
}

/* ── REFUND BOX ── */
.com-refund-box {
  background: #fff8e1; border: 1.5px solid #ffe082;
  border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 12px;
}

/* ── CHARGE ITEMS ── */
.com-charge-item {
  display: flex; justify-content: space-between; align-items: center;
  font-size: .82rem; padding: 7px 10px; background: white;
  border-radius: var(--radius-xs); margin-bottom: 5px;
  border: 1px solid #ffcdd2;
}
.com-charge-edit-input {
  width: 90px; padding: 4px 8px;
  border: 1.5px solid var(--red); border-radius: 6px;
  font-size: .82rem; outline: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.com-charge-save-btn {
  background: var(--green); border: none; border-radius: 6px;
  padding: 5px 9px; cursor: pointer; color: white;
  display: flex; align-items: center;
}
.com-edit-btn {
  border: none; border-radius: 6px; padding: 4px 8px;
  cursor: pointer; display: flex; align-items: center; gap: 3px;
  font-size: .68rem; font-weight: 700;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── DIVIDER ── */
.com-divider {
  height: 1px; background: var(--border-light);
  margin: 14px 0;
}

/* ── FOOTER ── */
.com-footer { display: flex; gap: 10px; margin-top: 4px; }
.com-btn-cancel {
  flex: 1; padding: 13px; background: white;
  border: 2px solid var(--border); border-radius: var(--radius-sm);
  cursor: pointer; font-size: .88rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Plus Jakarta Sans', sans-serif;
  transition: all .18s;
}
.com-btn-cancel:hover { border-color: var(--green); color: var(--green); }
.com-btn-confirm {
  flex: 2; padding: 13px; border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .9rem; font-weight: 800;
  color: white; font-family: 'Plus Jakarta Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .18s; letter-spacing: -.01em;
}
.com-btn-confirm:not(:disabled):hover { filter: brightness(1.08); transform: translateY(-1px); }
.com-btn-confirm:disabled { cursor: not-allowed; filter: none; transform: none; }

/* ── SECTION LABEL ── */
.com-sublabel {
  font-size: .62rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: .1em;
  display: flex; align-items: center; gap: 6px; margin-bottom: 8px;
}

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .com-body { padding: 14px 16px 20px; }
  .com-hdr  { padding: 18px 18px 16px; }
  .com-hdr-title { font-size: 1.05rem; }
  .com-info-grid { grid-template-columns: 1fr 1fr; }
  .com-pay-btn { min-width: calc(50% - 4px); }
  .com-paid-grid { grid-template-columns: 1fr; gap: 6px; }
  .com-footer { flex-direction: column; }
  .com-btn-cancel, .com-btn-confirm { flex: none; width: 100%; }
  .com-balance { flex-direction: column; gap: 8px; align-items: flex-start; }
}
@media (max-width: 420px) {
  .com-info-grid { grid-template-columns: 1fr; }
  .com-hdr-title { font-size: .95rem; }
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

  const allAdditional   = getAdditionalCharges(selected);
  const resCharges      = allAdditional.filter(c => c.from_reservation);
  const inHouseCharges  = allAdditional.filter(c => !c.from_reservation);
  const resChargesTotal = resCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const inHouseTotal    = inHouseCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const roomRate        = parseFloat(selected?.total_amount || 0);
  const extraNow        = parseFloat(extraCharges || 0);
  const inspectionTotal = getInspectionCharges(selected).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const displayRoomRate = roomRate - inHouseTotal - resChargesTotal;

  const grandTotal     = parseFloat(selected?.remaining_balance ?? selected?.total_amount ?? 0) + inspectionTotal + extraNow;
  const total          = parseFloat(selected?.total_amount || 0);
  const reservationDP  = parseFloat(selected?.reservation_downpayment || 0);
  const checkinPayment = parseFloat(selected?.amount_paid || 0);
  const totalPaid      = reservationDP > 0 ? reservationDP + checkinPayment : checkinPayment;

  const remainingBalance  = grandTotal;
  const amtGiven          = parseFloat(amountReceived || 0);
  const change            = fullyPaid ? 0 : Math.max(0, amtGiven - remainingBalance);

  const paidInFullAtCheckIn = !selected?.pay_later && checkinPayment >= roomRate;
  const partialAtCheckIn    = !selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate;
  const hasDP               = reservationDP > 0 || (selected?.pay_later && checkinPayment > 0 && checkinPayment < roomRate);
  const isConfirmDisabled   = processing || (!fullyPaid && (amtGiven <= 0 || amtGiven < remainingBalance));

  const paymentHistory = (() => {
    try { return JSON.parse(selected.payment_history || "[]"); } catch { return []; }
  })();

  const historyMeta = {
    inhouse_payment:      { label: "Cash Payment",  color: "#07713c", bg: "#e8f5e9", symbol: "💵", deduct: true  },
    date_change_charge:   { label: "Date Extension Charge",   color: "#e65100", bg: "#fff3e0", symbol: "📅", deduct: false },
    date_change_refund:   { label: "Date Shortening Refund",  color: "#1565c0", bg: "#e3f2fd", symbol: "↩️", deduct: true  },
    room_transfer_charge: { label: "Room Transfer Charge",    color: "#6a1b9a", bg: "#f3e5f5", symbol: "🔄", deduct: false },
    room_transfer_refund: { label: "Room Transfer Refund",    color: "#1565c0", bg: "#e3f2fd", symbol: "🔄", deduct: true  },
  };

  const nights = Math.max(0, Math.floor((new Date(selected.check_out) - new Date(selected.check_in)) / 86400000));

  return (
    <>
      <style>{CSS}</style>
      <div className="com-overlay" onClick={onClose}>
        <div className="com-box" onClick={e => e.stopPropagation()}>

          {/* ── HEADER ── */}
          <div className="com-hdr">
            <div className="com-hdr-left">
              <div className="com-hdr-badge">
                <RiLogoutBoxLine size={10} /> Check-Out
              </div>
              <h3 className="com-hdr-title">
                Process Check-Out
              </h3>
              <p className="com-hdr-sub">
                {selected.guest_name} · Room {selected.room_number}
              </p>
            </div>
            <button className="com-hdr-close" onClick={onClose}>×</button>
          </div>

          <div className="com-body">

            {successMsg && <div className="com-alert-success">✅ {successMsg}</div>}

            {!selected.inspection_status && (
              <div className="com-alert-warn">
                <RiAlertLine size={14} /> Room was not inspected before check-out.
              </div>
            )}

            {/* ── RESERVATION SUMMARY ── */}
            <div className="com-section">
              <div className="com-section-title">
                <span className="com-section-title-bar" />
                <RiUserLine size={13} /> Reservation Summary
              </div>
              <div className="com-info-grid">
                {[
                  [<RiUserLine size={10} />,     "Guest",     selected.guest_name],
                  [<RiHomeSmileLine size={10} />, "Room",      `Room ${selected.room_number}`],
                  [<RiCalendarLine size={10} />,  "Check-In",  selected.check_in],
                  [<RiCalendarLine size={10} />,  "Check-Out", selected.check_out],
                  [<RiTimeLine size={10} />,      "Duration",  `${nights} night${nights !== 1 ? "s" : ""}`],
                  [<RiCashLine size={10} />,      "Room Rate", `₱${displayRoomRate.toLocaleString()}`],
                ].map(([icon, k, v]) => (
                  <div key={k} className="com-info-box">
                    <div className="com-info-lbl">{icon}{k}</div>
                    <div className="com-info-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── EXTRA CHARGES ── */}
            <div className="com-section">
              <div className="com-section-title">
                <span className="com-section-title-bar" />
                Extra Charges at Check-Out
                <span style={{ fontSize: ".62rem", color: "var(--text-muted)", fontWeight: "500", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="com-label">Amount (₱)</label>
                  <input type="number" className="com-input" value={extraCharges}
                    onChange={e => setExtraCharges(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <label className="com-label">Reason</label>
                  <input className="com-input" value={extraNote}
                    onChange={e => setExtraNote(e.target.value)} placeholder="e.g. minibar, late check-out" />
                </div>
              </div>
            </div>



            {/* ── GUEST NOTES ── */}
            {selected?.notes && (
              <div style={{ background: "#fffde7", border: "1px solid #fff176", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "12px", display: "flex", gap: "8px", alignItems: "flex-start", fontSize: ".8rem", color: "#555" }}>
                <RiStickyNoteLine size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                <span><strong>Guest Notes:</strong> {selected.notes}</span>
              </div>
            )}

            {/* ── DAMAGE INSPECTION ── */}
            {selected?.inspection_status === "has_damage" && (
              <div className="com-alert-damage">
                <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <RiAlertLine size={15} color="#c62828" />
                  <span style={{ fontWeight: "700", color: "#c62828", fontSize: ".86rem" }}>Damage Reported by Maintenance</span>
                </div>
                {selected.inspection_notes && (
                  <div style={{ fontSize: ".8rem", color: "#555", marginBottom: "10px", background: "white", padding: "8px 10px", borderRadius: "var(--radius-xs)" }}>
                    {selected.inspection_notes}
                  </div>
                )}
                {getInspectionCharges(selected).length > 0 && (
                  <div>
                    <div style={{ fontSize: ".66rem", fontWeight: "700", color: "#c62828", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "7px" }}>Damage Charges</div>
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
                                ? <span style={{ fontSize: ".68rem", fontWeight: "700", color: "#f57f17", background: "#fff8e1", padding: "2px 7px", borderRadius: "8px", border: "1px solid #ffe082" }}>TBD</span>
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
                      <div style={{ fontSize: ".72rem", color: "#f57f17", marginTop: "6px", fontStyle: "italic" }}>
                        ⚠ Some charges are TBD — set price before checkout.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selected?.inspection_status === "cleared" && (
              <div className="com-alert-cleared">
                <RiShieldCheckLine size={15} color="var(--green)" /> Room inspected and cleared — no damage reported.
              </div>
            )}

            {/* ── BILL BREAKDOWN + HISTORY + BALANCE ── */}
            <div className="com-section">
              <div className="com-section-title">
                <span className="com-section-title-bar" />
                <RiMoneyDollarCircleLine size={13} /> Bill Breakdown
              </div>

              {/* Refund box */}
              {selected?.refund_amount > 0 && selected?.original_checkout && (
                <div className="com-refund-box" style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: ".66rem", fontWeight: 700, color: "#f57f17", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
                    ⚠ Stay Was Shortened — Refund Applied
                  </div>
                  {[
                    ["Original Check-Out",      selected.original_checkout],
                    ["New Check-Out",            selected.check_out],
                    ["Last Payment (Original)", `₱${parseFloat(selected.original_amount || 0).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", color: "#555", marginBottom: 6, paddingBottom: 6, borderBottom: "1px dashed #ffe082" }}>
                      <span>{k}</span>
                      <span style={{ fontWeight: 700, color: "#333" }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: 700, color: "#c62828", paddingTop: 4 }}>
                    <span>Refund Issued to Guest</span>
                    <span>−₱{parseFloat(selected.refund_amount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Room rate row */}
              <div className="com-bill-row">
                <span style={{ color: "var(--text-sec)", fontWeight: "600" }}>Room Rate</span>
                <span style={{ fontWeight: "700", color: "var(--text)" }}>₱{displayRoomRate.toLocaleString()}</span>
              </div>

              {/* Reservation charges */}
              {resCharges.length > 0 && (
                <div style={{ paddingBottom: "4px" }}>
                  {resCharges.map(c => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".76rem", color: "#aaa", padding: "3px 0 3px 14px" }}>
                      <span>• {c.name} <span style={{ fontSize: ".65rem", color: "#ccc" }}>(included)</span></span>
                      <span>₱{parseFloat(c.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* In-house charges */}
              {inHouseTotal > 0 && (
                <>
                  <div className="com-bill-row">
                    <span style={{ color: "#6a1b9a", fontWeight: "600" }}>In-House Charges</span>
                    <span style={{ fontWeight: "700", color: "#6a1b9a" }}>₱{inHouseTotal.toLocaleString()}</span>
                  </div>
{inHouseCharges.map(c => (
  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".76rem", color: "#888", padding: "3px 0 3px 14px" }}>
    <span>• {c.name.replace(/^\[Restaurant\] /, "")}</span>
    <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
  </div>
))}

{/* Date extension & room transfer charges */}
{paymentHistory
  .filter(h => h.type === "date_change_charge" || h.type === "room_transfer_charge")
  .map((h, i) => (
    <div key={`hist-${i}`} style={{ display: "flex", justifyContent: "space-between", fontSize: ".76rem", padding: "3px 0 3px 14px", color: h.type === "date_change_charge" ? "#e65100" : "#6a1b9a" }}>
      <span>• {h.type === "date_change_charge" ? "📅" : "🔄"} {h.note}</span>
      <span style={{ fontWeight: "600" }}>₱{parseFloat(h.amount).toLocaleString()}</span>
    </div>
  ))
}
                </>
              )}

              {/* Inspection charges */}
              {inspectionTotal > 0 && (
                <div className="com-bill-row">
                  <span style={{ color: "#c62828", fontWeight: "600" }}>Damage / Inspection</span>
                  <span style={{ fontWeight: "700", color: "#c62828" }}>₱{inspectionTotal.toLocaleString()}</span>
                </div>
              )}

              {/* Extra at checkout */}
              {extraNow > 0 && (
                <div className="com-bill-row">
                  <span style={{ color: "var(--text-sec)" }}>Extra at Check-Out{extraNote ? ` (${extraNote})` : ""}</span>
                  <span style={{ fontWeight: "700" }}>₱{extraNow.toLocaleString()}</span>
                </div>
              )}

              {/* Total */}
              <div className="com-bill-total">
                <span style={{ fontWeight: "800", color: "var(--text)", fontSize: ".9rem" }}>Subtotal</span>
                <span style={{ fontWeight: "800", color: "var(--green)", fontSize: ".95rem" }}>₱{total.toLocaleString()}</span>
              </div>

              {/* Already paid rows */}
              {paidInFullAtCheckIn && (
                <div className="com-bill-row" style={{ marginTop: "6px" }}>
                  <span style={{ color: "var(--text-sec)" }}>Paid in Full at Check-In</span>
                  <span style={{ fontWeight: "700", color: "var(--green)" }}>−₱{checkinPayment.toLocaleString()}</span>
                </div>
              )}
              {partialAtCheckIn && (
                <div className="com-bill-row" style={{ marginTop: "6px" }}>
                  <span style={{ color: "var(--text-sec)" }}>Partial Payment at Check-In</span>
                  <span style={{ fontWeight: "700", color: "var(--green)" }}>−₱{checkinPayment.toLocaleString()}</span>
                </div>
              )}
              {!hasDP && !paidInFullAtCheckIn && !partialAtCheckIn && totalPaid === 0 && (
                <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "var(--radius-xs)", padding: "8px 12px", marginTop: "8px", fontSize: ".77rem", color: "#f57f17", fontWeight: "600" }}>
                  No payment collected yet — full amount due at check-out.
                </div>
              )}

              {/* ── PAYMENT HISTORY ── */}
              {paymentHistory.filter(h => historyMeta[h.type]?.deduct === true).length > 0 && (
                <>
                  <div className="com-divider" />
                  <div className="com-sublabel">
                    <span style={{ display: "inline-block", width: "14px", height: "2px", background: "var(--gold)", borderRadius: "1px" }} />
                    Payment & Adjustment History
                  </div>
                    {paymentHistory.filter(h => historyMeta[h.type]?.deduct === true).map((h, i) => {
                      const meta = historyMeta[h.type] || { label: h.type, color: "#555", bg: "#f4f6f0", symbol: "•", deduct: false };
                      return (
                      <div key={i} className="com-history-item"
                        style={{ background: meta.bg, border: `1px solid ${meta.color}20` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <span style={{ fontSize: ".9rem" }}>{meta.symbol}</span>
                          <div>
                            <div style={{ fontSize: ".73rem", fontWeight: "700", color: meta.color }}>{meta.label}</div>
                            <div style={{ fontSize: ".66rem", color: "#999", marginTop: "1px" }}>{h.note} · {h.date}</div>
                          </div>
                        </div>
                        <span style={{ fontWeight: "800", color: meta.color, fontSize: ".84rem", whiteSpace: "nowrap" }}>
                          {meta.deduct ? "−" : "+"}₱{parseFloat(h.amount).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── BALANCE HIGHLIGHT ── */}
              <div className="com-balance"
                style={{
                  background: remainingBalance > 0
                    ? "linear-gradient(135deg, #fff3e0, #fff8e8)"
                    : "linear-gradient(135deg, var(--green-pale), #f0fff6)",
                  borderColor: remainingBalance > 0 ? "#ffb74d" : "var(--border)",
                }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ fontWeight: "800", fontSize: ".96rem", letterSpacing: "-.01em",
                    color: remainingBalance > 0 ? "#e65100" : "var(--green)" }}>
                    {remainingBalance > 0 ? "Remaining Balance Due" : "✓ Fully Settled"}
                  </div>
                  <div style={{ fontSize: ".7rem", color: "var(--text-muted)", marginTop: "3px" }}>
                    {remainingBalance > 0 && totalPaid > 0
                      ? `₱${grandTotal.toLocaleString()} total − ₱${totalPaid.toLocaleString()} already paid`
                      : remainingBalance > 0
                      ? "Full amount to collect now"
                      : "No outstanding balance"}
                  </div>
                </div>
                <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
                  <div style={{ fontWeight: "900", fontSize: "1.6rem", letterSpacing: "-.03em", lineHeight: 1,
                    color: remainingBalance > 0 ? "#e65100" : "var(--green)" }}>
                    ₱{remainingBalance.toLocaleString()}
                  </div>
                  {remainingBalance === 0 && (
                    <div style={{ fontSize: ".65rem", color: "var(--text-muted)", marginTop: "2px" }}>
                      No balance
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── COLLECT PAYMENT ── */}
            <div className="com-section" style={{ marginBottom: "16px" }}>
              <div className="com-section-title">
                <span className="com-section-title-bar" />
                <RiCashLine size={13} /> Collect Payment
              </div>

              <div className="com-paid-toggle"
                onClick={() => { setFullyPaid(!fullyPaid); if (!fullyPaid) setAmountReceived(remainingBalance.toString()); }}
                style={{
                  borderColor: fullyPaid ? "var(--green)" : "var(--border)",
                  background: fullyPaid ? "var(--green-pale)" : "#fafcfa",
                }}>
                <div className="com-paid-check"
                  style={{ borderColor: fullyPaid ? "var(--green)" : "#ccc", background: fullyPaid ? "var(--green)" : "white" }}>
                  {fullyPaid && <span style={{ color: "white", fontSize: ".7rem", fontWeight: "800" }}>✓</span>}
                </div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: ".88rem", color: fullyPaid ? "var(--green-dark)" : "var(--text)" }}>
                    Guest has paid the remaining balance
                  </div>
                  <div style={{ fontSize: ".74rem", color: "var(--text-muted)", marginTop: "1px" }}>
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
                      placeholder={`Balance: ₱${remainingBalance.toLocaleString()}`}
                      style={{ fontSize: "1.05rem", fontWeight: "700" }} />
                    <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}`}</style>
                  </div>
                  {change > 0 && (
                    <div className="com-change">
                      <span style={{ color: "var(--green)", fontWeight: "600", fontSize: ".88rem" }}>💵 Change to return to guest</span>
                      <span style={{ color: "var(--green)", fontWeight: "800", fontSize: "1.15rem" }}>₱{change.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}

              {fullyPaid && (
                <div className="com-paid-summary">
                  <div style={{ fontWeight: "700", fontSize: ".88rem", color: "var(--green-dark)" }}>
                    ✅ Payment fully settled
                  </div>
                  <div className="com-paid-grid">
                    {[
                      ["Grand Total",   `₱${grandTotal.toLocaleString()}`],
                      ["Paid Earlier",  `₱${totalPaid.toLocaleString()}`],
                      ["Collected Now", `₱${remainingBalance.toLocaleString()}`],
                    ].map(([lbl, val]) => (
                      <div key={lbl} className="com-paid-box">
                        <div style={{ fontSize: ".6rem", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>{lbl}</div>
                        <div style={{ fontSize: ".84rem", fontWeight: "800", color: "var(--green)" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="com-footer">
              <button className="com-btn-cancel" onClick={onClose}>Cancel</button>
              <button className="com-btn-confirm" onClick={onConfirm} disabled={isConfirmDisabled}
                style={{
                  background: isConfirmDisabled
                    ? "#b0c4b8"
                    : "linear-gradient(135deg, var(--green-dark), var(--green))",
                  boxShadow: isConfirmDisabled ? "none" : "0 4px 16px rgba(7,113,60,.35)",
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