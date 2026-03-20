import React, { useState, useEffect } from "react";
import {
  RiFileList3Line, RiLoginBoxLine, RiLogoutBoxLine,
  RiCalendarLine, RiMoneyDollarCircleLine, RiUserAddLine,
  RiDeleteBinLine, RiPencilLine, RiShieldLine,
  RiRefreshLine, RiTimeLine, RiUserLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.page { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.page-hdr { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.page-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.page-sub   { font-size:.83rem; color:#8a9a8a; }

.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc  { border-radius:14px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sc-lbl { font-size:.78rem; font-weight:700; text-transform:uppercase; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }

.fbar { display:flex; gap:10px; align-items:center; background:#fff; border-radius:14px; padding:13px 20px; margin-bottom:20px; border:1px solid #e4ebe4; flex-wrap:wrap; }
.finput { flex:1; min-width:180px; padding:9px 13px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.88rem; font-family:Arial,sans-serif; color:#333; outline:none; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color:#a8b8a8; font-style:italic; }
.fselect { padding:9px 13px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.86rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; }
.btn-refresh { display:inline-flex; align-items:center; gap:5px; padding:9px 16px; background:#07713c; color:#fff; border:none; border-radius:9px; cursor:pointer; font-size:.84rem; font-weight:700; font-family:Arial,sans-serif; }
.btn-refresh:hover { background:#05592f; }

/* ── LIST HEADER ── */
.list-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.list-title { font-size:.9rem; font-weight:700; color:#07713c; }
.list-badge { font-size:.65rem; font-weight:700; background:#ecfdf5; color:#07713c; border-radius:20px; padding:3px 10px; border:1px solid #d1fae5; }

/* ── LOG CARD ── */
.log-card { background:#fff; border-radius:14px; border:1px solid #e4ebe4; overflow:hidden; display:flex; margin-bottom:10px; box-shadow:0 1px 4px rgba(0,0,0,.05); transition:box-shadow .15s; }
.log-card:hover { box-shadow:0 3px 14px rgba(0,0,0,.09); }
.log-left { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 14px; min-width:80px; flex-shrink:0; }
.log-icon-wrap { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:6px; }
.log-time { font-size:.6rem; color:#aaa; text-align:center; line-height:1.4; }
.log-body { padding:14px 18px; flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; gap:6px; }
.log-top { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.log-action { font-size:.9rem; font-weight:700; color:#222; }
.log-details { font-size:.81rem; color:#666; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.log-bottom { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.cat-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:.7rem; font-weight:700; }
.role-badge { display:inline-flex; padding:3px 9px; border-radius:20px; font-size:.68rem; font-weight:700; }
.staff-chip { display:inline-flex; align-items:center; gap:6px; }
.av { width:26px; height:26px; border-radius:50%; background:linear-gradient(135deg,#07713c,#5cb85c); color:#fff; font-weight:700; font-size:.7rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.staff-name { font-size:.8rem; font-weight:600; color:#07713c; }

.empty { background:#fff; border-radius:14px; border:1px solid #e4ebe4; padding:60px; text-align:center; color:#9aaa9a; font-size:.9rem; }

/* pagination */
.pg { display:flex; gap:8px; justify-content:center; align-items:center; padding:16px 0 0; }
.pg-btn { padding:7px 16px; border:1.5px solid #ccdacc; border-radius:8px; background:#fff; font-weight:700; font-family:Arial,sans-serif; font-size:.84rem; cursor:pointer; color:#07713c; }
.pg-btn:disabled { color:#aaa; cursor:not-allowed; }
.pg-info { font-size:.84rem; color:#555; }
`;

const CATEGORY_CFG = {
  check_in:    { bg: "#e8f5e9", color: "#07713c",  label: "Check-In",     Icon: RiLoginBoxLine },
  check_out:   { bg: "#fff3e0", color: "#e65100",  label: "Check-Out",    Icon: RiLogoutBoxLine },
  reservation: { bg: "#e3f2fd", color: "#1565c0",  label: "Reservation",  Icon: RiCalendarLine },
  charge:      { bg: "#f3e5f5", color: "#6a1b9a",  label: "Charge Added", Icon: RiMoneyDollarCircleLine },
  staff:       { bg: "#fff8e1", color: "#f57f17",  label: "Staff",        Icon: RiUserAddLine },
  delete:      { bg: "#fce4ec", color: "#c62828",  label: "Deleted",      Icon: RiDeleteBinLine },
  edit:        { bg: "#ecfdf5", color: "#07713c",  label: "Edited",       Icon: RiPencilLine },
  auth:        { bg: "#e8f5e9", color: "#07713c",  label: "Auth",         Icon: RiShieldLine },
  other:       { bg: "#f4f6f0", color: "#555",     label: "Other",        Icon: RiFileList3Line },
};

const ROLE_CFG = {
  admin:        { bg: "#fef3c7", color: "#92400e" },
  staff:        { bg: "#ecfdf5", color: "#07713c" },
  receptionist: { bg: "#e3f2fd", color: "#1565c0" },
  maintenance:  { bg: "#fff3e0", color: "#e65100" },
};

const PAGE_SIZE = 20;

const formatTime = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

export default function ActivityLog() {
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("all");
  const [filterUser, setFilterUser] = useState("all");
  const [users,      setUsers]      = useState([]);
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { fetchLogs(); }, [filterCat, filterUser, page]); 

  const fetchUsers = async () => {
    const { data } = await supabase.from("users").select("id, full_name, role").order("full_name");
    setUsers(data || []);
  };

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from("activity_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (filterCat  !== "all") query = query.eq("category", filterCat);
    if (filterUser !== "all") query = query.eq("user_id",  filterUser);
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, count } = await query;
    setLogs(data || []);
    setTotal(count || 0);
    setLoading(false);
  };

  const handleRefresh = () => { setPage(1); fetchLogs(); };

  const filtered = logs.filter(l =>
    !search ||
    (l.user_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.action    || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.details   || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total,
    checkIns:  logs.filter(l => l.category === "check_in").length,
    checkOuts: logs.filter(l => l.category === "check_out").length,
    charges:   logs.filter(l => l.category === "charge").length,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="page">
        <div className="page-hdr">
          <div>
            <h2 className="page-title">Activity Log</h2>
            <p className="page-sub">Track all staff actions and system transactions</p>
          </div>
          <button className="btn-refresh" onClick={handleRefresh}>
            <RiRefreshLine size={15} />Refresh
          </button>
        </div>

   
        <div className="sc-4">
          {[
            { label: "Total Logs",    val: total,           Icon: RiFileList3Line,         bg: "#e8f5e9", c: "#07713c" },
            { label: "Check-Ins",     val: stats.checkIns,  Icon: RiLoginBoxLine,          bg: "#e3f2fd", c: "#1565c0" },
            { label: "Check-Outs",    val: stats.checkOuts, Icon: RiLogoutBoxLine,         bg: "#fff3e0", c: "#e65100" },
            { label: "Charges Added", val: stats.charges,   Icon: RiMoneyDollarCircleLine, bg: "#f3e5f5", c: "#6a1b9a" },
          ].map(({ label, val, Icon, bg, c }) => (
            <div key={label} className="sc" style={{ background: bg }}>
              <div className="sc-row"><Icon size={18} color={c} /><span className="sc-lbl" style={{ color: c }}>{label}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

     
        <div className="fbar">
          <input className="finput" placeholder="Search action, staff, details..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="fselect" value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1); }}>
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select className="fselect" value={filterUser} onChange={e => { setFilterUser(e.target.value); setPage(1); }}>
            <option value="all">All Staff</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
          </select>
        </div>

 
        <div className="list-hdr">
          <span className="list-title">Activity Timeline</span>
          <span className="list-badge">{total} total entries</span>
        </div>

    
        {loading ? (
          <div className="empty">Loading logs...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <RiFileList3Line size={40} color="#ccc" style={{ display: "block", margin: "0 auto 12px" }} />
            No activity logs found.<br />
            <span style={{ fontSize: ".82rem" }}>Logs appear as staff perform actions in the system.</span>
          </div>
        ) : (
          <>
            {filtered.map(log => {
              const cat     = CATEGORY_CFG[log.category] || CATEGORY_CFG.other;
              const CatIcon = cat.Icon;
              const role    = ROLE_CFG[log.user_role] || { bg: "#f5f5f5", color: "#888" };
              const t       = formatTime(log.created_at);
              return (
                <div key={log.id} className="log-card">

                  <div className="log-left" style={{ background: cat.bg + "66" }}>
                    <div className="log-icon-wrap" style={{ background: cat.bg }}>
                      <CatIcon size={18} color={cat.color} />
                    </div>
                    <div className="log-time">
                      <div style={{ fontWeight: "700", color: "#555" }}>{t.time}</div>
                      <div>{t.date}</div>
                    </div>
                  </div>

                  <div className="log-body">
                    <div className="log-top">
                      <span className="log-action">{log.action}</span>
                      <span className="cat-badge" style={{ background: cat.bg, color: cat.color }}>
                        <CatIcon size={11} />{cat.label}
                      </span>
                    </div>

                    {log.details && (
                      <div className="log-details" title={log.details}>{log.details}</div>
                    )}

                    <div className="log-bottom">
                      <div className="staff-chip">
                        <div className="av">{(log.user_name || "?").slice(0, 2).toUpperCase()}</div>
                        <span className="staff-name">{log.user_name || "System"}</span>
                      </div>
                      <span className="role-badge" style={{ background: role.bg, color: role.color }}>
                        {log.user_role || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}


            {total > PAGE_SIZE && (
              <div className="pg">
                <button className="pg-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                <span className="pg-info">Page {page} of {Math.ceil(total / PAGE_SIZE)}</span>
                <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}