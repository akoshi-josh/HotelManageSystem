import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  RiBellLine, RiSearchLine, RiAlertLine, RiCheckDoubleLine,
  RiToolsLine, RiLoginBoxLine, RiLogoutBoxLine, RiDeleteBinLine,
  RiCheckLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const TYPE_CFG = {
  inspection_request: { bg: "#fce4ec", color: "#c62828", Icon: RiSearchLine,     label: "Inspection Requested" },
  inspection_cleared: { bg: "#ecfdf5", color: "#07713c", Icon: RiCheckDoubleLine, label: "Room Cleared"          },
  inspection_damage:  { bg: "#fff3e0", color: "#e65100", Icon: RiAlertLine,       label: "Damage Found"          },
  cleaning_done:      { bg: "#e8f5e9", color: "#1b5e20", Icon: RiCheckLine,       label: "Cleaning Done"         },
  pre_checkin_done:   { bg: "#e3f2fd", color: "#1565c0", Icon: RiLoginBoxLine,    label: "Pre Check-In"          },
  post_checkout_done: { bg: "#f3e5f5", color: "#6a1b9a", Icon: RiLogoutBoxLine,   label: "Post Check-Out"        },
  default:            { bg: "#f4f6f0", color: "#555",    Icon: RiToolsLine,       label: "Notice"                },
};

const fmtTime = (ts) => {
  if (!ts) return "";
  const d = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (d < 1)    return "just now";
  if (d < 60)   return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
};

export default function NotificationBell({ onNavigate }) {
  const [open,     setOpen]     = useState(false);
  const [notifs,   setNotifs]   = useState([]);
  const [toast,    setToast]    = useState(null);
  const [panelPos, setPanelPos] = useState({ top: 70, right: 16 });

  const btnRef        = useRef(null);
  const toastTimer    = useRef(null);
  const panelTimer    = useRef(null);
  const channelRef    = useRef(null);

  /* ── position helper ── */
  const recalcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPanelPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
  }, []);

  /* ── show toast + auto-open panel ── */
  const showToast = useCallback((notif) => {
    const cfg = TYPE_CFG[notif.type] || TYPE_CFG.default;
    clearTimeout(toastTimer.current);
    clearTimeout(panelTimer.current);
    setToast({ title: notif.title, message: notif.message, cfg });
    recalcPos();
    // Only show toast — panel stays closed until user clicks bell
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, [recalcPos]);

  /* ── initial fetch + polling every 3s as fallback ── */
  useEffect(() => {
    fetchNotifs();
    const poll = setInterval(fetchNotifs, 3000);
    return () => clearInterval(poll);
  }, []); // eslint-disable-line

  /* ── Realtime subscription ── */
  useEffect(() => {
    // Remove any existing channel first
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("notifications-live", {
        config: { broadcast: { self: true } },
      })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          console.log("🔔 New notification:", payload.new);
          const n = payload.new;
          setNotifs(prev => {
            // Avoid duplicates
            if (prev.find(x => x.id === n.id)) return prev;
            return [n, ...prev];
          });
          showToast(n);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifs(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          setNotifs(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("🔔 NotificationBell channel status:", status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [showToast]);

  /* ── outside click closes panel ── */
  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      const panel = document.getElementById("nb-panel");
      if (panel?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      clearTimeout(panelTimer.current);
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const lastSeenIdRef = useRef(null);

  const fetchNotifs = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const list = data || [];
    setNotifs(list);

    // Detect brand-new unread notifications since last poll
    if (list.length > 0) {
      const newest = list[0];
      if (
        lastSeenIdRef.current !== null &&
        newest.id !== lastSeenIdRef.current &&
        !newest.is_read
      ) {
        // New notification arrived — show toast immediately
        showToast(newest);
      }
      lastSeenIdRef.current = newest.id;
    }
  };

  const unread = notifs.filter(n => !n.is_read).length;

  const markRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async (e) => {
    e.stopPropagation();
    const ids = notifs.filter(n => !n.is_read).map(n => n.id);
    if (!ids.length) return;
    await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteOne = async (e, id) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async (e) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setNotifs([]);
  };

  const handleItem = async (notif) => {
    clearTimeout(panelTimer.current);
    setOpen(false);
    setToast(null);
    await markRead(notif.id);
    if (notif.nav_target && onNavigate) onNavigate(notif.nav_target);
  };

  const togglePanel = () => {
    clearTimeout(panelTimer.current);
    if (!open) recalcPos();
    setOpen(o => !o);
  };

  const toastStyle = {
    position: "fixed",
    top: panelPos.top,
    right: panelPos.right,
    zIndex: 10001,
    width: 300,
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 8px 32px rgba(0,0,0,.22)",
    border: "1px solid #e4ebe4",
    overflow: "hidden",
    fontFamily: "Arial,sans-serif",
    animation: "nb-in .2s ease",
  };

  const panelStyle = {
    position: "fixed",
    top: panelPos.top,
    right: panelPos.right,
    zIndex: 10000,
    width: 360,
    maxWidth: "calc(100vw - 24px)",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 48px rgba(0,0,0,.2)",
    border: "1px solid #e4ebe4",
    overflow: "hidden",
    fontFamily: "Arial,sans-serif",
    animation: "nb-in .2s ease",
  };

  return (
    <>
      <style>{`
        @keyframes nb-in   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Bell button ── */}
      <button
        ref={btnRef}
        onClick={togglePanel}
        title="Notifications"
        style={{
          position: "relative",
          background: open ? "#ecfdf5" : "#f4f6f0",
          border: `1.5px solid ${open ? "#a7f3d0" : "#e4ebe4"}`,
          width: 38, height: 38, borderRadius: 10,
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <RiBellLine size={18} color={open ? "#07713c" : "#555"} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            background: "#c62828", color: "#fff",
            fontSize: ".6rem", fontWeight: 700,
            minWidth: 17, height: 17, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px", border: "2px solid #fff",
            animation: "nb-in .2s ease",
          }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* ── Toast popup ── */}
      {toast && (() => {
        const Ico = toast.cfg.Icon;
        return (
          <div style={toastStyle}>
            <div style={{ height: 4, background: toast.cfg.color }} />
            <div style={{ padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: toast.cfg.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Ico size={18} color={toast.cfg.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: ".84rem", fontWeight: 700, color: "#222", marginBottom: 3 }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{
                    fontSize: ".76rem", color: "#666", lineHeight: 1.35,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => { clearTimeout(toastTimer.current); setToast(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: "1.1rem", padding: "0 2px", flexShrink: 0, lineHeight: 1 }}
              >×</button>
            </div>
            {/* Static bottom line */}
            <div style={{ height: 3, background: toast.cfg.color }} />
          </div>
        );
      })()}

      {/* ── Notification panel ── */}
      {open && (
        <div id="nb-panel" style={panelStyle}>
          {/* Header */}
          <div style={{
            padding: "13px 18px", display: "flex", alignItems: "center",
            justifyContent: "space-between", borderBottom: "1px solid #eef4ee", background: "#f8faf8",
          }}>
            <span style={{ fontSize: ".88rem", fontWeight: 700, color: "#07713c" }}>
              Notifications{" "}
              {unread > 0 && <span style={{ color: "#aaa", fontWeight: 400, fontSize: ".76rem" }}>({unread} unread)</span>}
            </span>
            {unread > 0 && (
              <button onClick={markAllRead} style={{
                fontSize: ".74rem", fontWeight: 700, color: "#07713c",
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 8px", borderRadius: 6, fontFamily: "Arial,sans-serif",
              }}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: ".85rem" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "#f4f6f0",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
                }}>
                  <RiBellLine size={20} color="#ccc" />
                </div>
                No notifications yet
              </div>
            ) : notifs.map(n => {
              const cfg = TYPE_CFG[n.type] || TYPE_CFG.default;
              const Ico = cfg.Icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItem(n)}
                  onMouseOver={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseOut={e => e.currentTarget.style.background = n.is_read ? "#fff" : "#f0fdf4"}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 11,
                    padding: "12px 16px", borderBottom: "1px solid #f2f7f2",
                    cursor: "pointer", background: n.is_read ? "#fff" : "#f0fdf4",
                    position: "relative",
                  }}
                >
                  {!n.is_read && (
                    <div style={{
                      position: "absolute", top: 16, left: 6,
                      width: 6, height: 6, borderRadius: "50%", background: "#07713c",
                    }} />
                  )}
                  <div style={{
                    width: 34, height: 34, borderRadius: 10, background: cfg.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginLeft: n.is_read ? 0 : 6,
                  }}>
                    <Ico size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: ".83rem", fontWeight: 700, color: "#222", marginBottom: 2 }}>{n.title}</div>
                    {n.message && (
                      <div style={{ fontSize: ".77rem", color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.message}>
                        {n.message}
                      </div>
                    )}
                    <div style={{ fontSize: ".68rem", color: "#aaa", marginTop: 3 }}>{fmtTime(n.created_at)}</div>
                  </div>
                  <button
                    onClick={(e) => deleteOne(e, n.id)}
                    title="Remove"
                    onMouseOver={e => { e.currentTarget.style.color = "#e53935"; e.currentTarget.style.background = "#fce4ec"; }}
                    onMouseOut={e => { e.currentTarget.style.color = "#ccc"; e.currentTarget.style.background = "none"; }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 3, borderRadius: 5, flexShrink: 0 }}
                  >
                    <RiDeleteBinLine size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {notifs.length > 0 && (
            <div style={{ padding: "10px 16px", borderTop: "1px solid #eef4ee", textAlign: "center" }}>
              <button
                onClick={clearAll}
                onMouseOver={e => e.currentTarget.style.color = "#e53935"}
                onMouseOut={e => e.currentTarget.style.color = "#aaa"}
                style={{ fontSize: ".78rem", color: "#aaa", background: "none", border: "none", cursor: "pointer", fontFamily: "Arial,sans-serif" }}
              >Clear all notifications</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}