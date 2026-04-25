import React, { useState } from "react";
import { RiDeleteBinLine, RiRestaurantLine } from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";
import supabase from "../supabaseClient";
import RoomPickerModal from "./RoomPickerModal";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c; --green-dark: #055a2f; --green-light: #e8f5ee;
  --gold: #dbba14; --gold-light: #fdf8e1;
  --orange: #e65100; --orange-light: #fff3e0;
  --red: #c62828;
  --bg: #f4f6f0; --white: #ffffff; --border: #e2e8e2;
  --text: #1a2e1a; --text-sec: #5a6e5a; --text-muted: #8fa08f;
  --radius: 12px; --radius-sm: 8px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
}

.rvm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
  font-family: 'Roboto', sans-serif;
}

.rvm-box {
  background: var(--bg);
  border-radius: 20px;
  width: min(860px, 95vw);
  max-height: 92vh; overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
}
.rvm-box::-webkit-scrollbar { width: 4px; }
.rvm-box::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 10px; }

/* ── HEADER ── */
.rvm-hdr {
  background: var(--green);
  border-radius: 20px 20px 0 0; padding: 22px 28px;
  display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.rvm-hdr::before {
  content: ''; position: absolute;
  width: 220px; height: 220px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,0.12);
  top: -80px; right: -60px; pointer-events: none;
}
.rvm-hdr::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold);
}
.rvm-hdr-title {
  margin: 0; font-size: 1.1rem; font-weight: 700; color: white;
  position: relative; z-index: 1;
}
.rvm-hdr-sub {
  margin: 4px 0 0; font-size: .82rem; color: rgba(255,255,255,.65);
  position: relative; z-index: 1;
}
.rvm-hdr-close {
  background: rgba(255,255,255,.12); border: none;
  width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; color: white; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; position: relative; z-index: 1; flex-shrink: 0;
}
.rvm-hdr-close:hover { background: rgba(255,255,255,.26); }

/* ── BODY ── */
.rvm-body { padding: 24px 28px; }

/* ── SECTION ── */
.rvm-section {
  background: var(--white); border-radius: var(--radius);
  padding: 18px 20px; margin-bottom: 14px;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border);
}
.rvm-sec-title {
  font-size: .7rem; font-weight: 700; color: var(--green);
  text-transform: uppercase; letter-spacing: .1em; margin-bottom: 14px;
  display: flex; align-items: center; gap: 6px;
}
.rvm-sec-title::before {
  content: ''; display: inline-block;
  width: 14px; height: 2px; background: var(--gold); border-radius: 1px;
}

/* ── FORM FIELDS ── */
.rvm-label {
  display: block; font-size: .72rem; font-weight: 700;
  color: var(--text-sec); margin-bottom: 5px;
  text-transform: uppercase; letter-spacing: .06em;
}
.rvm-input {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; outline: none;
  font-family: 'Roboto', sans-serif; background: var(--white);
  color: var(--text); transition: border-color .2s, box-shadow .2s;
}
.rvm-input:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); }
.rvm-input::placeholder { color: var(--text-muted); font-style: italic; }

/* ── ROOM PICKER BUTTON ── */
.rvm-room-btn {
  width: 100%; padding: 10px 14px;
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  font-size: .9rem; outline: none; cursor: pointer;
  font-family: 'Roboto', sans-serif; background: var(--bg);
  color: var(--text); transition: border-color .2s;
  display: flex; justify-content: space-between; align-items: center;
  text-align: left;
}
.rvm-room-btn:hover { border-color: var(--gold); background: var(--gold-light); }
.rvm-room-btn.selected { border-color: rgba(219,186,20,.4); background: var(--gold-light); color: #7a5f00; }
.rvm-room-btn-hint { font-size: .73rem; color: var(--text-muted); }

/* ── ROOM SELECTED BADGE ── */
.rvm-room-selected {
  background: var(--green-light); border: 1px solid #bbf7d0;
  border-radius: 10px; padding: 11px 16px; margin-top: 10px;
  display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.rvm-room-selected::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--gold);
}
.rvm-room-name { font-weight: 700; color: var(--green); font-size: .93rem; }
.rvm-room-meta { color: var(--text-sec); font-size: .83rem; margin-left: 10px; }
.rvm-room-price { font-weight: 700; color: var(--green); font-size: .93rem; }

/* ── PRICING SUMMARY ── */
.rvm-pricing {
  margin-top: 14px; background: var(--green);
  border-radius: 10px; padding: 14px 18px;
  position: relative; overflow: hidden;
}
.rvm-pricing::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--gold);
}
.rvm-pricing-row {
  display: flex; justify-content: space-between; align-items: center;
}
.rvm-pricing-label { color: rgba(255,255,255,.72); font-size: .87rem; }
.rvm-pricing-value { color: white; font-weight: 700; font-size: 1.05rem; }
.rvm-pricing-sep {
  border: none; border-top: 1px solid rgba(255,255,255,.12);
  margin: 8px 0;
}
.rvm-pricing-sub-label { color: rgba(255,255,255,.55); font-size: .81rem; }
.rvm-pricing-sub-value { color: rgba(255,255,255,.72); font-size: .88rem; font-weight: 600; }

/* ── PARTIAL PAYMENT ── */
.rvm-partial-toggle {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 10px; border: 2px solid;
  cursor: pointer; margin-top: 12px; transition: all .2s;
}
.rvm-partial-check {
  width: 22px; height: 22px; border-radius: 50%; border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}
.rvm-partial-breakdown {
  margin-top: 8px; background: var(--orange-light);
  border: 1px solid #ffcc80; border-radius: 9px; padding: 14px 16px;
}
.rvm-partial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.rvm-partial-box { background: white; border-radius: var(--radius-sm); padding: 8px 12px; }
.rvm-partial-lbl { font-size: .68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
.rvm-partial-val { font-size: .88rem; font-weight: 700; color: var(--text-sec); }
.rvm-partial-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.rvm-partial-due {
  background: #ffe0b2; border-radius: var(--radius-sm); padding: 10px 12px;
  border: 1.5px solid #ffb74d;
}
.rvm-partial-due-lbl { font-size: .65rem; color: #bf360c; font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
.rvm-partial-due-val { font-size: 1rem; font-weight: 700; color: var(--orange); }
.rvm-partial-bal {
  background: #fce4ec; border-radius: var(--radius-sm); padding: 10px 12px;
  border: 1.5px solid #ef9a9a;
}
.rvm-partial-bal-lbl { font-size: .65rem; color: var(--red); font-weight: 700; text-transform: uppercase; margin-bottom: 3px; }
.rvm-partial-bal-val { font-size: 1rem; font-weight: 700; color: var(--red); }
.rvm-partial-note {
  font-size: .73rem; color: var(--orange);
  margin-top: 10px; font-style: italic; text-align: center;
}

/* ── ADDITIONAL CHARGES ── */
.rvm-charge-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; border-radius: var(--radius-sm); margin-bottom: 6px;
  border: 1px solid;
}
.rvm-charge-name { font-size: .84rem; color: var(--text); display: flex; align-items: center; gap: 6px; }
.rvm-charge-queued {
  font-size: .66rem; background: var(--orange-light); color: var(--orange);
  padding: 1px 6px; border-radius: 10px; font-weight: 700;
}
.rvm-charge-amount { font-weight: 700; font-size: .84rem; }
.rvm-charge-del { background: none; border: none; cursor: pointer; color: var(--red); display: flex; align-items: center; padding: 0 2px; }

/* ── ADD CHARGE INLINE ── */
.rvm-add-charge { display: flex; gap: 8px; align-items: center; }
.rvm-add-input {
  padding: 9px 12px; border: 1.5px dashed var(--border); border-radius: var(--radius-sm);
  font-size: .85rem; outline: none; font-family: 'Roboto', sans-serif; color: var(--text);
  background: var(--bg); transition: border-color .2s;
}
.rvm-add-input:focus { border-color: var(--gold); background: var(--gold-light); }
.rvm-add-input::placeholder { color: var(--text-muted); }
.rvm-add-btn {
  padding: 9px 16px; border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-weight: 700; font-size: .82rem;
  font-family: 'Roboto', sans-serif; white-space: nowrap;
  transition: background .15s;
}

/* ── RESTAURANT PRE-ORDER ── */
.rvm-restaurant-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: var(--gold-light);
  border: 1.5px solid rgba(219,186,20,.5); border-radius: var(--radius-sm);
  cursor: pointer; font-size: .78rem; font-weight: 700;
  color: #7a5f00; font-family: 'Roboto', sans-serif;
  position: relative; transition: background .15s;
}
.rvm-restaurant-btn:hover { background: rgba(219,186,20,.2); }
.rvm-restaurant-badge {
  position: absolute; top: -7px; right: -7px;
  background: var(--green); color: #fff; border-radius: 50%;
  width: 18px; height: 18px; font-size: .6rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.rvm-restaurant-notice {
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 9px; padding: 10px 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px;
  font-size: .8rem; color: #b45309;
}

/* ── ALERTS ── */
.rvm-alert-err {
  background: #fff3f3; border: 1px solid #ffcdd2; color: var(--red);
  padding: 10px 16px; border-radius: var(--radius-sm);
  margin-bottom: 18px; font-size: .87rem;
  display: flex; align-items: flex-start; gap: 8px;
}
.rvm-alert-ok {
  background: var(--green-light); border: 1px solid #a5d6a7; color: var(--green);
  padding: 10px 16px; border-radius: var(--radius-sm);
  margin-bottom: 18px; font-size: .87rem;
}

/* ── FOOTER BTNS ── */
.rvm-footer { display: flex; gap: 12px; margin-top: 4px; }
.rvm-btn-cancel {
  flex: 1; padding: 13px; background: var(--white);
  border: 2px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Roboto', sans-serif;
  transition: border-color .15s;
}
.rvm-btn-cancel:hover { border-color: #b0c8b0; }
.rvm-btn-confirm {
  flex: 2; padding: 13px; border: none; border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 700;
  color: white; font-family: 'Roboto', sans-serif;
  transition: background .2s;
  position: relative; overflow: hidden;
}
.rvm-btn-confirm::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rvm-btn-confirm:not(:disabled):hover::after { opacity: 1; }
.rvm-btn-confirm:disabled { background: #aaa; cursor: not-allowed; }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .rvm-body { padding: 16px 18px; }
  .rvm-hdr  { padding: 18px 20px; }
  .rvm-partial-grid, .rvm-partial-duo { grid-template-columns: 1fr; }
  .rvm-footer { flex-direction: column; }
  .rvm-btn-cancel, .rvm-btn-confirm { flex: none; width: 100%; }
}
`;

function AddChargeInline({ onAdd }) {
  const [name,   setName]   = React.useState("");
  const [amount, setAmount] = React.useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  const active = name.trim() && amount;
  return (
    <div className="rvm-add-charge">
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Room service, Extra bed..."
        className="rvm-add-input"
        style={{ flex: 2 }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <input
        type="number" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="₱ Amount"
        className="rvm-add-input"
        style={{ flex: 1 }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <button
        className="rvm-add-btn"
        onClick={handle} disabled={!active}
        style={{
          background: active ? "var(--green)" : "#e0e0e0",
          color: active ? "white" : "#aaa",
          cursor: active ? "pointer" : "not-allowed",
        }}
      >
        + Add
      </button>
    </div>
  );
}

export default function ReservationModal({
  editRes,
  form, setForm,
  rooms,
  saving,
  error,
  success,
  onClose,
  onSave,
  calcNights,
  calcRoomOnly,
  calcTotal,
  calcDownpayment,
  calcRemainingBalance,
  selectableRooms,
}) {
  const [showAddOns,    setShowAddOns]    = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  const selectedRoom = rooms.find(r => r.id === form.room_id);
  const restaurantChargesCount = (form.additional_charges || []).filter(c => c.from_restaurant).length;
  const additionalChargesTotal = (form.additional_charges || [])
    .reduce((s, c) => s + parseFloat(c.amount || 0), 0);

  const handleSave = async () => {
    await onSave();
    const restaurantCharges = (form.additional_charges || []).filter(c => c.from_restaurant);
    if (restaurantCharges.length === 0) return;
    try {
      let reservationId = editRes?.id || null;
      if (!reservationId && form.guest_name) {
        const { data: found } = await supabase.from("reservations").select("id").eq("guest_name", form.guest_name.trim()).order("created_at", { ascending: false }).limit(1);
        if (found && found.length > 0) reservationId = found[0].id;
      }
      const orderItems = restaurantCharges.map(c => ({
        id: c.restaurant_item_id || c.id,
        name: c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""),
        price: c.unit_price || c.amount,
        qty: c.qty || 1,
        subtotal: parseFloat(c.amount),
      }));
      const orderTotal  = restaurantCharges.reduce((s, c) => s + parseFloat(c.amount), 0);
      const roomNumber  = selectedRoom?.room_number || form.room_number || "";
      if (reservationId) {
        await supabase.from("restaurant_orders").delete().eq("reservation_id", reservationId).eq("status", "queued");
      }
      await supabase.from("restaurant_orders").insert([{
        reservation_id: reservationId,
        guest_name: form.guest_name,
        room_number: String(roomNumber),
        items: orderItems,
        total_amount: orderTotal,
        status: "queued",
      }]);
    } catch (err) {
      console.error("Failed to queue restaurant pre-order:", err);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rvm-overlay">
        <div className="rvm-box">

          <div className="rvm-hdr">
            <div>
              <h3 className="rvm-hdr-title">{editRes ? "Edit Reservation" : "New Reservation"}</h3>
              <p className="rvm-hdr-sub">{editRes ? "Update reservation details" : "Fill in the details to create a new reservation"}</p>
            </div>
            <button className="rvm-hdr-close" onClick={onClose}>×</button>
          </div>

          <div className="rvm-body">

            {error && (
              <div className="rvm-alert-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            {success && <div className="rvm-alert-ok">✅ {success}</div>}

            <div className="rvm-section">
              <div className="rvm-sec-title">Guest Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="rvm-label">Full Name <span style={{ color: "#e53935" }}>*</span></label>
                  <input type="text" className="rvm-input" value={form.guest_name}
                    onChange={e => setForm({ ...form, guest_name: e.target.value })}
                    placeholder="e.g. Juan Dela Cruz" />
                </div>
                <div>
                  <label className="rvm-label">Email Address</label>
                  <input type="email" className="rvm-input" value={form.guest_email}
                    onChange={e => setForm({ ...form, guest_email: e.target.value })}
                    placeholder="guest@email.com" />
                </div>
                <div>
                  <label className="rvm-label">Phone Number</label>
                  <input type="text" className="rvm-input" value={form.guest_phone}
                    onChange={e => setForm({ ...form, guest_phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX" />
                </div>
              </div>
            </div>

            <div className="rvm-section">
              <div className="rvm-sec-title">Room & Dates</div>

              <div style={{ marginBottom: "14px" }}>
                <label className="rvm-label">Select Room <span style={{ color: "#e53935" }}>*</span></label>
                <button
                  type="button"
                  className={`rvm-room-btn${selectedRoom ? " selected" : ""}`}
                  onClick={() => setShowRoomPicker(true)}
                >
                  <span>
                    {selectedRoom
                      ? `Room ${selectedRoom.room_number} | ${selectedRoom.type} | Floor ${selectedRoom.floor} | ₱${parseFloat(selectedRoom.price).toLocaleString()}/night`
                      : "— Choose an available room —"}
                  </span>
                  <span className="rvm-room-btn-hint">Browse ▾</span>
                </button>
                {selectableRooms.length === 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: ".8rem", color: "var(--orange)" }}>
                    ⚠️ All rooms are currently occupied or under maintenance.
                  </p>
                )}
              </div>

              {selectedRoom && (
                <div className="rvm-room-selected">
                  <div>
                    <span className="rvm-room-name">Room {selectedRoom.room_number}</span>
                    <span className="rvm-room-meta">{selectedRoom.type} · Floor {selectedRoom.floor}</span>
                  </div>
                  <span className="rvm-room-price">₱{parseFloat(selectedRoom.price).toLocaleString()}/night</span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "14px" }}>
                <div>
                  <label className="rvm-label">Check-In Date <span style={{ color: "#e53935" }}>*</span></label>
                  <input type="date" className="rvm-input" value={form.check_in}
                    onChange={e => setForm({ ...form, check_in: e.target.value })} />
                </div>
                <div>
                  <label className="rvm-label">
                    Check-Out Date{" "}
                    <span style={{ fontSize: ".72rem", color: "var(--text-muted)", fontWeight: "400", textTransform: "none" }}>(optional)</span>
                  </label>
                  <input type="date" className="rvm-input" value={form.check_out}
                    onChange={e => setForm({ ...form, check_out: e.target.value })} />
                </div>
              </div>

              {selectedRoom && (
                <div className="rvm-pricing">
                  {form.check_out ? (
                    <>
                      <div className="rvm-pricing-row">
                        <span className="rvm-pricing-label">{calcNights()} night{calcNights() !== 1 ? "s" : ""} × ₱{parseFloat(selectedRoom.price).toLocaleString()}</span>
                        <span className="rvm-pricing-value">Room: ₱{calcRoomOnly().toLocaleString()}</span>
                      </div>
                      {additionalChargesTotal > 0 && (
                        <>
                          <hr className="rvm-pricing-sep" />
                          <div className="rvm-pricing-row">
                            <span className="rvm-pricing-sub-label">Additional charges</span>
                            <span className="rvm-pricing-sub-value">+₱{additionalChargesTotal.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="rvm-pricing-row">
                      <span className="rvm-pricing-label">Open Stay · ₱{parseFloat(selectedRoom.price).toLocaleString()}/night</span>
                      <span className="rvm-pricing-value">Per night: ₱{parseFloat(selectedRoom.price).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {selectedRoom && form.check_out && calcTotal() > 0 && (
                <div>
                  <div
                    className="rvm-partial-toggle"
                    style={{
                      borderColor: form.partial_payment ? "#f57f17" : "var(--border)",
                      background: form.partial_payment ? "var(--orange-light)" : "#f8f9fa",
                    }}
                    onClick={() => setForm({ ...form, partial_payment: !form.partial_payment })}
                  >
                    <div
                      className="rvm-partial-check"
                      style={{
                        borderColor: form.partial_payment ? "#f57f17" : "#ccc",
                        background: form.partial_payment ? "#f57f17" : "white",
                      }}
                    >
                      {form.partial_payment && <span style={{ color: "white", fontSize: ".72rem", fontWeight: "700" }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", fontSize: ".88rem", color: form.partial_payment ? "var(--orange)" : "var(--text)" }}>
                        Partial Payment (30% Downpayment)
                      </div>
                      <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: "1px" }}>
                        30% of room rate due now — remaining balance at check-in or check-out
                      </div>
                    </div>
                    {form.partial_payment && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: ".68rem", color: "#f57f17", fontWeight: "700", textTransform: "uppercase" }}>Due Now</div>
                        <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--orange)" }}>₱{calcDownpayment().toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {form.partial_payment && (
                    <div className="rvm-partial-breakdown">
                      <div className="rvm-partial-grid">
                        {[["Room Rate", `₱${calcRoomOnly().toLocaleString()}`], ["Additional Charges", `₱${additionalChargesTotal.toLocaleString()}`]].map(([lbl, val]) => (
                          <div key={lbl} className="rvm-partial-box">
                            <div className="rvm-partial-lbl">{lbl}</div>
                            <div className="rvm-partial-val">{val}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rvm-partial-duo">
                        <div className="rvm-partial-due">
                          <div className="rvm-partial-due-lbl">30% Due Now (Room Rate Only)</div>
                          <div className="rvm-partial-due-val">₱{calcDownpayment().toLocaleString()}</div>
                        </div>
                        <div className="rvm-partial-bal">
                          <div className="rvm-partial-bal-lbl">Remaining Balance</div>
                          <div className="rvm-partial-bal-val">₱{calcRemainingBalance().toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="rvm-partial-note">
                        ⚠ Remaining balance of ₱{calcRemainingBalance().toLocaleString()} will be collected at check-in or check-out
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rvm-section">
              <div className="rvm-sec-title">Status & Notes</div>
              <div style={{ marginBottom: "14px" }}>
                <label className="rvm-label">Reservation Status</label>
                <select className="rvm-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ cursor: "pointer" }}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="rvm-label">Notes / Special Requests</label>
                <textarea
                  className="rvm-input" value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requests, preferences, or notes..."
                  rows={3} style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div className="rvm-section" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: 8 }}>
                <div className="rvm-sec-title" style={{ marginBottom: 0 }}>Additional Charges</div>
                <button className="rvm-restaurant-btn" onClick={() => setShowAddOns(true)}>
                  <RiRestaurantLine size={14} />
                  Restaurant Pre-Order
                  {restaurantChargesCount > 0 && (
                    <span className="rvm-restaurant-badge">{restaurantChargesCount}</span>
                  )}
                </button>
              </div>

              {restaurantChargesCount > 0 && (
                <div className="rvm-restaurant-notice">
                  <RiRestaurantLine size={14} />
                  <span>
                    <strong>{restaurantChargesCount} restaurant pre-order{restaurantChargesCount !== 1 ? "s" : ""}</strong> will be saved to the Restaurant as Queued — they move to Active Orders once the guest checks in.
                  </span>
                </div>
              )}

              {(form.additional_charges || []).length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  {(form.additional_charges || []).map(c => (
                    <div
                      key={c.id}
                      className="rvm-charge-item"
                      style={{
                        background: c.from_restaurant ? "#fffbeb" : "#f8fdf8",
                        borderColor: c.from_restaurant ? "#fde68a" : "var(--border)",
                      }}
                    >
                      <span className="rvm-charge-name">
                        {c.from_restaurant && <RiRestaurantLine size={12} color="#b45309" />}
                        {c.name}
                        {c.from_restaurant && <span className="rvm-charge-queued">queued</span>}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="rvm-charge-amount" style={{ color: c.from_restaurant ? "#b45309" : "var(--green)" }}>
                          ₱{parseFloat(c.amount).toLocaleString()}
                        </span>
                        <button
                          className="rvm-charge-del"
                          onClick={() => setForm({ ...form, additional_charges: (form.additional_charges || []).filter(x => x.id !== c.id) })}
                        >
                          <RiDeleteBinLine size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <AddChargeInline
                onAdd={charge => setForm({ ...form, additional_charges: [...(form.additional_charges || []), charge] })}
              />
            </div>

            <div className="rvm-footer">
              <button className="rvm-btn-cancel" onClick={onClose}>Cancel</button>
              <button
                className="rvm-btn-confirm"
                onClick={handleSave} disabled={saving}
                style={{ background: saving ? "#aaa" : "var(--green)", boxShadow: saving ? "none" : "0 4px 14px rgba(7,113,60,.28)" }}
              >
                {saving ? "Saving..." : editRes ? "Save Changes" : "Create Reservation"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {showAddOns && (
        <RestaurantAddOnsModal
          reservationId={editRes?.id || null}
          guestName={form.guest_name}
          roomNumber={form.room_number || ""}
          isCheckedIn={false}
          onClose={() => setShowAddOns(false)}
          onConfirm={(charges) => {
            const markedCharges = charges.map(c => ({ ...c, from_restaurant: true }));
            setForm(prev => ({
              ...prev,
              additional_charges: [...(prev.additional_charges || []), ...markedCharges],
            }));
            setShowAddOns(false);
          }}
        />
      )}
      {showRoomPicker && (  
        <RoomPickerModal
          rooms={selectableRooms}
          selectedRoomId={form.room_id}
          onSelect={r => setForm({ ...form, room_id: r.id })}
          onClose={() => setShowRoomPicker(false)}
        />
      )}
    </>
  );
}