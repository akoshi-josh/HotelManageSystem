import React from "react";
import {
  RiUserLine, RiHotelBedLine, RiWalkLine,
  RiMoneyDollarCircleLine, RiAddLine, RiDeleteBinLine,
  RiRestaurantLine,
} from "react-icons/ri";
import RestaurantAddOnsModal from "./RestaurantAddOnsModal";

const CSS = `
.mo-wi { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,.52); backdrop-filter:blur(2px); padding:20px; overflow-y:auto; }
.mb-wi { background:#f4f6f0; border-radius:20px; width:100%; max-width:720px; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.22); margin:auto; }
.mh-blue { background:linear-gradient(135deg,#1565c0,#1976d2); padding:20px 24px; border-radius:20px 20px 0 0; display:flex; justify-content:space-between; align-items:center; }
.mh-title { color:#fff; font-size:1rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.8rem; margin:3px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; }
.mbody { padding:18px 22px; overflow-y:auto; }
.msec { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:12px; border:1px solid #e4ebe4; }
.msec-title-blue { font-size:.68rem; font-weight:700; color:#1565c0; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.flabel { display:block; font-size:.76rem; font-weight:700; color:#3a6a3a; margin-bottom:4px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; }
.pay-opt { flex:1; padding:11px; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; }
.pay-opt.active-blue { border-color:#1565c0; background:#e3f2fd; }
.pay-opt-title { font-weight:700; font-size:.84rem; color:#333; }
.pay-opt-sub   { font-size:.73rem; color:#aaa; margin-top:2px; }
.total-bar-blue { background:#1565c0; border-radius:10px; padding:11px 16px; display:flex; justify-content:space-between; align-items:center; margin-top:10px; }
.add-row { display:flex; gap:7px; align-items:center; }
.add-fi-blue { flex:1; padding:9px 12px; border:1.5px dashed #90caf9; border-radius:8px; font-size:.84rem; outline:none; font-family:Arial,sans-serif; color:#333; }
.add-fi-blue::placeholder { color:#a8b8a8; font-style:italic; }
.add-btn-blue { padding:9px 16px; background:#1565c0; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; }
.add-btn-blue:disabled { background:#aaa; cursor:not-allowed; }
.charge-row { display:flex; justify-content:space-between; align-items:center; padding:7px 11px; background:#f0f7ff; border:1px solid #bbdefb; border-radius:7px; margin-bottom:5px; }
.charge-row-rst { background:#fffbeb; border:1px solid #fde68a; }
.charge-del { background:none; border:none; cursor:pointer; color:#e53935; padding:2px 4px; border-radius:4px; display:flex; align-items:center; }
.alert-err { padding:9px 14px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.83rem; margin-bottom:12px; }
.rst-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; background:#fff8e1; border:1.5px solid #f59e0b; border-radius:8px; cursor:pointer; font-size:.78rem; font-weight:700; color:#b45309; font-family:Arial,sans-serif; position:relative; }
.rst-btn:hover { background:#fef3c7; }
.rst-badge { position:absolute; top:-7px; right:-7px; background:#07713c; color:#fff; border-radius:50%; width:18px; height:18px; font-size:.65rem; font-weight:700; display:flex; align-items:center; justify-content:center; }
`;

function AddChargeBlue({ onAdd }) {
  const [name, setName]     = React.useState("");
  const [amount, setAmount] = React.useState("");
  const handle = () => {
    if (!name.trim() || !amount) return;
    onAdd({ id: Date.now(), name: name.trim(), amount: parseFloat(amount) });
    setName(""); setAmount("");
  };
  return (
    <div className="add-row">
      <input className="add-fi-blue" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Extra pillow, Room service..." onKeyDown={e => e.key === "Enter" && handle()} />
      <input type="number" className="add-fi-blue" style={{ flex: "0 0 100px" }} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₱ Amount" onKeyDown={e => e.key === "Enter" && handle()} />
      <button className="add-btn-blue" onClick={handle} disabled={!name.trim() || !amount}><RiAddLine size={13} />Add</button>
    </div>
  );
}

export default function WalkInModal({
  walkIn,          setWalkIn,
  walkInPayLater,  setWalkInPayLater,
  walkInError,
  savingWalkIn,
  availableRooms,
  calcWalkInTotal,
  calcWalkInRoomOnly,
  onClose,
  onConfirm,
}) {
  const [showAddOns, setShowAddOns] = React.useState(false);

  const restaurantCount = (walkIn.additional_charges || []).filter(c => c.from_restaurant).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="mo-wi" onClick={onClose}>
        <div className="mb-wi" onClick={e => e.stopPropagation()}>

          <div className="mh-blue">
            <div>
              <p className="mh-title">Walk-In Guest</p>
              <p className="mh-sub">Guest arrives without prior reservation</p>
            </div>
            <button className="mx" onClick={onClose}>×</button>
          </div>

          <div className="mbody">
            {walkInError && <div className="alert-err">⚠ {walkInError}</div>}

            <div className="msec">
              <div className="msec-title-blue"><RiUserLine size={13} />Guest Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="flabel">Full Name <span style={{ color: "#e53935" }}>*</span></label>
                  <input className="fi" value={walkIn.guest_name} onChange={e => setWalkIn({ ...walkIn, guest_name: e.target.value })} placeholder="e.g. Juan Dela Cruz" />
                </div>
                <div>
                  <label className="flabel">Email</label>
                  <input type="email" className="fi" value={walkIn.guest_email} onChange={e => setWalkIn({ ...walkIn, guest_email: e.target.value })} placeholder="guest@email.com" />
                </div>
                <div>
                  <label className="flabel">Phone</label>
                  <input className="fi" value={walkIn.guest_phone} onChange={e => setWalkIn({ ...walkIn, guest_phone: e.target.value })} placeholder="+63 9XX XXX XXXX" />
                </div>
              </div>
            </div>

            <div className="msec">
              <div className="msec-title-blue"><RiHotelBedLine size={13} />Room & Dates</div>
              <div style={{ marginBottom: "10px" }}>
                <label className="flabel">Select Room <span style={{ color: "#e53935" }}>*</span></label>
                <select className="fi" style={{ cursor: "pointer" }} value={walkIn.room_id} onChange={e => setWalkIn({ ...walkIn, room_id: e.target.value })}>
                  <option value="">— Choose an available room —</option>
                  {availableRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      Room {r.room_number} | {r.type} | Floor {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label className="flabel">Check-In <span style={{ color: "#e53935" }}>*</span></label>
                  <input type="date" className="fi" value={walkIn.check_in} onChange={e => setWalkIn({ ...walkIn, check_in: e.target.value })} />
                </div>
                <div>
                  <label className="flabel">Check-Out <span style={{ fontSize: ".7rem", color: "#8a9a8a", fontWeight: "400", textTransform: "none" }}>(optional)</span></label>
                  <input type="date" className="fi" value={walkIn.check_out} onChange={e => setWalkIn({ ...walkIn, check_out: e.target.value })} />
                </div>
              </div>
              {calcWalkInRoomOnly() > 0 && (
                <div className="total-bar-blue" style={{ marginTop: "10px" }}>
                  <span style={{ color: "rgba(255,255,255,.75)", fontSize: ".86rem" }}>
                    {walkIn.check_out
                      ? `${Math.round((new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000)} nights`
                      : "Open-ended · per night"}
                  </span>
                  <span style={{ color: "#fff", fontWeight: "700" }}>₱{calcWalkInRoomOnly().toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="msec">
              <div className="msec-title-blue"><RiMoneyDollarCircleLine size={13} />Payment Option</div>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { val: false, label: "Pay Now",          sub: "Collect on check-in"    },
                  { val: true,  label: "Pay at Check-Out", sub: "Guest pays when leaving" },
                ].map(opt => (
                  <div key={String(opt.val)} className={`pay-opt${walkInPayLater === opt.val ? " active-blue" : ""}`} onClick={() => setWalkInPayLater(opt.val)}>
                    <div className="pay-opt-title">{opt.label}</div>
                    <div className="pay-opt-sub">{opt.sub}</div>
                  </div>
                ))}
              </div>

              {!walkInPayLater && (
                <>
                  {(walkIn.additional_charges || []).length > 0 && (
                    <div style={{ marginTop: "12px", background: "#f4f6f0", borderRadius: "10px", padding: "12px 14px" }}>
                      <div style={{ fontSize: ".68rem", fontWeight: "700", color: "#555", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "8px" }}>Bill Breakdown</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", color: "#555", marginBottom: "4px" }}>
                        <span>Room Rate</span>
                        <span style={{ fontWeight: "600" }}>₱{calcWalkInRoomOnly().toLocaleString()}</span>
                      </div>
                      {(walkIn.additional_charges || []).map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".83rem", color: "#555", marginBottom: "4px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            {c.from_restaurant && <RiRestaurantLine size={11} color="#b45309" />}
                            • {c.name}
                          </span>
                          <span style={{ fontWeight: "600" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: "700", borderTop: "1px solid #ddd", paddingTop: "6px", marginTop: "4px" }}>
                        <span style={{ color: "#333" }}>Total to Collect</span>
                        <span style={{ color: "#1565c0" }}>₱{calcWalkInTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: "12px", marginBottom: "10px" }}>
                    <label className="flabel" style={{ display: "block", fontSize: ".8rem", fontWeight: "700", color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Amount Received (₱)</label>
                    <input
                      type="number" className="fi"
                      style={{ fontSize: "1rem", fontWeight: "700" }}
                      value={walkIn.amount_received || ""}
                      onChange={e => setWalkIn({ ...walkIn, amount_received: e.target.value })}
                      placeholder="Enter amount given by guest"
                      onFocus={e => e.target.style.borderColor = "#1565c0"}
                      onBlur={e => e.target.style.borderColor = "#ccdacc"}
                    />
                  </div>
                  {parseFloat(walkIn.amount_received || 0) > calcWalkInTotal() && calcWalkInTotal() > 0 && (
                    <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: "0.9rem" }}>💵 Change to return</span>
                      <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{(parseFloat(walkIn.amount_received) - calcWalkInTotal()).toLocaleString()}</span>
                    </div>
                  )}
                  {parseFloat(walkIn.amount_received || 0) > 0 && parseFloat(walkIn.amount_received || 0) < calcWalkInTotal() && (
                    <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#e65100", fontWeight: "700", fontSize: "0.88rem" }}>⚠ Balance due at Check-Out</span>
                      <span style={{ color: "#e65100", fontWeight: "800", fontSize: "1.1rem" }}>₱{(calcWalkInTotal() - parseFloat(walkIn.amount_received)).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="msec">
              <div className="msec-title-blue">Notes / Special Requests</div>
              <textarea className="fi" rows={2} style={{ resize: "vertical" }} value={walkIn.notes} onChange={e => setWalkIn({ ...walkIn, notes: e.target.value })} placeholder="Any special requests..." />
            </div>

            {/* Additional Charges + Restaurant Add Ons */}
            <div className="msec">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="msec-title-blue" style={{ marginBottom: 0 }}><RiMoneyDollarCircleLine size={13} />Additional Charges</div>
                <button className="rst-btn" onClick={() => setShowAddOns(true)}>
                  <RiRestaurantLine size={14} />
                  Restaurant Add-Ons
                  {restaurantCount > 0 && <span className="rst-badge">{restaurantCount}</span>}
                </button>
              </div>
              {(walkIn.additional_charges || []).map(c => (
                <div key={c.id} className={`charge-row${c.from_restaurant ? " charge-row-rst" : ""}`}>
                  <span style={{ fontSize: ".82rem", color: "#333", display: "flex", alignItems: "center", gap: "5px" }}>
                    {c.from_restaurant && <RiRestaurantLine size={11} color="#b45309" />}
                    {c.name}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: "700", color: c.from_restaurant ? "#b45309" : "#1565c0", fontSize: ".82rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                    <button className="charge-del" onClick={() => setWalkIn({ ...walkIn, additional_charges: walkIn.additional_charges.filter(x => x.id !== c.id) })}>
                      <RiDeleteBinLine size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <AddChargeBlue onAdd={charge => setWalkIn({ ...walkIn, additional_charges: [...(walkIn.additional_charges || []), charge] })} />
            </div>
          </div>

          <div style={{ padding: "13px 22px", borderTop: "1px solid #e4ebe4", display: "flex", gap: "10px" }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: "11px", background: "#fff", border: "1.5px solid #ccdacc", borderRadius: "10px", cursor: "pointer", fontSize: ".88rem", fontWeight: "600", color: "#4a6a4a", fontFamily: "Arial,sans-serif" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm} disabled={savingWalkIn}
              style={{ flex: 2, padding: "11px", background: savingWalkIn ? "#aaa" : "#1565c0", border: "none", borderRadius: "10px", cursor: savingWalkIn ? "not-allowed" : "pointer", fontSize: ".88rem", fontWeight: "700", color: "#fff", fontFamily: "Arial,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <RiWalkLine size={15} />{savingWalkIn ? "Checking In..." : "Check In Now"}
            </button>
          </div>

        </div>
      </div>

      {showAddOns && (
        <RestaurantAddOnsModal
          guestName={walkIn.guest_name}
          roomNumber={walkIn.room_number || ""}
          onClose={() => setShowAddOns(false)}
          onConfirm={(charges) => {
            setWalkIn(prev => ({ ...prev, additional_charges: [...(prev.additional_charges || []), ...charges] }));
            setShowAddOns(false);
          }}
        />
      )}
    </>
  );
}