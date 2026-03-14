import React, { useState, useEffect } from "react";
import supabase from "../supabaseClient";

const font = "'Arial', sans-serif";
const inputStyle = { width: "100%", padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: "8px", fontSize: "0.9rem", outline: "none", fontFamily: font, boxSizing: "border-box", background: "white", transition: "border 0.2s" };
const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#555", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px" };

export default function Guests() {
  const [guests, setGuests]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [history, setHistory]       = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => { fetchGuests(); }, []);

  const fetchGuests = async () => {
    setLoading(true);
    const { data } = await supabase.from("reservations").select("*").order("created_at", { ascending: false });
    // Group by guest email or name to get unique guests
    const map = {};
    (data || []).forEach(r => {
      const key = r.guest_email || r.guest_name;
      if (!map[key]) {
        map[key] = { name: r.guest_name, email: r.guest_email || "—", phone: r.guest_phone || "—", visits: 0, total_spent: 0, last_stay: r.check_out, status: r.status };
      }
      map[key].visits++;
      map[key].total_spent += parseFloat(r.total_amount || 0);
      if (new Date(r.check_out) > new Date(map[key].last_stay)) map[key].last_stay = r.check_out;
      if (r.status === "checked_in") map[key].status = "checked_in";
    });
    setGuests(Object.values(map));
    setLoading(false);
  };

  const openGuest = async (guest) => {
    setSelected(guest);
    setLoadingHistory(true);
    const key = guest.email !== "—" ? "guest_email" : "guest_name";
    const val = guest.email !== "—" ? guest.email : guest.name;
    const { data } = await supabase.from("reservations").select("*").eq(key, val).order("check_in", { ascending: false });
    setHistory(data || []);
    setLoadingHistory(false);
  };

  const STATUS_CONFIG = {
    confirmed:   { bg: "#e8f5e9", color: "#1b5e20", label: "Confirmed" },
    checked_in:  { bg: "#e3f2fd", color: "#1565c0", label: "Checked In" },
    checked_out: { bg: "#f3e5f5", color: "#6a1b9a", label: "Checked Out" },
    cancelled:   { bg: "#fce4ec", color: "#c62828", label: "Cancelled" },
    pending:     { bg: "#fff8e1", color: "#f57f17", label: "Pending" },
  };

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  return (
    <div style={{ padding: "28px 32px", fontFamily: font, background: "#f0f2f0", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "700", color: "#1a3c1a" }}>Guests</h2>
        <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.9rem" }}>View guest profiles and stay history</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total Guests",    value: guests.length,                                            icon: "👥", bg: "#e8f5e9", color: "#1b5e20" },
          { label: "Currently Staying",value: guests.filter(g => g.status === "checked_in").length,   icon: "🏠", bg: "#e3f2fd", color: "#1565c0" },
          { label: "Returning Guests", value: guests.filter(g => g.visits > 1).length,                icon: "⭐", bg: "#fff8e1", color: "#f57f17" },
        ].map(({ label, value, icon, bg, color }) => (
          <div key={label} style={{ background: bg, borderRadius: "14px", padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "1.3rem" }}>{icon}</span>
              <span style={{ fontSize: "0.85rem", color, fontWeight: "600" }}>{label}</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1a1a1a" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ background: "white", borderRadius: "14px", padding: "16px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
        <input type="text" placeholder="🔍  Search by name, email or phone..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle}
          onFocus={e => e.target.style.borderColor="#2d6a2d"} onBlur={e => e.target.style.borderColor="#e8e8e8"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: "20px" }}>
        {/* Guest Table */}
        <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: font }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #f0f0f0" }}>
                {["Guest", "Email", "Phone", "Visits", "Total Spent", "Last Stay", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "0.78rem", color: "#888", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#aaa" }}>No guests found.</td></tr>
              ) : filtered.map((g, i) => {
                const s = STATUS_CONFIG[g.status] || STATUS_CONFIG.confirmed;
                const isActive = selected?.name === g.name;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f5f5f5", background: isActive ? "#f0f7f0" : "white", cursor: "pointer" }}
                    onClick={() => openGuest(g)}
                    onMouseOver={e => { if (!isActive) e.currentTarget.style.background = "#fafafa"; }}
                    onMouseOut={e => { if (!isActive) e.currentTarget.style.background = "white"; }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#2d6a2d,#66bb6a)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "0.85rem", flexShrink: 0 }}>
                          {g.name.slice(0,2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "0.92rem" }}>{g.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{g.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.88rem", color: "#555" }}>{g.phone}</td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span style={{ background: g.visits > 1 ? "#fff8e1" : "#f5f5f5", color: g.visits > 1 ? "#f57f17" : "#888", padding: "3px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700" }}>
                        {g.visits}x
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "#1a3c1a" }}>₱{g.total_spent.toLocaleString()}</td>
                    <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#888" }}>{g.last_stay}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.76rem", fontWeight: "700", background: s.bg, color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ color: "#2d6a2d", fontSize: "0.85rem", fontWeight: "700" }}>View →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Guest Detail Panel */}
        {selected && (
          <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden", alignSelf: "start" }}>
            <div style={{ background: "linear-gradient(135deg,#1e4d1e,#2d6a2d)", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "1.1rem" }}>
                    {selected.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: "700", fontSize: "1rem" }}>{selected.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginTop: "2px" }}>{selected.visits} visit{selected.visits !== 1 ? "s" : ""} · ₱{selected.total_spent.toLocaleString()} total</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "28px", height: "28px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1rem" }}>×</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                {[["📧 Email", selected.email], ["📞 Phone", selected.phone], ["🏨 Visits", `${selected.visits}x`], ["💰 Total Spent", `₱${selected.total_spent.toLocaleString()}`]].map(([k,v]) => (
                  <div key={k} style={{ background: "#f8f9fa", borderRadius: "8px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "3px" }}>{k}</div>
                    <div style={{ fontWeight: "600", fontSize: "0.88rem", color: "#222" }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#2d6a2d", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>Stay History</div>
              {loadingHistory ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "0.88rem" }}>Loading history...</div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#aaa", fontSize: "0.88rem" }}>No history found.</div>
              ) : history.map(r => {
                const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.confirmed;
                return (
                  <div key={r.id} style={{ border: "1px solid #f0f0f0", borderRadius: "10px", padding: "12px 14px", marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: "700", color: "#1a3c1a" }}>Room {r.room_number || "—"}</span>
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.73rem", fontWeight: "700", background: s.bg, color: s.color }}>{s.label}</span>
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#888" }}>{r.check_in} → {r.check_out}</div>
                    <div style={{ fontWeight: "700", color: "#1a3c1a", fontSize: "0.88rem", marginTop: "4px" }}>₱{parseFloat(r.total_amount || 0).toLocaleString()}</div>
                  </div>
                  
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}