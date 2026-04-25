import React, { useState } from "react";
import {
  RiLoginBoxLine,
  RiUserLine,
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiDeleteBinLine,
  RiRestaurantLine,
} from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";
import supabase from "../supabaseClient";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c; --green-dark: #055a2f; --green-light: #e8f5ee;
  --gold: #dbba14; --gold-light: #fdf8e1;
  --orange: #e65100; --orange-light: #fff3e0;
  --bg: #f4f6f0; --white: #ffffff; --border: #e2e8e2;
  --text: #1a2e1a; --text-sec: #5a6e5a; --text-muted: #8fa08f;
  --radius: 12px; --radius-sm: 8px;
  --shadow-sm: 0 1px 4px rgba(0,0,0,0.06);
}

.cim-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px; overflow-y: auto;
  font-family: 'Roboto', sans-serif;
}
.cim-box {
  background: var(--bg); border-radius: 20px;
  width: min(640px, 95vw); max-height: 92vh; overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,.25);
}
.cim-box::-webkit-scrollbar { width: 4px; }
.cim-box::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 10px; }

/* ── HEADER ── */
.cim-hdr {
  background: var(--green);
  border-radius: 20px 20px 0 0; padding: 22px 28px;
  display: flex; justify-content: space-between; align-items: center;
  position: relative; overflow: hidden;
}
.cim-hdr::before {
  content: ''; position: absolute;
  width: 220px; height: 220px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,0.12);
  top: -80px; right: -60px; pointer-events: none;
}
.cim-hdr::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px; background: var(--gold);
}
.cim-hdr-title {
  margin: 0; color: white; font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px; position: relative; z-index: 1;
}
.cim-hdr-sub  { margin: 4px 0 0; color: rgba(255,255,255,.65); font-size: .82rem; position: relative; z-index: 1; }
.cim-hdr-close {
  background: rgba(255,255,255,.12); border: none;
  width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; color: white; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; position: relative; z-index: 1; flex-shrink: 0;
}
.cim-hdr-close:hover { background: rgba(255,255,255,.26); }

/* ── BODY ── */
.cim-body { padding: 22px 28px; }

/* ── SECTION ── */
.cim-section {
  background: var(--white); border-radius: var(--radius);
  padding: 16px 18px; margin-bottom: 14px;
  box-shadow: var(--shadow-sm); border: 1px solid var(--border);
}
.cim-sec-title {
  font-size: .7rem; font-weight: 700; color: var(--green);
  text-transform: uppercase; letter-spacing: .1em; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.cim-sec-title::before {
  content: ''; display: inline-block;
  width: 14px; height: 2px; background: var(--gold); border-radius: 1px;
}

/* ── INFO GRID ── */
.cim-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cim-info-box { background: var(--bg); border-radius: var(--radius-sm); padding: 10px 12px; }
.cim-info-lbl { color: var(--text-muted); font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; }
.cim-info-val { font-weight: 600; color: var(--text); margin-top: 2px; font-size: .87rem; }

/* ── DOWNPAYMENT BOX ── */
.cim-downpay {
  margin-top: 10px; background: var(--gold-light);
  border: 1.5px solid rgba(219,186,20,.4); border-radius: 9px; padding: 11px 14px;
}
.cim-downpay-title {
  font-size: .7rem; font-weight: 700; color: #7a5f00;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px;
}
.cim-downpay-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
.cim-downpay-box  { background: white; border-radius: var(--radius-sm); padding: 7px 10px; text-align: center; }
.cim-downpay-lbl  { font-size: .62rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }
.cim-downpay-val  { font-size: .88rem; font-weight: 700; color: var(--text-sec); }

/* ── CHARGES ── */
.cim-charge-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 10px; background: var(--green-light);
  border: 1px solid #bbf7d0; border-radius: var(--radius-sm); margin-bottom: 5px;
}
.cim-charge-name { font-size: .84rem; color: var(--text); }
.cim-charge-del  { background: none; border: none; cursor: pointer; color: #e53935; display: flex; align-items: center; padding: 0 2px; }

/* ── BALANCE BOX ── */
.cim-balance {
  display: flex; justify-content: space-between; align-items: center;
  padding: 11px 14px; margin-top: 14px;
  background: var(--orange-light); border: 1.5px solid #ffb74d; border-radius: 10px;
}
.cim-balance-lbl  { font-size: .86rem; font-weight: 700; color: var(--orange); }
.cim-balance-sub  { font-size: .7rem; color: var(--text-muted); margin-top: 2px; }
.cim-balance-val  { font-weight: 900; color: var(--orange); font-size: 1.1rem; letter-spacing: -0.01em; }

/* ── PAYMENT OPTIONS ── */
.cim-pay-opt {
  flex: 1; padding: 11px; border: 1.5px solid; border-radius: 10px;
  cursor: pointer; transition: all .15s;
}
.cim-pay-opt-label { font-weight: 700; font-size: .84rem; color: var(--text); }
.cim-pay-opt-sub   { font-size: .72rem; color: var(--text-muted); margin-top: 2px; }

/* ── PAYMENT METHODS ── */
.cim-pay-method {
  flex: 1; padding: 8px 4px; border-radius: var(--radius-sm);
  cursor: pointer; font-size: .74rem; font-weight: 700;
  font-family: 'Roboto', sans-serif; transition: all .15s; text-align: center;
}

/* ── FULLY PAID TOGGLE ── */
.cim-paid-toggle {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 10px; border: 2px solid;
  cursor: pointer; margin-bottom: 14px; transition: all .2s;
}
.cim-paid-check {
  width: 22px; height: 22px; border-radius: 50%; border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all .2s;
}

/* ── ADD CHARGE ROW ── */
.cim-add-row { display: flex; gap: 8px; align-items: center; }
.cim-add-input {
  padding: 9px 12px; border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm); font-size: .85rem; outline: none;
  font-family: 'Roboto', sans-serif; color: var(--text); background: var(--bg);
  transition: border-color .2s;
}
.cim-add-input:focus { border-color: var(--gold); background: var(--gold-light); }
.cim-add-input::placeholder { color: var(--text-muted); }
.cim-add-btn {
  padding: 9px 14px; border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-weight: 700; font-size: .82rem;
  font-family: 'Roboto', sans-serif; display: inline-flex; align-items: center; gap: 4px;
  white-space: nowrap; transition: background .15s;
}

/* ── PAY LATER BOX ── */
.cim-paylater-box {
  background: var(--gold-light); border: 1px solid rgba(219,186,20,.4);
  border-radius: 10px; padding: 14px 18px; margin-bottom: 14px;
}

/* ── ALERTS ── */
.cim-alert-ok {
  background: var(--green-light); border: 1px solid #a5d6a7;
  border-radius: 10px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center;
}
.cim-alert-warn {
  background: var(--gold-light); border: 1px solid rgba(219,186,20,.4);
  border-radius: 10px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center;
}
.cim-alert-change {
  background: var(--green-light); border: 1px solid #a5d6a7;
  border-radius: 10px; padding: 12px 16px; margin-bottom: 8px;
  display: flex; justify-content: space-between; align-items: center;
}

/* ── RESTAURANT BTN ── */
.cim-restaurant-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; background: var(--gold-light);
  border: 1.5px solid rgba(219,186,20,.5); border-radius: var(--radius-sm);
  cursor: pointer; font-size: .78rem; font-weight: 700;
  color: #7a5f00; font-family: 'Roboto', sans-serif;
  position: relative; transition: background .15s;
}
.cim-restaurant-btn:hover { background: rgba(219,186,20,.2); }
.cim-restaurant-badge {
  position: absolute; top: -7px; right: -7px;
  background: var(--green); color: #fff; border-radius: 50%;
  width: 18px; height: 18px; font-size: .62rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.cim-restaurant-notice {
  background: var(--green-light); border: 1px solid #a7f3d0;
  border-radius: 9px; padding: 10px 14px; margin-bottom: 12px;
  display: flex; align-items: center; gap: 8px; font-size: .8rem; color: #065f46;
}

/* ── FOOTER ── */
.cim-footer { display: flex; gap: 12px; }
.cim-btn-cancel {
  flex: 1; padding: 13px; background: var(--white);
  border: 2px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Roboto', sans-serif; transition: border-color .15s;
}
.cim-btn-cancel:hover { border-color: #b0c8b0; }
.cim-btn-cancel:disabled { cursor: not-allowed; }
.cim-btn-confirm {
  flex: 2; padding: 13px; border: none; border-radius: 10px;
  cursor: pointer; font-size: .9rem; font-weight: 700; color: white;
  font-family: 'Roboto', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  transition: background .2s; position: relative; overflow: hidden;
}
.cim-btn-confirm::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px; background: var(--gold); opacity: 0; transition: opacity .2s;
}
.cim-btn-confirm:not(:disabled):hover::after { opacity: 1; }
.cim-btn-confirm:disabled { cursor: not-allowed; }

/* ── RESPONSIVE ── */
@media (max-width: 640px) {
  .cim-body { padding: 16px 18px; }
  .cim-hdr  { padding: 18px 20px; }
  .cim-info-grid { grid-template-columns: 1fr; }
  .cim-downpay-grid { grid-template-columns: 1fr; gap: 6px; }
  .cim-footer { flex-direction: column; }
  .cim-btn-cancel, .cim-btn-confirm { flex: none; width: 100%; }
}
`;

function AddChargeRow({ onAdd }) {
  const [name,   setName]   = useState("");
  const [amount, setAmount] = useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  const active = name.trim() && amount;
  return (
    <div className="cim-add-row">
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Extra pillow, Room service..."
        className="cim-add-input" style={{ flex: 2 }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <input
        type="number" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="₱ Amount"
        className="cim-add-input" style={{ flex: "0 0 110px" }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <button
        className="cim-add-btn" onClick={handle} disabled={!active}
        style={{ background: active ? "var(--green)" : "#e0e0e0", color: active ? "white" : "#aaa", cursor: active ? "pointer" : "not-allowed" }}
      >
        <RiAddLine size={13} />Add
      </button>
    </div>
  );
}

export default function CheckInModal({ selected, onClose, onConfirm, processing }) {
  const allResCharges = (() => { try { return JSON.parse(selected?.additional_charges || "[]"); } catch { return []; } })();

  const [payLater,          setPayLater]          = useState(false);
  const [paymentMethod,     setPaymentMethod]     = useState("cash");
  const [fullyPaid,         setFullyPaid]         = useState(false);
  const [amountReceived,    setAmountReceived]    = useState("");
  const [additionalCharges, setAdditionalCharges] = useState(allResCharges.map(c => ({ ...c })));
  const [showAddOns,        setShowAddOns]        = useState(false);
  const [sendingOrder,      setSendingOrder]      = useState(false);

  if (!selected) return null;

  const reservationDownpayment    = parseFloat(selected?.amount_paid || 0);
  const hasReservationDownpayment = selected?.pay_later && reservationDownpayment > 0;

  const nights   = (selected.check_in && selected.check_out)
    ? Math.max(0, Math.round((new Date(selected.check_out) - new Date(selected.check_in)) / 86400000))
    : null;
  const durationLabel = nights !== null ? `${nights} night${nights !== 1 ? "s" : ""}` : "Open-ended";

  const baseTotal        = parseFloat(selected?.total_amount || 0);
  const chargesTotal     = additionalCharges.filter(c => !allResCharges.some(rc => rc.id === c.id)).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const totalBill        = baseTotal + chargesTotal;
  const allResChargesSum = allResCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const roomrate         = baseTotal - allResChargesSum;
  const grandTotal       = baseTotal + chargesTotal;
  const remainingBalance = Math.max(0, totalBill - reservationDownpayment);
  const amtReceived      = parseFloat(amountReceived || 0);
  const change           = fullyPaid ? 0 : Math.max(0, amtReceived - remainingBalance);
  const balance          = fullyPaid ? 0 : Math.max(0, remainingBalance - amtReceived);

  const handleConfirm = async () => {
    setSendingOrder(true);
    try {
      const { data: roomCheck } = await supabase.from("rooms").select("status, room_number").eq("id", selected.room_id).single();
      if (roomCheck && roomCheck.status === "occupied") {
        alert(`⚠️ Room ${selected.room_number} is already occupied.\n\nAnother guest has already checked into this room.\nPlease use Edit Room to assign a different room.`);
        setSendingOrder(false); onClose(); return;
      }

      if (selected?.id) {
        const { data: queuedOrders } = await supabase.from("restaurant_orders").select("*").eq("reservation_id", selected.id).eq("status", "queued");
        if (queuedOrders && queuedOrders.length > 0) {
          await supabase.from("restaurant_orders").update({ status: "pending", updated_at: new Date().toISOString() }).eq("reservation_id", selected.id).eq("status", "queued");
          for (const order of queuedOrders) {
            const items   = Array.isArray(order.items) ? order.items : [];
            const summary = items.map(i => `${i.name} ×${i.qty}`).join(", ");
            await supabase.from("notifications").insert([{ type: "restaurant_order", title: `🍽 New Order — Room ${selected.room_number || "?"}`, message: `${selected.guest_name}: ${summary} · ₱${parseFloat(order.total_amount).toLocaleString()}`, nav_target: "Restaurant", is_read: false, target_role: "restaurant" }]);
          }
        }
      }

      const freshRestaurantCharges = additionalCharges.filter(c => c.from_restaurant && !allResCharges.some(rc => rc.id === c.id));
      if (freshRestaurantCharges.length > 0) {
        const orderItems  = freshRestaurantCharges.map(c => ({ id: c.restaurant_item_id || c.id, name: c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""), price: c.unit_price || c.amount, qty: c.qty || 1, subtotal: parseFloat(c.amount) }));
        const orderTotal  = freshRestaurantCharges.reduce((s, c) => s + parseFloat(c.amount), 0);
        await supabase.from("restaurant_orders").insert([{ reservation_id: selected?.id || null, guest_name: selected.guest_name, room_number: String(selected.room_number || ""), items: orderItems, total_amount: orderTotal, status: "pending" }]);
        const summary = orderItems.map(i => `${i.name} ×${i.qty}`).join(", ");
        await supabase.from("notifications").insert([{ type: "restaurant_order", title: `🍽 New Order — Room ${selected.room_number || "?"}`, message: `${selected.guest_name}: ${summary} · ₱${orderTotal.toLocaleString()}`, nav_target: "Restaurant", is_read: false, target_role: "restaurant" }]);
      }

      const paidAmt   = payLater ? reservationDownpayment : fullyPaid ? totalBill : reservationDownpayment + amtReceived;
      const isPartial = !payLater && !fullyPaid && paidAmt < totalBill && paidAmt > 0;
      setSendingOrder(false);
      onConfirm({ paidAmt, payLater, isPartial, paymentMethod, additionalCharges });
    } catch (err) {
      console.error("handleConfirm error:", err);
      alert("Something went wrong: " + (err.message || "Unknown error"));
      setSendingOrder(false);
    }
  };

  const restaurantChargesCount = additionalCharges.filter(c => c.from_restaurant).length;
  const isProcessing           = processing || sendingOrder;
  const isConfirmDisabled      = isProcessing || (!payLater && !fullyPaid && amtReceived <= 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="cim-overlay">
        <div className="cim-box">

          <div className="cim-hdr">
            <div>
              <h3 className="cim-hdr-title"><RiLoginBoxLine size={20} /> Process Check-In</h3>
              <p className="cim-hdr-sub">Confirm guest arrival and collect payment</p>
            </div>
            <button className="cim-hdr-close" onClick={onClose}>×</button>
          </div>

          <div className="cim-body">

            <div className="cim-section">
              <div className="cim-sec-title"><RiUserLine size={13} /> Reservation Summary</div>
              <div className="cim-info-grid">
                {[
                  ["Guest",     selected.guest_name],
                  ["Room",      `Room ${selected.room_number}`],
                  ["Check-In",  selected.check_in],
                  ["Check-Out", selected.check_out || "Open Stay"],
                  ["Duration",  durationLabel],
                  ["Room Rate", `₱${roomrate.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} className="cim-info-box">
                    <div className="cim-info-lbl">{k}</div>
                    <div className="cim-info-val">{v}</div>
                  </div>
                ))}
                {selected.notes && (
                  <div style={{ gridColumn: "1 / -1", background: "#fffdf0", border: "1px solid #f0de7a", borderRadius: "var(--radius-sm)", padding: "10px 12px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "1px" }}>📝</span>
                    <div>
                      <div className="cim-info-lbl" style={{ color: "#b45309" }}>Notes / Special Requests</div>
                      <div style={{ fontWeight: "500", color: "#7a6500", fontSize: ".87rem", lineHeight: "1.5" }}>{selected.notes}</div>
                    </div>
                  </div>
                )}
              </div>

              {hasReservationDownpayment && (
                <div className="cim-downpay">
                  <div className="cim-downpay-title">⚡ 30% Downpayment on File</div>
                  <div className="cim-downpay-grid">
                    {[["Grand Total", `₱${grandTotal.toLocaleString()}`], ["Paid (30%)", `₱${reservationDownpayment.toLocaleString()}`], ["Balance Due", `₱${Math.max(0, baseTotal - reservationDownpayment + chargesTotal).toLocaleString()}`]].map(([lbl, val]) => (
                      <div key={lbl} className="cim-downpay-box">
                        <div className="cim-downpay-lbl">{lbl}</div>
                        <div className="cim-downpay-val" style={{ color: lbl === "Balance Due" ? "var(--orange)" : "var(--text-sec)" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: ".72rem", color: "var(--text-muted)", marginTop: "7px", fontStyle: "italic" }}>Remaining balance will be collected at check-out.</div>
                </div>
              )}
            </div>

            <div className="cim-section">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", flexWrap: "wrap", gap: 8 }}>
                <div className="cim-sec-title" style={{ marginBottom: 0 }}>
                  <RiMoneyDollarCircleLine size={13} /> Additional Charges at Check-In
                </div>
                <button className="cim-restaurant-btn" onClick={() => setShowAddOns(true)}>
                  <RiRestaurantLine size={14} />
                  Restaurant Add-Ons
                  {restaurantChargesCount > 0 && <span className="cim-restaurant-badge">{restaurantChargesCount}</span>}
                </button>
              </div>

              {restaurantChargesCount > 0 && (
                <div className="cim-restaurant-notice">
                  <RiRestaurantLine size={14} />
                  <span>
                    <strong>{restaurantChargesCount} restaurant item{restaurantChargesCount !== 1 ? "s" : ""}</strong> staged — order fires to the kitchen when you confirm check-in.
                  </span>
                </div>
              )}

              {additionalCharges.map(c => (
                <div key={c.id} className="cim-charge-item">
                  <span className="cim-charge-name">{c.name.replace(/^\[Restaurant\] /, "")}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: "700", color: "var(--green)", fontSize: ".84rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                    <button className="cim-charge-del" onClick={() => setAdditionalCharges(prev => prev.filter(x => x.id !== c.id))}>
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <AddChargeRow onAdd={c => setAdditionalCharges(prev => [...prev, c])} />

              <div className="cim-balance">
                <div>
                  <div className="cim-balance-lbl">Remaining Balance</div>
                  <div className="cim-balance-sub">
                    {hasReservationDownpayment
                      ? `₱${totalBill.toLocaleString()} total − ₱${reservationDownpayment.toLocaleString()} downpayment`
                      : chargesTotal > 0
                        ? `Room ₱${baseTotal.toLocaleString()} + Charges ₱${chargesTotal.toLocaleString()}`
                        : `Room rate ₱${baseTotal.toLocaleString()}`
                    }
                  </div>
                </div>
                <span className="cim-balance-val">₱{remainingBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="cim-section">
              <div className="cim-sec-title"><RiMoneyDollarCircleLine size={13} /> Payment Option</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { val: false, label: "Pay Now",          sub: "Collect full or partial now" },
                  { val: true,  label: "Pay at Check-Out", sub: hasReservationDownpayment ? `₱${reservationDownpayment.toLocaleString()} downpayment kept — balance at check-out` : "Collect when guest leaves" },
                ].map(opt => (
                  <div
                    key={String(opt.val)}
                    className="cim-pay-opt"
                    onClick={() => setPayLater(opt.val)}
                    style={{
                      borderColor: payLater === opt.val ? "var(--green)" : "var(--border)",
                      background: payLater === opt.val ? "var(--green-light)" : "var(--white)",
                    }}
                  >
                    <div className="cim-pay-opt-label">{opt.label}</div>
                    <div className="cim-pay-opt-sub">{opt.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {!payLater && (
              <>
                <div className="cim-section">
                  <div className="cim-sec-title"><RiMoneyDollarCircleLine size={13} /> Payment Method</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["cash", "card", "gcash", "bank_transfer"].map(m => (
                      <button key={m} className="cim-pay-method" onClick={() => setPaymentMethod(m)}
                        style={{
                          border: `2px solid ${paymentMethod === m ? "var(--green)" : "var(--border)"}`,
                          background: paymentMethod === m ? "var(--green-light)" : "var(--white)",
                          color: paymentMethod === m ? "var(--green)" : "var(--text-muted)",
                        }}>
                        {m === "cash" ? "Cash" : m === "card" ? "Card" : m === "gcash" ? "GCash" : "Bank"}<br />
                        <span style={{ fontSize: ".65rem", fontWeight: "400", color: "var(--text-muted)" }}>
                          {m === "cash" ? "💵" : m === "card" ? "💳" : m === "gcash" ? "📱" : "🏦"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cim-section">
                  <div className="cim-sec-title"><RiMoneyDollarCircleLine size={13} /> Collect Payment</div>

                  <div
                    className="cim-paid-toggle"
                    style={{ borderColor: fullyPaid ? "#4caf50" : "var(--border)", background: fullyPaid ? "var(--green-light)" : "#f8f9fa" }}
                    onClick={() => { setFullyPaid(f => !f); if (!fullyPaid) setAmountReceived(totalBill.toString()); }}
                  >
                    <div className="cim-paid-check" style={{ borderColor: fullyPaid ? "#4caf50" : "#ccc", background: fullyPaid ? "#4caf50" : "white" }}>
                      {fullyPaid && <span style={{ color: "white", fontSize: ".72rem", fontWeight: "700" }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: ".9rem", color: fullyPaid ? "#1b5e20" : "var(--text)" }}>Guest has fully paid</div>
                      <div style={{ fontSize: ".76rem", color: "var(--text-muted)", marginTop: "1px" }}>Mark as fully settled — ₱{totalBill.toLocaleString()} total</div>
                    </div>
                  </div>

                  {!fullyPaid && (
                    <>
                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: ".72rem", fontWeight: "700", color: "var(--text-sec)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: ".06em" }}>
                          Amount Received (₱)
                        </label>
                        <input
                          type="number" value={amountReceived}
                          onChange={e => setAmountReceived(e.target.value)}
                          placeholder="Enter amount given by guest"
                          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "1rem", fontWeight: "700", fontFamily: "Roboto,sans-serif", outline: "none", background: "var(--white)", transition: "border-color .2s", MozAppearance: "textfield" }}
                          onFocus={e => e.target.style.borderColor = "var(--green)"}
                          onBlur={e => e.target.style.borderColor = "var(--border)"}
                        />
                        <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}`}</style>
                      </div>
                      {change > 0 && (
                        <div className="cim-alert-change">
                          <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: ".9rem" }}>💵 Change to return</span>
                          <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{change.toLocaleString()}</span>
                        </div>
                      )}
                      {amtReceived > 0 && balance > 0 && (
                        <div className="cim-alert-warn">
                          <span style={{ color: "var(--orange)", fontWeight: "700", fontSize: ".87rem" }}>⚠ Balance due at Check-Out</span>
                          <span style={{ color: "var(--orange)", fontWeight: "900", fontSize: "1.1rem" }}>₱{balance.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  {fullyPaid && (
                    <div className="cim-alert-ok">
                      <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: ".92rem" }}>✅ Payment fully settled — ₱{totalBill.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {payLater && (
              <div className="cim-paylater-box">
                <div style={{ fontWeight: "700", fontSize: ".88rem", color: "#7a5f00", marginBottom: "3px" }}>
                  {hasReservationDownpayment ? "Remaining balance at Check-Out" : "Full payment at Check-Out"}
                </div>
                <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
                  {hasReservationDownpayment
                    ? `₱${remainingBalance.toLocaleString()} remaining (after ₱${reservationDownpayment.toLocaleString()} downpayment) will be collected when guest leaves.`
                    : `Total of ₱${totalBill.toLocaleString()} will be collected when guest leaves.`
                  }
                </div>
              </div>
            )}

            <div className="cim-footer">
              <button className="cim-btn-cancel" onClick={onClose} disabled={isProcessing}>Cancel</button>
              <button
                className="cim-btn-confirm"
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                style={{ background: isConfirmDisabled ? "#aaa" : "var(--green)", boxShadow: isConfirmDisabled ? "none" : "0 4px 14px rgba(7,113,60,.25)" }}
              >
                <RiLoginBoxLine size={16} />
                {sendingOrder ? "Sending to Kitchen…" : isProcessing ? "Processing..." : "Confirm Check-In"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {showAddOns && (
        <RestaurantAddOnsModal
          reservationId={selected?.id}
          guestName={selected?.guest_name}
          roomNumber={selected?.room_number}
          isCheckedIn={true}
          onClose={() => setShowAddOns(false)}
          onConfirm={(charges) => { setAdditionalCharges(prev => [...prev, ...charges]); setShowAddOns(false); }}
        />
      )}
    </>
  );
}