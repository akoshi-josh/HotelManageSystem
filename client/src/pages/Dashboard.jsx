import React, { useState, useEffect } from "react";
import {
  RiHotelBedLine, RiCheckboxCircleLine, RiHome4Line,
  RiCalendarLine, RiMoneyDollarCircleLine,
  RiUserLine, RiLockLine, RiSettings3Line,
  RiLogoutCircleLine, RiForbidLine,
} from "react-icons/ri";
import Sidebar from "../components/Sidebar";
import Staff from "./Staff";
import Rooms from "./Rooms";
import Reservations from "./Reservations";
import CheckIn from "./CheckIn";
import CheckOut from "./CheckOut";
import Guests from "./Guests";
import Settings from "./Settings";
import Maintenance from "./Maintenance";
import Pricing from "./Pricing";
import ActivityLog from "./ActivityLog";
import InHouse from "./InHouse";
import Restaurant from "./Restaurant";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import supabase from "../supabaseClient";
import NotificationBell from "./NotificationBell";

const ADMIN_ONLY       = ["Staff", "Log", "Pricing"];
const MAINTENANCE_ONLY = ["Maintenance"];
const RESTAURANT_ONLY  = ["Restaurant"];

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
  --white: #ffffff;
  --bg: #f2f5f0;
  --border: #e2e8e2;
  --text-primary: #1a2e1a;
  --text-secondary: #5a6e5a;
  --text-muted: #8fa08f;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.10);
}

.db-root {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: 'Roboto', sans-serif;
  background: var(--bg);
  overflow: hidden;
}

.db-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

.db-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.db-scroll::-webkit-scrollbar { width: 4px; }
.db-scroll::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 10px; }

/* ── TOPBAR ── */
.topbar {
  background: var(--white);
  padding: 0 28px;
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 8px rgba(7,113,60,0.06);
}

.topbar-left { display: flex; align-items: center; gap: 12px; }

.topbar-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--green);
  letter-spacing: -0.01em;
}

.topbar-gold-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gold);
  flex-shrink: 0;
}

.role-badge {
  font-size: .62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
}

.topbar-right { display: flex; align-items: center; gap: 10px; }

.profile-btn {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--white);
  font-family: 'Roboto', sans-serif;
  transition: background .15s, border-color .15s;
}
.profile-btn:hover { background: var(--bg); border-color: #c8d8c8; }

.profile-avatar {
  width: 34px; height: 34px;
  border-radius: 8px;
  background: var(--green);
  color: var(--white);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .82rem; flex-shrink: 0;
  border: 2px solid var(--gold);
}

/* ── DROPDOWN ── */
.dd-wrap { position: relative; }
.dd-menu {
  position: absolute; right: 0; top: 54px;
  background: var(--white);
  border-radius: var(--radius);
  min-width: 210px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border);
  z-index: 200; overflow: hidden;
}
.dd-head {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--green-light);
}
.dd-head-accent {
  width: 100%; height: 2px;
  background: var(--gold);
  border-radius: 2px;
  margin-bottom: 10px;
}
.dd-item {
  padding: 11px 16px;
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: .87rem; color: var(--text-primary);
  font-family: 'Roboto', sans-serif;
  transition: background .15s;
}
.dd-item:hover { background: var(--green-light); }
.dd-item.danger { color: #e53935; }
.dd-item.danger:hover { background: #fff5f5; }
.dd-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* ── CONTENT AREA ── */
.db-content {
  padding: 24px 28px 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── STAT CARDS ── */
.sc-5 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.sc-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
.sc-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }

.sc {
  border-radius: var(--radius);
  padding: 18px 20px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.sc::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--gold);
  opacity: 0;
  transition: opacity .2s;
}
.sc:hover::after { opacity: 1; }

.sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sc-ico { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sc-lbl { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.sc-val { font-size: 1.8rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; }

/* ── CHART CARDS ── */
.chart-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 22px 24px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.cc-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.cc-title {
  font-size: .94rem;
  font-weight: 700;
  color: var(--green);
  display: flex; align-items: center; gap: 8px;
}
.cc-title::before {
  content: '';
  display: inline-block;
  width: 4px; height: 16px;
  background: var(--gold);
  border-radius: 2px;
  flex-shrink: 0;
}
.cc-badge {
  font-size: .63rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase;
  background: var(--green-light); color: var(--green);
  border-radius: 20px; padding: 3px 10px;
  border: 1px solid #bbf7d0;
}
.cc-sub { font-size: .8rem; color: var(--text-muted); margin: 0 0 18px; }

/* ── TODAY GRID ── */
.today-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.today-card {
  background: var(--white);
  border-radius: var(--radius);
  padding: 20px 22px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}
.today-card-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--gold-light);
}
.today-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid #f4f7f4;
}
.today-row:last-child { border-bottom: none; }
.today-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ── TABLE CARD ── */
.tc {
  background: var(--white);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: hidden;
}
.tc-hdr {
  padding: 16px 22px 14px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--border);
  background: var(--green-light);
}
.tc-title {
  font-size: .94rem; font-weight: 700; color: var(--green);
  display: flex; align-items: center; gap: 8px;
}
.tc-title::before {
  content: '';
  display: inline-block;
  width: 4px; height: 16px;
  background: var(--gold);
  border-radius: 2px;
}
.tc-badge {
  font-size: .63rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  background: var(--gold-light); color: #7a5f00;
  border-radius: 20px; padding: 3px 10px;
  border: 1px solid rgba(219,186,20,0.3);
}
.tc-head {
  display: grid; padding: 9px 22px;
  background: #fafcfa;
  border-bottom: 1px solid var(--border);
}
.th {
  font-size: .63rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .1em;
  color: var(--text-muted);
}
.tc-scroll { overflow-y: auto; max-height: 380px; }
.tc-scroll::-webkit-scrollbar { width: 3px; }
.tc-scroll::-webkit-scrollbar-thumb { background: #d1e8d1; border-radius: 10px; }

.tr {
  display: grid; padding: 12px 22px; align-items: center;
  border-bottom: 1px solid #f4f7f4;
  transition: background .15s;
}
.tr:last-child { border-bottom: none; }
.tr:hover { background: #f8fdf8; }

.rg { display: flex; align-items: center; gap: 10px; min-width: 0; }
.av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: var(--green);
  color: var(--white); font-weight: 700; font-size: .82rem;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(219,186,20,0.4);
}
.rg-name {
  font-size: .87rem; font-weight: 600; color: var(--green);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rg-sub {
  font-size: .72rem; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cell-room  { font-weight: 700; font-size: .85rem; color: var(--green); }
.cell-date  { font-size: .83rem; color: var(--text-secondary); }
.cell-amt   { font-weight: 700; font-size: .85rem; color: var(--green); }
.pill {
  display: inline-flex; padding: 3px 10px;
  border-radius: 20px; font-size: .71rem; font-weight: 700;
  text-transform: capitalize;
}
.empty {
  padding: 50px; text-align: center;
  color: var(--text-muted); font-size: .88rem;
}

/* ── ACCESS DENIED ── */
.access-denied {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 60vh;
  font-family: 'Roboto', sans-serif;
}
.access-denied-icon {
  width: 96px; height: 96px; border-radius: 50%;
  background: #fce4ec;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
  border: 2px solid rgba(198,40,40,0.15);
}

/* ── MOBILE HAMBURGER ── */
.mobile-menu-btn {
  display: none;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 7px;
  color: var(--green);
  align-items: center;
  justify-content: center;
  transition: background .15s;
}
.mobile-menu-btn:hover { background: var(--green-light); }

.sb-overlay {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 299;
}

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .sc-5 { grid-template-columns: repeat(3,1fr); }
}

@media (max-width: 900px) {
  .sc-5 { grid-template-columns: repeat(2,1fr); }
  .today-grid { grid-template-columns: 1fr; }
  .db-content { padding: 16px 16px 40px; gap: 14px; }
  .topbar { padding: 0 16px; }
}

@media (max-width: 768px) {
  .db-root { position: relative; }
  .mobile-menu-btn { display: flex; }
  .sb-overlay.open { display: block; }

  .topbar-title { font-size: .92rem; }
  .profile-name-text { display: none; }
  .profile-role-text { display: none; }
  .profile-chevron   { display: none; }
  .profile-btn { padding: 4px 6px; }

  .tc-head, .tr { padding-left: 14px; padding-right: 14px; }
}

@media (max-width: 520px) {
  .sc-5 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .sc-val { font-size: 1.5rem; }
  .db-content { padding: 12px 12px 40px; gap: 12px; }
  .topbar { height: 56px; min-height: 56px; padding: 0 12px; }
  .chart-card { padding: 16px; }
  .today-card { padding: 14px 16px; }
  .tc-hdr { padding: 12px 14px; }
}

@media (max-width: 380px) {
  .sc-5 { grid-template-columns: 1fr; }
}
`;

const STATUS_CFG = {
  confirmed:   { bg: "#e8f5e9", color: "#1b5e20" },
  checked_in:  { bg: "#e3f2fd", color: "#1565c0" },
  checked_out: { bg: "#f3e5f5", color: "#6a1b9a" },
  cancelled:   { bg: "#fce4ec", color: "#c62828" },
  pending:     { bg: "#fff8e1", color: "#f57f17" },
};

const DD_ITEMS = [
  { Icon: RiUserLine,      label: "My Profile",      nav: null       },
  { Icon: RiLockLine,      label: "Change Password", nav: null       },
  { Icon: RiSettings3Line, label: "Settings",        nav: "Settings" },
];

const ROLE_CFG = {
  admin:        { label: "Admin",        bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  staff:        { label: "Staff",        bg: "#ecfdf5", color: "#07713c", border: "#bbf7d0" },
  receptionist: { label: "Receptionist", bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  maintenance:  { label: "Maintenance",  bg: "#fff3e0", color: "#e65100", border: "#ffcc80" },
  restaurant:   { label: "Restaurant",   bg: "#fdf2f8", color: "#9c27b0", border: "#e1bee7" },
};

export default function Dashboard({ onLogout, user }) {
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [navKey,       setNavKey]       = useState(0);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);

  const email    = user?.email     || "";
  const name     = user?.full_name || email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();
  const role     = user?.role || "staff";

  useEffect(() => {
    if (role === "maintenance") setActiveNav("Maintenance");
    if (role === "restaurant")  setActiveNav("Restaurant");
  }, [role]);

  const canAccess = (key) => {
    if (ADMIN_ONLY.includes(key)      && role !== "admin")                            return false;
    if (MAINTENANCE_ONLY.includes(key) && role !== "admin" && role !== "maintenance") return false;
    if (RESTAURANT_ONLY.includes(key) && role !== "admin" && role !== "restaurant")  return false;
    if (role === "restaurant" && !["Restaurant", "Settings"].includes(key))          return false;
    return true;
  };

  const handleNav = (key) => {
    if (!canAccess(key)) return;
    setActiveNav(key);
    setNavKey(k => k + 1);
    setShowDropdown(false);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    if (!canAccess(activeNav)) return <AccessDenied />;
    switch (activeNav) {
      case "Staff":        return <Staff />;
      case "Rooms":        return <Rooms userRole={role} />;
      case "Reservations": return <Reservations />;
      case "Check-In":     return <CheckIn     key={`checkin-${navKey}`}  user={user} />;
      case "Check-Out":    return <CheckOut    key={`checkout-${navKey}`} user={user} />;
      case "Guests":       return <Guests />;
      case "Maintenance":  return <Maintenance key={`maintenance-${navKey}`} user={user} />;
      case "In-House": return <InHouse key={`inhouse-${navKey}`} user={user} />;
      case "Pricing":      return <Pricing />;
      case "Log":          return <ActivityLog />;
      case "Settings":     return <Settings user={user} userRole={role} />;
      case "Restaurant":   return <Restaurant key={`restaurant-${navKey}`} user={user} />;
      default:             return <DashboardHome />;
    }
  };

  const roleCfg = ROLE_CFG[role] || ROLE_CFG.staff;

  return (
    <>
      <style>{CSS}</style>
      <div className="db-root" onClick={() => { showDropdown && setShowDropdown(false); }}>

        {sidebarOpen && (
          <div className="sb-overlay open" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar
          activeNav={activeNav}
          setActiveNav={handleNav}
          onLogout={onLogout}
          userRole={role}
          userEmail={email}
          userName={name}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="db-main">
          <div className="db-scroll">

            <header className="topbar">
              <div className="topbar-left">
                <button
                  className="mobile-menu-btn"
                  onClick={e => { e.stopPropagation(); setSidebarOpen(o => !o); }}
                  type="button"
                  aria-label="Open menu"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
                <span className="topbar-gold-dot" />
                <div className="topbar-title">
                  {activeNav === "Dashboard" ? `Welcome, ${name}!` : activeNav}
                </div>
                <span
                  className="role-badge"
                  style={{ background: roleCfg.bg, color: roleCfg.color, borderColor: roleCfg.border }}
                >
                  {roleCfg.label}
                </span>
              </div>

              <div className="topbar-right">
                <NotificationBell onNavigate={handleNav} userRole={role} />
                <div className="dd-wrap" onClick={e => e.stopPropagation()}>
                  <button
                    className="profile-btn"
                    onClick={() => setShowDropdown(d => !d)}
                    type="button"
                  >
                    <div className="profile-avatar">{initials}</div>
                    <div className="profile-name-text" style={{ lineHeight: "1.3", textAlign: "left" }}>
                      <div style={{ fontSize: ".86rem", fontWeight: "700", color: "#222" }}>{name}</div>
                      <div className="profile-role-text" style={{ fontSize: ".72rem", color: "#888", textTransform: "capitalize" }}>{role}</div>
                    </div>
                    <span className="profile-chevron" style={{ color: "#aaa", fontSize: ".8rem", marginLeft: "4px" }}>▾</span>
                  </button>

                  {showDropdown && (
                    <div className="dd-menu">
                      <div className="dd-head">
                        <div className="dd-head-accent" />
                        <div style={{ fontWeight: "700", fontSize: ".9rem", color: "#222" }}>{name}</div>
                        <div style={{ fontSize: ".78rem", color: "#888", marginTop: "2px" }}>{email}</div>
                        <div style={{ marginTop: "6px", display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: ".7rem", fontWeight: "700", background: roleCfg.bg, color: roleCfg.color, textTransform: "capitalize" }}>
                          {role}
                        </div>
                      </div>
                      {DD_ITEMS.map(({ Icon, label, nav }) => (
                        <div
                          key={label}
                          className="dd-item"
                          onClick={() => { if (nav) handleNav(nav); setShowDropdown(false); }}
                        >
                          <span className="dd-icon"><Icon size={16} color="#555" /></span>
                          <span>{label}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1px solid #f0f0f0" }}>
                        <div className="dd-item danger" onClick={onLogout}>
                          <span className="dd-icon"><RiLogoutCircleLine size={16} /></span>
                          <span>Logout</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <main className="db-content">
              {renderPage()}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

function AccessDenied() {
  return (
    <div className="access-denied">
      <div className="access-denied-icon">
        <RiForbidLine size={48} color="#c62828" />
      </div>
      <h2 style={{ fontSize: "1.4rem", color: "#c62828", margin: "0 0 8px", fontWeight: "700" }}>Access Denied</h2>
      <p style={{ color: "#8a9a8a", fontSize: ".9rem", margin: 0 }}>You don't have permission to view this page.</p>
      <p style={{ color: "#aaa", fontSize: ".82rem", marginTop: "6px" }}>Contact your administrator if you need access.</p>
    </div>
  );
}

function DashboardHome() {
  const [stats,     setStats]     = useState({ total: 0, available: 0, occupied: 0, reservations: 0, revenue: 0 });
  const [recentRes, setRecentRes] = useState([]);
  const [checkIns,  setCheckIns]  = useState([]);
  const [checkOuts, setCheckOuts] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    (async () => {
      const [{ data: rooms }, { data: all }] = await Promise.all([
        supabase.from("rooms").select("status"),
        supabase.from("reservations").select("*").order("created_at", { ascending: false }),
      ]);
      const r = all || [];
      const revenue = r
        .filter(x => x.status === "checked_out")
        .reduce((s, x) => s + parseFloat(x.total_amount || 0), 0);

      setStats({
        total:        rooms?.length || 0,
        available:    rooms?.filter(x => x.status === "available").length  || 0,
        occupied:     rooms?.filter(x => x.status === "occupied").length   || 0,
        reservations: r.length,
        revenue,
      });
      setRecentRes(r.slice(0, 8));
      setCheckIns(r.filter(x  => x.check_in  === today && ["confirmed","pending","checked_in","checked_out"].includes(x.status)));
      setCheckOuts(r.filter(x => x.check_out === today && ["checked_in","checked_out"].includes(x.status)));

      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const lbl = d.toLocaleString("default", { month: "short" });
        months.push({
          month:    lbl,
          bookings: r.filter(x => x.check_in?.startsWith(key)).length,
          revenue:  r
            .filter(x => x.status === "checked_out" && x.check_out?.startsWith(key))
            .reduce((s, x) => s + parseFloat(x.total_amount || 0), 0),
        });
      }
      setChartData(months);
    })();
  }, []);

  const STAT_CARDS = [
    { lbl: "Total Rooms",  val: stats.total,                            Icon: RiHotelBedLine,          bg: "#e3f2fd", color: "#1565c0" },
    { lbl: "Available",    val: stats.available,                        Icon: RiCheckboxCircleLine,    bg: "#e8f5e9", color: "#1b5e20" },
    { lbl: "Occupied",     val: stats.occupied,                         Icon: RiHome4Line,             bg: "#fff3e0", color: "#e65100" },
    { lbl: "Reservations", val: stats.reservations,                     Icon: RiCalendarLine,          bg: "#f3e5f5", color: "#6a1b9a" },
    { lbl: "Revenue",      val: `₱${stats.revenue.toLocaleString()}`,   Icon: RiMoneyDollarCircleLine, bg: "#fdf8e1", color: "#7a5f00" },
  ];

  return (
    <>
      <div className="sc-5">
        {STAT_CARDS.map(({ lbl, val, Icon, bg, color }) => (
          <div key={lbl} className="sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
            <div className="sc-row">
              <span className="sc-ico"><Icon size={18} color={color} /></span>
              <span className="sc-lbl" style={{ color }}>{lbl}</span>
            </div>
            <div className="sc-val">{val}</div>
          </div>
        ))}
      </div>

      <div className="today-grid">
        {[
          { title: "Today's Check-Ins",  items: checkIns,  badgeBg: "#e8f5e9", badgeColor: "#1b5e20" },
          { title: "Today's Check-Outs", items: checkOuts, badgeBg: "#fff3e0", badgeColor: "#e65100" },
        ].map(({ title, items, badgeBg, badgeColor }) => (
          <div key={title} className="today-card">
            <div className="today-card-hdr">
              <div className="cc-title">{title}</div>
              <span
                className="cc-badge"
                style={{ background: badgeBg, color: badgeColor, borderColor: "transparent" }}
              >
                {items.length} guests
              </span>
            </div>
            {items.length === 0
              ? <p style={{ color: "#bbb", fontSize: ".84rem" }}>No entries for today.</p>
              : items.map(r => {
                const STATUS_DOT   = { confirmed: "#4caf50", pending: "#f57f17", checked_in: "#1565c0", checked_out: "#6a1b9a" };
                const STATUS_LABEL = { confirmed: "Pending", pending: "Pending", checked_in: "In", checked_out: "Done" };
                return (
                  <div key={r.id} className="today-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <div className="today-dot" style={{ background: STATUS_DOT[r.status] || "#ccc" }} />
                      <span style={{ fontSize: ".85rem", fontWeight: "600", color: "#333" }}>{r.guest_name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontSize: ".7rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px",
                        background: r.status === "checked_out" ? "#f3e5f5" : r.status === "checked_in" ? "#e3f2fd" : "#e8f5e9",
                        color: r.status === "checked_out" ? "#6a1b9a" : r.status === "checked_in" ? "#1565c0" : "#1b5e20"
                      }}>{STATUS_LABEL[r.status] || r.status}</span>
                      <span style={{ fontSize: ".82rem", fontWeight: "700", color: "#07713c" }}>Rm {r.room_number}</span>
                    </div>
                  </div>
                );
              })
            }
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="cc-hdr">
          <div className="cc-title">Reservation Statistics</div>
          <span className="cc-badge">Last 6 months</span>
        </div>
        <p className="cc-sub">Number of bookings per month</p>
        {chartData.every(d => d.bookings === 0)
          ? <div className="empty">No reservation data yet.</div>
          : <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef4ee" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a9a7a", fontFamily: "Roboto" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7a9a7a", fontFamily: "Roboto" }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #d1fae5", fontFamily: "Roboto" }} />
                <Legend wrapperStyle={{ fontFamily: "Roboto", fontSize: "12px" }} />
                <Bar  dataKey="bookings" name="Bookings" fill="#5cb85c" radius={[6,6,0,0]} />
                <Line type="monotone" dataKey="bookings" name="Trend" stroke="#dbba14" strokeWidth={2.5} dot={{ fill: "#dbba14", r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
        }
      </div>

      <div className="chart-card">
        <div className="cc-hdr">
          <div className="cc-title">Revenue Overview</div>
          <span className="cc-badge">Last 6 months</span>
        </div>
        <p className="cc-sub">Total revenue from checked-out guests per month</p>
        {chartData.every(d => d.revenue === 0)
          ? <div className="empty">No revenue data yet.</div>
          : <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef4ee" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a9a7a", fontFamily: "Roboto" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7a9a7a", fontFamily: "Roboto" }} tickFormatter={v => `₱${v.toLocaleString()}`} />
                <Tooltip formatter={v => [`₱${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 10, border: "1px solid #d1fae5", fontFamily: "Roboto" }} />
                <Legend wrapperStyle={{ fontFamily: "Roboto", fontSize: "12px" }} />
                <Bar  dataKey="revenue" name="Revenue (₱)" fill="#e8f5ee" stroke="#5cb85c" strokeWidth={1.5} radius={[6,6,0,0]} />
                <Line type="monotone" dataKey="revenue" name="Trend" stroke="#dbba14" strokeWidth={2.5} dot={{ fill: "#dbba14", r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
        }
      </div>

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">Recent Reservations</div>
          <span className="tc-badge">Latest 8</span>
        </div>
        <div className="tc-head" style={{ gridTemplateColumns: "2fr .8fr 1fr 1fr 1fr 1fr" }}>
          {["Guest","Room","Check-In","Check-Out","Total","Status"].map(h => (
            <div key={h} className="th">{h}</div>
          ))}
        </div>
        <div className="tc-scroll">
          {recentRes.length === 0
            ? <div className="empty">No reservations yet.</div>
            : recentRes.map(res => {
              const s = STATUS_CFG[res.status] || { bg: "#f5f5f5", color: "#888" };
              return (
                <div key={res.id} className="tr" style={{ gridTemplateColumns: "2fr .8fr 1fr 1fr 1fr 1fr" }}>
                  <div className="rg">
                    <div className="av">{(res.guest_name || "G").slice(0,2).toUpperCase()}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="rg-name">{res.guest_name}</div>
                      {res.guest_email && <div className="rg-sub">{res.guest_email}</div>}
                    </div>
                  </div>
                  <div className="cell-room">{res.room_number || "—"}</div>
                  <div className="cell-date">{res.check_in}</div>
                  <div className="cell-date">{res.check_out}</div>
                  <div className="cell-amt">₱{parseFloat(res.total_amount || 0).toLocaleString()}</div>
                  <div>
                    <span className="pill" style={{ background: s.bg, color: s.color }}>
                      {(res.status||"").replace("_"," ")}
                    </span>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </>
  );
}