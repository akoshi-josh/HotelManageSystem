import React, { useState, useEffect, useRef } from "react";
import {
  RiBellLine, RiSearchLine, RiAlertLine, RiCheckDoubleLine,
  RiToolsLine, RiLoginBoxLine, RiLogoutBoxLine, RiDeleteBinLine,
  RiCheckLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const TYPE_CFG = {
  inspection_request: { bg: "#fce4ec", color: "#c62828", Icon: RiSearchLine,    label: "Inspection" },
  inspection_cleared: { bg: "#ecfdf5", color: "#07713c", Icon: RiCheckDoubleLine,label: "Cleared" },
  inspection_damage:  { bg: "#fff3e0", color: "#e65100", Icon: RiAlertLine,      label: "Damage" },
  cleaning_done:      { bg: "#e8f5e9", color: "#1b5e20", Icon: RiCheckLine,      label: "Cleaned" },
  pre_checkin_done:   { bg: "#e3f2fd", color: "#1565c0", Icon: RiLoginBoxLine,   label: "Pre Check-In" },
  post_checkout_done: { bg: "#f3e5f5", color: "#6a1b9a", Icon: RiLogoutBoxLine,  label: "Post Check-Out" },
  default:            { bg: "#f4f6f0", color: "#555",    Icon: RiToolsLine,      label: "Notice" },
};

const formatTime = (ts) => {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1)   return "just now";
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440)return `${Math.floor(diff / 60)}h ago`;
  return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
};

export default function NotificationBell({ onNavigate }) {
  const [open,   setOpen]   = useState(false);
  const [notifs, setNotifs] = useState([]);
  const btnRef = useRef(null);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // Don't close if clicking inside the panel (portal)
      const panel = document.getElementById("nb-panel-root");
      if (panel && panel.contains(e.target)) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fetchNotifs = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifs(data || []);
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    const unreadIds = notifs.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async (e) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setNotifs([]);
  };

  const handleItemClick = async (notif) => {
    await markRead(notif.id);
    if (notif.nav_target && onNavigate) onNavigate(notif.nav_target);
    setOpen(false);
  };

  // Panel position — calculated from button
  const [panelStyle, setPanelStyle] = useState({});
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
        zIndex: 9999,
      });
    }
  }, [open]);

  const styles = {
    btn: {
      position: "relative", background: "#f4f6f0", border: "1.5px solid #e4ebe4",
      width: 38, height: 38, borderRadius: 10, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, transition: "background .15s",
    },
    badge: {
      position: "absolute", top: -5, right: -5,
      background: "#c62828", color: "#fff",
      fontSize: ".6rem", fontWeight: 700,
      minWidth: 17, height: 17, borderRadius: 9,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 3px", border: "2px solid #fff",
    },
    panel: {
      width: 360, maxWidth: "calc(100vw - 24px)",
      background: "#fff", borderRadius: 16,
      boxShadow: "0 12px 48px rgba(0,0,0,.2)",
      border: "1px solid #e4ebe4", overflow: "hidden",
      fontFamily: "Arial,sans-serif",
    },
    panelHdr: {
      padding: "13px 18px", display: "flex", alignItems: "center",
      justifyContent: "space-between", borderBottom: "1px solid #eef4ee",
      background: "#f8faf8",
    },
    panelTitle: { fontSize: ".88rem", fontWeight: 700, color: "#07713c" },
    markAll: {
      fontSize: ".74rem", fontWeight: 700, color: "#07713c",
      background: "none", border: "none", cursor: "pointer",
      padding: "4px 8px", borderRadius: 6, fontFamily: "Arial,sans-serif",
    },
    list: { maxHeight: 400, overflowY: "auto" },
    emptyWrap: { padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: ".85rem" },
    item: (unread) => ({
      display: "flex", alignItems: "flex-start", gap: 11,
      padding: "12px 16px", borderBottom: "1px solid #f2f7f2",
      cursor: "pointer", transition: "background .15s",
      background: unread ? "#f0fdf4" : "#fff",
      position: "relative",
    }),
    unreadDot: {
      position: "absolute", top: 16, left: 6,
      width: 6, height: 6, borderRadius: "50%", background: "#07713c",
    },
    icoWrap: (bg) => ({
      width: 34, height: 34, borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, background: bg,
    }),
    content: { flex: 1, minWidth: 0 },
    itemTitle: { fontSize: ".83rem", fontWeight: 700, color: "#222", marginBottom: 2 },
    itemMsg: {
      fontSize: ".77rem", color: "#666", lineHeight: 1.35,
      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    },
    itemTime: { fontSize: ".68rem", color: "#aaa", marginTop: 3 },
    delBtn: {
      background: "none", border: "none", cursor: "pointer",
      color: "#ccc", padding: 3, borderRadius: 5, flexShrink: 0,
    },
    footer: { padding: "10px 16px", borderTop: "1px solid #eef4ee", textAlign: "center" },
    clearAll: {
      fontSize: ".78rem", color: "#aaa", background: "none",
      border: "none", cursor: "pointer", fontFamily: "Arial,sans-serif",
    },
  };

  return (
    <>
      <button
        ref={btnRef}
        style={styles.btn}
        onClick={() => setOpen(o => !o)}
        title="Notifications"
      >
        <RiBellLine size={18} color={open ? "#07713c" : "#555"} />
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div id="nb-panel-root" style={{ ...styles.panel, ...panelStyle }}>
          {/* Header */}
          <div style={styles.panelHdr}>
            <span style={styles.panelTitle}>
              Notifications{" "}
              {unreadCount > 0 && (
                <span style={{ color: "#aaa", fontWeight: 400, fontSize: ".76rem" }}>
                  ({unreadCount} unread)
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button style={styles.markAll} onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div style={styles.list}>
            {notifs.length === 0 ? (
              <div style={styles.emptyWrap}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#f4f6f0", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                  <RiBellLine size={20} color="#ccc" />
                </div>
                No notifications yet
              </div>
            ) : notifs.map(notif => {
              const cfg = TYPE_CFG[notif.type] || TYPE_CFG.default;
              const CfgIcon = cfg.Icon;
              return (
                <div
                  key={notif.id}
                  style={styles.item(!notif.is_read)}
                  onClick={() => handleItemClick(notif)}
                  onMouseOver={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseOut={e => e.currentTarget.style.background = notif.is_read ? "#fff" : "#f0fdf4"}
                >
                  {!notif.is_read && <div style={styles.unreadDot} />}
                  <div style={{ ...styles.icoWrap(cfg.bg), marginLeft: notif.is_read ? 0 : 6 }}>
                    <CfgIcon size={16} color={cfg.color} />
                  </div>
                  <div style={styles.content}>
                    <div style={styles.itemTitle}>{notif.title}</div>
                    {notif.message && <div style={styles.itemMsg} title={notif.message}>{notif.message}</div>}
                    <div style={styles.itemTime}>{formatTime(notif.created_at)}</div>
                  </div>
                  <button
                    style={styles.delBtn}
                    onClick={(e) => deleteNotif(e, notif.id)}
                    title="Remove"
                    onMouseOver={e => { e.currentTarget.style.color = "#e53935"; e.currentTarget.style.background = "#fce4ec"; }}
                    onMouseOut={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.background = "none"; }}
                  >
                    <RiDeleteBinLine size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {notifs.length > 0 && (
            <div style={styles.footer}>
              <button style={styles.clearAll} onClick={clearAll}
                onMouseOver={e => e.currentTarget.style.color = "#e53935"}
                onMouseOut={e => e.currentTarget.style.color = "#aaa"}
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}