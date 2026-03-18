import React, { useState, useEffect } from "react";
import { RiGroupLine, RiHome4Line, RiStarLine } from "react-icons/ri";
import supabase from "../supabaseClient";

const STATUS_CFG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20",  label: "Confirmed"   },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0",  label: "Checked In"  },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a",  label: "Checked Out" },
  cancelled:   { bg: "#fce4ec", color: "#c62828",  label: "Cancelled"   },
  pending:     { bg: "#fff8e1", color: "#f57f17",  label: "Pending"     },
};

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 28px 32px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.6rem; font-weight:700; color:#07713c; margin:0; }
.page-sub   { font-size:.88rem; color:#6b7a6b; margin:4px 0 0; }
.sc-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px; }
.sc { border-radius:14px; padding:20px 22px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:9px; }
.sc-ico { display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.sc-lbl { font-size:.8rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { display:flex; gap:12px; align-items:center; background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; flex-wrap:wrap; }
.finput { flex:1; min-width:160px; padding:10px 14px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.fselect { padding:10px 12px; border:1.5px solid #ccdacc; border-radius:10px; font-size:.88rem; font-family:Arial,sans-serif; color:#07713c; outline:none; background:#fff; cursor:pointer; flex-shrink:0; }
.fselect:focus { border-color:#07713c; }
.tc { background:#fff; border-radius:14px; border:1px solid #e4ebe4; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; }
.tc-hdr { padding:16px 22px 12px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eef4ee; }
.tc-title { font-size:.92rem; font-weight:700; color:#07713c; }
.tc-badge { font-size:.65rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; background:#ecfdf5; color:#07713c; border-radius:20px; padding:3px 10px; border:1px solid #d1fae5; }
.tc-head { display:grid; padding:8px 22px; background:#f8faf8; border-bottom:1px solid #eef4ee; }
.th { font-size:.64rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#7a9a7a; }
.tc-scroll { overflow-y:auto; max-height:520px; }
.tc-scroll::-webkit-scrollbar { width:4px; }
.tc-scroll::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
.tr { display:grid; padding:12px 22px; align-items:center; border-bottom:1px solid #f2f7f2; transition:background .15s; cursor:pointer; }
.tr:last-child { border-bottom:none; }
.tr:hover { background:#f8fdf8; }
.rg { display:flex; align-items:center; gap:10px; min-width:0; }
.av { width:36px; height:36px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#07713c,#5cb85c); color:#fff; font-weight:700; font-size:.84rem; display:flex; align-items:center; justify-content:center; }
.rg-name { font-size:.88rem; font-weight:600; color:#07713c; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.rg-sub  { font-size:.72rem; color:#8a9a8a; }
.cell-room { font-weight:700; font-size:.86rem; color:#07713c; }
.cell-date { font-size:.84rem; color:#6b7a6b; }
.cell-amt  { font-weight:700; font-size:.86rem; color:#07713c; }
.pill { display:inline-flex; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; }
.empty { padding:48px; text-align:center; color:#9aaa9a; font-size:.88rem; }
.gdetail { background:#fff; border-radius:14px; border:1px solid #e4ebe4; box-shadow:0 1px 4px rgba(0,0,0,.04); overflow:hidden; align-self:start; position:sticky; top:0; }
.gdh { background:linear-gradient(135deg,#07713c,#0a9150); padding:20px 22px; }
.hist-item { border:1px solid #e4ebe4; border-radius:10px; padding:12px 14px; margin-bottom:10px; }
.hist-item:last-child { margin-bottom:0; }
.detail-scroll { overflow-y:auto; max-height:460px; padding:20px 22px; }
.detail-scroll::-webkit-scrollbar { width:4px; }
.detail-scroll::-webkit-scrollbar-thumb { background:#d1e8d1; border-radius:10px; }
`;

export default function Guests() {
  // raw reservations — same as Dashboard
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

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    // Exact same query as Dashboard — no grouping, no map, just raw rows
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Guests fetch error:", error);
      setLoading(false);
      return;
    }

    const rows = data || [];
    setReservations(rows);

    // Collect all years from check_in dates for the year filter dropdown
    const years = [...new Set(
      rows.map(r => r.check_in?.slice(0, 4)).filter(Boolean)
    )].sort((a, b) => b - a);
    setAllYears(years);

    setLoading(false);
  };

  // ── When a row is clicked, load all reservations for that guest ──
  const openGuest = async (res) => {
    setSelected(res);
    setHistYear("all");
    setLoadingHist(true);

    // Match by email if available, else by name
    let { data } = res.guest_email
      ? await supabase.from("reservations").select("*").eq("guest_email", res.guest_email).order("check_in", { ascending: false })
      : await supabase.from("reservations").select("*").eq("guest_name", res.guest_name).order("check_in", { ascending: false });

    setGuestHistory(data || []);
    setLoadingHist(false);
  };

  // ── FILTERED list — exactly like Dashboard's recent reservations but with filters ──
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

  // History filtered by year inside detail panel
  const filteredHist = histYear === "all"
    ? guestHistory
    : guestHistory.filter(r => (r.check_in || "").startsWith(histYear));

  const histYears = [...new Set(
    guestHistory.map(r => r.check_in?.slice(0, 4)).filter(Boolean)
  )].sort((a, b) => b - a);

  // Stat cards — same logic as before but based on raw reservations
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
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Guests</h2>
            <p className="page-sub">All guest reservations — {reservations.length} total records</p>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="sc-3">
          {[
            { lbl: "Total Guests",      val: uniqueGuests,  Icon: RiGroupLine, bg: "#e8f5e9", c: "#1b5e20" },
            { lbl: "Currently Staying", val: currentlyIn,   Icon: RiHome4Line, bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Returning Guests",  val: returningEmails,Icon: RiStarLine, bg: "#fff8e1", c: "#f57f17" },
          ].map(({ lbl, val, Icon, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row">
                <span className="sc-ico"><Icon size={20} color={c} /></span>
                <span className="sc-lbl" style={{ color: c }}>{lbl}</span>
              </div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="fbar">
          <input
            className="finput"
            type="text"
            placeholder="Search by name, email, phone or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="fselect" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
            <option value="all">All Years</option>
            {allYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select className="fselect" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* MAIN GRID */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "20px" }}>

          {/* RESERVATIONS TABLE — every row = one reservation/guest */}
          <div className="tc">
            <div className="tc-hdr">
              <div className="tc-title">All Guests</div>
              <span className="tc-badge">{filtered.length} of {reservations.length} records</span>
            </div>
            <div className="tc-head" style={{ gridTemplateColumns: cols }}>
              {["Guest","Email","Phone","Room","Check-In","Check-Out","Status",""].map(h => (
                <div key={h} className="th">{h}</div>
              ))}
            </div>
            <div className="tc-scroll">
              {loading ? (
                <div className="empty">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="empty">No records found.</div>
              ) : filtered.map(r => {
                const s = STATUS_CFG[r.status] || STATUS_CFG.confirmed;
                const isActive = selected?.id === r.id;
                return (
                  <div
                    key={r.id}
                    className="tr"
                    style={{ gridTemplateColumns: cols, background: isActive ? "#ecfdf5" : undefined }}
                    onClick={() => openGuest(r)}
                  >
                    <div className="rg">
                      <div className="av">{(r.guest_name || "?").slice(0, 2).toUpperCase()}</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="rg-name">{r.guest_name || "Unknown"}</div>
                        {r.guest_phone && <div className="rg-sub">{r.guest_phone}</div>}
                      </div>
                    </div>
                    <div style={{ fontSize: ".82rem", color: "#6b7a6b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.guest_email || "—"}
                    </div>
                    <div style={{ fontSize: ".82rem", color: "#6b7a6b" }}>
                      {r.guest_phone || "—"}
                    </div>
                    <div className="cell-room">{r.room_number || "—"}</div>
                    <div className="cell-date">{r.check_in || "—"}</div>
                    <div className="cell-date">{r.check_out || "—"}</div>
                    <div>
                      <span className="pill" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ color: "#07713c", fontSize: ".82rem", fontWeight: "700" }}>View →</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GUEST DETAIL PANEL */}
          {selected && (
            <div className="gdetail">
              <div className="gdh">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "1.1rem" }}>
                      {(selected.guest_name || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "white", fontWeight: "700", fontSize: "1rem" }}>
                        {selected.guest_name}
                      </div>
                      <div style={{ color: "rgba(255,255,255,.65)", fontSize: ".8rem", marginTop: "2px" }}>
                        {guestHistory.length} reservation{guestHistory.length !== 1 ? "s" : ""} · ₱{guestHistory.reduce((s, r) => s + parseFloat(r.total_amount || 0), 0).toLocaleString()} total
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{ background: "rgba(255,255,255,.15)", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1rem" }}
                  >×</button>
                </div>
              </div>

              <div className="detail-scroll">
                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                  {[
                    ["Email",        selected.guest_email || "—"],
                    ["Phone",        selected.guest_phone || "—"],
                    ["Room",         `Room ${selected.room_number || "—"}`],
                    ["Amount Paid",  `₱${parseFloat(selected.total_amount || 0).toLocaleString()}`],
                    ["Check-In",     selected.check_in  || "—"],
                    ["Check-Out",    selected.check_out || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#f8faf8", borderRadius: "8px", padding: "10px 12px", border: "1px solid #e4ebe4" }}>
                      <div style={{ fontSize: ".72rem", color: "#9aaa9a", marginBottom: "3px" }}>{k}</div>
                      <div style={{ fontWeight: "600", fontSize: ".86rem", color: "#07713c" }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Stay history header + year filter */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ fontSize: ".72rem", fontWeight: "700", color: "#07713c", textTransform: "uppercase", letterSpacing: ".08em" }}>
                    All Stays {histYear !== "all" && `— ${histYear}`}
                  </div>
                  {histYears.length > 1 && (
                    <select
                      className="fselect"
                      style={{ fontSize: ".76rem", padding: "5px 10px" }}
                      value={histYear}
                      onChange={e => setHistYear(e.target.value)}
                    >
                      <option value="all">All Years</option>
                      {histYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  )}
                </div>

                {loadingHist ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#9aaa9a", fontSize: ".88rem" }}>Loading...</div>
                ) : filteredHist.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "#9aaa9a", fontSize: ".88rem" }}>
                    {histYear !== "all" ? `No stays in ${histYear}.` : "No history found."}
                  </div>
                ) : filteredHist.map(r => {
                  const s = STATUS_CFG[r.status] || STATUS_CFG.confirmed;
                  const nights = (r.check_in && r.check_out)
                    ? Math.max(0, Math.round((new Date(r.check_out) - new Date(r.check_in)) / 86400000))
                    : 0;
                  return (
                    <div key={r.id} className="hist-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#07713c" }}>Room {r.room_number || "—"}</span>
                        <span className="pill" style={{ background: s.bg, color: s.color, fontSize: ".7rem" }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: ".82rem", color: "#8a9a8a" }}>{r.check_in} → {r.check_out}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                        <span style={{ fontWeight: "700", color: "#07713c", fontSize: ".88rem" }}>
                          ₱{parseFloat(r.total_amount || 0).toLocaleString()}
                        </span>
                        {nights > 0 && (
                          <span style={{ fontSize: ".76rem", color: "#9aaa9a" }}>
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