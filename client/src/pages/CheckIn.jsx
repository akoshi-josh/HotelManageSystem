import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const G = "#07713c";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.sc-ico { font-size:1.2rem; } .sc-lbl { font-size:.8rem; font-weight:700; text-transform:uppercase; } .sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { display:flex; gap:14px; align-items:center; background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; }
.finput { flex:1; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; transition:border-color .2s,box-shadow .2s; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.btn-primary { padding:11px 22px; background:#07713c; color:#fff; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); transition:background .2s; }
.btn-primary:hover { background:#05592f; }
.section-block { margin-bottom:20px; }
.section-hdr { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
.section-dot { width:10px; height:10px; border-radius:50%; }
.section-lbl { font-size:1rem; font-weight:700; color:#333; }
.tc { background:#fff; border-radius:14px; border:1px solid #e4ebe4; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.tc-head { display:grid; padding:8px 22px; background:#f8faf8; border-bottom:1px solid #eef4ee; }
.th { font-size:.64rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9a7a; }
.tc-scroll { overflow-y:auto; max-height:380px; }
.tr { display:grid; padding:12px 22px; align-items:center; border-bottom:1px solid #f2f7f2; transition:background .15s; }
.tr:last-child { border-bottom:none; }
.tr:hover { background:#f8fdf8; }
.rg { display:flex; align-items:center; gap:10px; min-width:0; }
.av { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#07713c,#5cb85c); color:#fff; font-weight:700; font-size:.84rem; display:flex; align-items:center; justify-content:center; }
.rg-name { font-size:.88rem; font-weight:600; color:#07713c; }
.rg-sub  { font-size:.73rem; color:#8a9a8a; }
.cell-room { font-weight:700; font-size:.86rem; color:#07713c; }
.cell-date { font-size:.84rem; color:#6b7a6b; }
.cell-amt  { font-weight:700; font-size:.86rem; color:#07713c; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
.ba { display:inline-flex; align-items:center; gap:3px; padding:5px 11px; border-radius:7px; border:1.5px solid; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; cursor:pointer; transition:background .15s; }
.ba-in { border-color:#07713c; color:#07713c; background:#fff; }
.ba-in:hover { background:#07713c; color:#fff; }
.ba-blue { border-color:#1565c0; color:#1565c0; background:#fff; }
.ba-blue:hover { background:#1565c0; color:#fff; }
.empty { padding:48px; text-align:center; color:#9aaa9a; }
/* MODAL */
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:16px; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.22); }
.mh { padding:22px 28px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; }
.mh-title { color:#fff; font-size:1.15rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.82rem; margin:4px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:22px 28px; overflow-y:auto; flex:1; }
.mfoot { padding:14px 28px; border-top:1px solid #e4ebe4; display:flex; gap:12px; flex-shrink:0; }
.sc2 { background:#fff; border-radius:12px; padding:18px 20px; margin-bottom:14px; border:1px solid #e4ebe4; }
.sc2-title { font-size:.7rem; font-weight:700; color:#07713c; text-transform:uppercase; letter-spacing:.08em; margin-bottom:14px; }
.flabel { display:block; font-size:.78rem; font-weight:700; color:#3a6a3a; margin-bottom:5px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#07713c; box-sizing:border-box; transition:border-color .2s,box-shadow .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.btn-cancel { flex:1; padding:12px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; transition:background .15s; }
.btn-cancel:hover { background:#f4f6f0; }
.btn-confirm { flex:2; padding:12px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.9rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; box-shadow:0 4px 14px rgba(7,113,60,.28); transition:background .2s; }
.btn-confirm:hover:not(:disabled) { background:#05592f; }
.btn-confirm:disabled { background:#a8b8a8; cursor:not-allowed; box-shadow:none; }
.alert-ok  { padding:10px 15px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.84rem; margin-bottom:14px; }
.alert-err { padding:10px 15px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.84rem; margin-bottom:14px; }
.pmg { display:flex; gap:8px; }
.pm { flex:1; padding:8px 4px; border-radius:8px; cursor:pointer; font-size:.74rem; font-weight:700; font-family:Arial,sans-serif; text-align:center; transition:all .15s; border:1.5px solid #ccdacc; background:#fff; color:#8a9a8a; }
.pm.on { border-color:#07713c; background:#ecfdf5; color:#07713c; }
.pm:not(.on):hover { border-color:#07713c; }
.tot-banner { margin-top:12px; background:#07713c; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; }
`;

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash", icon: "💵" },
  { key: "card", label: "Card", icon: "💳" },
  { key: "gcash", label: "GCash", icon: "📱" },
  { key: "bank_transfer", label: "Bank", icon: "🏦" },
];

export default function CheckIn() {
  const [reservations, setReservations] = useState([]);
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [showWalkIn,   setShowWalkIn]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [processing,   setProcessing]   = useState(false);
  const [payMethod,    setPayMethod]    = useState("cash");
  const [amountPaid,   setAmountPaid]   = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");
  const [walkIn, setWalkIn] = useState({ guest_name:"", guest_email:"", guest_phone:"", room_id:"", check_in: new Date().toISOString().split("T")[0], check_out:"", notes:"" });
  const [walkInErr,    setWalkInErr]    = useState("");
  const [savingWalk,   setSavingWalk]   = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: r }, { data: rm }] = await Promise.all([
      supabase.from("reservations").select("*").in("status",["confirmed","pending"]).order("check_in"),
      supabase.from("rooms").select("*").order("room_number"),
    ]);
    setReservations(r || []); setRooms(rm || []); setLoading(false);
  };

  const availRooms = rooms.filter(r => r.status === "available");

  const openCheckIn = (res) => {
    setSelected(res); setAmountPaid(res.total_amount?.toString() || ""); setPayMethod("cash"); setSuccessMsg(""); setShowModal(true);
  };

  const handleCheckIn = async () => {
    if (!amountPaid) return;
    setProcessing(true);
    await supabase.from("reservations").update({ status:"checked_in", payment_method:payMethod, amount_paid:parseFloat(amountPaid) }).eq("id", selected.id);
    await supabase.from("rooms").update({ status:"occupied" }).eq("id", selected.room_id);
    setProcessing(false); setSuccessMsg("Guest successfully checked in!");
    fetchData(); setTimeout(() => { setShowModal(false); setSuccessMsg(""); }, 1800);
  };

  const calcWalkTotal = () => {
    const rm = rooms.find(r => r.id === walkIn.room_id);
    if (!rm || !walkIn.check_in || !walkIn.check_out) return 0;
    const nights = Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000);
    return nights * parseFloat(rm.price);
  };

  const handleWalkIn = async () => {
    setWalkInErr("");
    if (!walkIn.guest_name || !walkIn.room_id || !walkIn.check_in || !walkIn.check_out) { setWalkInErr("Please fill in all required fields."); return; }
    if (new Date(walkIn.check_out) <= new Date(walkIn.check_in)) { setWalkInErr("Check-out must be after check-in."); return; }
    setSavingWalk(true);
    const rm = rooms.find(r => r.id === walkIn.room_id);
    const nights = Math.max(0, (new Date(walkIn.check_out) - new Date(walkIn.check_in)) / 86400000);
    const total = nights * parseFloat(rm?.price || 0);
    const { error } = await supabase.from("reservations").insert({
      guest_name:walkIn.guest_name, guest_email:walkIn.guest_email, guest_phone:walkIn.guest_phone,
      room_id:walkIn.room_id, room_number:rm?.room_number,
      check_in:walkIn.check_in, check_out:walkIn.check_out,
      status:"checked_in", total_amount:total, notes:walkIn.notes, amount_paid:total,
    });
    if (error) { setWalkInErr(error.message); setSavingWalk(false); return; }
    await supabase.from("rooms").update({ status:"occupied" }).eq("id", walkIn.room_id);
    setSavingWalk(false); setShowWalkIn(false);
    setWalkIn({ guest_name:"", guest_email:"", guest_phone:"", room_id:"", check_in:today, check_out:"", notes:"" });
    fetchData();
  };

  const filtered = reservations.filter(r =>
    r.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.room_number||"").includes(search) ||
    (r.guest_phone||"").includes(search)
  );

  const overdue  = filtered.filter(r => r.check_in < today);
  const todayArr = filtered.filter(r => r.check_in === today);
  const upcoming = filtered.filter(r => r.check_in > today);

  const nights = selected ? Math.max(0, (new Date(selected.check_out) - new Date(selected.check_in)) / 86400000) : 0;

  const SectionTable = ({ title, data, dotColor }) => {
    if (!data.length) return null;
    return (
      <div className="section-block">
        <div className="section-hdr">
          <div className="section-dot" style={{ background: dotColor }} />
          <div className="section-lbl">{title} ({data.length})</div>
        </div>
        <div className="tc">
          <div className="tc-head" style={{ gridTemplateColumns:"2.4fr .8fr 1fr 1fr 1fr 1fr 1fr" }}>
            {["Guest","Room","Check-In","Check-Out","Total","Type","Action"].map(h => <div key={h} className="th">{h}</div>)}
          </div>
          <div className="tc-scroll">
            {data.map(res => {
              const isOverdue = res.check_in < today;
              return (
                <div key={res.id} className="tr" style={{ gridTemplateColumns:"2.4fr .8fr 1fr 1fr 1fr 1fr 1fr" }}>
                  <div className="rg">
                    <div className="av">{res.guest_name.slice(0,2).toUpperCase()}</div>
                    <div><div className="rg-name">{res.guest_name}</div>{res.guest_phone && <div className="rg-sub">{res.guest_phone}</div>}</div>
                  </div>
                  <div className="cell-room">{res.room_number||"—"}</div>
                  <div className="cell-date">{res.check_in}</div>
                  <div className="cell-date">{res.check_out}</div>
                  <div className="cell-amt">₱{parseFloat(res.total_amount||0).toLocaleString()}</div>
                  <div><span className="pill" style={{ background: isOverdue?"#fff3e0":"#e8f5e9", color: isOverdue?"#e65100":"#1b5e20" }}>{isOverdue?"Overdue":res.check_in===today?"Today":"Upcoming"}</span></div>
                  <div style={{ textAlign:"right" }}><button className="ba ba-in" onClick={() => openCheckIn(res)}>✅ Check In</button></div>
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
          <div><h2 className="page-title">Check-In</h2><p className="page-sub">Process guest arrivals and walk-ins</p></div>
          <button className="btn-primary" onClick={() => setShowWalkIn(true)}>🚶 Walk-In Guest</button>
        </div>

        <div className="sc-4">
          {[
            { lbl:"Today's Arrivals",   val:reservations.filter(r=>r.check_in===today).length,  ico:"📅", bg:"#e8f5e9", c:"#1b5e20" },
            { lbl:"Overdue",            val:reservations.filter(r=>r.check_in<today).length,    ico:"⏳", bg:"#fff3e0", c:"#e65100" },
            { lbl:"Upcoming",           val:reservations.filter(r=>r.check_in>today).length,    ico:"🗓️", bg:"#e3f2fd", c:"#1565c0" },
            { lbl:"Available Rooms",    val:availRooms.length,                                   ico:"🛏️", bg:"#f3e5f5", c:"#6a1b9a" },
          ].map(({ lbl, val, ico, bg, c }) => (
            <div key={lbl} className="sc" style={{ background:bg }}>
              <div className="sc-row"><span className="sc-ico">{ico}</span><span className="sc-lbl" style={{ color:c }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput" type="text" placeholder="🔍  Search guest, room, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading
          ? <div className="empty">Loading...</div>
          : filtered.length === 0
            ? <div style={{ background:"#fff", borderRadius:"14px", padding:"60px", textAlign:"center", border:"1px solid #e4ebe4" }}><div style={{ fontSize:"3rem",marginBottom:"12px" }}>🎉</div><div style={{ fontWeight:"700",color:"#333" }}>No pending check-ins!</div></div>
            : <><SectionTable title="Overdue — Not Yet Checked In" data={overdue}   dotColor="#e65100" /><SectionTable title="Today's Arrivals" data={todayArr} dotColor="#4caf50" /><SectionTable title="Upcoming Arrivals" data={upcoming} dotColor="#1565c0" /></>
        }
      </div>

      {/* CHECK-IN MODAL */}
      {showModal && selected && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" style={{ maxWidth:"500px" }} onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background:"linear-gradient(135deg,#07713c,#0a9150)" }}>
              <div><div className="mh-title">✅ Process Check-In</div><div className="mh-sub">Confirm arrival and collect payment</div></div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {successMsg && <div className="alert-ok">✓ {successMsg}</div>}
              <div className="sc2">
                <div className="sc2-title">📋 Guest Summary</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  {[["Guest",selected.guest_name],["Room",`Room ${selected.room_number}`],["Check-In",selected.check_in],["Check-Out",selected.check_out],["Duration",`${nights} night${nights!==1?"s":""}`],["Total",`₱${parseFloat(selected.total_amount||0).toLocaleString()}`]].map(([k,v]) => (
                    <div key={k}><div style={{ color:"#9aaa9a",fontSize:".72rem",fontWeight:"700",textTransform:"uppercase" }}>{k}</div><div style={{ fontWeight:"600",color:"#07713c",marginTop:"2px" }}>{v}</div></div>
                  ))}
                </div>
              </div>
              <div className="sc2">
                <div className="sc2-title">💳 Payment</div>
                <div style={{ marginBottom:"12px" }}>
                  <label className="flabel">Payment Method</label>
                  <div className="pmg">{PAYMENT_METHODS.map(m => <button key={m.key} className={`pm${payMethod===m.key?" on":""}`} type="button" onClick={() => setPayMethod(m.key)}>{m.icon}<br/>{m.label}</button>)}</div>
                </div>
                <div><label className="flabel">Amount to Collect (₱)</label><input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} className="fi" /></div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleCheckIn} disabled={processing||!amountPaid}>{processing?"Processing…":"✅ Confirm Check-In"}</button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN MODAL */}
      {showWalkIn && (
        <div className="mo" onClick={() => setShowWalkIn(false)}>
          <div className="mb" style={{ maxWidth:"560px" }} onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background:"linear-gradient(135deg,#1565c0,#1976d2)" }}>
              <div><div className="mh-title">🚶 Walk-In Guest</div><div className="mh-sub">Guest arrives without prior reservation</div></div>
              <button className="mx" onClick={() => setShowWalkIn(false)}>×</button>
            </div>
            <div className="mbody">
              {walkInErr && <div className="alert-err">✕ {walkInErr}</div>}
              <div className="sc2">
                <div className="sc2-title" style={{ color:"#1565c0" }}>👤 Guest Information</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                  <div style={{ gridColumn:"1/-1" }}><label className="flabel">Full Name *</label><input className="fi" value={walkIn.guest_name} onChange={e=>setWalkIn({...walkIn,guest_name:e.target.value})} placeholder="e.g. Juan Dela Cruz" /></div>
                  <div><label className="flabel">Email</label><input type="email" className="fi" value={walkIn.guest_email} onChange={e=>setWalkIn({...walkIn,guest_email:e.target.value})} placeholder="guest@email.com" /></div>
                  <div><label className="flabel">Phone</label><input className="fi" value={walkIn.guest_phone} onChange={e=>setWalkIn({...walkIn,guest_phone:e.target.value})} placeholder="+63 9XX XXX XXXX" /></div>
                </div>
              </div>
              <div className="sc2">
                <div className="sc2-title" style={{ color:"#1565c0" }}>🛏️ Room & Dates</div>
                <div style={{ marginBottom:"14px" }}><label className="flabel">Select Room *</label><select className="fi" value={walkIn.room_id} onChange={e=>setWalkIn({...walkIn,room_id:e.target.value})} style={{ cursor:"pointer" }}><option value="">— Choose available room —</option>{availRooms.map(r=><option key={r.id} value={r.id}>Room {r.room_number} | {r.type} | Flr {r.floor} | ₱{parseFloat(r.price).toLocaleString()}/night</option>)}</select></div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                  <div><label className="flabel">Check-In *</label><input type="date" className="fi" value={walkIn.check_in} onChange={e=>setWalkIn({...walkIn,check_in:e.target.value})} /></div>
                  <div><label className="flabel">Check-Out *</label><input type="date" className="fi" value={walkIn.check_out} onChange={e=>setWalkIn({...walkIn,check_out:e.target.value})} /></div>
                </div>
                {calcWalkTotal() > 0 && (
                  <div className="tot-banner">
                    <span style={{ color:"rgba(255,255,255,.72)",fontSize:".86rem" }}>{Math.round((new Date(walkIn.check_out)-new Date(walkIn.check_in))/86400000)} nights</span>
                    <span style={{ color:"#fff",fontWeight:"700" }}>Total: ₱{calcWalkTotal().toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowWalkIn(false)}>Cancel</button>
              <button className="btn-confirm" style={{ background:savingWalk?"#a8b8a8":"#1565c0", boxShadow:"0 4px 14px rgba(21,101,192,.3)" }} onClick={handleWalkIn} disabled={savingWalk}>{savingWalk?"Checking In…":"🚶 Check In Now"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}