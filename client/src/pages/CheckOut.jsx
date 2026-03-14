import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.sc-ico { font-size:1.2rem; }
.sc-lbl { font-size:.8rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { display:flex; gap:14px; align-items:center; background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; }
.finput { flex:1; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.section-block { margin-bottom:20px; }
.section-hdr { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.section-dot { width:10px; height:10px; border-radius:50%; }
.section-lbl { font-size:1rem; font-weight:700; color:#333; }
.tc { background:#fff; border-radius:14px; border:1px solid #e4ebe4; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.tc-head { display:grid; padding:8px 22px; background:#f8faf8; border-bottom:1px solid #eef4ee; }
.th { font-size:.64rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9a7a; }
.tc-scroll { overflow-y:auto; max-height:380px; }
.tc-scroll::-webkit-scrollbar { width:4px; }
.tc-scroll::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
.tr { display:grid; padding:12px 22px; align-items:center; border-bottom:1px solid #f2f7f2; transition:background .15s; }
.tr:last-child { border-bottom:none; }
.tr:hover { background:#f8fdf8; }
.rg { display:flex; align-items:center; gap:10px; min-width:0; }
.av { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#07713c,#5cb85c); color:#fff; font-weight:700; font-size:.84rem; display:flex; align-items:center; justify-content:center; }
.rg-name { font-size:.88rem; font-weight:600; color:#07713c; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rg-sub  { font-size:.73rem; color:#8a9a8a; }
.cell-room { font-weight:700; font-size:.86rem; color:#07713c; }
.cell-date { font-size:.84rem; color:#6b7a6b; }
.cell-amt  { font-weight:700; font-size:.86rem; color:#07713c; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
.ba { display:inline-flex; align-items:center; gap:3px; padding:5px 11px; border-radius:7px; border:1.5px solid; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; cursor:pointer; transition:background .15s; }
.ba-out { border-color:#e65100; color:#e65100; background:#fff; }
.ba-out:hover { background:#fff3e0; }
.empty { padding:48px; text-align:center; color:#9aaa9a; font-size:.88rem; }
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:16px; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.22); }
.mh { padding:22px 28px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; }
.mh-title { color:#fff; font-size:1.15rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.82rem; margin:4px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:22px 28px; overflow-y:auto; flex:1; }
.mbody::-webkit-scrollbar { width:4px; }
.mbody::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
.mfoot { padding:14px 28px; border-top:1px solid #e4ebe4; display:flex; gap:12px; flex-shrink:0; }
.sc2 { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:14px; border:1px solid #e4ebe4; }
.sc2-title { font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
.flabel { display:block; font-size:.78rem; font-weight:700; color:#3a6a3a; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#07713c; box-sizing:border-box; transition:border-color .2s,box-shadow .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.btn-cancel { flex:1; padding:12px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-cancel:hover { background:#f4f6f0; }
.btn-confirm { flex:2; padding:12px; border:none; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; }
.btn-confirm:disabled { opacity:.6; cursor:not-allowed; }
.alert-ok { padding:10px 15px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.84rem; margin-bottom:14px; }
.pmg { display:flex; gap:8px; }
.pm { flex:1; padding:8px 4px; border-radius:8px; cursor:pointer; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; text-align:center; transition:all .15s; border:1.5px solid #ccdacc; background:#fff; color:#8a9a8a; }
.brow { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px dashed #eef4ee; font-size:.9rem; }
.brow:last-child { border:none; }
.btotal { display:flex; justify-content:space-between; padding:11px 0 3px; font-size:1.05rem; }
`;

const PM_METHODS = [
  { key: "cash",          label: "Cash",  icon: "💵" },
  { key: "card",          label: "Card",  icon: "💳" },
  { key: "gcash",         label: "GCash", icon: "📱" },
  { key: "bank_transfer", label: "Bank",  icon: "🏦" },
];

export default function CheckOut() {
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [payMethod,    setPayMethod]    = useState("cash");
  const [extraChg,     setExtraChg]     = useState("");
  const [extraNote,    setExtraNote]    = useState("");
  const [received,     setReceived]     = useState("");
  const [fullyPaid,    setFullyPaid]    = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("reservations").select("*").eq("status", "checked_in").order("check_out");
    setReservations(data || []);
    setLoading(false);
  };

  const openModal = (res) => {
    setSelected(res);
    setExtraChg(""); setExtraNote(""); setPayMethod("cash");
    setFullyPaid(false); setSuccessMsg("");
    const bal = parseFloat(res.total_amount || 0) - parseFloat(res.amount_paid || 0);
    setReceived(bal > 0 ? bal.toString() : "0");
    setShowModal(true);
  };

  const base  = parseFloat(selected?.total_amount || 0);
  const paid  = parseFloat(selected?.amount_paid  || 0);
  const extra = parseFloat(extraChg || 0);
  const grand = base + extra;
  const bal   = Math.max(0, grand - paid);
  const chg   = fullyPaid ? 0 : Math.max(0, parseFloat(received || 0) - bal);

  const handleCheckOut = async () => {
    setProcessing(true);
    await supabase.from("reservations").update({
      status: "checked_out",
      total_amount: grand,
      payment_method: payMethod,
      amount_paid: grand,
      extra_charges: extra,
      extra_charges_note: extraNote,
      checked_out_at: new Date().toISOString(),
    }).eq("id", selected.id);
    await supabase.from("rooms").update({ status: "available" }).eq("id", selected.room_id);
    setProcessing(false);
    setSuccessMsg("Guest successfully checked out! Room is now available.");
    fetchData();
    setTimeout(() => { setShowModal(false); setSuccessMsg(""); }, 2000);
  };

  const filtered = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number || "").includes(search)
  );
  const overdue  = filtered.filter(r => r.check_out < today);
  const todayCO  = filtered.filter(r => r.check_out === today);
  const upcoming = filtered.filter(r => r.check_out > today);

  const SectionTable = ({ title, data, dotColor }) => {
    if (!data.length) return null;
    const cols = "2fr .8fr 1fr 1fr .8fr 1fr 1fr 1fr";
    return (
      <div className="section-block">
        <div className="section-hdr">
          <div className="section-dot" style={{ background: dotColor }} />
          <div className="section-lbl">{title} ({data.length})</div>
        </div>
        <div className="tc">
          <div className="tc-head" style={{ gridTemplateColumns: cols }}>
            {["Guest","Room","Check-In","Check-Out","Nights","Total","Status","Action"].map(h => (
              <div key={h} className="th">{h}</div>
            ))}
          </div>
          <div className="tc-scroll">
            {data.map(res => {
              const nights = Math.max(0, (new Date(res.check_out) - new Date(res.check_in)) / 86400000);
              const isOD = res.check_out < today;
              const isTD = res.check_out === today;
              return (
                <div key={res.id} className="tr" style={{ gridTemplateColumns: cols }}>
                  <div className="rg">
                    <div className="av" style={isOD ? { background: "linear-gradient(135deg,#e65100,#ff9800)" } : {}}>
                      {res.guest_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="rg-name">{res.guest_name}</div>
                      {res.guest_phone && <div className="rg-sub">{res.guest_phone}</div>}
                    </div>
                  </div>
                  <div className="cell-room">{res.room_number || "—"}</div>
                  <div className="cell-date">{res.check_in}</div>
                  <div className="cell-date" style={{ color: isOD ? "#e53935" : "inherit", fontWeight: isOD ? "700" : "400" }}>
                    {res.check_out}
                  </div>
                  <div style={{ fontSize: ".84rem", color: "#6b7a6b" }}>{nights}n</div>
                  <div className="cell-amt">₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
                  <div>
                    <span className="pill" style={{
                      background: isOD ? "#fce4ec" : isTD ? "#fff8e1" : "#e3f2fd",
                      color: isOD ? "#c62828" : isTD ? "#f57f17" : "#1565c0",
                    }}>
                      {isOD ? "⚠️ Overdue" : isTD ? "Today" : "Upcoming"}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button className="ba ba-out" onClick={() => openModal(res)}>🚪 Check Out</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Check-Out</h2>
            <p className="page-sub">Process guest departures and collect final payments</p>
          </div>
        </div>

        <div className="sc-4">
          {[
            { lbl: "Currently Staying",  val: reservations.length,                                    ico: "🏠", bg: "#e8f5e9", c: "#1b5e20" },
            { lbl: "Overdue Check-Outs", val: reservations.filter(r => r.check_out < today).length,   ico: "⚠️", bg: "#fce4ec", c: "#c62828" },
            { lbl: "Checkout Today",     val: reservations.filter(r => r.check_out === today).length, ico: "🚪", bg: "#fff3e0", c: "#e65100" },
            { lbl: "Upcoming",           val: reservations.filter(r => r.check_out > today).length,   ico: "🗓️", bg: "#e3f2fd", c: "#1565c0" },
          ].map(({ lbl, val, ico, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row"><span className="sc-ico">{ico}</span><span className="sc-lbl" style={{ color: c }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" type="text" placeholder="🔍  Search guest or room..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: "14px", padding: "60px", textAlign: "center", border: "1px solid #e4ebe4" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏨</div>
            <div style={{ fontWeight: "700", color: "#333" }}>No guests currently checked in</div>
          </div>
        ) : (
          <>
            <SectionTable title="Overdue — Should Have Checked Out" data={overdue}  dotColor="#c62828" />
            <SectionTable title="Checking Out Today"                data={todayCO}  dotColor="#e65100" />
            <SectionTable title="Still Staying"                     data={upcoming} dotColor="#1565c0" />
          </>
        )}
      </div>

      {showModal && selected && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background: "linear-gradient(135deg,#bf360c,#e65100)" }}>
              <div>
                <p className="mh-title">🚪 Process Check-Out</p>
                <p className="mh-sub">Review charges and collect final payment</p>
              </div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {successMsg && <div className="alert-ok">✓ {successMsg}</div>}

              <div className="sc2">
                <div className="sc2-title" style={{ color: "#e65100" }}>📋 Reservation Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {[
                    ["Guest",       selected.guest_name],
                    ["Room",        `Room ${selected.room_number}`],
                    ["Check-In",    selected.check_in],
                    ["Check-Out",   selected.check_out],
                    ["Duration",    `${Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000)} nights`],
                    ["Room Charge", `₱${parseFloat(selected.total_amount || 0).toLocaleString()}`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#f8faf8", borderRadius: "8px", padding: "10px 12px" }}>
                      <div style={{ color: "#9aaa9a", fontSize: ".72rem", fontWeight: "700", textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontWeight: "600", color: "#07713c", marginTop: "2px", fontSize: ".88rem" }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sc2">
                <div className="sc2-title" style={{ color: "#e65100" }}>➕ Extra Charges (Optional)</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="flabel">Amount (₱)</label>
                    <input type="number" className="fi" value={extraChg} onChange={e => setExtraChg(e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="flabel">Reason</label>
                    <input className="fi" value={extraNote} onChange={e => setExtraNote(e.target.value)} placeholder="e.g. Room service" />
                  </div>
                </div>
              </div>

              <div className="sc2">
                <div className="sc2-title" style={{ color: "#e65100" }}>💳 Payment Method</div>
                <div className="pmg">
                  {PM_METHODS.map(m => (
                    <button
                      key={m.key}
                      type="button"
                      className="pm"
                      style={payMethod === m.key ? { borderColor: "#e65100", background: "#fff3e0", color: "#e65100" } : {}}
                      onClick={() => setPayMethod(m.key)}
                    >
                      {m.icon}<br />{m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc2">
                <div className="sc2-title" style={{ color: "#e65100" }}>🧾 Bill Breakdown</div>
                <div className="brow"><span style={{ color: "#6b7a6b" }}>Room Charge</span><span style={{ fontWeight: "600" }}>₱{base.toLocaleString()}</span></div>
                <div className="brow"><span style={{ color: "#6b7a6b" }}>Extra Charges</span><span style={{ fontWeight: "600" }}>₱{extra.toLocaleString()}</span></div>
                <div className="brow"><span style={{ color: "#6b7a6b" }}>Already Paid</span><span style={{ fontWeight: "600", color: "#4caf50" }}>-₱{paid.toLocaleString()}</span></div>
                <div className="btotal">
                  <span style={{ fontWeight: "700", color: "#333" }}>Balance Due</span>
                  <span style={{ fontWeight: "700", color: bal > 0 ? "#e65100" : "#4caf50", fontSize: "1.2rem" }}>₱{bal.toLocaleString()}</span>
                </div>
              </div>

              <div className="sc2">
                <div className="sc2-title" style={{ color: "#e65100" }}>💰 Collect Payment</div>
                <div
                  onClick={() => { setFullyPaid(!fullyPaid); if (!fullyPaid) setReceived(bal.toString()); }}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: `1.5px solid ${fullyPaid ? "#07713c" : "#ccdacc"}`, background: fullyPaid ? "#e8f5e9" : "#f8faf8", cursor: "pointer", marginBottom: "14px" }}
                >
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: `2px solid ${fullyPaid ? "#07713c" : "#ccc"}`, background: fullyPaid ? "#07713c" : "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {fullyPaid && <span style={{ color: "white", fontSize: ".75rem", fontWeight: "700" }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: ".9rem", color: fullyPaid ? "#1b5e20" : "#333" }}>Guest has fully paid</div>
                    <div style={{ fontSize: ".78rem", color: "#8a9a8a", marginTop: "1px" }}>Mark as fully settled</div>
                  </div>
                </div>
                {!fullyPaid && (
                  <>
                    <div style={{ marginBottom: "12px" }}>
                      <label className="flabel">Amount Received (₱)</label>
                      <input type="number" className="fi" value={received} onChange={e => setReceived(e.target.value)} placeholder="Enter amount given by guest" style={{ fontSize: "1rem", fontWeight: "700" }} />
                    </div>
                    {chg > 0 && (
                      <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#1b5e20", fontWeight: "600", fontSize: ".9rem" }}>💵 Change to return</span>
                        <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: "1.2rem" }}>₱{chg.toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}
                {fullyPaid && (
                  <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ color: "#1b5e20", fontWeight: "700", fontSize: ".95rem" }}>✅ Payment fully settled — ₱{grand.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn-confirm"
                style={{ background: processing ? "#a8b8a8" : "#e65100", boxShadow: processing ? "none" : "0 4px 14px rgba(230,81,0,.3)" }}
                onClick={handleCheckOut}
                disabled={processing || (!fullyPaid && !received)}
              >
                {processing ? "Processing…" : "🚪 Confirm Check-Out & Mark Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}