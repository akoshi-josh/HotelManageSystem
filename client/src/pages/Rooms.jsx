import React, { useState, useEffect } from "react";
import {
  RiHotelBedLine, RiCheckboxCircleLine, RiErrorWarningLine,
  RiToolsLine, RiCalendarLine, RiPencilLine, RiDeleteBinLine,
  RiUserLine, RiAddLine, RiSubtractLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";


const STATUS_CFG = {
  available:      { bg: "#ecfdf5", color: "#07713c", label: "Available",     Icon: RiCheckboxCircleLine },
  occupied:       { bg: "#fce4ec", color: "#c62828", label: "Occupied",      Icon: RiCalendarLine },
  maintenance:    { bg: "#fff3e0", color: "#e65100", label: "Maintenance",   Icon: RiToolsLine },
  reserved:       { bg: "#e3f2fd", color: "#1565c0", label: "Reserved",      Icon: RiCalendarLine },
  needs_cleaning: { bg: "#fce4ec", color: "#c62828", label: "Needs Cleaning", Icon: RiToolsLine },
};

const BED_TYPES   = ["Single", "Queen", "Master"];
const ROOM_TYPES  = ["Standard", "Deluxe", "Suite"];

const DEFAULT_BED_CONFIG = { Single: 0, Queen: 0, Master: 0 };  

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.rm-root { padding: 24px 28px 48px; font-family: Arial,sans-serif; background: #f4f6f0; min-height: 100%; }
.rm-hdr  { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
.rm-title { font-size:1.1rem; font-weight:700; color:#07713c; margin:0 0 2px; }
.rm-sub   { font-size:.83rem; color:#8a9a8a; }
.sc-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
.sc   { border-radius:14px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,.05); }
.sc-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
.sc-lbl { font-size:.78rem; font-weight:700; text-transform:uppercase; letter-spacing:.3px; }
.sc-val { font-size:1.9rem; font-weight:700; color:#1a1a1a; }
.fbar { background:#fff; border-radius:14px; padding:14px 22px; margin-bottom:20px; border:1px solid #e4ebe4; display:flex; gap:12px; align-items:center; flex-wrap:wrap; }
.finput { padding:9px 13px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.88rem; font-family:Arial,sans-serif; color:#333; outline:none; background:#fff; }
.finput:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.finput.flex1 { flex:1; min-width:160px; }
.btn-primary { padding:10px 20px; background:#07713c; color:#fff; border:none; border-radius:9px; cursor:pointer; font-size:.86rem; font-weight:700; font-family:Arial,sans-serif; display:inline-flex; align-items:center; gap:6px; white-space:nowrap; box-shadow:0 4px 12px rgba(7,113,60,.25); }
.btn-primary:hover { background:#05592f; }
.rm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }
.rc { background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.06); transition:transform .2s,box-shadow .2s; border:1px solid #e4ebe4; }
.rc:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,.11); }
.rc-top { background:linear-gradient(135deg,#07713c,#0a9150); padding:16px 20px; color:#fff; min-height:180px; position:relative; }
.rc-top-row { display:flex; justify-content:space-between; align-items:flex-start; }
.rc-num { font-size:2rem; font-weight:700; line-height:1; }
.rc-lbl { font-size:.68rem; opacity:.65; margin-bottom:2px; }
.rc-type { font-size:.78rem; font-weight:600; opacity:.82; margin-top:4px; }
.rc-body { padding:14px 18px; }
.rc-status { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:.72rem; font-weight:700; margin-bottom:10px; }
.rc-beds { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px; }
.rc-bed-tag { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:12px; font-size:.72rem; font-weight:700; background:#f4f6f0; color:#333; }
.rc-meta { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px; }
.rc-meta-item { background:#f4f6f0; border-radius:7px; padding:7px 10px; }
.rc-meta-lbl { font-size:.64rem; color:#8a9a8a; font-weight:700; text-transform:uppercase; display:flex; align-items:center; gap:3px; margin-bottom:2px; }
.rc-meta-val { font-size:.84rem; font-weight:600; color:#222; }
.rc-price { font-size:1.15rem; font-weight:700; color:#07713c; margin-bottom:12px; }
.rc-price span { font-size:.72rem; font-weight:400; color:#aaa; }
.rc-actions { display:flex; gap:7px; }
.rc-btn { display:inline-flex; align-items:center; gap:4px; padding:6px 12px; border-radius:7px; border:1.5px solid; font-size:.76rem; font-weight:700; cursor:pointer; font-family:Arial,sans-serif; transition:background .15s; }
.rc-btn-edit { border-color:#fde68a; color:#92400e; background:#fffbeb; }
.rc-btn-edit:hover { background:#fef3c7; }
.rc-btn-del  { border-color:#fca5a5; color:#dc2626; background:#fff5f5; }
.rc-btn-del:hover { background:#fee2e2; }
.empty { text-align:center; padding:60px; color:#9aaa9a; font-size:.9rem; background:#fff; border-radius:14px; border:1px solid #e4ebe4; }
.mo { position:fixed; inset:0; z-index:999; display:flex; align-items:flex-start; justify-content:center; background:rgba(0,0,0,.48); backdrop-filter:blur(2px); padding:20px; overflow-y:auto; }
.mb { background:#f4f6f0; border-radius:20px; width:100%; max-width:520px; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,.22); margin:auto; }
.mh { padding:20px 24px; flex-shrink:0; display:flex; justify-content:space-between; align-items:center; border-radius:20px 20px 0 0; background:linear-gradient(135deg,#07713c,#0a9150); }
.mh-title { color:#fff; font-size:1.05rem; font-weight:700; margin:0; }
.mh-sub   { color:rgba(255,255,255,.68); font-size:.8rem; margin:3px 0 0; }
.mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; }
.mx:hover { background:rgba(255,255,255,.28); }
.mbody { padding:18px 24px; overflow-y:auto; }
.mfoot { padding:14px 24px; border-top:1px solid #e4ebe4; display:flex; gap:10px; flex-shrink:0; }
.msec { background:#fff; border-radius:12px; padding:14px 16px; margin-bottom:12px; border:1px solid #e4ebe4; }
.msec-title { font-size:.7rem; font-weight:700; color:#07713c; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; }
.flabel { display:block; font-size:.76rem; font-weight:700; color:#3a6a3a; margin-bottom:4px; text-transform:uppercase; letter-spacing:.4px; }
.fi { width:100%; padding:9px 12px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.88rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; transition:border-color .2s; }
.fi:focus { border-color:#07713c; box-shadow:0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color:#a8b8a8; font-style:italic; }
.bed-row { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1.5px solid #e4ebe4; border-radius:10px; margin-bottom:8px; background:#fafafa; }
.bed-row.has-beds { border-color:#a7f3d0; background:#f0fdf4; }
.bed-info { flex:1; }
.bed-name { font-size:.88rem; font-weight:700; color:#222; }
.bed-desc { font-size:.72rem; color:#8a9a8a; margin-top:1px; }
.bed-ctrl { display:flex; align-items:center; gap:8px; }
.bed-num { font-size:1.1rem; font-weight:700; color:#07713c; min-width:20px; text-align:center; }
.bed-btn { width:28px; height:28px; border-radius:50%; border:1.5px solid #ccdacc; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#07713c; transition:all .15s; }
.bed-btn:hover { border-color:#07713c; background:#ecfdf5; }
.bed-btn.disabled { opacity:.35; cursor:not-allowed; }
.btn-cancel  { flex:1; padding:11px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.btn-confirm { flex:2; padding:11px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; }
.btn-confirm:disabled { background:#aaa; cursor:not-allowed; }
.alert-ok  { padding:9px 14px; border-radius:8px; background:#e8f5e9; border-left:3px solid #4cae4c; color:#1b5e20; font-size:.83rem; margin-bottom:12px; }
.alert-err { padding:9px 14px; border-radius:8px; background:#fdecea; border-left:3px solid #e53935; color:#b71c1c; font-size:.83rem; margin-bottom:12px; }
`;

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
  const [imgViewer, setImgViewer] = useState(null);
  const [form, setForm] = useState({
    room_number: "", type: "Standard", floor: "", price: "",
    status: "available", description: "",
  });
  const [bedConfig, setBedConfig] = useState({ ...DEFAULT_BED_CONFIG });
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
  const { error: upErr } = await supabase.storage
    .from("room-images")
    .upload(path, file, { upsert: true });
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
    const primaryBedType = priority.find(t => bedConfig[t] > 0) || "Single";
    const primaryBedCount = bedConfig[primaryBedType];
    const maxOcc = calcMaxOccupancy(bedConfig);
    const bedConfigArr = BED_TYPES.filter(t => bedConfig[t] > 0).map(t => ({ type: t, count: bedConfig[t] }));

    const payload = {
      room_number:   form.room_number,
      image_url:     roomImgFile ? await uploadRoomImage(roomImgFile) : (editRoom?.image_url || null),
      type:          form.type,
      floor:         parseInt(form.floor),
      price:         parseFloat(form.price),
      status:        form.status,
      description:   form.description,
      bed_type:      primaryBedType,
      bed_count:     primaryBedCount,
      max_occupancy: maxOcc,
      bed_config:    bedConfigArr,
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
          <div>
            <h2 className="rm-title">Room Management</h2>
            <p className="rm-sub">Manage hotel rooms and bed configurations</p>
          </div>
          {userRole === "admin" && (
            <button className="btn-primary" onClick={openAdd}>
              <RiHotelBedLine size={16} /> Add Room
            </button>
          )}
        </div>

        <div className="sc-4">
          {[
            { lbl: "Total Rooms", val: stats.total,       Icon: RiHotelBedLine,       bg: "#e8f5e9", c: "#07713c" },
            { lbl: "Available",   val: stats.available,   Icon: RiCheckboxCircleLine, bg: "#e3f2fd", c: "#1565c0" },
            { lbl: "Occupied",    val: stats.occupied,    Icon: RiErrorWarningLine,   bg: "#fce4ec", c: "#c62828" },
            { lbl: "Maintenance", val: stats.maintenance, Icon: RiToolsLine,          bg: "#fff3e0", c: "#e65100" },
          ].map(({ lbl, val, Icon, bg, c }) => (
            <div key={lbl} className="sc" style={{ background: bg }}>
              <div className="sc-row"><Icon size={18} color={c} /><span className="sc-lbl" style={{ color: c }}>{lbl}</span></div>
              <div className="sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="fbar">
          <input className="finput flex1" placeholder="Search room number or type..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="finput" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
          <select className="finput" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="finput" value={filterBed} onChange={e => setFilterBed(e.target.value)}>
            <option value="all">All Beds</option>
            <option value="Single">Single Bed</option>
            <option value="Queen">Queen Bed</option>
            <option value="Master">Master Bed</option>
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading rooms...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No rooms found.</div>
        ) : (
          <div className="rm-grid">
            {filtered.map(room => {
              const s      = STATUS_CFG[room.status] || STATUS_CFG.available;
              const StatIcon = s.Icon;
              const config = parseBedConfig(room);
              const bedTags = BED_TYPES.filter(t => config[t] > 0).map(t => `${config[t]}× ${t}`);
              return (
                <div key={room.id} className="rc">
              <div className="rc-top" style={{
                background: room.image_url
                  ? `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55)), url(${room.image_url}) center/cover no-repeat`
                  : "linear-gradient(135deg,#07713c,#0a9150)",
                minHeight: "110px",
                cursor: room.image_url ? "pointer" : "default",
              }} onClick={() => room.image_url && setImgViewer(room.image_url)}>
                    <div className="rc-top-row">
                      <div>
                        <div className="rc-lbl">Room</div>
                        <div className="rc-num">{room.room_number}</div>
                        <div className="rc-type">{room.type}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="rc-lbl">Floor</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: "700" }}>{room.floor}</div>
                      </div>
                    </div>
                  </div>
                  <div className="rc-body">
                    <div className="rc-status" style={{ background: s.bg, color: s.color }}>
                      <StatIcon size={12} />{s.label}
                    </div>
                    <div className="rc-beds">
                      {bedTags.map(tag => (
                        <span key={tag} className="rc-bed-tag"><RiHotelBedLine size={11} />{tag}</span>
                      ))}
                    </div>
                    <div className="rc-meta">
                      <div className="rc-meta-item">
                        <div className="rc-meta-lbl"><RiHotelBedLine size={10} />Total Beds</div>
                        <div className="rc-meta-val">{Object.values(config).reduce((s,n)=>s+n,0)}</div>
                      </div>
                      <div className="rc-meta-item">
                        <div className="rc-meta-lbl"><RiUserLine size={10} />Max Guests</div>
                        <div className="rc-meta-val">{room.max_occupancy || calcMaxOccupancy(config)}</div>
                      </div>
                    </div>
                    {room.description && <div style={{ fontSize: ".76rem", color: "#8a9a8a", marginBottom: "10px", lineHeight: "1.4" }}>{room.description}</div>}
                    <div className="rc-price">₱{parseFloat(room.price).toLocaleString()} <span>/night</span></div>
                    {userRole === "admin" && (
                      <div className="rc-actions">
                        <button className="rc-btn rc-btn-edit" onClick={() => openEdit(room)}><RiPencilLine size={13} />Edit</button>
                        <button className="rc-btn rc-btn-del"  onClick={() => handleDelete(room.id)}><RiDeleteBinLine size={13} />Delete</button>
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
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div>
                <p className="mh-title">{editRoom ? "Edit Room" : "Add New Room"}</p>
                <p className="mh-sub">{editRoom ? "Update room details" : "Configure the new room"}</p>
              </div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {error   && <div className="alert-err">⚠ {error}</div>}
              {success && <div className="alert-ok">✓ {success}</div>}

              <div className="msec">
  <div className="msec-title">Room Image</div>
  <div
    onClick={() => document.getElementById("room-img-input").click()}
    style={{ width: "100%", height: "140px", border: "2px dashed #ccdacc", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#f8faf8", overflow: "hidden", position: "relative", transition: "border-color .2s" }}
    onMouseOver={e => e.currentTarget.style.borderColor = "#07713c"}
    onMouseOut={e => e.currentTarget.style.borderColor = "#ccdacc"}
  >
    <input id="room-img-input" type="file" accept="image/*" style={{ display: "none" }}
      onChange={e => {
        const file = e.target.files[0];
        if (!file) return;
        setRoomImgFile(file);
        setRoomImgPreview(URL.createObjectURL(file));
      }}
    />
    {roomImgPreview
      ? <img src={roomImgPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      : <div style={{ textAlign: "center", color: "#7a9a7a" }}>
          <RiHotelBedLine size={28} color="#ccdacc" />
          <div style={{ fontSize: ".8rem", fontWeight: "600", marginTop: "6px" }}>Click to upload room image</div>
          <div style={{ fontSize: ".72rem", color: "#aaa", marginTop: "2px" }}>PNG, JPG, WEBP</div>
        </div>
    }
  </div>
  {roomImgPreview && (
    <button onClick={() => { setRoomImgFile(null); setRoomImgPreview(""); }}
      style={{ marginTop: "7px", fontSize: ".78rem", color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "Arial,sans-serif" }}>
      ✕ Remove image
    </button>
  )}
</div>

              <div className="msec">
                <div className="msec-title">Room Info</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label className="flabel">Room Number *</label>
                    <input className="fi" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} placeholder="e.g. 101" />
                  </div>
                  <div>
                    <label className="flabel">Floor *</label>
                    <input type="number" className="fi" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} placeholder="e.g. 1" />
                  </div>
                  <div>
                    <label className="flabel">Room Type *</label>
                    <select className="fi" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flabel">Status</label>
                    <select className="fi" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="msec">
                <div className="msec-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Bed Configuration</span>
                  {totalBeds > 0 && (
                    <span style={{ fontSize: ".72rem", fontWeight: "700", color: "#07713c", background: "#ecfdf5", padding: "2px 9px", borderRadius: "10px" }}>
                      {totalBeds} bed{totalBeds > 1 ? "s" : ""} · {calcMaxOccupancy(bedConfig)} max guests
                    </span>
                  )}
                </div>
                {BED_TYPES.map(type => (
                  <div key={type} className={`bed-row${bedConfig[type] > 0 ? " has-beds" : ""}`}>
                    <div className="bed-info">
                      <div className="bed-name">{type} Bed</div>
                      <div className="bed-desc">{BED_INFO[type].desc}</div>
                    </div>
                    <div className="bed-ctrl">
                      <button className={`bed-btn${bedConfig[type] === 0 ? " disabled" : ""}`} onClick={() => adjustBed(type, -1)} disabled={bedConfig[type] === 0}>
                        <RiSubtractLine size={14} />
                      </button>
                      <span className="bed-num">{bedConfig[type]}</span>
                      <button className="bed-btn" onClick={() => adjustBed(type, 1)}>
                        <RiAddLine size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {totalBeds === 0 && <div style={{ textAlign: "center", color: "#e53935", fontSize: ".8rem", padding: "6px 0" }}>Add at least 1 bed</div>}
              </div>

              <div className="msec">
                <div className="msec-title">Pricing & Notes</div>
                <div style={{ marginBottom: "10px" }}>
                  <label className="flabel">Price per Night (₱) *</label>
                  <input type="number" className="fi" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="e.g. 1500" />
                </div>
                <div>
                  <label className="flabel">Description (optional)</label>
                  <textarea className="fi" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Garden view, mountain facing..." rows={2} style={{ resize: "vertical" }} />
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving || totalBeds === 0}>{saving ? "Saving..." : editRoom ? "Save Changes" : "Add Room"}</button>
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
    >
      ×
    </button>
    <img
      src={imgViewer}
      alt="Room"
      onClick={e => e.stopPropagation()}
      style={{ width: "80vw", height: "80vh", borderRadius: "12px", objectFit: "cover", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
    />
  </div>
)}
    </>
  );
}