import React, { useState } from "react";
import { RiDeleteBinLine, RiRestaurantLine } from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";
import supabase from "../supabaseClient";

function AddChargeInline({ onAdd }) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Room service, Extra bed..."
        style={{ flex: 2, padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <input
        type="number" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="₱ Amount"
        style={{ flex: 1, padding: "9px 12px", border: "1.5px dashed #c8e6c9", borderRadius: "8px", fontSize: "0.85rem", outline: "none", fontFamily: "Arial,sans-serif", color: "#333" }}
        onKeyDown={e => e.key === "Enter" && handle()}
      />
      <button
        onClick={handle} disabled={!name.trim() || !amount}
        style={{ padding: "9px 16px", background: name.trim() && amount ? "#2d6a2d" : "#e0e0e0", color: name.trim() && amount ? "white" : "#aaa", border: "none", borderRadius: "8px", cursor: name.trim() && amount ? "pointer" : "not-allowed", fontWeight: "700", fontSize: "0.82rem", fontFamily: "Arial,sans-serif", whiteSpace: "nowrap" }}
      >
        + Add
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8",
  borderRadius: "8px", fontSize: "0.9rem", outline: "none",
  fontFamily: "Arial,sans-serif", boxSizing: "border-box", background: "white", transition: "border 0.2s",
};
const labelStyle = {
  display: "block", fontSize: "0.8rem", fontWeight: "700",
  color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px",
};

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
  const [showAddOns, setShowAddOns] = useState(false);
  const selectedRoom = rooms.find(r => r.id === form.room_id);

  const restaurantChargesCount = (form.additional_charges || []).filter(c => c.from_restaurant).length;

  const handleSave = async () => {
    await onSave();

    const restaurantCharges = (form.additional_charges || []).filter(c => c.from_restaurant);
    if (restaurantCharges.length === 0) return;

    try {
      let reservationId = editRes?.id || null;

      if (!reservationId && form.guest_name) {
        const { data: found } = await supabase
          .from("reservations")
          .select("id")
          .eq("guest_name", form.guest_name.trim())
          .order("created_at", { ascending: false })
          .limit(1);
        if (found && found.length > 0) reservationId = found[0].id;
      }

      const orderItems = restaurantCharges.map(c => ({
        id: c.restaurant_item_id || c.id,
        name: c.name.replace(/^\[Restaurant\] /, "").replace(/ ×\d+$/, ""),
        price: c.unit_price || c.amount,
        qty: c.qty || 1,
        subtotal: parseFloat(c.amount),
      }));

      const orderTotal = restaurantCharges.reduce((s, c) => s + parseFloat(c.amount), 0);
      const roomNumber = selectedRoom?.room_number || form.room_number || "";

      if (reservationId) {
        await supabase
          .from("restaurant_orders")
          .delete()
          .eq("reservation_id", reservationId)
          .eq("status", "queued");
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
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}
      >
        <div
          style={{
            background: "#f8f9fa", borderRadius: "20px",
            width: "min(860px, 95vw)", maxHeight: "92vh", overflowY: "auto",
            boxShadow: "0 24px 80px rgba(0,0,0,0.25)", fontFamily: "Arial,sans-serif",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1e4d1e, #2d6a2d)",
              borderRadius: "20px 20px 0 0", padding: "24px 30px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: "white" }}>
                {editRes ? "Edit Reservation" : "New Reservation"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "rgba(255,255,255,0.7)" }}>
                {editRes ? "Update reservation details" : "Fill in the details to create a new reservation"}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)", border: "none",
                width: "34px", height: "34px", borderRadius: "50%",
                cursor: "pointer", color: "white", fontSize: "1.1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: "28px 30px" }}>

            {error && (
              <div style={{ background: "#fff3f3", border: "1px solid #ffcdd2", color: "#c62828", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.88rem" }}>
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", color: "#1b5e20", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "0.88rem" }}>
                ✅ {success}
              </div>
            )}

            <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
                👤 Guest Information
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Full Name <span style={{ color: "#e53935" }}>*</span></label>
                  <input
                    type="text" value={form.guest_name}
                    onChange={e => setForm({ ...form, guest_name: e.target.value })}
                    placeholder="e.g. Juan Dela Cruz" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    type="email" value={form.guest_email}
                    onChange={e => setForm({ ...form, guest_email: e.target.value })}
                    placeholder="guest@email.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="text" value={form.guest_phone}
                    onChange={e => setForm({ ...form, guest_phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  />
                </div>
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
                🛏️ Room & Dates
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Select Room <span style={{ color: "#e53935" }}>*</span></label>
                <select
                  value={form.room_id}
                  onChange={e => setForm({ ...form, room_id: e.target.value })}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">— Choose an available room —</option>
                  {selectableRooms.length === 0
                    ? <option disabled>No available rooms right now</option>
                    : selectableRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night
                        </option>
                      ))
                  }
                </select>
                {selectableRooms.length === 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "#e65100" }}>
                    ⚠️ All rooms are currently occupied or under maintenance.
                  </p>
                )}
              </div>

              {selectedRoom && (
                <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontWeight: "700", color: "#1a3c1a", fontSize: "0.95rem" }}>Room {selectedRoom.room_number}</span>
                    <span style={{ color: "#555", fontSize: "0.85rem", marginLeft: "10px" }}>{selectedRoom.type} · Floor {selectedRoom.floor}</span>
                  </div>
                  <span style={{ fontWeight: "700", color: "#1a3c1a", fontSize: "0.95rem" }}>
                    ₱{parseFloat(selectedRoom.price).toLocaleString()}/night
                  </span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Check-In Date <span style={{ color: "#e53935" }}>*</span></label>
                  <input
                    type="date" value={form.check_in}
                    onChange={e => setForm({ ...form, check_in: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Check-Out Date{" "}
                    <span style={{ fontSize: "0.75rem", color: "#888", fontWeight: "400", textTransform: "none" }}>(optional — open stay)</span>
                  </label>
                  <input
                    type="date" value={form.check_out}
                    onChange={e => setForm({ ...form, check_out: e.target.value })}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                    onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                  />
                </div>
              </div>

              {selectedRoom && (
                <div style={{ marginTop: "14px", background: "#1a3c1a", borderRadius: "10px", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {form.check_out ? (
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>
                      {calcNights()} night{calcNights() !== 1 ? "s" : ""} × ₱{parseFloat(selectedRoom.price).toLocaleString()}
                    </div>
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.88rem" }}>
                      Open Stay · ₱{parseFloat(selectedRoom.price).toLocaleString()}/night
                    </div>
                  )}
                  <div style={{ color: "white", fontWeight: "700", fontSize: "1.1rem" }}>
                    {form.check_out
                      ? `Total: ₱${calcTotal().toLocaleString()}`
                      : `Per night: ₱${parseFloat(selectedRoom.price).toLocaleString()}`
                    }
                  </div>
                </div>
              )}

              {selectedRoom && form.check_out && calcTotal() > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    onClick={() => setForm({ ...form, partial_payment: !form.partial_payment })}
                    style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `2px solid ${form.partial_payment ? "#f57f17" : "#e8e8e8"}`, background: form.partial_payment ? "#fff8e1" : "#f8f9fa", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${form.partial_payment ? "#f57f17" : "#ccc"}`, background: form.partial_payment ? "#f57f17" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.partial_payment && <span style={{ color: "white", fontSize: "0.75rem", fontWeight: "700" }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "700", fontSize: "0.88rem", color: form.partial_payment ? "#e65100" : "#333" }}>
                        Partial Payment (30% Downpayment)
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#888", marginTop: "1px" }}>
                        30% of room rate due now — remaining balance at check-in or check-out
                      </div>
                    </div>
                    {form.partial_payment && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "0.72rem", color: "#f57f17", fontWeight: "700", textTransform: "uppercase" }}>Due Now</div>
                        <div style={{ fontSize: "1rem", fontWeight: "700", color: "#e65100" }}>₱{calcDownpayment().toLocaleString()}</div>
                      </div>
                    )}
                  </div>

                  {form.partial_payment && (
                    <div style={{ marginTop: "8px", background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "9px", padding: "14px 16px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        {[
                          ["Room Rate", `₱${calcRoomOnly().toLocaleString()}`],
                          ["Additional Charges", `₱${(calcTotal() - calcRoomOnly()).toLocaleString()}`],
                          ["Grand Total", `₱${calcTotal().toLocaleString()}`],
                        ].map(([lbl, val]) => (
                          <div key={lbl} style={{ background: "white", borderRadius: "8px", padding: "8px 12px" }}>
                            <div style={{ fontSize: "0.68rem", color: "#aaa", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>{lbl}</div>
                            <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#555" }}>{val}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div style={{ background: "#ffe0b2", borderRadius: "8px", padding: "10px 12px", border: "1.5px solid #ffb74d" }}>
                          <div style={{ fontSize: "0.68rem", color: "#bf360c", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>30% Due Now (Room Rate Only)</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", color: "#e65100" }}>₱{calcDownpayment().toLocaleString()}</div>
                        </div>
                        <div style={{ background: "#fce4ec", borderRadius: "8px", padding: "10px 12px", border: "1.5px solid #ef9a9a" }}>
                          <div style={{ fontSize: "0.68rem", color: "#c62828", fontWeight: "700", textTransform: "uppercase", marginBottom: "3px" }}>Remaining Balance</div>
                          <div style={{ fontSize: "1rem", fontWeight: "700", color: "#c62828" }}>₱{calcRemainingBalance().toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#e65100", marginTop: "10px", fontStyle: "italic", textAlign: "center" }}>
                        ⚠ Remaining balance of ₱{calcRemainingBalance().toLocaleString()} will be collected at check-in or check-out
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "16px" }}>
                Status & Notes
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>Reservation Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="checked_in">Checked In</option>
                  <option value="checked_out">Checked Out</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Notes / Special Requests</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special requests, preferences, or notes..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={e => e.target.style.borderColor = "#2d6a2d"}
                  onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                />
              </div>
            </div>

            <div style={{ background: "white", borderRadius: "12px", padding: "20px", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  Additional Charges / Requests
                </div>
                <button
                  onClick={() => setShowAddOns(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    padding: "7px 14px", background: "#fff8e1",
                    border: "1.5px solid #f59e0b", borderRadius: "8px",
                    cursor: "pointer", fontSize: "0.78rem", fontWeight: "700",
                    color: "#b45309", fontFamily: "Arial,sans-serif",
                    position: "relative",
                  }}
                >
                  <RiRestaurantLine size={14} />
                  Restaurant Pre-Order
                  {restaurantChargesCount > 0 && (
                    <span style={{
                      position: "absolute", top: "-7px", right: "-7px",
                      background: "#07713c", color: "#fff", borderRadius: "50%",
                      width: "18px", height: "18px", fontSize: ".62rem", fontWeight: "700",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {restaurantChargesCount}
                    </span>
                  )}
                </button>
              </div>

              {restaurantChargesCount > 0 && (
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "9px", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", fontSize: ".8rem", color: "#b45309" }}>
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
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "8px 12px",
                        background: c.from_restaurant ? "#fffbeb" : "#f8fdf8",
                        border: `1px solid ${c.from_restaurant ? "#fde68a" : "#e8f5e8"}`,
                        borderRadius: "8px", marginBottom: "6px",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", color: "#333", display: "flex", alignItems: "center", gap: "6px" }}>
                        {c.from_restaurant && <RiRestaurantLine size={12} color="#b45309" />}
                        {c.name}
                        {c.from_restaurant && (
                          <span style={{ fontSize: ".68rem", background: "#fff3e0", color: "#e65100", padding: "1px 6px", borderRadius: "10px", fontWeight: "700" }}>
                            queued
                          </span>
                        )}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: "700", color: c.from_restaurant ? "#b45309" : "#2d6a2d", fontSize: "0.85rem" }}>
                          ₱{parseFloat(c.amount).toLocaleString()}
                        </span>
                        <button
                          onClick={() => setForm({ ...form, additional_charges: (form.additional_charges || []).filter(x => x.id !== c.id) })}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", display: "flex", alignItems: "center", padding: "0 2px" }}
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

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: "13px", background: "white", border: "2px solid #e0e0e0", borderRadius: "10px", cursor: "pointer", fontSize: "0.92rem", fontWeight: "600", color: "#666", fontFamily: "Arial,sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave} disabled={saving}
                style={{ flex: 2, padding: "13px", background: saving ? "#aaa" : "#2d6a2d", border: "none", borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontSize: "0.92rem", fontWeight: "700", color: "white", fontFamily: "Arial,sans-serif", boxShadow: saving ? "none" : "0 4px 12px rgba(45,106,45,0.35)" }}
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
    </>
  );
}