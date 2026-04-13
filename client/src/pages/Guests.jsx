import React, { useState, useEffect } from "react";
import { RiGroupLine, RiHome4Line, RiStarLine, RiSearchLine, RiCloseLine } from "react-icons/ri";
import supabase from "../supabaseClient";

const STATUS_CFG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20",  label: "Confirmed"   },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0",  label: "Checked In"  },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a",  label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828",  label: "Cancelled"   },
  pending:     { bg: "#fff8e1", color: "#f57f17",  label: "Pending"     },
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #07713c;
  --green-dark: #055a2f;
  --green-light: #e8f5ee;
  --gold: #dbba14;
  --gold-light: #fdf8e1;
  --gold-muted: rgba(219,186,20,0.15);
  --bg: #f2f5f0;
  --white: #ffffff;
  --border: #e2e8e2;
  --text: #1a2e1a;
  --text-sec: #5a6e5a;
  --text-muted: #8fa08f;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.11);
}

.g-page {
  padding: 28px 32px 48px;
  font-family: 'Roboto', sans-serif;
  background: var(--bg);
  min-height: 100%;
}

/* ── PAGE HEADER ── */
.g-hdr {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
}
.g-hdr-left {}
.g-page-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.g-page-title::before {
  content: '';
  display: inline-block; width: 4px; height: 24px;
  background: var(--gold); border-radius: 2px; flex-shrink: 0;
}
.g-page-sub { font-size: .85rem; color: var(--text-muted); margin: 5px 0 0; }

/* ── STAT CARDS ── */
.g-sc-3 {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 14px; margin-bottom: 22px;
}
.g-sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.g-sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.g-sc::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.g-sc:hover::after { opacity: 1; }
.g-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.g-sc-ico { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.g-sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.g-sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── FILTER BAR ── */
.g-fbar {
  display: flex; gap: 10px; align-items: center;
  background: var(--white); border-radius: var(--radius);
  padding: 14px 20px; margin-bottom: 20px;
  border: 1px solid var(--border); flex-wrap: wrap;
  box-shadow: var(--shadow);
}
.g-search-wrap {
  flex: 1; min-width: 180px; position: relative; display: flex; align-items: center;
}
.g-search-icon {
  position: absolute; left: 12px; color: var(--text-muted); flex-shrink: 0;
  pointer-events: none;
}
.g-finput {
  width: 100%; padding: 9px 14px 9px 36px;
  border: 1.5px solid var(--border); border-radius: 10px;
  font-size: .88rem; font-family: 'Roboto', sans-serif; color: var(--green);
  outline: none; background: var(--bg); transition: border-color .2s, box-shadow .2s;
}
.g-finput:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); background: var(--white); }
.g-finput::placeholder { color: var(--text-muted); font-style: italic; }
.g-fselect {
  padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 10px;
  font-size: .85rem; font-family: 'Roboto', sans-serif; color: var(--green);
  outline: none; background: var(--bg); cursor: pointer; flex-shrink: 0;
  transition: border-color .2s;
}
.g-fselect:focus { border-color: var(--green); }

/* ── MAIN GRID ── */
.g-grid-1 { display: grid; grid-template-columns: 1fr; gap: 20px; }
.g-grid-2 { display: grid; grid-template-columns: 1fr 380px; gap: 20px; }

/* ── TABLE CARD ── */
.g-tc {
  background: var(--white); border-radius: var(--radius);
  border: 1px solid var(--border); box-shadow: var(--shadow); overflow: hidden;
}
.g-tc-hdr {
  padding: 15px 22px 13px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border); background: var(--green-light);
}
.g-tc-title {
  font-size: .92rem; font-weight: 700; color: var(--green);
  display: flex; align-items: center; gap: 8px;
}
.g-tc-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 16px; background: var(--gold); border-radius: 2px;
}
.g-tc-badge {
  font-size: .62rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  background: var(--gold-light); color: #7a5f00; border-radius: 20px;
  padding: 3px 10px; border: 1px solid rgba(219,186,20,.3);
}
.g-tc-head {
  display: grid; padding: 8px 22px;
  background: #fafcfa; border-bottom: 1px solid var(--border);
}
.g-th { font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--text-muted); }
.g-tc-scroll { overflow-y: auto; max-height: 520px; }
.g-tc-scroll::-webkit-scrollbar { width: 3px; }
.g-tc-scroll::-webkit-scrollbar-thumb { background: #d1e8d1; border-radius: 10px; }

.g-tr {
  display: grid; padding: 11px 22px; align-items: center;
  border-bottom: 1px solid #f4f7f4; transition: background .15s; cursor: pointer;
}
.g-tr:last-child { border-bottom: none; }
.g-tr:hover { background: #f4faf4; }
.g-tr.active { background: var(--green-light); }

.g-rg { display: flex; align-items: center; gap: 10px; min-width: 0; }
.g-av {
  width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
  background: var(--green); color: var(--white);
  font-weight: 700; font-size: .8rem;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(219,186,20,.4);
}
.g-rg-name { font-size: .86rem; font-weight: 600; color: var(--green); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.g-rg-sub  { font-size: .71rem; color: var(--text-muted); }
.g-cell-room { font-weight: 700; font-size: .84rem; color: var(--green); }
.g-cell-date { font-size: .82rem; color: var(--text-sec); }
.g-cell-email { font-size: .8rem; color: var(--text-sec); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.g-pill { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: .7rem; font-weight: 700; }
.g-view-btn { font-size: .8rem; font-weight: 700; color: var(--gold); background: var(--gold-light); border: 1px solid rgba(219,186,20,.3); border-radius: 7px; padding: 3px 9px; }
.g-empty { padding: 48px; text-align: center; color: var(--text-muted); font-size: .88rem; }

/* ── GUEST DETAIL PANEL ── */
.g-detail {
  background: var(--white); border-radius: var(--radius);
  border: 1px solid var(--border); box-shadow: var(--shadow-md);
  overflow: hidden; align-self: start; position: sticky; top: 0;
}
.g-detail-hdr {
  background: var(--green); padding: 20px 22px; position: relative; overflow: hidden;
}
.g-detail-hdr::before {
  content: ''; position: absolute;
  width: 180px; height: 180px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,.15);
  top: -60px; right: -60px; pointer-events: none;
}
.g-detail-hdr::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold);
}
.g-detail-avatar {
  width: 48px; height: 48px; border-radius: 12px;
  background: rgba(255,255,255,.12); border: 2px solid rgba(219,186,20,.5);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); font-weight: 700; font-size: 1.1rem;
  flex-shrink: 0;
}
.g-detail-close {
  background: rgba(255,255,255,.12); border: none;
  width: 28px; height: 28px; border-radius: 50%;
  cursor: pointer; color: var(--white); font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; flex-shrink: 0;
}
.g-detail-close:hover { background: rgba(255,255,255,.25); }

.g-info-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 18px;
}
.g-info-box {
  background: #f8faf8; border-radius: var(--radius-sm);
  padding: 10px 12px; border: 1px solid var(--border);
}
.g-info-lbl { font-size: .68rem; color: var(--text-muted); margin-bottom: 3px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; }
.g-info-val { font-weight: 700; font-size: .84rem; color: var(--green); }

.g-hist-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 12px;
}
.g-hist-title {
  font-size: .7rem; font-weight: 700; color: var(--green);
  text-transform: uppercase; letter-spacing: .1em;
  display: flex; align-items: center; gap: 6px;
}
.g-hist-title::before {
  content: ''; width: 14px; height: 2px; background: var(--gold); border-radius: 1px;
}
.g-hist-item {
  border: 1px solid var(--border); border-radius: 10px;
  padding: 12px 14px; margin-bottom: 9px;
  transition: border-color .15s, background .15s;
}
.g-hist-item:last-child { margin-bottom: 0; }
.g-hist-item:hover { border-color: rgba(219,186,20,.4); background: #fffef5; }

.g-detail-scroll { overflow-y: auto; max-height: 460px; padding: 18px 20px; }
.g-detail-scroll::-webkit-scrollbar { width: 3px; }
.g-detail-scroll::-webkit-scrollbar-thumb { background: #d1e8d1; border-radius: 10px; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .g-grid-2 { grid-template-columns: 1fr 340px; }
}
@media (max-width: 900px) {
  .g-sc-3 { grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .g-grid-2 { grid-template-columns: 1fr; }
  .g-detail { position: fixed; bottom: 0; left: 0; right: 0; z-index: 400;
    border-radius: 20px 20px 0 0; max-height: 80vh; overflow-y: auto; }
  .g-page { padding: 20px 20px 80px; }
}
@media (max-width: 640px) {
  .g-sc-3 { grid-template-columns: 1fr 1fr; }
  .g-sc-3 > :last-child { grid-column: 1 / -1; }
  .g-page { padding: 16px 14px 80px; }
  .g-hdr { margin-bottom: 16px; }
  .g-page-title { font-size: 1.3rem; }
  .g-tc-head, .g-tr { padding-left: 14px; padding-right: 14px; }
  .g-fbar { padding: 12px 14px; gap: 8px; }
}
@media (max-width: 420px) {
  .g-sc-3 { grid-template-columns: 1fr; }
  .g-sc-3 > :last-child { grid-column: auto; }
}
`;

export default function Guests() {
  const [reservations,  setReservations]  = useState([]);
  const [allYears,      setAllYears]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterYear,    setFilterYear]    = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [selected,      setSelected]      = useState(null);
  const [guestHistory,  setGuestHistory]  = useState([]);
  const [histYear,      setHistYear]      = useState("all");
  const [loadingHist,   setLoadingHist]   = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { console.error("Guests fetch error:", error); setLoading(false); return; }
    const rows = data || [];
    setReservations(rows);
    const years = [...new Set(rows.map(r => r.check_in?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a);
    setAllYears(years);
    setLoading(false);
  };

  const openGuest = async (res) => {
    setSelected(res);
    setHistYear("all");
    setLoadingHist(true);
    let { data } = res.guest_email
      ? await supabase.from("reservations").select("*").eq("guest_email", res.guest_email).order("check_in", { ascending: false })
      : await supabase.from("reservations").select("*").eq("guest_name", res.guest_name).order("check_in", { ascending: false });
    setGuestHistory(data || []);
    setLoadingHist(false);
  };

  const filtered = reservations.filter(r => {
    const matchSearch =
      (r.guest_name  || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.guest_email || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.guest_phone || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.room_number || "").includes(search);
    const matchYear   = filterYear   === "all" || (r.check_in || "").startsWith(filterYear);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchYear && matchStatus;
  });

  const filteredHist = histYear === "all"
    ? guestHistory
    : guestHistory.filter(r => (r.check_in || "").startsWith(histYear));

  const histYears = [...new Set(guestHistory.map(r => r.check_in?.slice(0, 4)).filter(Boolean))].sort((a, b) => b - a);

  const uniqueGuests    = new Set(reservations.map(r => r.guest_email || r.guest_name)).size;
  const currentlyIn     = reservations.filter(r => r.status === "checked_in").length;
  const returningEmails = Object.values(
    reservations.reduce((acc, r) => {
      const k = r.guest_email || r.guest_name;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {})
  ).filter(count => count > 1).length;

  const cols = "2fr 1.4fr 1.1fr .8fr 1fr 1fr 1fr .5fr";

  return (
    <>
      <style>{CSS}</style>
      <div className="g-page">

        <div className="g-hdr">
          <div className="g-hdr-left">
            <h2 className="g-page-title">Guests</h2>
            <p className="g-page-sub">All guest reservations — {reservations.length} total records</p>
          </div>
        </div>

        <div className="g-sc-3">
          {[
            { lbl: "Total Guests",      val: uniqueGuests,    Icon: RiGroupLine, bg: "#e8f5e9", c: "#1b5e20" },
            { lbl: "Currently Staying", val: currentlyIn,     Icon: RiHome4Line, bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Returning Guests",  val: returningEmails, Icon: RiStarLine,  bg: "#fdf8e1", c: "#7a5f00" },
          ].map(({ lbl, val, Icon, bg, c }) => (
            <div key={lbl} className="g-sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="g-sc-row">
                <span className="g-sc-ico"><Icon size={18} color={c} /></span>
                <span className="g-sc-lbl" style={{ color: c }}>{lbl}</span>
              </div>
              <div className="g-sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="g-fbar">
          <div className="g-search-wrap">
            <RiSearchLine size={15} className="g-search-icon" />
            <input
              className="g-finput"
              type="text"
              placeholder="Search by name, email, phone or room..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="g-fselect" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="all">All Years</option>
            {allYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="g-fselect" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className={selected ? "g-grid-2" : "g-grid-1"}>

          <div className="g-tc">
            <div className="g-tc-hdr">
              <div className="g-tc-title">All Guests</div>
              <span className="g-tc-badge">{filtered.length} of {reservations.length} records</span>
            </div>
            <div className="g-tc-head" style={{ gridTemplateColumns: cols }}>
              {["Guest","Email","Phone","Room","Check-In","Check-Out","Status",""].map(h => (
                <div key={h} className="g-th">{h}</div>
              ))}
            </div>
            <div className="g-tc-scroll">
              {loading ? (
                <div className="g-empty">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="g-empty">No records found.</div>
              ) : filtered.map(r => {
                const s = STATUS_CFG[r.status] || STATUS_CFG.confirmed;
                const isActive = selected?.id === r.id;
                return (
                  <div
                    key={r.id}
                    className={`g-tr${isActive ? " active" : ""}`}
                    style={{ gridTemplateColumns: cols }}
                    onClick={() => openGuest(r)}
                  >
                    <div className="g-rg">
                      <div className="g-av">{(r.guest_name || "?").slice(0, 2).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="g-rg-name">{r.guest_name || "Unknown"}</div>
                        {r.guest_phone && <div className="g-rg-sub">{r.guest_phone}</div>}
                      </div>
                    </div>
                    <div className="g-cell-email">{r.guest_email || "—"}</div>
                    <div style={{ fontSize: ".8rem", color: "var(--text-sec)" }}>{r.guest_phone || "—"}</div>
                    <div className="g-cell-room">{r.room_number || "—"}</div>
                    <div className="g-cell-date">{r.check_in || "—"}</div>
                    <div className="g-cell-date">{r.check_out || "—"}</div>
                    <div>
                      <span className="g-pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div><span className="g-view-btn">View →</span></div>
                  </div>
                );
              })}
            </div>
          </div>

          {selected && (
            <div className="g-detail">
              <div className="g-detail-hdr">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div className="g-detail-avatar">
                      {(selected.guest_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: "700", fontSize: "1rem" }}>{selected.guest_name}</div>
                      <div style={{ color: "rgba(255,255,255,.55)", fontSize: ".78rem", marginTop: "2px" }}>
                        {guestHistory.length} stay{guestHistory.length !== 1 ? "s" : ""} &nbsp;·&nbsp; ₱{guestHistory.reduce((s, r) => s + parseFloat(r.total_amount || 0), 0).toLocaleString()} total
                      </div>
                      <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "5px", background: "rgba(219,186,20,.18)", border: "1px solid rgba(219,186,20,.35)", borderRadius: "20px", padding: "2px 10px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#dbba14", flexShrink: 0 }} />
                        <span style={{ fontSize: ".62rem", fontWeight: "700", color: "#dbba14", letterSpacing: ".1em", textTransform: "uppercase" }}>Guest Profile</span>
                      </div>
                    </div>
                  </div>
                  <button className="g-detail-close" onClick={() => setSelected(null)}>
                    <RiCloseLine size={16} />
                  </button>
                </div>
              </div>

              <div className="g-detail-scroll">
                <div className="g-info-grid">
                  {[
                    ["Email",        selected.guest_email || "—"],
                    ["Phone",        selected.guest_phone || "—"],
                    ["Room",         `Room ${selected.room_number || "—"}`],
                    ["Amount Paid",  `₱${parseFloat(selected.total_amount || 0).toLocaleString()}`],
                    ["Check-In",     selected.check_in  || "—"],
                    ["Check-Out",    selected.check_out || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="g-info-box">
                      <div className="g-info-lbl">{k}</div>
                      <div className="g-info-val">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="g-hist-hdr">
                  <div className="g-hist-title">
                    All Stays {histYear !== "all" && `— ${histYear}`}
                  </div>
                  {histYears.length > 1 && (
                    <select
                      className="g-fselect"
                      style={{ fontSize: ".74rem", padding: "5px 10px" }}
                      value={histYear}
                      onChange={e => setHistYear(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {histYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  )}
                </div>

                {loadingHist ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: ".88rem" }}>Loading...</div>
                ) : filteredHist.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: ".88rem" }}>
                    {histYear !== "all" ? `No stays in ${histYear}.` : "No history found."}
                  </div>
                ) : filteredHist.map(r => {
                  const s = STATUS_CFG[r.status] || STATUS_CFG.confirmed;
                  const nights = (r.check_in && r.check_out)
                    ? Math.max(0, Math.round((new Date(r.check_out) - new Date(r.check_in)) / 86400000))
                    : 0;
                  return (
                    <div key={r.id} className="g-hist-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", color: "var(--green)", fontSize: ".88rem" }}>Room {r.room_number || "—"}</span>
                        <span className="g-pill" style={{ background: s.bg, color: s.color, fontSize: ".7rem" }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>{r.check_in} → {r.check_out}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                        <span style={{ fontWeight: "700", color: "var(--green)", fontSize: ".87rem" }}>
                          ₱{parseFloat(r.total_amount || 0).toLocaleString()}
                        </span>
                        {nights > 0 && (
                          <span style={{ fontSize: ".73rem", color: "var(--text-muted)", background: "var(--bg)", padding: "2px 8px", borderRadius: "10px" }}>
                            {nights} night{nights !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}