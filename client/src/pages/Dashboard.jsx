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
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import supabase from "../supabaseClient";
import NotificationBell from "./NotificationBell";

const ADMIN_ONLY       = ["Staff", "Log", "Pricing"];
const MAINTENANCE_ONLY = ["Maintenance"];

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.db-root { display: flex; height: 100vh; width: 100vw; font-family: Arial, sans-serif; background: #f4f6f0; overflow: hidden; }
.db-main { flex: 1; display: flex; flex-direction: column; min-width: 0; height: 100vh; overflow: hidden; }
.db-scroll { flex: 1; overflow-y: auto; overflow-x: hidden; }
.db-scroll::-webkit-scrollbar { width: 5px; }
.db-scroll::-webkit-scrollbar-thumb { background: #c8d8c8; border-radius: 10px; }

.topbar {
  background: #fff; padding: 0 28px; height: 62px; min-height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #e4ebe4; flex-shrink: 0;
  position: sticky; top: 0; z-index: 100;
}
.topbar-title { font-size: 1.1rem; font-weight: 700; color: #07713c; display: flex; align-items: center; gap: 10px; }
.role-badge {
  font-size: .64rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .08em; padding: 3px 10px; border-radius: 20px; border: 1px solid;
}
.topbar-right { display: flex; align-items: center; gap: 10px; }

.profile-btn {
  display: flex; align-items: center; gap: 9px; cursor: pointer;
  padding: 6px 12px; border-radius: 10px;
  border: 1px solid #e0e0e0; background: #fff;
  font-family: Arial, sans-serif; transition: background .15s;
}
.profile-btn:hover { background: #f4f6f0; }
.profile-avatar {
  width: 34px; height: 34px; border-radius: 8px;
  background: #07713c; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .85rem; flex-shrink: 0;
}

.dd-wrap { position: relative; }
.dd-menu {
  position: absolute; right: 0; top: 52px;
  background: #fff; border-radius: 12px; min-width: 200px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.14); border: 1px solid #f0f0f0;
  z-index: 200; overflow: hidden;
}
.dd-head { padding: 16px; border-bottom: 1px solid #f0f0f0; }
.dd-item {
  padding: 11px 16px; display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: .88rem; color: #333;
  font-family: Arial, sans-serif; transition: background .15s;
}
.dd-item:hover { background: #f4f6f0; }
.dd-item.danger { color: #e53935; }
.dd-item.danger:hover { background: #fff5f5; }
.dd-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.db-content { padding: 24px 28px 48px; display: flex; flex-direction: column; gap: 20px; }

.sc-5 { display: grid; grid-template-columns: repeat(5,1fr); gap: 16px; }
.sc-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.sc-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
.sc { border-radius: 14px; padding: 20px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.sc-ico  { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sc-lbl  { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
.sc-val  { font-size: 1.9rem; font-weight: 700; color: #1a1a1a; }

.chart-card {
  background: #fff; border-radius: 14px; padding: 22px;
  border: 1px solid #e4ebe4; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.cc-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.cc-title { font-size: .92rem; font-weight: 700; color: #07713c; }
.cc-badge {
  font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  background: #ecfdf5; color: #07713c; border-radius: 20px;
  padding: 3px 10px; border: 1px solid #d1fae5;
}
.cc-sub { font-size: .82rem; color: #aaa; margin: 0 0 18px; }

.today-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.today-card {
  background: #fff; border-radius: 14px; padding: 20px 22px;
  border: 1px solid #e4ebe4; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.today-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid #f5f5f5;
}
.today-row:last-child { border-bottom: none; }
.today-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.tc {
  background: #fff; border-radius: 14px;
  border: 1px solid #e4ebe4; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  overflow: hidden;
}
.tc-hdr {
  padding: 16px 22px 12px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid #eef4ee;
}
.tc-title { font-size: .92rem; font-weight: 700; color: #07713c; }
.tc-badge {
  font-size: .65rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  background: #ecfdf5; color: #07713c; border-radius: 20px;
  padding: 3px 10px; border: 1px solid #d1fae5;
}
.tc-head {
  display: grid; padding: 8px 22px;
  background: #f8faf8; border-bottom: 1px solid #eef4ee;
}
.th { font-size: .64rem; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #7a9a7a; }
.tc-scroll { overflow-y: auto; max-height: 380px; }
.tc-scroll::-webkit-scrollbar { width: 4px; }
.tc-scroll::-webkit-scrollbar-thumb { background: #d1e8d1; border-radius: 10px; }

.tr {
  display: grid; padding: 12px 22px; align-items: center;
  border-bottom: 1px solid #f2f7f2; transition: background .15s;
}
.tr:last-child { border-bottom: none; }
.tr:hover { background: #f8fdf8; }

.rg { display: flex; align-items: center; gap: 10px; min-width: 0; }
.av {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg,#07713c,#5cb85c);
  color: #fff; font-weight: 700; font-size: .84rem;
  display: flex; align-items: center; justify-content: center;
}
.rg-name { font-size: .88rem; font-weight: 600; color: #07713c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rg-sub  { font-size: .73rem; color: #8a9a8a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cell-room  { font-weight: 700; font-size: .86rem; color: #07713c; }
.cell-date  { font-size: .84rem; color: #6b7a6b; }
.cell-amt   { font-weight: 700; font-size: .86rem; color: #07713c; }
.pill { display: inline-flex; padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 700; text-transform: capitalize; }
.empty { padding: 50px; text-align: center; color: #9aaa9a; font-size: .88rem; }
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
};

export default function Dashboard({ onLogout, user }) {
  const [activeNav,    setActiveNav]    = useState("Dashboard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [navKey,       setNavKey]       = useState(0);

  const email    = user?.email     || "";
  const name     = user?.full_name || email.split("@")[0];
  const initials = name.slice(0, 2).toUpperCase();
  const role     = user?.role || "staff";

  useEffect(() => {
    if (role === "maintenance") setActiveNav("Maintenance");
  }, [role]);

  const handleNav = (key) => {
    if (ADMIN_ONLY.includes(key) && role !== "admin") return;
    if (MAINTENANCE_ONLY.includes(key) && role !== "admin" && role !== "maintenance") return;
    setActiveNav(key);
    setNavKey(k => k + 1);
    setShowDropdown(false);
  };

  const renderPage = () => {
    if (ADMIN_ONLY.includes(activeNav) && role !== "admin") return <AccessDenied />;
    if (MAINTENANCE_ONLY.includes(activeNav) && role !== "admin" && role !== "maintenance") return <AccessDenied />;
    switch (activeNav) {
      case "Staff":        return <Staff />;
      case "Rooms":        return <Rooms userRole={role} />;
      case "Reservations": return <Reservations />;
      case "Check-In":     return <CheckIn     key={`checkin-${navKey}`} />;
      case "Check-Out":    return <CheckOut    key={`checkout-${navKey}`} />;
      case "Guests":       return <Guests />;
      case "Maintenance":  return <Maintenance key={`maintenance-${navKey}`} user={user} />;
      case "In-House":     return <InHouse     key={`inhouse-${navKey}`} />;
      case "Pricing":      return <Pricing />;
      case "Log":          return <ActivityLog />;
      case "Settings":     return <Settings user={user} userRole={role} />;
      default:             return <DashboardHome />;
    }
  };

  const roleCfg = ROLE_CFG[role] || ROLE_CFG.staff;

  return (
    <>
      <style>{CSS}</style>
      <div className="db-root" onClick={() => showDropdown && setShowDropdown(false)}>
        <Sidebar
          activeNav={activeNav}
          setActiveNav={handleNav}
          onLogout={onLogout}
          userRole={role}
          userEmail={email}
          userName={name}
        />

        <div className="db-main">
          <div className="db-scroll">

            <header className="topbar">
              <div className="topbar-title">
                {activeNav === "Dashboard" ? `Welcome, ${name}!` : activeNav}
                <span className="role-badge" style={{ background: roleCfg.bg, color: roleCfg.color, borderColor: roleCfg.border }}>
                  {roleCfg.label}
                </span>
              </div>

              <div className="topbar-right">
                <NotificationBell onNavigate={handleNav} />
                <div className="dd-wrap" onClick={e => e.stopPropagation()}>
                  <button className="profile-btn" onClick={() => setShowDropdown(d => !d)} type="button">
                    <div className="profile-avatar">{initials}</div>
                    <div style={{ lineHeight: "1.3", textAlign: "left" }}>
                      <div style={{ fontSize: ".88rem", fontWeight: "700", color: "#222" }}>{name}</div>
                      <div style={{ fontSize: ".74rem", color: "#888", textTransform: "capitalize" }}>{role}</div>
                    </div>
                    <span style={{ color: "#aaa", fontSize: ".8rem", marginLeft: "4px" }}>▾</span>
                  </button>

                  {showDropdown && (
                    <div className="dd-menu">
                      <div className="dd-head">
                        <div style={{ fontWeight: "700", fontSize: ".9rem", color: "#222" }}>{name}</div>
                        <div style={{ fontSize: ".8rem", color: "#888", marginTop: "2px" }}>{email}</div>
                        <div style={{ marginTop: "6px", display: "inline-block", padding: "2px 10px", borderRadius: "20px", fontSize: ".72rem", fontWeight: "700", background: roleCfg.bg, color: roleCfg.color, textTransform: "capitalize" }}>
                          {role}
                        </div>
                      </div>
                      {DD_ITEMS.map(({ Icon, label, nav }) => (
                        <div key={label} className="dd-item" onClick={() => { if (nav) handleNav(nav); setShowDropdown(false); }}>
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

/* ── ACCESS DENIED ── */
function AccessDenied() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", fontFamily: "Arial,sans-serif", background: "#f4f6f0" }}>
      <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <RiForbidLine size={48} color="#c62828" />
      </div>
      <h2 style={{ fontSize: "1.4rem", color: "#c62828", margin: "0 0 8px", fontWeight: "700" }}>Access Denied</h2>
      <p style={{ color: "#8a9a8a", fontSize: ".9rem", margin: 0 }}>You don't have permission to view this page.</p>
      <p style={{ color: "#aaa", fontSize: ".82rem", marginTop: "6px" }}>Contact your administrator if you need access.</p>
    </div>
  );
}

/* ── DASHBOARD HOME ── */
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
    { lbl: "Revenue",      val: `₱${stats.revenue.toLocaleString()}`,   Icon: RiMoneyDollarCircleLine, bg: "#fff8e1", color: "#f57f17" },
  ];

  return (
    <>
      <div className="sc-5">
        {STAT_CARDS.map(({ lbl, val, Icon, bg, color }) => (
          <div key={lbl} className="sc" style={{ background: bg }}>
            <div className="sc-row">
              <span className="sc-ico"><Icon size={20} color={color} /></span>
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
            <div className="cc-hdr" style={{ marginBottom: "14px" }}>
              <div className="cc-title">{title}</div>
              <span className="cc-badge" style={{ background: badgeBg, color: badgeColor, borderColor: "transparent" }}>
                {items.length} guests
              </span>
            </div>
            {items.length === 0
              ? <p style={{ color: "#bbb", fontSize: ".85rem" }}>No entries for today.</p>
              : items.map(r => {
                const STATUS_DOT   = { confirmed: "#4caf50", pending: "#f57f17", checked_in: "#1565c0", checked_out: "#6a1b9a" };
                const STATUS_LABEL = { confirmed: "Pending", pending: "Pending", checked_in: "In", checked_out: "Done" };
                return (
                  <div key={r.id} className="today-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <div className="today-dot" style={{ background: STATUS_DOT[r.status] || "#ccc" }} />
                      <span style={{ fontSize: ".86rem", fontWeight: "600", color: "#333" }}>{r.guest_name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: ".72rem", fontWeight: "700", padding: "2px 7px", borderRadius: "20px",
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
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a9a7a" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7a9a7a" }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                <Legend />
                <Bar  dataKey="bookings" name="Bookings" fill="#5cb85c" radius={[6,6,0,0]} />
                <Line type="monotone" dataKey="bookings" name="Trend" stroke="#07713c" strokeWidth={2.5} dot={{ fill: "#07713c", r: 4 }} />
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
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#7a9a7a" }} />
                <YAxis tick={{ fontSize: 12, fill: "#7a9a7a" }} tickFormatter={v => `₱${v.toLocaleString()}`} />
                <Tooltip formatter={v => [`₱${v.toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: 8, border: "1px solid #d1fae5" }} />
                <Legend />
                <Bar  dataKey="revenue" name="Revenue (₱)" fill="#ecfdf5" stroke="#5cb85c" strokeWidth={1} radius={[6,6,0,0]} />
                <Line type="monotone" dataKey="revenue" name="Trend" stroke="#07713c" strokeWidth={2.5} dot={{ fill: "#07713c", r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
        }
      </div>

      <div className="tc">
        <div className="tc-hdr">
          <div className="tc-title">Recent Reservations</div>
          <span className="tc-badge">Recent</span>
        </div>
        <div className="tc-head" style={{ gridTemplateColumns: "2fr .8fr 1fr 1fr 1fr 1fr" }}>
          {["Guest","Room","Check-In","Check-Out","Total","Status"].map(h => <div key={h} className="th">{h}</div>)}
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
                  <div><span className="pill" style={{ background: s.bg, color: s.color }}>{(res.status||"").replace("_"," ")}</span></div>
                </div>
              );
            })
          }
        </div>
      </div>
    </>
  );
}