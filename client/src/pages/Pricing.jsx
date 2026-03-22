import React, { useState, useEffect, useCallback } from "react";
import {
  RiHotelBedLine, RiCheckboxCircleLine,
  RiSaveLine, RiRefreshLine, RiAddLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const ROOM_TYPES = ["Standard", "Deluxe", "Suite"];

const TYPE_COLOR = {
  Standard: { bg: "#e8f5e9", color: "#07713c", border: "#a7f3d0" },
  Deluxe:   { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  Suite:    { bg: "#f3e5f5", color: "#6a1b9a", border: "#ce93d8" },
};

const BED_ORDER = ["Single", "Queen", "Queen", "Master"];

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.pr-root { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.pr-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.pr-sub   { font-size:.83rem; color:#8a9a8a; margin-bottom:24px; }
.pr-success { display:flex; align-items:center; gap:8px; padding:11px 18px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; color:#065f46; font-weight:600; font-size:.86rem; margin-bottom:18px; }
.pr-grid  { display:flex; flex-direction:column; gap:20px; }

/* ── TYPE CARD ── */
.pr-card  { background:#fff; border-radius:16px; border:1px solid #e4ebe4; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.pr-card-hdr { padding:16px 22px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #eef4ee; }
.pr-card-title { font-size:.95rem; font-weight:700; display:flex; align-items:center; gap:8px; }
.pr-card-meta  { display:flex; align-items:center; gap:8px; }
.pr-card-badge { font-size:.65rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:3px 10px; border-radius:20px; border:1px solid; }

/* ── PRICING ROW ── */
.pr-row { display:flex; align-items:center; gap:0; border-bottom:1px solid #f2f7f2; transition:background .15s; }
.pr-row:last-child { border-bottom:none; }
.pr-row:hover { background:#f8fdf8; }

.pr-row-left  { padding:14px 22px; flex:1; min-width:0; }
.pr-row-right { padding:14px 18px; display:flex; align-items:center; gap:12px; flex-shrink:0; border-left:1px solid #eef4ee; }

/* Bed config display */
.bed-config { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.bed-pill { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:.76rem; font-weight:700; background:#f4f6f0; color:#333; border:1px solid #e4ebe4; }
.bed-pill-count { font-size:.9rem; font-weight:800; color:#07713c; }
.bed-plus { font-size:.75rem; color:#aaa; font-weight:700; }

.pr-info-col { display:flex; flex-direction:column; gap:2px; }
.pr-info-lbl { font-size:.63rem; color:#8a9a8a; font-weight:700; text-transform:uppercase; }
.pr-info-val { font-size:.86rem; font-weight:700; }
.pr-rooms-count { font-size:.72rem; font-weight:700; padding:2px 9px; border-radius:10px; }

/* Price input */
.pr-current-price { font-size:1rem; font-weight:800; color:#07713c; min-width:80px; }
.pr-input-wrap { display:flex; align-items:center; gap:4px; background:#f4f6f0; border-radius:9px; padding:4px 10px; border:1.5px solid #ccdacc; transition:border-color .2s; }
.pr-input-wrap:focus-within { border-color:#07713c; background:#fff; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.pr-symbol { font-size:.85rem; color:#888; font-weight:700; }
.pr-input { width:100px; background:none; border:none; outline:none; font-size:.9rem; font-family:Arial,sans-serif; color:#07713c; font-weight:700; }
.pr-input::placeholder { color:#bbb; font-weight:400; }
.pr-apply-btn { display:inline-flex; align-items:center; gap:5px; padding:8px 16px; background:#07713c; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.8rem; font-weight:700; font-family:Arial,sans-serif; white-space:nowrap; }
.pr-apply-btn:hover { background:#05592f; }
.pr-apply-btn:disabled { background:#ccc; cursor:not-allowed; }

.pr-empty { padding:20px 22px; color:#aaa; font-size:.85rem; text-align:center; }
.rn-btn { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border:1.5px solid #ccdacc; border-radius:20px; font-size:.76rem; font-weight:700; color:#07713c; background:#ecfdf5; cursor:pointer; font-family:Arial,sans-serif; transition:all .15s; white-space:nowrap; }
.rn-btn:hover { background:#d1fae5; border-color:#6ee7b7; }
.rn-mo { position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:20px; }
.rn-mb { background:#fff; border-radius:18px; width:100%; max-width:420px; box-shadow:0 20px 60px rgba(0,0,0,.22); overflow:hidden; }
.rn-mh { padding:18px 22px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eef4ee; }
.rn-mh-title { font-size:.95rem; font-weight:700; color:#07713c; margin:0; }
.rn-mh-sub   { font-size:.78rem; color:#8a9a8a; margin:2px 0 0; }
.rn-mx { background:#f4f6f0; border:none; width:30px; height:30px; border-radius:50%; cursor:pointer; color:#555; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.rn-mx:hover { background:#e4ebe4; }
.rn-body { padding:18px 22px; max-height:340px; overflow-y:auto; }
.rn-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(60px,1fr)); gap:8px; }
.rn-tag { background:#f4f6f0; border:1px solid #e4ebe4; border-radius:8px; padding:7px 10px; text-align:center; font-size:.82rem; font-weight:700; color:#222; }
.pr-divider { height:1px; background:#eef4ee; margin:0; }

/* bed icon */
.bed-icon { display:inline-block; }
`;

/* Render a bed icon as inline SVG */
function BedIcon({ size = 14, color = "#555" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}

/**
 * Parse bed_config JSONB array OR fall back to bed_type + bed_count.
 * Returns array of {type, count} e.g. [{type:"Single",count:3},{type:"Master",count:1}]
 */
function parseBedConfig(room) {
  try {
    // bed_config may come as array (JSONB) or string (legacy JSON.stringify)
    let cfg = room.bed_config;
    if (typeof cfg === "string") cfg = JSON.parse(cfg);
    if (Array.isArray(cfg) && cfg.length > 0) {
      return cfg.filter(b => b.count > 0);
    }
  } catch {}
  // Fallback to bed_type + bed_count columns
  const bt = room.bed_type  || "Single";
  const bc = room.bed_count || 1;
  return [{ type: bt, count: bc }];
}

/** Stable string key for a bed config array */
function bedConfigKey(config) {
  return config.map(b => `${b.count}x${b.type}`).sort().join("|");
}

/** Human-readable string */
function bedConfigLabel(config) {
  return config.map(b => `${b.count}× ${b.type}`).join(" + ");
}

export default function Pricing() {
  const [rooms,      setRooms]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [prices,     setPrices]     = useState({});   // key -> new price string
  const [applying,   setApplying]   = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [roomsModal, setRoomsModal]  = useState(null); // { title, rooms[] }

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    const { data } = await supabase.from("rooms").select("*").order("room_number");
    setRooms(data || []);
    setLoading(false);
  };

  /**
   * Build combos for a given type.
   * Each combo = unique bed configuration (regardless of how beds are stored).
   */
  const getCombos = (type) => {
    const typeRooms = rooms.filter(r => r.type === type);
    const map = new Map(); // bedConfigKey -> { config, rooms[], sample_price }
    typeRooms.forEach(r => {
      const config = parseBedConfig(r);
      const key    = bedConfigKey(config);
      if (!map.has(key)) {
        map.set(key, { config, roomList: [], sample_price: r.price });
      }
      map.get(key).roomList.push(r);
    });
    return Array.from(map.entries())
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) => {
        // Sort by first bed type priority
        const ai = BED_ORDER.indexOf(a.config[0]?.type || "");
        const bi = BED_ORDER.indexOf(b.config[0]?.type || "");
        return ai - bi;
      });
  };

  const handleApply = async (type, combo) => {
    const inputKey = `${type}__${combo.key}`;
    const newPrice = parseFloat(prices[inputKey]);
    if (!newPrice || newPrice <= 0) return;
    setApplying(inputKey);

    // Update every room in this combo by ID
    const ids = combo.roomList.map(r => r.id);
    const { error } = await supabase.from("rooms")
      .update({ price: newPrice })
      .in("id", ids);

    if (!error) {
      setSuccessMsg(
        `Updated ${ids.length} ${type} room${ids.length > 1 ? "s" : ""} (${bedConfigLabel(combo.config)}) → ₱${newPrice.toLocaleString()}/night`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchRooms();
      setPrices(p => ({ ...p, [inputKey]: "" }));
    }
    setApplying(null);
  };

  if (loading) return (
    <>
      <style>{CSS}</style>
      <div className="pr-root"><div style={{ color: "#aaa", padding: "60px", textAlign: "center" }}>Loading...</div></div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="pr-root">
        <h2 className="pr-title">Pricing Management</h2>
        <p className="pr-sub">
          Prices are grouped by room type and bed configuration. Enter a new price and click <strong>Apply</strong> to update all matching rooms at once.
        </p>

        {successMsg && (
          <div className="pr-success">
            <RiCheckboxCircleLine size={18} /> {successMsg}
          </div>
        )}

        <div className="pr-grid">
          {ROOM_TYPES.map(type => {
            const combos    = getCombos(type);
            const tc        = TYPE_COLOR[type];
            const typeCount = rooms.filter(r => r.type === type).length;
            if (typeCount === 0) return null;

            return (
              <div key={type} className="pr-card">
                {/* Card header */}
                <div className="pr-card-hdr">
                  <div className="pr-card-title" style={{ color: tc.color }}>
                    <RiHotelBedLine size={18} />
                    {type} Rooms
                  </div>
                  <div className="pr-card-meta">
                    <span style={{ fontSize: ".8rem", color: "#8a9a8a" }}>{combos.length} configuration{combos.length !== 1 ? "s" : ""}</span>
                    <span className="pr-card-badge" style={{ background: tc.bg, color: tc.color, borderColor: tc.border }}>
                      {typeCount} room{typeCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {combos.length === 0 ? (
                  <div className="pr-empty">
                    <RiAddLine size={16} style={{ marginBottom: "4px" }} /><br />
                    No rooms of this type yet. Add rooms with bed configuration in the Rooms page.
                  </div>
                ) : combos.map((combo, idx) => {
                  const inputKey    = `${type}__${combo.key}`;
                  const isApplying  = applying === inputKey;
                  const canApply    = !!prices[inputKey] && parseFloat(prices[inputKey]) > 0;
                  // Get the actual current price (refetched after apply)
                  const currentPrice = combo.roomList[0]?.price || combo.sample_price;

                  return (
                    <React.Fragment key={combo.key}>
                      {idx > 0 && <div className="pr-divider" />}
                      <div className="pr-row">

                        {/* LEFT — Bed Configuration only */}
                        <div className="pr-row-left">
                          <div className="pr-info-lbl" style={{ marginBottom: "7px" }}>Bed Configuration</div>
                          <div className="bed-config">
                            {combo.config.map((b, i) => (
                              <React.Fragment key={i}>
                                {i > 0 && <span className="bed-plus">+</span>}
                                <span className="bed-pill">
                                  <BedIcon size={13} color="#07713c" />
                                  <span className="bed-pill-count">{b.count}</span>
                                  <span>{b.type}</span>
                                  {b.count > 1 ? " Beds" : " Bed"}
                                </span>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* RIGHT — Rooms · Room Numbers · Current Price · New Price · Apply */}
                        <div className="pr-row-right">

                          {/* Rooms count */}
                          <div className="pr-info-col" style={{ alignItems: "center" }}>
                            <div className="pr-info-lbl">Rooms</div>
                            <span className="pr-rooms-count" style={{ background: tc.bg, color: tc.color }}>
                              {combo.roomList.length}
                            </span>
                          </div>

                          <div style={{ width: "1px", height: "36px", background: "#eef4ee", flexShrink: 0 }} />

                          {/* Room Numbers modal button */}
                          <div className="pr-info-col" style={{ alignItems: "center" }}>
                            <div className="pr-info-lbl">Room Numbers</div>
                            <button
                              className="rn-btn"
                              onClick={() => setRoomsModal({
                                title: `${type} · ${bedConfigLabel(combo.config)}`,
                                rooms: combo.roomList,
                              })}
                            >
                              View Rooms
                            </button>
                          </div>

                          <div style={{ width: "1px", height: "36px", background: "#eef4ee", flexShrink: 0 }} />

                          {/* Current Price */}
                          <div className="pr-info-col" style={{ alignItems: "flex-end" }}>
                            <div className="pr-info-lbl">Current Price</div>
                            <div className="pr-current-price">
                              ₱{parseFloat(currentPrice).toLocaleString()}
                              <span style={{ fontSize: ".7rem", fontWeight: "400", color: "#aaa" }}>/night</span>
                            </div>
                          </div>

                          <div style={{ width: "1px", height: "36px", background: "#eef4ee", flexShrink: 0 }} />

                          {/* New Price input */}
                          <div className="pr-info-col">
                            <div className="pr-info-lbl">New Price</div>
                            <div className="pr-input-wrap">
                              <span className="pr-symbol">₱</span>
                              <input
                                type="number"
                                className="pr-input"
                                placeholder="Enter amount"
                                value={prices[inputKey] || ""}
                                onChange={e => setPrices(p => ({ ...p, [inputKey]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && canApply && handleApply(type, combo)}
                              />
                            </div>
                          </div>

                          {/* Apply button */}
                          <button
                            className="pr-apply-btn"
                            onClick={() => handleApply(type, combo)}
                            disabled={!canApply || isApplying}
                          >
                            {isApplying
                              ? <><RiRefreshLine size={13} />Applying...</>
                              : <><RiSaveLine size={13} />Apply to All</>
                            }
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Numbers Modal */}
      {roomsModal && (
        <div className="rn-mo" onClick={() => setRoomsModal(null)}>
          <div className="rn-mb" onClick={e => e.stopPropagation()}>
            <div className="rn-mh">
              <div>
                <p className="rn-mh-title">Room Numbers</p>
                <p className="rn-mh-sub">{roomsModal.title} · {roomsModal.rooms.length} room{roomsModal.rooms.length !== 1 ? "s" : ""}</p>
              </div>
              <button className="rn-mx" onClick={() => setRoomsModal(null)}>×</button>
            </div>
            <div className="rn-body">
              <div className="rn-grid">
                {roomsModal.rooms
                  .slice()
                  .sort((a, b) => String(a.room_number).localeCompare(String(b.room_number), undefined, { numeric: true }))
                  .map(r => (
                    <div key={r.id} className="rn-tag">{r.room_number}</div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}