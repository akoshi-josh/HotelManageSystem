import React, { useState } from "react";
import { RiHotelBedLine, RiSearchLine, RiCheckboxCircleLine } from "react-icons/ri";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite"];

export default function RoomPickerModal({ rooms, selectedRoomId, onSelect, onClose }) {
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");

  const filtered = rooms.filter(r => {
    const matchSearch = r.room_number.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase());
    const matchType = filter === "all" || r.type === filter;
    return matchSearch && matchType;
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}
      onClick={onClose}
    >
      <div
        style={{ background: "#f4f6f0", borderRadius: "20px", width: "min(860px, 95vw)", maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "Arial,sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ background: "linear-gradient(135deg,#1e4d1e,#2d6a2d)", borderRadius: "20px 20px 0 0", padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h3 style={{ margin: 0, color: "white", fontSize: "1.1rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <RiHotelBedLine size={20} /> Select a Room
            </h3>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.65)", fontSize: "0.8rem" }}>
              Choose an available room for this reservation
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", color: "white", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "16px 24px", borderBottom: "1px solid #e4ebe4", background: "#fff", flexShrink: 0, display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px", display: "flex", alignItems: "center", gap: "8px", border: "1.5px solid #ccdacc", borderRadius: "9px", padding: "0 12px", background: "#fff" }}>
            <RiSearchLine size={16} color="#7a9a7a" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search room number or type..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: "0.88rem", fontFamily: "Arial,sans-serif", color: "#333", padding: "9px 0", background: "transparent" }}
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: "9px 13px", border: "1.5px solid #ccdacc", borderRadius: "9px", fontSize: "0.88rem", fontFamily: "Arial,sans-serif", color: "#333", outline: "none", background: "#fff", cursor: "pointer" }}
          >
            <option value="all">All Types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div style={{ overflowY: "auto", padding: "18px 24px", flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px", color: "#aaa", fontSize: "0.88rem" }}>
              No rooms found.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" }}>
              {filtered.map(r => {
                const isSelected = r.id === selectedRoomId;
                return (
                  <div
                    key={r.id}
                    onClick={() => { onSelect(r); onClose(); }}
                    style={{
                      background: "#fff",
                      borderRadius: "14px",
                      border: isSelected ? "2px solid #2d6a2d" : "2px solid #e4ebe4",
                      boxShadow: isSelected ? "0 0 0 3px rgba(45,106,45,0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                      cursor: "pointer",
                      overflow: "hidden",
                      transition: "all 0.18s",
                      position: "relative",
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#2d6a2d"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#e4ebe4"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{
                      background: r.image_url
                        ? `linear-gradient(rgba(0,0,0,0.38), rgba(0,0,0,0.52)), url(${r.image_url}) center/cover no-repeat`
                        : "linear-gradient(135deg,#1e4d1e,#2d6a2d)",
                      padding: "16px 16px 14px",
                      minHeight: "90px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "2px" }}>Room</div>
                          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#fff", lineHeight: 1 }}>{r.room_number}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: ".6rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: "2px" }}>Floor</div>
                          <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#fff" }}>{r.floor}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: ".72rem", color: "rgba(255,255,255,0.75)", fontWeight: "600", marginTop: "6px" }}>{r.type}</div>
                    </div>

                    <div style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <RiHotelBedLine size={13} color="#7a9a7a" />
                          <span style={{ fontSize: ".76rem", color: "#555", fontWeight: "600" }}>{r.bed_count || 1} {r.bed_type || "Bed"}</span>
                        </div>
                        <span style={{ fontSize: ".72rem", fontWeight: "700", color: isSelected ? "#2d6a2d" : "#07713c", background: isSelected ? "#e8f5e9" : "#f4f6f0", padding: "2px 8px", borderRadius: "8px" }}>
                          {r.type}
                        </span>
                      </div>
                      <div style={{ fontSize: "1rem", fontWeight: "700", color: "#2d6a2d" }}>
                        ₱{parseFloat(r.price).toLocaleString()}
                        <span style={{ fontSize: ".72rem", fontWeight: "400", color: "#aaa", marginLeft: "3px" }}>/night</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", background: "#2d6a2d", color: "#fff", borderRadius: "20px", padding: "3px 10px", fontSize: ".65rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <RiCheckboxCircleLine size={11} /> Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 24px", borderTop: "1px solid #e4ebe4", background: "#fff", borderRadius: "0 0 20px 20px", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "11px", background: "#fff", border: "1.5px solid #ccdacc", borderRadius: "10px", cursor: "pointer", fontSize: "0.88rem", fontWeight: "600", color: "#4a6a4a", fontFamily: "Arial,sans-serif" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}