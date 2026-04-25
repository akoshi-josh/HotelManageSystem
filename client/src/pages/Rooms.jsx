import React, { useState, useEffect } from "react";
import {
  RiHotelBedLine, RiCheckboxCircleLine, RiErrorWarningLine,
  RiToolsLine, RiCalendarLine, RiPencilLine, RiDeleteBinLine,
  RiUserLine, RiAddLine, RiSubtractLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const STATUS_CFG = {
  available:      { bg: "#e8f5e9", color: "#07713c", label: "Available",      Icon: RiCheckboxCircleLine },
  occupied:       { bg: "#fce4ec", color: "#c62828", label: "Occupied",       Icon: RiCalendarLine },
  maintenance:    { bg: "#fff3e0", color: "#e65100", label: "Maintenance",    Icon: RiToolsLine },
  reserved:       { bg: "#e3f2fd", color: "#1565c0", label: "Reserved",       Icon: RiCalendarLine },
  needs_cleaning: { bg: "#fce4ec", color: "#c62828", label: "Needs Cleaning", Icon: RiToolsLine },
};

const BED_TYPES  = ["Single", "Queen", "Master"];
const ROOM_TYPES = ["Standard", "Deluxe", "Suite"];

const DEFAULT_BED_CONFIG = { Single: 0, Queen: 0, Master: 0 };

const BED_INFO = {
  Single: { desc: "Fits 1 person comfortably" },
  Queen:  { desc: "Fits 2-3 persons comfortably" },
  Master: { desc: "Premium master bed, fits 2 persons" },
};

function calcMaxOccupancy(config) {
  const per = { Single: 1, Queen: 3, Master: 2 };
  return Object.entries(config).reduce((s, [t, n]) => s + (per[t] || 1) * n, 0);
}

function parseBedConfig(room) {
  try {
    let arr = room.bed_config;
    if (typeof arr === "string") arr = JSON.parse(arr);
    if (Array.isArray(arr) && arr.length > 0) {
      const obj = { ...DEFAULT_BED_CONFIG };
      arr.forEach(({ type, count }) => { if (obj[type] !== undefined) obj[type] = count; });
      return obj;
    }
  } catch {}
  const obj = { ...DEFAULT_BED_CONFIG };
  const mappedType = BED_TYPES.includes(room.bed_type) ? room.bed_type : "Single";
  if (mappedType && BED_TYPES.includes(mappedType)) obj[mappedType] = room.bed_count || 1;
  return obj;
}

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
  --bg: #f2f5f0;
  --white: #ffffff;
  --border: #e2e8e2;
  --text: #1a2e1a;
  --text-sec: #5a6e5a;
  --text-muted: #8fa08f;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(7,113,60,0.07);
  --shadow-md: 0 4px 20px rgba(7,113,60,0.11);
}

.rm-root { padding: 24px 28px 48px; font-family: 'Roboto', sans-serif; background: var(--bg); min-height: 100%; }

/* ── PAGE HEADER ── */
.rm-hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
.rm-hdr-left {}
.rm-title {
  font-size: 1.55rem; font-weight: 900; color: var(--green);
  letter-spacing: -0.02em; margin: 0;
  display: flex; align-items: center; gap: 10px;
}
.rm-title::before {
  content: ''; display: inline-block;
  width: 4px; height: 24px;
  background: var(--gold); border-radius: 2px; flex-shrink: 0;
}
.rm-sub { font-size: .84rem; color: var(--text-muted); margin: 5px 0 0; }

.rm-btn-add {
  padding: 10px 20px;
  background: var(--green); color: #fff;
  border: none; border-radius: 10px; cursor: pointer;
  font-size: .86rem; font-weight: 700; font-family: 'Roboto', sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(7,113,60,.22);
  transition: background .2s, transform .15s;
  position: relative; overflow: hidden;
}
.rm-btn-add::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rm-btn-add:hover { background: var(--green-dark); transform: translateY(-1px); }
.rm-btn-add:hover::after { opacity: 1; }

/* ── STAT CARDS ── */
.rm-sc-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.rm-sc {
  border-radius: var(--radius); padding: 18px 20px;
  box-shadow: var(--shadow); position: relative; overflow: hidden;
  border: 1px solid transparent;
  transition: transform .15s, box-shadow .15s;
}
.rm-sc:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.rm-sc::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rm-sc:hover::after { opacity: 1; }
.rm-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.rm-sc-lbl { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.rm-sc-val { font-size: 1.85rem; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }

/* ── FILTER BAR ── */
.rm-fbar {
  background: var(--white); border-radius: var(--radius);
  padding: 13px 20px; margin-bottom: 20px;
  border: 1px solid var(--border); box-shadow: var(--shadow);
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
}
.rm-search-wrap { flex: 1; min-width: 160px; position: relative; display: flex; align-items: center; }
.rm-search-icon { position: absolute; left: 11px; color: var(--text-muted); pointer-events: none; }
.rm-finput {
  padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px;
  font-size: .86rem; font-family: 'Roboto', sans-serif; color: var(--text);
  outline: none; background: var(--bg); transition: border-color .2s, box-shadow .2s;
}
.rm-finput.with-icon { padding-left: 34px; width: 100%; }
.rm-finput:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); background: var(--white); }
.rm-finput::placeholder { color: var(--text-muted); font-style: italic; }

/* ── ROOM GRID ── */
.rm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

.rm-card {
  background: var(--white); border-radius: var(--radius);
  overflow: hidden; box-shadow: var(--shadow);
  border: 1px solid var(--border);
  transition: transform .2s, box-shadow .2s;
  display: flex; flex-direction: column;
}
.rm-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

.rm-card-top {
  padding: 16px 20px; color: #fff; min-height: 110px;
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--green) 0%, #0a9150 100%);
}
.rm-card-top::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold);
}
.rm-card-top-row { display: flex; justify-content: space-between; align-items: flex-start; }
.rm-card-room-lbl { font-size: .65rem; opacity: .65; margin-bottom: 2px; text-transform: uppercase; letter-spacing: .08em; }
.rm-card-room-num { font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; }
.rm-card-room-type { font-size: .78rem; font-weight: 600; opacity: .82; margin-top: 4px; }
.rm-card-floor-lbl { font-size: .65rem; opacity: .65; margin-bottom: 2px; text-transform: uppercase; letter-spacing: .08em; text-align: right; }
.rm-card-floor-num { font-size: 1.4rem; font-weight: 900; text-align: right; }

.rm-card-body { padding: 14px 18px; flex: 1; }

.rm-status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 20px;
  font-size: .7rem; font-weight: 700; margin-bottom: 10px;
}

.rm-bed-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
.rm-bed-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 12px;
  font-size: .7rem; font-weight: 700;
  background: var(--gold-light); color: #7a5f00;
  border: 1px solid rgba(219,186,20,.3);
}

.rm-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
.rm-meta-item { background: var(--bg); border-radius: var(--radius-sm); padding: 7px 10px; }
.rm-meta-lbl {
  font-size: .62rem; color: var(--text-muted); font-weight: 700;
  text-transform: uppercase; letter-spacing: .06em;
  display: flex; align-items: center; gap: 3px; margin-bottom: 2px;
}
.rm-meta-val { font-size: .84rem; font-weight: 700; color: var(--green); }

.rm-desc { font-size: .74rem; color: var(--text-muted); margin-bottom: 10px; line-height: 1.5; }

.rm-price {
  font-size: 1.15rem; font-weight: 900; color: var(--green);
  margin-bottom: 12px; letter-spacing: -0.01em;
  display: flex; align-items: baseline; gap: 4px;
}
.rm-price-label { font-size: .7rem; font-weight: 400; color: var(--text-muted); }

.rm-actions { display: flex; gap: 7px; }
.rm-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 7px; border: 1.5px solid;
  font-size: .74rem; font-weight: 700; cursor: pointer;
  font-family: 'Roboto', sans-serif; transition: background .15s;
}
.rm-btn-edit { border-color: rgba(219,186,20,.4); color: #7a5f00; background: var(--gold-light); }
.rm-btn-edit:hover { background: rgba(219,186,20,.2); }
.rm-btn-del  { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
.rm-btn-del:hover  { background: #fee2e2; }

.rm-empty {
  text-align: center; padding: 60px; color: var(--text-muted); font-size: .9rem;
  background: var(--white); border-radius: var(--radius); border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

/* ── MODAL ── */
.rm-mo {
  position: fixed; inset: 0; z-index: 999;
  display: flex; align-items: flex-start; justify-content: center;
  background: rgba(0,0,0,.48);
  padding: 20px; overflow-y: auto;
}
.rm-mb {
  background: var(--bg); border-radius: 20px;
  width: 100%; max-width: 520px;
  display: flex; flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,.22); margin: auto;
}
.rm-mh {
  padding: 22px 26px; flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
  border-radius: 20px 20px 0 0;
  background: var(--green);
  position: relative; overflow: hidden;
}
.rm-mh::before {
  content: ''; position: absolute;
  width: 220px; height: 220px; border-radius: 50%;
  border: 1px solid rgba(219,186,20,0.12);
  top: -80px; right: -60px; pointer-events: none;
}
.rm-mh::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 3px;
  background: var(--gold);
}
.rm-mh-title { color: #fff; font-size: 1.05rem; font-weight: 700; margin: 0; position: relative; z-index: 1; }
.rm-mh-sub   { color: rgba(255,255,255,.65); font-size: .8rem; margin: 3px 0 0; position: relative; z-index: 1; }
.rm-mx {
  background: rgba(255,255,255,.12); border: none;
  width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: #fff; font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s; flex-shrink: 0; position: relative; z-index: 1;
}
.rm-mx:hover { background: rgba(255,255,255,.26); }

.rm-mbody { padding: 18px 24px; overflow-y: auto; }
.rm-mfoot {
  padding: 14px 24px; border-top: 1px solid var(--border);
  display: flex; gap: 10px; flex-shrink: 0;
}

.rm-msec {
  background: var(--white); border-radius: 12px;
  padding: 14px 16px; margin-bottom: 12px;
  border: 1px solid var(--border);
}
.rm-msec-title {
  font-size: .7rem; font-weight: 700; color: var(--green);
  text-transform: uppercase; letter-spacing: .08em; margin-bottom: 12px;
  display: flex; align-items: center; gap: 6px;
}
.rm-msec-title::before {
  content: ''; display: inline-block;
  width: 12px; height: 2px; background: var(--gold); border-radius: 1px;
}

.rm-flabel {
  display: block; font-size: .72rem; font-weight: 700;
  color: var(--text-sec); margin-bottom: 4px;
  text-transform: uppercase; letter-spacing: .06em;
}
.rm-fi {
  width: 100%; padding: 9px 12px;
  border: 1.5px solid var(--border); border-radius: 9px;
  font-size: .88rem; font-family: 'Roboto', sans-serif;
  outline: none; background: var(--white); color: var(--text);
  transition: border-color .2s, box-shadow .2s;
}
.rm-fi:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(7,113,60,.1); }
.rm-fi::placeholder { color: var(--text-muted); font-style: italic; }

/* Bed rows */
.rm-bed-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px; border: 1.5px solid var(--border);
  border-radius: 10px; margin-bottom: 8px; background: #fafcfa;
  transition: border-color .15s, background .15s;
}
.rm-bed-row.has-beds { border-color: rgba(219,186,20,.4); background: var(--gold-light); }
.rm-bed-name { font-size: .88rem; font-weight: 700; color: var(--text); }
.rm-bed-desc { font-size: .72rem; color: var(--text-muted); margin-top: 1px; }
.rm-bed-ctrl { display: flex; align-items: center; gap: 8px; }
.rm-bed-num  { font-size: 1.1rem; font-weight: 900; color: var(--green); min-width: 20px; text-align: center; }
.rm-bed-btn  {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--border); background: var(--white);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--green); transition: all .15s;
}
.rm-bed-btn:hover { border-color: var(--gold); background: var(--gold-light); }
.rm-bed-btn.disabled { opacity: .35; cursor: not-allowed; }

.rm-btn-cancel {
  flex: 1; padding: 11px; background: var(--white);
  border: 1.5px solid var(--border); border-radius: 10px;
  cursor: pointer; font-size: .87rem; font-weight: 600;
  color: var(--text-muted); font-family: 'Roboto', sans-serif;
  transition: border-color .15s;
}
.rm-btn-cancel:hover { border-color: #b0c8b0; }
.rm-btn-confirm {
  flex: 2; padding: 11px; background: var(--green);
  border: none; border-radius: 10px; cursor: pointer;
  font-size: .87rem; font-weight: 700; color: #fff;
  font-family: 'Roboto', sans-serif;
  box-shadow: 0 4px 14px rgba(7,113,60,.22);
  transition: background .2s;
  position: relative; overflow: hidden;
}
.rm-btn-confirm::after {
  content: ''; position: absolute;
  bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--gold); opacity: 0; transition: opacity .2s;
}
.rm-btn-confirm:hover:not(:disabled) { background: var(--green-dark); }
.rm-btn-confirm:hover:not(:disabled)::after { opacity: 1; }
.rm-btn-confirm:disabled { background: #aaa; cursor: not-allowed; }

.rm-alert-ok  { padding: 9px 14px; border-radius: 8px; background: #e8f5e9; border-left: 3px solid #4cae4c; color: #1b5e20; font-size: .83rem; margin-bottom: 12px; }
.rm-alert-err { padding: 9px 14px; border-radius: 8px; background: #fdecea; border-left: 3px solid #e53935; color: #b71c1c; font-size: .83rem; margin-bottom: 12px; }

/* ── IMAGE UPLOAD ── */
.rm-img-drop {
  width: 100%; height: 140px; border: 2px dashed var(--border);
  border-radius: 12px; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  cursor: pointer; background: var(--bg); overflow: hidden;
  position: relative; transition: border-color .2s;
}
.rm-img-drop:hover { border-color: var(--gold); }
.rm-img-placeholder { text-align: center; color: var(--text-muted); }
.rm-img-placeholder-lbl { font-size: .8rem; font-weight: 600; margin-top: 6px; }
.rm-img-placeholder-sub { font-size: .72rem; color: var(--text-muted); margin-top: 2px; }
.rm-img-remove {
  margin-top: 7px; font-size: .78rem; color: #dc2626;
  background: none; border: none; cursor: pointer; font-family: 'Roboto', sans-serif;
  display: flex; align-items: center; gap: 4px;
}

/* ── RESPONSIVE ── */
@media (max-width: 1100px) { .rm-sc-4 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 900px)  { .rm-root { padding: 20px 20px 48px; } }
@media (max-width: 640px) {
  .rm-sc-4 { grid-template-columns: 1fr 1fr; gap: 10px; }
  .rm-root { padding: 16px 14px 48px; }
  .rm-hdr  { margin-bottom: 16px; }
  .rm-title { font-size: 1.3rem; }
  .rm-grid { grid-template-columns: 1fr; }
  .rm-fbar { padding: 12px 14px; gap: 8px; }
}
@media (max-width: 420px) {
  .rm-sc-4 { grid-template-columns: 1fr; }
  .rm-mb { max-width: 100%; border-radius: 16px; }
}
`;

export default function Rooms({ userRole }) {
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [editRoom,     setEditRoom]     = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType,   setFilterType]   = useState("all");
  const [filterBed,    setFilterBed]    = useState("all");
  const [imgViewer,    setImgViewer]    = useState(null);
  const [form, setForm] = useState({
    room_number: "", type: "Standard", floor: "", price: "",
    status: "available", description: "",
  });
  const [bedConfig,      setBedConfig]      = useState({ ...DEFAULT_BED_CONFIG });
  const [roomImgFile,    setRoomImgFile]    = useState(null);
  const [roomImgPreview, setRoomImgPreview] = useState("");

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    const { data } = await supabase.from("rooms").select("*").order("room_number");
    setRooms(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setEditRoom(null);
    setForm({ room_number: "", type: "Standard", floor: "", price: "", status: "available", description: "" });
    setBedConfig({ ...DEFAULT_BED_CONFIG, Single: 1 });
    setRoomImgFile(null); setRoomImgPreview("");
    setError(""); setSuccess(""); setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({ room_number: room.room_number, type: room.type, floor: room.floor, price: room.price, status: room.status, description: room.description || "" });
    setBedConfig(parseBedConfig(room));
    setRoomImgFile(null); setRoomImgPreview(room.image_url || "");
    setError(""); setSuccess(""); setShowModal(true);
  };

  const adjustBed = (type, delta) => {
    setBedConfig(prev => ({ ...prev, [type]: Math.max(0, (prev[type] || 0) + delta) }));
  };

  const totalBeds = Object.values(bedConfig).reduce((s, n) => s + n, 0);

  const uploadRoomImage = async (file) => {
    const ext  = file.name.split(".").pop();
    const path = `rooms/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("room-images").upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("room-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setError("");
    if (!form.room_number || !form.type || !form.floor || !form.price) {
      setError("Room number, type, floor, and price are required."); return;
    }
    if (totalBeds === 0) { setError("Please add at least 1 bed."); return; }
    setSaving(true);
    const priority = ["Master", "Queen", "Single"];
    const primaryBedType  = priority.find(t => bedConfig[t] > 0) || "Single";
    const primaryBedCount = bedConfig[primaryBedType];
    const maxOcc       = calcMaxOccupancy(bedConfig);
    const bedConfigArr = BED_TYPES.filter(t => bedConfig[t] > 0).map(t => ({ type: t, count: bedConfig[t] }));
    const payload = {
      room_number: form.room_number,
      image_url:   roomImgFile ? await uploadRoomImage(roomImgFile) : (editRoom?.image_url || null),
      type: form.type, floor: parseInt(form.floor), price: parseFloat(form.price),
      status: form.status, description: form.description,
      bed_type: primaryBedType, bed_count: primaryBedCount,
      max_occupancy: maxOcc, bed_config: bedConfigArr,
    };
    if (editRoom) {
      const { error: e } = await supabase.from("rooms").update(payload).eq("id", editRoom.id);
      if (e) { setError(e.message); setSaving(false); return; }
      setSuccess("Room updated!");
    } else {
      const { error: e } = await supabase.from("rooms").insert(payload);
      if (e) { setError(e.message); setSaving(false); return; }
      setSuccess("Room added!");
    }
    setSaving(false); fetchRooms();
    setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    fetchRooms();
  };

  const filtered = rooms.filter(r => {
    const matchSearch = r.room_number.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType   = filterType   === "all" || r.type   === filterType;
    const matchBed    = filterBed    === "all" || (() => { const c = parseBedConfig(r); return c[filterBed] > 0; })();
    return matchSearch && matchStatus && matchType && matchBed;
  });

  const stats = {
    total:       rooms.length,
    available:   rooms.filter(r => r.status === "available").length,
    occupied:    rooms.filter(r => r.status === "occupied").length,
    maintenance: rooms.filter(r => r.status === "maintenance").length,
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rm-root">

        <div className="rm-hdr">
          <div className="rm-hdr-left">
            <h2 className="rm-title">Room Management</h2>
            <p className="rm-sub">Manage hotel rooms and bed configurations</p>
          </div>
          {userRole === "admin" && (
            <button className="rm-btn-add" onClick={openAdd}>
              <RiHotelBedLine size={16} /> Add Room
            </button>
          )}
        </div>

        <div className="rm-sc-4">
          {[
            { lbl: "Total Rooms", val: stats.total,       Icon: RiHotelBedLine,       bg: "#e8f5e9", c: "#07713c" },
            { lbl: "Available",   val: stats.available,   Icon: RiCheckboxCircleLine, bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Occupied",    val: stats.occupied,    Icon: RiErrorWarningLine,   bg: "#fce4ec", c: "#c62828" },
            { lbl: "Maintenance", val: stats.maintenance, Icon: RiToolsLine,          bg: "#fdf8e1", c: "#7a5f00" },
          ].map(({ lbl, val, Icon, bg, c }) => (
            <div key={lbl} className="rm-sc" style={{ background: bg, borderColor: "rgba(0,0,0,0.04)" }}>
              <div className="rm-sc-row"><Icon size={18} color={c} /><span className="rm-sc-lbl" style={{ color: c }}>{lbl}</span></div>
              <div className="rm-sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="rm-fbar">
          <div className="rm-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rm-search-icon" style={{position:'absolute',left:11,pointerEvents:'none',color:'var(--text-muted)'}}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="rm-finput with-icon"
              placeholder="Search room number or type..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="rm-finput" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
          <select className="rm-finput" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="rm-finput" value={filterBed} onChange={e => setFilterBed(e.target.value)}>
            <option value="all">All Beds</option>
            <option value="Single">Single Bed</option>
            <option value="Queen">Queen Bed</option>
            <option value="Master">Master Bed</option>
          </select>
        </div>

        {loading ? (
          <div className="rm-empty">Loading rooms...</div>
        ) : filtered.length === 0 ? (
          <div className="rm-empty">No rooms found.</div>
        ) : (
          <div className="rm-grid">
            {filtered.map(room => {
              const s = STATUS_CFG[room.status] || STATUS_CFG.available;
              const StatIcon = s.Icon;
              const config = parseBedConfig(room);
              const bedTags = BED_TYPES.filter(t => config[t] > 0).map(t => `${config[t]}× ${t}`);
              return (
                <div key={room.id} className="rm-card">
                  <div
                    className="rm-card-top"
                    style={{
                      background: room.image_url
                        ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${room.image_url}) center/cover no-repeat`
                        : "linear-gradient(135deg, #07713c 0%, #0a9150 100%)",
                      cursor: room.image_url ? "pointer" : "default",
                    }}
                    onClick={() => room.image_url && setImgViewer(room.image_url)}
                  >
                    <div className="rm-card-top-row">
                      <div>
                        <div className="rm-card-room-lbl">Room</div>
                        <div className="rm-card-room-num">{room.room_number}</div>
                        <div className="rm-card-room-type">{room.type}</div>
                      </div>
                      <div>
                        <div className="rm-card-floor-lbl">Floor</div>
                        <div className="rm-card-floor-num">{room.floor}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rm-card-body">
                    <div className="rm-status-pill" style={{ background: s.bg, color: s.color }}>
                      <StatIcon size={12} />{s.label}
                    </div>

                    <div className="rm-bed-tags">
                      {bedTags.map(tag => (
                        <span key={tag} className="rm-bed-tag">
                          <RiHotelBedLine size={11} />{tag}
                        </span>
                      ))}
                    </div>

                    <div className="rm-meta">
                      <div className="rm-meta-item">
                        <div className="rm-meta-lbl"><RiHotelBedLine size={10} />Total Beds</div>
                        <div className="rm-meta-val">{Object.values(config).reduce((s,n) => s+n, 0)}</div>
                      </div>
                      <div className="rm-meta-item">
                        <div className="rm-meta-lbl"><RiUserLine size={10} />Max Guests</div>
                        <div className="rm-meta-val">{room.max_occupancy || calcMaxOccupancy(config)}</div>
                      </div>
                    </div>

                    {room.description && (
                      <div className="rm-desc">{room.description}</div>
                    )}

                    <div className="rm-price">
                      ₱{parseFloat(room.price).toLocaleString()}
                      <span className="rm-price-label">/night</span>
                    </div>

                    {userRole === "admin" && (
                      <div className="rm-actions">
                        <button className="rm-btn rm-btn-edit" onClick={() => openEdit(room)}>
                          <RiPencilLine size={13} />Edit
                        </button>
                        <button className="rm-btn rm-btn-del" onClick={() => handleDelete(room.id)}>
                          <RiDeleteBinLine size={13} />Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="rm-mo" onClick={() => setShowModal(false)}>
          <div className="rm-mb" onClick={e => e.stopPropagation()}>
            <div className="rm-mh">
              <div>
                <p className="rm-mh-title">{editRoom ? "Edit Room" : "Add New Room"}</p>
                <p className="rm-mh-sub">{editRoom ? "Update room details" : "Configure the new room"}</p>
              </div>
              <button className="rm-mx" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="rm-mbody">
              {error   && <div className="rm-alert-err">⚠ {error}</div>}
              {success && <div className="rm-alert-ok">✓ {success}</div>}

              <div className="rm-msec">
                <div className="rm-msec-title">Room Image</div>
                <div
                  className="rm-img-drop"
                  onClick={() => document.getElementById("room-img-input").click()}
                  style={{ borderColor: roomImgPreview ? "rgba(219,186,20,.4)" : undefined }}
                >
                  <input
                    id="room-img-input" type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setRoomImgFile(file);
                      setRoomImgPreview(URL.createObjectURL(file));
                    }}
                  />
                  {roomImgPreview
                    ? <img src={roomImgPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div className="rm-img-placeholder">
                        <RiHotelBedLine size={28} color="#c8d8c8" />
                        <div className="rm-img-placeholder-lbl">Click to upload room image</div>
                        <div className="rm-img-placeholder-sub">PNG, JPG, WEBP</div>
                      </div>
                  }
                </div>
                {roomImgPreview && (
                  <button className="rm-img-remove" onClick={() => { setRoomImgFile(null); setRoomImgPreview(""); }}>
                    ✕ Remove image
                  </button>
                )}
              </div>

              <div className="rm-msec">
                <div className="rm-msec-title">Room Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="rm-flabel">Room Number *</label>
                    <input className="rm-fi" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} placeholder="e.g. 101" />
                  </div>
                  <div>
                    <label className="rm-flabel">Floor *</label>
                    <input type="number" className="rm-fi" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} placeholder="e.g. 1" />
                  </div>
                  <div>
                    <label className="rm-flabel">Room Type *</label>
                    <select className="rm-fi" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="rm-flabel">Status</label>
                    <select className="rm-fi" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rm-msec">
                <div className="rm-msec-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 12, height: 2, background: "var(--gold)", borderRadius: 1 }} />
                    Bed Configuration
                  </span>
                  {totalBeds > 0 && (
                    <span style={{ fontSize: ".7rem", fontWeight: "700", color: "#7a5f00", background: "var(--gold-light)", padding: "2px 9px", borderRadius: "10px", border: "1px solid rgba(219,186,20,.3)" }}>
                      {totalBeds} bed{totalBeds > 1 ? "s" : ""} · {calcMaxOccupancy(bedConfig)} max guests
                    </span>
                  )}
                </div>
                {BED_TYPES.map(type => (
                  <div key={type} className={`rm-bed-row${bedConfig[type] > 0 ? " has-beds" : ""}`}>
                    <div>
                      <div className="rm-bed-name">{type} Bed</div>
                      <div className="rm-bed-desc">{BED_INFO[type].desc}</div>
                    </div>
                    <div className="rm-bed-ctrl">
                      <button
                        className={`rm-bed-btn${bedConfig[type] === 0 ? " disabled" : ""}`}
                        onClick={() => adjustBed(type, -1)}
                        disabled={bedConfig[type] === 0}
                      >
                        <RiSubtractLine size={14} />
                      </button>
                      <span className="rm-bed-num">{bedConfig[type]}</span>
                      <button className="rm-bed-btn" onClick={() => adjustBed(type, 1)}>
                        <RiAddLine size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {totalBeds === 0 && (
                  <div style={{ textAlign: "center", color: "#e53935", fontSize: ".8rem", padding: "6px 0" }}>
                    Add at least 1 bed
                  </div>
                )}
              </div>

              <div className="rm-msec">
                <div className="rm-msec-title">Pricing & Notes</div>
                <div style={{ marginBottom: "10px" }}>
                  <label className="rm-flabel">Price per Night (₱) *</label>
                  <input type="number" className="rm-fi" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 1500" />
                </div>
                <div>
                  <label className="rm-flabel">Description (optional)</label>
                  <textarea className="rm-fi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Garden view, mountain facing..." rows={2} style={{ resize: "vertical" }} />
                </div>
              </div>
            </div>

            <div className="rm-mfoot">
              <button className="rm-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="rm-btn-confirm" onClick={handleSave} disabled={saving || totalBeds === 0}>
                {saving ? "Saving..." : editRoom ? "Save Changes" : "Add Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      {imgViewer && (
        <div
          onClick={() => setImgViewer(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <button
            onClick={() => setImgViewer(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.15)", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", color: "#fff", fontSize: "1.3rem", display: "flex", alignItems: "center", justifyContent: "center" }}
          >×</button>
          <img
            src={imgViewer} alt="Room"
            onClick={e => e.stopPropagation()}
            style={{ width: "80vw", height: "80vh", borderRadius: "12px", objectFit: "cover", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
          />
        </div>
      )}
    </>
  );
}