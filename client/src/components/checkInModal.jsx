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

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
  borderRadius: "8px", fontSize: "0.9rem", outline: "none",
  fontFamily: "Arial,sans-serif", boxSizing: "border-box",
  background: "white", transition: "border 0.2s",
};
const labelStyle = {
  display: "block", fontSize: "0.8rem", fontWeight: "700",
  color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px",
};
const sectionTitle = (color = "#07713c") => ({
  fontSize: "0.78rem", fontWeight: "700", color,
  textTransform: "uppercase", letterSpacing: "0.8px",
  marginBottom: "12px", display: "flex", alignItems: "center", gap: "5px",
});
const card = {
  background: "white", borderRadius: "12px", padding: "16px 20px",
  marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};

function AddChargeRow({ onAdd }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Extra pillow, Room service..."
        style={{ flex: 2, padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <input
        type="number" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="₱ Amount"
        style={{ flex: "0 0 110px", padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <button
        onClick={handle} disabled={!name.trim() || !amount}
        style={{ padding: "9px 14px", background: name.trim() && amount ? "#07713c" : "#e0e0e0", color: name.trim() && amount ? "white" : "#aaa", border: "none", borderRadius: "8px", cursor: name.trim() && amount ? "pointer" : "not-allowed", fontWeight: "700", fontSize: "0.82rem", fontFamily: "Arial,sans-serif", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        <RiAddLine size={13} />Add
      </button>
    </div>
  );
}

export default function CheckInModal({ selected, onClose, onConfirm, processing }) {
  const allResCharges = (() => {
    try { return JSON.parse(selected?.additional_charges || "[]"); } catch { return []; }
  })();

  const [payLater,          setPayLater]          = useState(false);
  const [paymentMethod,     setPaymentMethod]     = useState("cash");
  const [fullyPaid,         setFullyPaid]         = useState(false);
  const [amountReceived,    setAmountReceived]    = useState("");
  const [additionalCharges, setAdditionalCharges] = useState(
    allResCharges.map(c => ({ ...c }))
  );
  const [showAddOns,   setShowAddOns]   = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);

  if (!selected) return null;

  const resNonRestaurantCharges = allResCharges.filter(c => !c.from_restaurant);

  const reservationDownpayment    = parseFloat(selected?.amount_paid || 0);
  const hasReservationDownpayment = selected?.pay_later && reservationDownpayment > 0;

  const nights   = (selected.check_in && selected.check_out)
    ? Math.max(0, Math.round((new Date(selected.check_out) - new Date(selected.check_in)) / 86400000))
    : null;

  const baseTotal    = parseFloat(selected?.total_amount || 0);
  const chargesTotal = additionalCharges
  .filter(c => !allResCharges.some(rc => rc.id === c.id))
  .reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const totalBill    = baseTotal + chargesTotal;
  const allResChargesSum = allResCharges.reduce((s, c) => s + parseFloat(c.amount || 0), 0);
  const roomrate = baseTotal - allResChargesSum;
  const grandTotal = baseTotal + chargesTotal;

  const remainingBalance = Math.max(0, totalBill - reservationDownpayment);
  const amtReceived      = parseFloat(amountReceived || 0);
  const change  = fullyPaid ? 0 : Math.max(0, amtReceived - remainingBalance);
  const balance = fullyPaid ? 0 : Math.max(0, remainingBalance - amtReceived);  


  const durationLabel = nights !== null
    ? `${nights} night${nights !== 1 ? "s" : ""}`
    : "Open-ended";

  const handleConfirm = async () => {
    setSendingOrder(true);

    if (selected?.id) {
      const { data: queuedOrders } = await supabase
        .from("restaurant_orders")
        .select("*")
        .eq("reservation_id", selected.id)
        .eq("status", "queued");

      if (queuedOrders && queuedOrders.length > 0) {
        await supabase
          .from("restaurant_orders")
          .update({ status: "pending", updated_at: new Date().toISOString() })
          .eq("reservation_id", selected.id)
          .eq("status", "queued");

        for (const order of queuedOrders) {
          const items   = Array.isArray(order.items) ? order.items : [];
          const summary = items.map(i => `${i.name} ×${i.qty}`).join(", ");
          await supabase.from("notifications").insert([{
            type:        "restaurant_order",
            title:       `🍽 New Order — Room ${selected.room_number || "?"}`,
            message:     `${selected.guest_name}: ${summary} · ₱${parseFloat(order.total_amount).toLocaleString()}`,
            nav_target:  "Restaurant",
            is_read:     false,
            target_role: "restaurant",
          }]);
        }
      }
    }

    const freshRestaurantCharges = additionalCharges.filter(c =>
      c.from_restaurant && !allResCharges.some(rc => rc.id === c.id)
    );

    if (freshRestaurantCharges.length > 0) {
      const orderItems = freshRestaurantCharges.map(c => ({
        id:       c.restaurant_item_id || c.id,
        name:     c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""),
        price:    c.unit_price || c.amount,
        qty:      c.qty || 1,
        subtotal: parseFloat(c.amount),
      }));
      const orderTotal = freshRestaurantCharges.reduce((s, c) => s + parseFloat(c.amount), 0);

      await supabase.from("restaurant_orders").insert([{
        reservation_id: selected?.id || null,
        guest_name:     selected.guest_name,
        room_number:    String(selected.room_number || ""),
        items:          orderItems,
        total_amount:   orderTotal,
        status:         "pending",
      }]);

      const summary = orderItems.map(i => `${i.name} ×${i.qty}`).join(", ");
      await supabase.from("notifications").insert([{
        type:        "restaurant_order",
        title:       `🍽 New Order — Room ${selected.room_number || "?"}`,
        message:     `${selected.guest_name}: ${summary} · ₱${orderTotal.toLocaleString()}`,
        nav_target:  "Restaurant",
        is_read:     false,
        target_role: "restaurant",
      }]);
    }

const paidAmt = payLater
  ? reservationDownpayment
  : fullyPaid
    ? totalBill
    : reservationDownpayment + amtReceived;
    const isPartial = !payLater && !fullyPaid && paidAmt < totalBill && paidAmt > 0;

    setSendingOrder(false);
    onConfirm({ paidAmt, payLater, isPartial, paymentMethod, additionalCharges });
  };

  const restaurantChargesCount = additionalCharges.filter(c => c.from_restaurant).length;
  const isProcessing = processing || sendingOrder;


  const isConfirmDisabled = isProcessing || (!payLater && !fullyPaid && amtReceived <= 0);

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", overflowY: "auto" }}>
        <div style={{ background: "#f8f9fa", borderRadius: "20px", width: "min(640px, 95vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif" }}>

          <div style={{ background: "linear-gradient(135deg,#07713c,#0a9150)", borderRadius: "20px 20px 0 0", padding: "24px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <RiLoginBoxLine size={20} /> Process Check-In
              </h3>
              <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
                Confirm guest arrival and collect payment
              </p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.1rem" }}>
              ×
            </button>
          </div>

          <div style={{ padding: "24px 30px" }}>

            <div style={card}>
              <div style={sectionTitle("#07713c")}>
                <RiUserLine size={13} /> Reservation Summary
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  ["Guest",     selected.guest_name],
                  ["Room",      `Room ${selected.room_number}`],
                  ["Check-In",  selected.check_in],
                  ["Check-Out", selected.check_out || "Open Stay"],
                  ["Duration",  durationLabel],
                  ["Room Rate", `₱${roomrate.toLocaleString()}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ color: "#aaa", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                    <div style={{ fontWeight: "600", color: "#222", marginTop: "2px", fontSize: "0.88rem" }}>{v}</div>
                  </div>
                ))}
              </div>

              {hasReservationDownpayment && (
                <div style={{ marginTop: "10px", background: "#fff8e1", border: "1.5px solid #ffe082", borderRadius: "9px", padding: "11px 14px" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "#f57f17", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>
                    ⚡ 30% Downpayment on File
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                    {[
                      ["Grand Total",   `₱${grandTotal.toLocaleString()}`],
                      ["Paid (30%)",  `₱${reservationDownpayment.toLocaleString()}`],
                      ["Balance Due", `₱${Math.max(0, baseTotal - reservationDownpayment + chargesTotal).toLocaleString()}`],
                    ].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: "white", borderRadius: "7px", padding: "7px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.65rem", color: "#aaa", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>{lbl}</div>
                        <div style={{ fontSize: "0.88rem", fontWeight: "700", color: lbl === "Balance Due" ? "#e65100" : "#555" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: "0.73rem", color: "#888", marginTop: "7px", fontStyle: "italic" }}>
                    Remaining balance will be collected at check-out.
                  </div>
                </div>
              )}

            </div>

            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={sectionTitle("#07713c")}>
                  <RiMoneyDollarCircleLine size={13} /> Additional Charges at Check-In
                </div>
                <button
                  onClick={() => setShowAddOns(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: "#fff8e1", border: "1.5px solid #f59e0b", borderRadius: "8px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "700", color: "#b45309", fontFamily: "Arial,sans-serif", position: "relative" }}
                >
                  <RiRestaurantLine size={14} />
                  Restaurant Add-Ons
                  {restaurantChargesCount > 0 && (
                    <span style={{ position: "absolute", top: "-7px", right: "-7px", background: "#07713c", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: ".65rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {restaurantChargesCount}
                    </span>
                  )}
                </button>
              </div>

              {restaurantChargesCount > 0 && (
                <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "9px", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: ".8rem", color: "#065f46" }}>
                  <RiRestaurantLine size={14} />
                  <span>
                    <strong>{restaurantChargesCount} restaurant item{restaurantChargesCount !== 1 ? "s" : ""}</strong> staged — order fires to the kitchen when you confirm check-in.
                  </span>
                </div>
              )}

{additionalCharges.map(c => (
  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", marginBottom: "5px" }}>
    <span style={{ fontSize: "0.85rem", color: "#333" }}>
      {c.name.replace(/^\[Restaurant\] /, "")}
    </span>
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontWeight: "700", color: "#07713c", fontSize: "0.85rem" }}>
        ₱{parseFloat(c.amount).toLocaleString()}
      </span>
<button
  onClick={() => setAdditionalCharges(prev => prev.filter(x => x.id !== c.id))}
  style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", display: "flex", alignItems: "center", padding: "0 2px" }}
>
  <RiDeleteBinLine size={14} />
</button>
    </div>
  </div>
))}
              <AddChargeRow onAdd={c => setAdditionalCharges(prev => [...prev, c])} />



              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", marginTop: "14px", background: "#fff3e0", border: "1.5px solid #ffb74d", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "0.86rem", fontWeight: "700", color: "#e65100" }}>
                    Remaining Balance
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#888", marginTop: "2px" }}>
                    {hasReservationDownpayment
                      ? `₱${totalBill.toLocaleString()} total − ₱${reservationDownpayment.toLocaleString()} downpayment`
                      : chargesTotal > 0
                        ? `Room ₱${baseTotal.toLocaleString()} + Charges ₱${chargesTotal.toLocaleString()}`
                        : `Room rate ₱${baseTotal.toLocaleString()}`
                    }
                  </div>
                </div>
                <span style={{ fontWeight: "800", color: "#e65100", fontSize: "1.1rem" }}>
                  ₱{remainingBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={card}>
              <div style={sectionTitle("#07713c")}>
                <RiMoneyDollarCircleLine size={13} /> Payment Option
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
                {[
                  { val: false, label: "Pay Now",          sub: "Collect full or partial now" },
                  { val: true,  label: "Pay at Check-Out", sub: hasReservationDownpayment ? `₱${reservationDownpayment.toLocaleString()} downpayment kept — balance at check-out` : "Collect when guest leaves" },
                ].map(opt => (
                  <div
                    key={String(opt.val)}
                    onClick={() => setPayLater(opt.val)}
                    style={{ flex: 1, padding: "11px", border: `1.5px solid ${payLater === opt.val ? "#07713c" : "#ccdacc"}`, borderRadius: "10px", cursor: "pointer", background: payLater === opt.val ? "#ecfdf5" : "#fff" }}
                  >
                    <div style={{ fontWeight: "700", fontSize: ".84rem", color: "#333" }}>{opt.label}</div>
                    <div style={{ fontSize: ".73rem", color: "#aaa", marginTop: "2px" }}>{opt.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {!payLater && (
              <>
                <div style={card}>
                  <div style={sectionTitle("#07713c")}>
                    <RiMoneyDollarCircleLine size={13} /> Payment Method
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["cash", "card", "gcash", "bank_transfer"].map(m => (
                      <button
                        key={m} onClick={() => setPaymentMethod(m)}
                        style={{ flex: 1, padding: "8px 4px", border: `2px solid ${paymentMethod === m ? "#07713c" : "#e8e8e8"}`, borderRadius: "8px", background: paymentMethod === m ? "#ecfdf5" : "white", cursor: "pointer", fontSize: "0.75rem", fontWeight: "700", color: paymentMethod === m ? "#07713c" : "#888", fontFamily: "Arial,sans-serif" }}
                      >
                        {m === "cash" ? "Cash" : m === "card" ? "Card" : m === "gcash" ? "GCash" : "Bank"}<br />
                        <span style={{ fontSize: "0.65rem", fontWeight: "400", color: "#aaa" }}>
                          {m === "cash" ? "💵" : m === "card" ? "💳" : m === "gcash" ? "📱" : "🏦"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={card}>
                  <div style={sectionTitle("#07713c")}>
                    <RiMoneyDollarCircleLine size={13} /> Collect Payment
                  </div>
                  <div
                    onClick={() => { setFullyPaid(f => !f); if (!fullyPaid) setAmountReceived(totalBill.toString()); }}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${fullyPaid ? "#4caf50" : "#e8e8e8"}`, background: fullyPaid ? "#e8f5e9" : "#f8f9fa", cursor: "pointer", marginBottom: "14px", transition: "all 0.2s" }}
                  >
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${fullyPaid ? "#4caf50" : "#ccc"}`, background: fullyPaid ? "#4caf50" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {fullyPaid && <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "700" }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.9rem", color: fullyPaid ? "#1b5e20" : "#333" }}>Guest has fully paid</div>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "1px" }}>
                        Mark as fully settled — ₱{totalBill.toLocaleString()} total
                      </div>
                    </div>
                  </div>

                  {!fullyPaid && (
                    <>
                      <div style={{ marginBottom: "12px" }}>
                        <label style={labelStyle}>Amount Received (₱)</label>
                        <input
                          type="number" value={amountReceived}
                          onChange={e => setAmountReceived(e.target.value)}
                          placeholder="Enter amount given by guest"
                          style={{ ...inputStyle, fontSize: "1rem", fontWeight: "700", MozAppearance: "textfield" }}
                          onFocus={e => e.target.style.borderColor = "#07713c"}
                          onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                        />
                        <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
                      </div>
                      {change > 0 && (
                        <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: "0.9rem" }}>💵 Change to return</span>
                          <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{change.toLocaleString()}</span>
                        </div>
                      )}
                      {amtReceived > 0 && balance > 0 && (
                        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "#e65100", fontWeight: "700", fontSize: "0.88rem" }}>⚠ Balance due at Check-Out</span>
                          <span style={{ color: "#e65100", fontWeight: "800", fontSize: "1.1rem" }}>₱{balance.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  {fullyPaid && (
                    <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                      <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "0.95rem" }}>
                        ✅ Payment fully settled — ₱{totalBill.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {payLater && (
              <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px" }}>
                <div style={{ fontWeight: "700", fontSize: ".88rem", color: "#f57f17", marginBottom: "3px" }}>
                  {hasReservationDownpayment ? "Remaining balance at Check-Out" : "Full payment at Check-Out"}
                </div>
                <div style={{ fontSize: ".8rem", color: "#888" }}>
                  {hasReservationDownpayment
                    ? `₱${remainingBalance.toLocaleString()} remaining (after ₱${reservationDownpayment.toLocaleString()} downpayment) will be collected when guest leaves.`
                    : `Total of ₱${totalBill.toLocaleString()} will be collected when guest leaves.`
                  }
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onClose}
                disabled={isProcessing}
                style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: isProcessing ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                style={{ flex: 2, padding: "13px", background: isConfirmDisabled ? "#aaa" : "#07713c", border: "none", borderRadius: "10px", cursor: isConfirmDisabled ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
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
          onConfirm={(charges) => {
            setAdditionalCharges(prev => [...prev, ...charges]);
            setShowAddOns(false);
          }}
        />
      )}
    </>
  );
}