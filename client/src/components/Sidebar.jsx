import React from "react";
import {
  RiDashboardLine, RiHotelBedLine, RiCalendarLine,
  RiLoginBoxLine, RiLogoutBoxLine, RiGroupLine,
  RiUserLine, RiSettings3Line, RiHotelLine,
  RiLogoutCircleLine, RiToolsLine, RiPriceTag3Line, RiHistoryLine,
} from "react-icons/ri";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sb-root {
  width: 240px; flex-shrink: 0;
  background: #07713c;
  display: flex; flex-direction: column;
  height: 100vh; position: relative; overflow: hidden;
}
.sb-root::before {
  content: ''; position: absolute;
  width: 320px; height: 320px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.05);
  top: -80px; left: -80px; pointer-events: none;
}
.sb-root::after {
  content: ''; position: absolute;
  width: 240px; height: 240px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
  bottom: -60px; right: -80px; pointer-events: none;
}

.sb-logo {
  padding: 20px 18px 16px;
  display: flex; align-items: center; gap: 11px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  position: relative; z-index: 1; flex-shrink: 0;
}
.sb-logo-icon {
  width: 42px; height: 42px; border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1.5px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.sb-logo-name { font-size: .88rem; font-weight: 700; color: #fff; line-height: 1.2; }
.sb-logo-sub  { font-size: .67rem; color: rgba(255,255,255,0.4); letter-spacing: .08em; text-transform: uppercase; margin-top: 2px; }

.sb-nav {
  flex: 1; padding: 10px 0;
  display: flex; flex-direction: column; gap: 1px;
  position: relative; z-index: 1; overflow-y: auto;
}
.sb-nav::-webkit-scrollbar { width: 0; }

.sb-section {
  font-size: .62rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase;
  color: rgba(255,255,255,0.26); padding: 8px 18px 3px;
}

.sb-link {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 18px; cursor: pointer;
  color: rgba(255,255,255,0.60); font-size: .86rem; font-weight: 400;
  font-family: Arial, sans-serif;
  transition: color .2s, background .2s; position: relative;
  background: none; border: none; width: 100%; text-align: left;
}
.sb-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
.sb-link.active { color: #fff; background: rgba(255,255,255,0.11); font-weight: 600; }
.sb-link.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: #5cb85c; border-radius: 0 2px 2px 0;
}
.sb-icon { font-size: 18px; width: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

.sb-footer {
  padding: 13px 14px;
  border-top: 1px solid rgba(255,255,255,0.07);
  position: relative; z-index: 1; flex-shrink: 0;
}
.sb-user {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border-radius: 10px;
  background: rgba(255,255,255,0.06);
}
.sb-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #5cb85c; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: .8rem; flex-shrink: 0;
}
.sb-user-info { flex: 1; min-width: 0; }
.sb-user-name { font-size: .75rem; font-weight: 700; color: rgba(255,255,255,0.85); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-role-badge {
  display: inline-block; font-size: .60rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase;
  padding: 1px 7px; border-radius: 10px; margin-top: 2px;
}
.sb-logout {
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.30); font-size: 14px;
  padding: 4px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: color .2s, background .2s; flex-shrink: 0;
}
.sb-logout:hover { color: #fff; background: rgba(255,255,255,0.1); }
`;

const ROLE_BADGE_CFG = {
  admin:        { bg: "rgba(255,193,7,0.2)",  color: "#ffd54f",  label: "Admin"        },
  staff:        { bg: "rgba(92,184,92,0.2)",  color: "#a5d6a7",  label: "Staff"        },
  receptionist: { bg: "rgba(144,202,249,0.2)",color: "#90caf9",  label: "Receptionist" },
  maintenance:  { bg: "rgba(255,183,77,0.2)", color: "#ffcc80",  label: "Maintenance"  },
};

// Define nav groups with role access
const NAV = [
  { section: "Menu" },
  { label: "Dashboard",    Icon: RiDashboardLine,  key: "Dashboard",    roles: ["admin","staff","receptionist"] },
  { label: "Rooms",        Icon: RiHotelBedLine,   key: "Rooms",        roles: ["admin","staff","receptionist"] },
  { label: "Reservations", Icon: RiCalendarLine,   key: "Reservations", roles: ["admin","staff","receptionist"] },
  { label: "Check-In",     Icon: RiLoginBoxLine,   key: "Check-In",     roles: ["admin","staff","receptionist"] },
  { label: "In-House",     Icon: RiHotelBedLine,   key: "In-House",     roles: ["admin","staff","receptionist"] },
  { label: "Check-Out",    Icon: RiLogoutBoxLine,  key: "Check-Out",    roles: ["admin","staff","receptionist"] },
  { label: "Guests",       Icon: RiGroupLine,      key: "Guests",       roles: ["admin","staff","receptionist"] },
  { section: "Maintenance" },
  { label: "Maintenance",  Icon: RiToolsLine,      key: "Maintenance",  roles: ["admin","maintenance"] },
  { section: "Admin" },
  { label: "Log",          Icon: RiHistoryLine,    key: "Log",          roles: ["admin"] },
  { label: "Staff",        Icon: RiUserLine,       key: "Staff",        roles: ["admin"] },
  { label: "Pricing",      Icon: RiPriceTag3Line,  key: "Pricing",      roles: ["admin"] },
  { label: "Settings",     Icon: RiSettings3Line,  key: "Settings",     roles: ["admin","staff","receptionist"] },
];

export default function Sidebar({ activeNav, setActiveNav, onLogout, userRole, userEmail, userName }) {
  const initials  = (userName || userEmail || "U").slice(0, 2).toUpperCase();
  const badge     = ROLE_BADGE_CFG[userRole] || ROLE_BADGE_CFG.staff;
  const visibleNav = NAV.filter(item => item.section || (item.roles && item.roles.includes(userRole)));

  // Hide section headers if no items follow them for this role
  const filtered = visibleNav.filter((item, idx) => {
    if (!item.section) return true;
    const next = visibleNav[idx + 1];
    return next && !next.section;
  });

  return (
    <>
      <style>{CSS}</style>
      <aside className="sb-root">
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <RiHotelLine size={22} color="#fff" />
          </div>
          <div>
            <div className="sb-logo-name">HMS</div>
            <div className="sb-logo-sub">Hotel Management</div>
          </div>
        </div>

        <nav className="sb-nav">
          {filtered.map((item, i) => {
            if (item.section) return <div key={i} className="sb-section">{item.section}</div>;
            const { Icon, label, key } = item;
            return (
              <button
                key={key}
                className={`sb-link${activeNav === key ? " active" : ""}`}
                onClick={() => setActiveNav(key)}
              >
                <span className="sb-icon"><Icon size={18} /></span>
                {label}
              </button>
            );
          })}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <div className="sb-user-name">{userName || userEmail || "User"}</div>
              <span className="sb-role-badge" style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            </div>
            <button className="sb-logout" onClick={onLogout} title="Logout">
              <RiLogoutCircleLine size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}