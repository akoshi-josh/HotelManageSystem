import React, { useState, useEffect } from "react";
import {
  RiHotelBedLine, RiUserLine, RiCalendarLine, RiAddCircleLine,
  RiMoneyDollarCircleLine, RiStickyNoteLine, RiTimeLine,
  RiCheckboxCircleLine, RiDeleteBinLine, RiEyeLine, RiLoginBoxLine,
  RiCalendar2Line,
} from "react-icons/ri";
import supabase from "../supabaseClient";
import { logActivity } from "../logger";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ih-root { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.ih-hdr  { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.ih-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.ih-sub   { font-size:.83rem; color:#8a9a8a; }

.sc-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
.sc  { border-radius:14px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sc-lbl { font-size:.78rem; font-weight:700; text-transform:uppercase; letter-spacing:.3px; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }

.fbar { background:#fff; border-radius:14px; padding:13px 20px; margin-bottom:16px; border:1px solid #e4ebe4; }
.finput { width:100%; padding:9px 13px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.88rem; font-family:Arial,sans-serif; color:#333; outline:none; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }

.ih-table { background:#fff; border-radius:14px; border:1px solid #e4ebe4; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.04); }
.ih-thead { display:grid; grid-template-columns:80px 1.8fr 60px 110px 110px 110px 90px; padding:9px 20px; background:#f8faf8; border-bottom:2px solid #eef4ee; }
.ih-th { font-size:.64rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9a7a; }
.ih-tbody { overflow-y:auto; max-height:60vh; }
.ih-tbody::-webkit-scrollbar { width:4px; }
.ih-tbody::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
.ih-tr { display:grid; grid-template-columns:80px 1.8fr 60px 110px 110px 110px 90px; padding:12px 20px; align-items:center; border-bottom:1px solid #f2f7f2; transition:background .15s; cursor:default; }
.ih-tr:last-child { border-bottom:none; }
.ih-tr:hover { background:#f8fdf8; }
.ih-td { font-size:.86rem; color:#333; }
.room-badge { display:inline-flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#07713c,#0a9150); color:#fff; font-weight:700; font-size:.9rem; border-radius:9px; padding:5px 12px; min-width:52px; }
.guest-name { font-weight:600; color:#07713c; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.floor-badge { display:inline-block; background:#ecfdf5; color:#07713c; font-weight:700; font-size:.78rem; padding:3px 9px; border-radius:10px; }
.date-val { font-size:.83rem; color:#555; }
.checkout-today { font-size:.83rem; color:#e65100; font-weight:700; }
.rate-val { font-weight:700; color:#07713c; font-size:.86rem; }
.view-btn { display:inline-flex; align-items:center; gap:5px; padding:6px 13px; background:#07713c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.78rem; font-weight:700; font-family:Arial,sans-serif; transition:background .15s; }
.view-btn:hover { background:#05592f; }
.empty { text-align:center; padding:60px; color:#9aaa9a; font-size:.9rem; }
.empty-ico { width:56px; height:56px; border-radius:50%; background:#ecfdf5; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }

/* MODAL */
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); padding:16px; overflow-y:auto; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-width:780px; display:flex; flex-direction:column; box-shadow:0 24px 80px rgba(0,0,0,.28); margin:auto; }
.mh { padding:22px 28px; border-radius:20px 20px 0 0; background:linear-gradient(135deg,#07713c,#0a9150); display:flex; justify-content:space-between; align-items:center; position:relative; }
.mh-room { font-size:2.2rem; font-weight:700; color:#fff; line-height:1; }
.mh-type  { font-size:.74rem; color:rgba(255,255,255,.7); margin-top:4px; text-transform:uppercase; letter-spacing:.6px; }
.mh-meta  { display:flex; gap:16px; align-items:center; }
.mh-badge { background:rgba(255,255,255,.15); border-radius:12px; padding:10px 18px; text-align:center; }
.mh-nights-num { font-size:1.6rem; font-weight:700; color:#fff; line-height:1; }
.mh-nights-lbl { font-size:.63rem; color:rgba(255,255,255,.65); text-transform:uppercase; margin-top:1px; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:20px 26px; }
.mbody-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mbody-left  { display:flex; flex-direction:column; gap:12px; }
.mbody-right { display:flex; flex-direction:column; gap:12px; }
.msec { background:#fff; border-radius:12px; padding:16px 18px; border:1px solid #e4ebe4; }
.msec-title { font-size:.68rem; font-weight:700; color:#07713c; text-transform:uppercase; letter-spacing:.1em; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.info-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.info-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
.info-cell { background:#f4f6f0; border-radius:8px; padding:9px 12px; }
.info-lbl { font-size:.64rem; color:#8a9a8a; font-weight:700; text-transform:uppercase; display:flex; align-items:center; gap:3px; margin-bottom:2px; }
.info-val { font-size:.86rem; font-weight:600; color:#222; }
.charge-row { display:flex; justify-content:space-between; align-items:center; padding:7px 11px; background:#f8fdf8; border:1px solid #e8f5e8; border-radius:7px; margin-bottom:5px; }
.charge-name { font-size:.82rem; color:#333; }
.charge-amt  { font-weight:700; color:#07713c; font-size:.82rem; }
.charge-del  { background:none; border:none; cursor:pointer; color:#e53935; padding:2px 4px; border-radius:4px; display:flex; align-items:center; }
.charge-del:hover { background:#fce4ec; }
.total-bar { display:flex; justify-content:space-between; align-items:center; background:#07713c; border-radius:10px; padding:13px 18px; margin-top:4px; }
.total-lbl { color:rgba(255,255,255,.8); font-size:.88rem; }
.total-amt { color:#fff; font-weight:700; font-size:1.2rem; }
.note-box { display:flex; gap:7px; background:#fffde7; border:1px solid #fff176; border-radius:8px; padding:9px 12px; font-size:.81rem; color:#555; line-height:1.4; }
.add-row { display:flex; gap:7px; align-items:center; margin-top:10px; }
.add-fi { flex:1; padding:8px 11px; border:1.5px dashed #a7f3d0; border-radius:8px; font-size:.84rem; outline:none; font-family:Arial,sans-serif; color:#333; min-width:0; }
.add-fi:focus { border-color:#07713c; }
.add-fi::placeholder { color:#a8b8a8; font-style:italic; }
.add-btn { padding:8px 16px; background:#07713c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; }
.add-btn:disabled { background:#aaa; cursor:not-allowed; }
.mfoot { padding:14px 26px; border-top:1px solid #e4ebe4; display:flex; gap:10px; }
.btn-close { width:100%; padding:11px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
@media (max-width: 640px) {
  .mb { max-width:100%; border-radius:16px; }
  .mbody-grid { grid-template-columns:1fr; }
  .mh { flex-direction:column; gap:12px; align-items:flex-start; }
  .mh-meta { width:100%; justify-content:flex-start; }
  .info-grid-3 { grid-template-columns:1fr 1fr; }
}
.extend-box { background:#e3f2fd; border:1.5px solid #90caf9; border-radius:10px; padding:13px 15px; margin-top:10px; }
.extend-title { font-size:.68rem; font-weight:700; color:#1565c0; text-transform:uppercase; letter-spacing:.08em; display:flex; align-items:center; gap:5px; margin-bottom:10px; }
.extend-row { display:flex; gap:8px; align-items:center; }
.extend-input { flex:1; padding:8px 12px; border:1.5px solid #90caf9; border-radius:8px; font-size:.86rem; font-family:Arial,sans-serif; outline:none; color:#333; background:#fff; }
.extend-input:focus { border-color:#1565c0; box-shadow:0 0 0 3px rgba(21,101,192,.1); }
.extend-btn { padding:8px 16px; background:#1565c0; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; }
.extend-btn:disabled { background:#aaa; cursor:not-allowed; }
.open-stay-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; background:#fff8e1; color:#f57f17; border-radius:10px; font-size:.72rem; font-weight:700; border:1px solid #ffe082; }
`;

export default function InHouse({ highlightId }) {
  const [guests,   setGuests]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState(null);  // reservation shown in modal
  const [reqName,  setReqName]  = useState("");
  const [reqAmt,   setReqAmt]   = useState("");
  const [saving,   setSaving]   = useState(false);
  const [extending,  setExtending]  = useState(false); // is saving extension
  const [extDate,    setExtDate]    = useState("");     // new checkout date input

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchGuests(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchGuests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reservations")
      .select("*, rooms(type, floor)")
      .eq("status", "checked_in")
      .order("check_in");
    // Filter out any that might have been checked out
    const activeGuests = (data || []).filter(r => r.status === "checked_in");
    setGuests(activeGuests);
    setLoading(false);
  };

  const getCharges = (res) => {
    try { return JSON.parse(res?.additional_charges || "[]"); } catch { return []; }
  };

  const calcTotal = (res) => {
    const base  = parseFloat(res.total_amount || 0);
    const extra = getCharges(res).reduce((s, c) => s + parseFloat(c.amount || 0), 0);
    return base + extra;
  };

  const nightsStayed = (checkIn) => Math.max(1, Math.floor((new Date() - new Date(checkIn)) / 86400000));
  const nightsLeft   = (checkOut) => checkOut ? Math.max(0, Math.ceil((new Date(checkOut) - new Date()) / 86400000)) : null;

  const handleAddCharge = async () => {
    if (!reqName.trim() || !reqAmt || !selected) return;
    setSaving(true);
    const existing = getCharges(selected);
    const updated  = [...existing, { id: Date.now(), name: reqName.trim(), amount: parseFloat(reqAmt) }];
    await supabase.from("reservations").update({ additional_charges: JSON.stringify(updated) }).eq("id", selected.id);
    await logActivity({ action: `Added charge to Room ${selected.room_number}: ${reqName.trim()}`, category: "charge", details: `Guest: ${selected.guest_name} | Amount: ₱${parseFloat(reqAmt).toLocaleString()}`, entity_type: "reservation", entity_id: selected.id });
    setSaving(false);
    setReqName(""); setReqAmt("");
    // Refresh both list and selected
    const { data } = await supabase.from("reservations").select("*, rooms(type, floor)").eq("id", selected.id).single();
    setSelected(data);
    fetchGuests();
  };

  const handleDeleteCharge = async (chargeId) => {
    if (!selected) return;
    const updated = getCharges(selected).filter(c => c.id !== chargeId);
    await supabase.from("reservations").update({ additional_charges: JSON.stringify(updated) }).eq("id", selected.id);
    const { data } = await supabase.from("reservations").select("*, rooms(type, floor)").eq("id", selected.id).single();
    setSelected(data);
    fetchGuests();
  };

  const handleExtendStay = async () => {
    if (!selected || !extDate) return;
    if (selected.check_in && new Date(extDate) <= new Date(selected.check_in)) return;
    setExtending(true);
    // Recalculate total based on new dates
    const checkIn  = selected.check_in;
    const checkOut = extDate;
    const nights   = checkIn && checkOut
      ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 1;
    const pricePerNight = parseFloat(selected.total_amount || 0) /
      Math.max(1, selected.check_out
        ? Math.ceil((new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)
        : 1);
    const newTotal = nights * pricePerNight;

    await supabase.from("reservations")
      .update({ check_out: extDate, total_amount: newTotal })
      .eq("id", selected.id);

    // Refresh selected
    const { data } = await supabase.from("reservations").select("*, rooms(type, floor)").eq("id", selected.id).single();
    setSelected(data);
    setExtDate("");
    setExtending(false);
    fetchGuests();
  };

  const openModal = (res) => { setSelected(res); setReqName(""); setReqAmt(""); setExtDate(""); };
  const closeModal = () => setSelected(null);

  const filtered = guests.filter(g =>
    g.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (g.room_number || "").includes(search)
  );

  const checkingOutToday = guests.filter(g => g.check_out === today).length;

  return (
    <>
      <style>{CSS}</style>
      <div className="ih-root">
        <div className="ih-hdr">
          <div>
            <h2 className="ih-title">In-House Guests</h2>
            <p className="ih-sub">Guests currently staying — click View for full details</p>
          </div>
        </div>

        {/* Stats */}
        <div className="sc-3">
          {[
            { lbl: "Currently Staying",  val: guests.length,          Icon: RiHotelBedLine,          bg: "#e8f5e9", color: "#07713c" },
            { lbl: "Checking Out Today", val: checkingOutToday,       Icon: RiTimeLine,              bg: "#fff3e0", color: "#e65100" },
            { lbl: "Total Add. Charges", val: `₱${guests.reduce((s,g)=>s+getCharges(g).reduce((a,c)=>a+parseFloat(c.amount||0),0),0).toLocaleString()}`, Icon: RiMoneyDollarCircleLine, bg: "#f3e5f5", color: "#6a1b9a" },
          ].map(({ lbl, val, Icon, bg, color }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row"><Icon size={18} color={color} /><span className="sc-lbl" style={{ color }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="fbar">
          <input className="finput" placeholder="Search guest name or room number..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="ih-table">
          <div className="ih-thead">
            <div className="ih-th">Room</div>
            <div className="ih-th">Guest Name</div>
            <div className="ih-th">Floor</div>
            <div className="ih-th">Check-In</div>
            <div className="ih-th">Check-Out</div>
            <div className="ih-th">Room Rate</div>
            <div className="ih-th"></div>
          </div>
          <div className="ih-tbody">
            {loading ? (
              <div className="empty">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-ico"><RiHotelBedLine size={26} color="#07713c" /></div>
                <div style={{ fontWeight: "700", color: "#333", marginBottom: "4px" }}>No guests checked in</div>
                <div style={{ fontSize: ".83rem" }}>Check-in guests from the Check-In page.</div>
              </div>
            ) : filtered.map(res => {
              const isCheckingOutToday = res.check_out === today;
              return (
                <div key={res.id} className="ih-tr" style={{ background: res.id === highlightId ? "#fffde7" : undefined, outline: res.id === highlightId ? "2px solid #f59e0b" : "none", transition: "all 0.3s" }}>
                  <div className="ih-td"><span className="room-badge">{res.room_number}</span></div>
                  <div className="ih-td guest-name">{res.guest_name}</div>
                  <div className="ih-td"><span className="floor-badge">{res.rooms?.floor ?? "—"}</span></div>
                  <div className="ih-td"><span className="date-val">{res.check_in}</span></div>
                  <div className="ih-td">
                    {!res.check_out
                      ? <span style={{ fontSize: ".78rem", color: "#f57f17", fontWeight: "700", background: "#fff8e1", padding: "3px 8px", borderRadius: "8px", border: "1px solid #ffe082" }}>Open</span>
                      : isCheckingOutToday
                        ? <span className="checkout-today">Today</span>
                        : <span className="date-val">{res.check_out}</span>
                    }
                  </div>
                  <div className="ih-td"><span className="rate-val">₱{parseFloat(res.total_amount||0).toLocaleString()}</span></div>
                  <div className="ih-td">
                    <button className="view-btn" onClick={() => openModal(res)}>
                      <RiEyeLine size={13} /> View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── DETAIL MODAL ── */}
      {selected && (() => {
        const charges = getCharges(selected);
        const total   = calcTotal(selected);
        const stayed  = nightsStayed(selected.check_in);
        const left    = nightsLeft(selected.check_out);
        const isToday = selected.check_out ? selected.check_out === today : false;

        return (
          <div className="mo" onClick={closeModal}>
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
                  <button className="mx" onClick={closeModal}>×</button>
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
                            {selected.check_out}{isToday ? " ★" : ""}
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
                          <div className="info-lbl"><RiMoneyDollarCircleLine size={10} />Room Rate</div>
                          <div className="info-val" style={{ fontSize: "1.1rem", color: "#07713c" }}>
                            ₱{parseFloat(selected.total_amount||0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Extend Stay */}
                      <div className="extend-box">
                        <div className="extend-title"><RiCalendar2Line size={13} />
                          {selected.check_out ? "Extend Stay" : "Set Check-Out Date"}
                        </div>
                        <div className="extend-row">
                          <input
                            type="date"
                            className="extend-input"
                            value={extDate}
                            min={selected.check_in || today}
                            onChange={e => setExtDate(e.target.value)}
                            placeholder="Select new date"
                          />
                          <button
                            className="extend-btn"
                            onClick={handleExtendStay}
                            disabled={extending || !extDate}
                          >
                            <RiCalendar2Line size={13} />
                            {extending ? "Saving..." : selected.check_out ? "Extend" : "Set Date"}
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
                      <div className="msec-title"><RiAddCircleLine size={13} />Additional Charges</div>

                      {charges.length > 0 ? (
                        <div style={{ marginBottom: "10px", maxHeight: "220px", overflowY: "auto" }}>
                          {charges.map(c => (
                            <div key={c.id} className="charge-row">
                              <span className="charge-name">{c.name}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="charge-amt">₱{parseFloat(c.amount).toLocaleString()}</span>
                                <button className="charge-del" onClick={() => handleDeleteCharge(c.id)}>
                                  <RiDeleteBinLine size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: "#aaa", fontSize: ".82rem", marginBottom: "10px", fontStyle: "italic" }}>
                          No additional charges yet.
                        </div>
                      )}

                      {/* Add charge */}
                      <div className="add-row">
                        <input className="add-fi" value={reqName} onChange={e => setReqName(e.target.value)}
                          placeholder="Description..." onKeyDown={e => e.key === "Enter" && handleAddCharge()} />
                        <input type="number" className="add-fi" style={{ flex: "0 0 90px" }} value={reqAmt}
                          onChange={e => setReqAmt(e.target.value)} placeholder="₱"
                          onKeyDown={e => e.key === "Enter" && handleAddCharge()} />
                        <button className="add-btn" onClick={handleAddCharge} disabled={saving || !reqName.trim() || !reqAmt}>
                          {saving ? "..." : "+ Add"}
                        </button>
                      </div>
                    </div>

                    {/* Total Bill */}
                    <div className="total-bar">
                      <div>
                        <div className="total-lbl">Total Bill</div>
                        {charges.length > 0 && (
                          <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,.6)", marginTop: "2px" }}>
                            Room + {charges.length} extra charge{charges.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                      <span className="total-amt">₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mfoot">
                <button className="btn-close" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}