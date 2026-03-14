import React from "react";
import { RiDashboardLine, RiHotelBedLine, RiCalendarLine, RiLoginBoxLine, RiLogoutBoxLine, RiGroupLine, RiUserLine, RiSettings3Line, RiHotelLine, RiLogoutCircleLine } from "react-icons/ri";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.sb-root {
  width: 240px; flex-shrink: 0;
  background: #07713c;
  display: flex; flex-direction: column;
  height: 100vh; position: relative; overflow: hidden;
}
/* NORMI decorative ring */
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

/* LOGO */
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

/* NAV */
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
/* NORMI 3px left accent bar */
.sb-link.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: #5cb85c; border-radius: 0 2px 2px 0;
}
.sb-icon { font-size: 18px; width: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* FOOTER */
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
.sb-email {
  flex: 1; font-size: .72rem; color: rgba(255,255,255,0.48);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
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

const NAV = [
  { section: "Menu" },
  { label: "Dashboard",    icon: RiDashboardLine,   key: "Dashboard" },
  { label: "Rooms",        icon: RiHotelBedLine,    key: "Rooms" },
  { label: "Reservations", icon: RiCalendarLine,    key: "Reservations" },
  { label: "Check-In",     icon: RiLoginBoxLine,    key: "Check-In" },
  { label: "Check-Out",    icon: RiLogoutBoxLine,   key: "Check-Out" },
  { label: "Guests",       icon: RiGroupLine,       key: "Guests" },
  { section: "Admin" },
  { label: "Staff",        icon: RiUserLine,        key: "Staff",   adminOnly: true },
  { label: "Settings",     icon: RiSettings3Line,   key: "Settings" },
];

export default function Sidebar({ activeNav, setActiveNav, onLogout, userRole, userEmail }) {
  const initials = (userEmail || "U").slice(0, 2).toUpperCase();

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
          {NAV.map((item, i) => {
            if (item.section) return <div key={i} className="sb-section">{item.section}</div>;
            if (item.adminOnly && userRole !== "admin") return null;
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                className={`sb-link${activeNav === item.key ? " active" : ""}`}
                onClick={() => setActiveNav(item.key)}
              >
                <span className="sb-icon"><IconComponent size={18} /></span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-email">{userEmail || "user@hotel.com"}</div>
            <button className="sb-logout" onClick={onLogout} title="Logout">
              <RiLogoutCircleLine size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}