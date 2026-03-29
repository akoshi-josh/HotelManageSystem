import React, { useState, useEffect, useRef } from "react";
import {
  RiRestaurantLine, RiAddLine, RiPencilLine, RiDeleteBinLine,
  RiImageAddLine, RiCheckboxCircleLine, RiCloseCircleLine,
  RiTimeLine, RiSearchLine, RiOrderPlayLine, RiBikeLine,
  RiCheckDoubleLine, RiAlertLine, RiRefreshLine, RiHistoryLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.rp-page { padding: 28px 32px; font-family: Arial, sans-serif; background: #f4f6f0; min-height: 100%; }
.rp-hdr  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.rp-title { font-size: 1.6rem; font-weight: 700; color: #07713c; margin: 0; }
.rp-sub   { font-size: .88rem; color: #6b7a6b; margin: 4px 0 0; }

.tab-bar { display:flex; gap:4px; background:#fff; border-radius:12px; padding:5px; border:1px solid #e4ebe4; margin-bottom:22px; width:fit-content; }
.tab-btn { padding:9px 22px; border:none; border-radius:9px; cursor:pointer; font-size:.88rem; font-weight:600; font-family:Arial,sans-serif; color:#6b7a6b; background:none; display:flex; align-items:center; gap:7px; transition:all .15s; }
.tab-btn.active { background:#07713c; color:#fff; box-shadow:0 2px 8px rgba(7,113,60,.28); }
.tab-btn:not(.active):hover { background:#f4f6f0; }
.tab-notif { background:#e53935; color:#fff; border-radius:50%; width:18px; height:18px; font-size:.62rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.tab-notif-amber { background:#f59e0b; color:#fff; border-radius:50%; width:18px; height:18px; font-size:.62rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

.sc-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
.sc { border-radius: 14px; padding: 20px 22px; box-shadow: 0 2px 8px rgba(0,0,0,.05); }
.sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
.sc-ico { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sc-lbl { font-size: .8rem; font-weight: 700; text-transform: uppercase; }
.sc-val { font-size: 1.9rem; font-weight: 700; color: #1a1a1a; }

.fbar { display: flex; gap: 12px; align-items: center; background: #fff; border-radius: 14px; padding: 14px 22px; margin-bottom: 20px; border: 1px solid #e4ebe4; }
.finput { flex: 1; padding: 10px 14px; border: 1.5px solid #ccdacc; border-radius: 10px; font-size: .9rem; font-family: Arial, sans-serif; color: #07713c; outline: none; background: #fff; }
.finput:focus { border-color: #07713c; box-shadow: 0 0 0 3px rgba(7,113,60,.1); }
.finput::placeholder { color: #a8b8a8; font-style: italic; }
.fsel { padding: 10px 14px; border: 1.5px solid #ccdacc; border-radius: 10px; font-size: .88rem; font-family: Arial, sans-serif; color: #07713c; outline: none; background: #fff; cursor: pointer; }

.btn-primary { padding: 11px 22px; background: #07713c; color: #fff; border: none; border-radius: 10px; cursor: pointer; font-size: .88rem; font-weight: 700; font-family: Arial, sans-serif; box-shadow: 0 4px 14px rgba(7,113,60,.28); white-space: nowrap; display: inline-flex; align-items: center; gap: 7px; }
.btn-primary:hover { background: #05592f; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
.item-card { background: #fff; border-radius: 16px; border: 1px solid #e4ebe4; box-shadow: 0 2px 8px rgba(0,0,0,.05); overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .2s; }
.item-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.10); }
.item-img { width: 100%; height: 160px; background: #f0f7f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.item-img img { width: 100%; height: 100%; object-fit: cover; }
.item-img-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; color: #b0c8b0; }
.item-img-placeholder span { font-size: .75rem; }
.item-body { padding: 14px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.item-name { font-size: 1rem; font-weight: 700; color: #1a1a1a; }
.item-meta { display: flex; align-items: center; justify-content: space-between; }
.item-price { font-size: 1.05rem; font-weight: 700; color: #07713c; }
.item-cat   { font-size: .72rem; font-weight: 600; color: #8a9a8a; text-transform: capitalize; background: #f4f6f0; padding: 2px 8px; border-radius: 20px; }
.item-actions { display: flex; gap: 7px; margin-top: auto; padding-top: 4px; }
.btn-act { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 10px; border-radius: 8px; border: 1.5px solid; font-size: .76rem; font-weight: 700; font-family: Arial, sans-serif; cursor: pointer; transition: background .15s; }
.btn-edit { border-color: #fde68a; color: #92400e; background: #fffbeb; }
.btn-edit:hover { background: #fef3c7; }
.btn-del  { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }
.btn-del:hover { background: #fee2e2; }
.status-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 700; }
.empty { padding: 60px; text-align: center; color: #9aaa9a; font-size: .88rem; background: #fff; border-radius: 14px; border: 1px solid #e4ebe4; }

/* orders */
.orders-grid { display: flex; flex-direction: column; gap: 14px; }
.order-card { background:#fff; border-radius:14px; border:1.5px solid #e4ebe4; box-shadow:0 2px 8px rgba(0,0,0,.05); overflow:hidden; }
.order-card.pending   { border-left:5px solid #f57f17; }
.order-card.preparing { border-left:5px solid #1565c0; }
.order-card.serving   { border-left:5px solid #07713c; }
.order-card.done      { border-left:5px solid #9e9e9e; opacity:.72; }
.order-card.queued    { border-left:5px solid #f59e0b; opacity:.88; }
.order-hdr { padding:14px 18px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f0f0f0; }
.order-guest { font-size:.95rem; font-weight:700; color:#1a1a1a; }
.order-room  { font-size:.8rem; color:#6b7a6b; margin-top:2px; }
.order-status-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 13px; border-radius:20px; font-size:.76rem; font-weight:700; }
.order-body { padding:14px 18px; }
.order-items-list { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.order-item-row { display:flex; justify-content:space-between; align-items:center; font-size:.85rem; color:#444; }
.order-item-name { font-weight:600; }
.order-item-sub  { color:#8a9a8a; font-size:.76rem; }
.order-total { display:flex; justify-content:space-between; align-items:center; padding-top:10px; border-top:1px dashed #e4ebe4; font-weight:700; }
.order-total-lbl { color:#555; font-size:.86rem; }
.order-total-amt { color:#07713c; font-size:1.05rem; }
.order-time { font-size:.73rem; color:#aaa; margin-top:5px; }
.order-actions { padding:11px 18px; border-top:1px solid #f0f7f0; display:flex; gap:9px; }
.order-action-btn { display:inline-flex; align-items:center; gap:6px; padding:9px 18px; border-radius:9px; border:none; cursor:pointer; font-size:.82rem; font-weight:700; font-family:Arial,sans-serif; transition:all .15s; }
.oab-prepare { background:#dbeafe; color:#1565c0; }
.oab-prepare:hover { background:#bfdbfe; }
.oab-serve   { background:#ecfdf5; color:#07713c; }
.oab-serve:hover { background:#d1fae5; }
.oab-done    { background:#f3f4f6; color:#6b7280; }
.oab-done:hover { background:#e5e7eb; }

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
.new-pulse { animation: pulse 1.4s infinite; }

/* modal */
.mo { position: fixed; inset: 0; z-index: 999; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,.48); backdrop-filter: blur(2px); padding: 16px; }
.mb { background: #f4f6f0; border-radius: 20px; width: 100%; max-width: 500px; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.22); }
.mh { padding: 22px 28px; flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; border-radius: 20px 20px 0 0; background: linear-gradient(135deg,#07713c,#0a9150); }
.mh-title { color: #fff; font-size: 1.1rem; font-weight: 700; margin: 0; }
.mh-sub   { color: rgba(255,255,255,.68); font-size: .82rem; margin: 4px 0 0; }
.mx { background: rgba(255,255,255,.15); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: #fff; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; }
.mx:hover { background: rgba(255,255,255,.28); }
.mbody { padding: 22px 28px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; }
.mfoot { padding: 14px 28px; border-top: 1px solid #e4ebe4; display: flex; gap: 12px; flex-shrink: 0; }
.sc2 { background: #fff; border-radius: 12px; padding: 18px 20px; border: 1px solid #e4ebe4; }
.sc2-title { font-size: .7rem; font-weight: 700; color: #07713c; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 14px; }
.flabel { display: block; font-size: .78rem; font-weight: 700; color: #3a6a3a; margin-bottom: 5px; text-transform: uppercase; letter-spacing: .4px; }
.fi { width: 100%; padding: 10px 14px; border: 1.5px solid #ccdacc; border-radius: 10px; font-size: .9rem; font-family: Arial, sans-serif; outline: none; background: #fff; color: #07713c; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; }
.fi:focus { border-color: #07713c; box-shadow: 0 0 0 3px rgba(7,113,60,.1); }
.fi::placeholder { color: #a8b8a8; font-style: italic; }
.btn-cancel  { flex: 1; padding: 12px; background: #fff; border: 1.5px solid #ccdacc; border-radius: 10px; cursor: pointer; font-size: .9rem; font-weight: 600; color: #4a6a4a; font-family: Arial, sans-serif; }
.btn-cancel:hover { background: #f4f6f0; }
.btn-confirm { flex: 2; padding: 12px; background: #07713c; border: none; border-radius: 10px; cursor: pointer; font-size: .9rem; font-weight: 700; color: #fff; font-family: Arial, sans-serif; box-shadow: 0 4px 14px rgba(7,113,60,.28); }
.btn-confirm:hover:not(:disabled) { background: #05592f; }
.btn-confirm:disabled { background: #a8b8a8; cursor: not-allowed; box-shadow: none; }
.alert-ok  { padding: 10px 15px; border-radius: 8px; background: #e8f5e9; border-left: 3px solid #4cae4c; color: #1b5e20; font-size: .84rem; }
.alert-err { padding: 10px 15px; border-radius: 8px; background: #fdecea; border-left: 3px solid #e53935; color: #b71c1c; font-size: .84rem; }
.img-upload { width: 100%; height: 130px; border: 2px dashed #ccdacc; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; background: #f8faf8; transition: border-color .2s, background .2s; position: relative; overflow: hidden; }
.img-upload:hover { border-color: #07713c; background: #ecfdf5; }
.img-upload-label { font-size: .8rem; color: #7a9a7a; font-weight: 600; pointer-events: none; }
.del-modal { max-width: 400px; }
`;

const ITEM_STATUS_CFG = {
  available:   { bg: "#e8f5e9", color: "#1b5e20", Icon: RiCheckboxCircleLine, label: "Available"   },
  unavailable: { bg: "#fce4ec", color: "#c62828", Icon: RiCloseCircleLine,    label: "Unavailable" },
  ongoing:     { bg: "#fff3e0", color: "#e65100", Icon: RiTimeLine,           label: "Ongoing"     },
};

const ORDER_STATUS_CFG = {
  queued:    { bg: "#fff8e1", color: "#b45309", label: "Queued",    Icon: RiHistoryLine     },
  pending:   { bg: "#fff3e0", color: "#e65100", label: "Pending",   Icon: RiAlertLine       },
  preparing: { bg: "#e3f2fd", color: "#1565c0", label: "Preparing", Icon: RiTimeLine        },
  serving:   { bg: "#ecfdf5", color: "#07713c", label: "Serving",   Icon: RiBikeLine        },
  done:      { bg: "#f3f4f6", color: "#6b7280", label: "Done",      Icon: RiCheckDoubleLine },
};

const CATEGORIES = ["food", "beverage", "dessert", "snack", "special"];
const EMPTY_FORM  = { name: "", price: "", category: "food", status: "available", image_url: "" };

export default function Restaurant({ user }) {
  const [tab,          setTab]          = useState("menu");
  const [items,        setItems]        = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [newOrderIds,  setNewOrderIds]  = useState(new Set());
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterCat,    setFilterCat]    = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orderFilter,  setOrderFilter]  = useState("active");

  const [showModal,  setShowModal]  = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [imgFile,    setImgFile]    = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [delItem,    setDelItem]    = useState(null);
  const [deleting,   setDeleting]   = useState(false);
  const fileRef = useRef();

  const canManage = user?.role === "admin" || user?.role === "restaurant";

  useEffect(() => { fetchItems(); }, []);

  /* ── Realtime: orders table ── */
  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel("restaurant_orders_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_orders" }, payload => {
        if (payload.eventType === "INSERT") {
          const isLive = payload.new.status === "pending";
          if (isLive) {
            setNewOrderIds(prev => new Set([...prev, payload.new.id]));
            setTab("orders");
            setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n.delete(payload.new.id); return n; }), 10000);
          }
          setOrders(prev => [payload.new, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
          // If a queued order just became pending (check-in triggered it), flash it
          if (payload.old.status === "queued" && payload.new.status === "pending") {
            setNewOrderIds(prev => new Set([...prev, payload.new.id]));
            setTab("orders");
            setTimeout(() => setNewOrderIds(prev => { const n = new Set(prev); n.delete(payload.new.id); return n; }), 10000);
          }
        } else if (payload.eventType === "DELETE") {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("restaurant_items").select("*").order("created_at", { ascending: false });
    setItems(data || []); setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const updateOrderStatus = async (id, status) => {
    await supabase.from("restaurant_orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  };

  const openAdd = () => {
    setEditItem(null); setForm(EMPTY_FORM); setImgFile(null); setImgPreview("");
    setError(""); setSuccess(""); setShowModal(true);
  };
  const openEdit = item => {
    setEditItem(item);
    setForm({ name: item.name, price: String(item.price), category: item.category || "food", status: item.status || "available", image_url: item.image_url || "" });
    setImgFile(null); setImgPreview(item.image_url || "");
    setError(""); setSuccess(""); setShowModal(true);
  };

  const handleImgChange = e => {
    const file = e.target.files[0]; if (!file) return;
    setImgFile(file); setImgPreview(URL.createObjectURL(file));
  };

  const uploadImage = async file => {
    const ext = file.name.split(".").pop();
    const path = `restaurant/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("restaurant-images").upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from("restaurant-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (!form.name.trim()) { setError("Item name is required."); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) { setError("Enter a valid price."); return; }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imgFile) imageUrl = await uploadImage(imgFile);
      const payload = { name: form.name.trim(), price: parseFloat(form.price), category: form.category, status: form.status, image_url: imageUrl || null };
      if (editItem) {
        const { error: e } = await supabase.from("restaurant_items").update(payload).eq("id", editItem.id);
        if (e) throw e; setSuccess("Item updated!");
      } else {
        const { error: e } = await supabase.from("restaurant_items").insert([payload]);
        if (e) throw e; setSuccess("Item added!");
      }
      fetchItems();
      setTimeout(() => { setShowModal(false); setSuccess(""); }, 1200);
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!delItem) return; setDeleting(true);
    await supabase.from("restaurant_items").delete().eq("id", delItem.id);
    setDeleting(false); setDelItem(null); fetchItems();
  };

  const cycleStatus = async item => {
    if (!canManage) return;
    const order = ["available", "unavailable", "ongoing"];
    const next  = order[(order.indexOf(item.status) + 1) % order.length];
    await supabase.from("restaurant_items").update({ status: next }).eq("id", item.id);
    fetchItems();
  };

  const filteredItems = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterCat === "all" || it.category === filterCat) &&
    (filterStatus === "all" || it.status === filterStatus)
  );

  // Order display filters
  const activeOrders  = orders.filter(o => ["pending","preparing","serving"].includes(o.status));
  const queuedOrders  = orders.filter(o => o.status === "queued");
  const allOrders     = orders;

  const displayOrders = orderFilter === "active"  ? activeOrders
                      : orderFilter === "queued"  ? queuedOrders
                      : allOrders;

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const activeCount  = activeOrders.length;
  const queuedCount  = queuedOrders.length;

  const counts = {
    total:       items.length,
    available:   items.filter(i => i.status === "available").length,
    unavailable: items.filter(i => i.status === "unavailable").length,
    ongoing:     items.filter(i => i.status === "ongoing").length,
  };

  const STAT_CARDS = [
    { lbl: "Total Items", val: counts.total,       bg: "#e3f2fd", color: "#1565c0", Icon: RiRestaurantLine    },
    { lbl: "Available",   val: counts.available,   bg: "#e8f5e9", color: "#1b5e20", Icon: RiCheckboxCircleLine },
    { lbl: "Unavailable", val: counts.unavailable, bg: "#fce4ec", color: "#c62828", Icon: RiCloseCircleLine   },
    { lbl: "Ongoing",     val: counts.ongoing,     bg: "#fff3e0", color: "#e65100", Icon: RiTimeLine          },
  ];

  const timeAgo = ts => {
    const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff/60)}h ${diff%60}m ago`;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-page">

        <div className="rp-hdr">
          <div>
            <h2 className="rp-title">Restaurant</h2>
            <p className="rp-sub">Manage menu items and guest orders</p>
          </div>
          {canManage && tab === "menu" && (
            <button className="btn-primary" onClick={openAdd}><RiAddLine size={16} /> Add Item</button>
          )}
          {tab === "orders" && (
            <button className="btn-primary" style={{ background: "#1565c0", boxShadow: "0 4px 14px rgba(21,101,192,.28)" }} onClick={fetchOrders}>
              <RiRefreshLine size={16} /> Refresh
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn${tab === "menu" ? " active" : ""}`} onClick={() => setTab("menu")}>
            <RiRestaurantLine size={16} /> Menu Items
          </button>
          <button className={`tab-btn${tab === "orders" ? " active" : ""}`} onClick={() => setTab("orders")}>
            <RiOrderPlayLine size={16} /> Orders
            {activeCount > 0 && (
              <span className={`tab-notif${pendingCount > 0 ? " new-pulse" : ""}`}>{activeCount}</span>
            )}
            {queuedCount > 0 && activeCount === 0 && (
              <span className="tab-notif-amber">{queuedCount}</span>
            )}
          </button>
        </div>

        {/* ══ MENU TAB ══ */}
        {tab === "menu" && (
          <>
            <div className="sc-4">
              {STAT_CARDS.map(({ lbl, val, bg, color, Icon }) => (
                <div key={lbl} className="sc" style={{ background: bg }}>
                  <div className="sc-row"><span className="sc-ico"><Icon size={20} color={color} /></span><span className="sc-lbl" style={{ color }}>{lbl}</span></div>
                  <div className="sc-val">{val}</div>
                </div>
              ))}
            </div>
            <div className="fbar">
              <RiSearchLine size={18} color="#7a9a7a" />
              <input className="finput" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
              <select className="fsel" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <select className="fsel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
            {loading ? <div className="empty">Loading menu items…</div>
              : filteredItems.length === 0 ? <div className="empty">No items found. {canManage && "Click \"Add Item\" to get started."}</div>
              : (
                <div className="card-grid">
                  {filteredItems.map(item => {
                    const sCfg = ITEM_STATUS_CFG[item.status] || ITEM_STATUS_CFG.available;
                    return (
                      <div key={item.id} className="item-card">
                        <div className="item-img">
                          {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="item-img-placeholder"><RiImageAddLine size={36} color="#c8d8c8" /><span>No image</span></div>}
                        </div>
                        <div className="item-body">
                          <div className="item-name">{item.name}</div>
                          <div className="item-meta">
                            <span className="item-price">₱{parseFloat(item.price).toLocaleString()}</span>
                            <span className="item-cat">{item.category}</span>
                          </div>
                          <div>
                            <span className="status-pill" style={{ background: sCfg.bg, color: sCfg.color, cursor: canManage ? "pointer" : "default" }}
                              onClick={() => canManage && cycleStatus(item)}>
                              <sCfg.Icon size={12} />{sCfg.label}
                            </span>
                          </div>
                          {canManage && (
                            <div className="item-actions">
                              <button className="btn-act btn-edit" onClick={() => openEdit(item)}><RiPencilLine size={13} /> Edit</button>
                              <button className="btn-act btn-del"  onClick={() => setDelItem(item)}><RiDeleteBinLine size={13} /> Delete</button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </>
        )}

        {/* ══ ORDERS TAB ══ */}
        {tab === "orders" && (
          <>
            {/* Order filter buttons */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "18px", alignItems: "center", flexWrap: "wrap" }}>
              {[
                { val: "active",  label: "Active Orders",  count: activeCount,  accent: "#07713c" },
                { val: "queued",  label: "Queued (Pre-orders)", count: queuedCount, accent: "#b45309" },
                { val: "all",     label: "All Orders",     count: allOrders.length, accent: "#555" },
              ].map(f => (
                <button key={f.val} onClick={() => setOrderFilter(f.val)}
                  style={{
                    padding: "8px 16px", border: `1.5px solid ${orderFilter === f.val ? f.accent : "#ccdacc"}`,
                    borderRadius: "10px", background: orderFilter === f.val ? (f.val === "queued" ? "#fffbeb" : f.val === "active" ? "#ecfdf5" : "#f4f6f0") : "#fff",
                    color: orderFilter === f.val ? f.accent : "#6b7a6b",
                    fontWeight: "700", fontSize: ".84rem", cursor: "pointer", fontFamily: "Arial,sans-serif",
                    display: "flex", alignItems: "center", gap: "7px",
                  }}>
                  {f.label}
                  {f.count > 0 && (
                    <span style={{ background: f.accent, color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: ".62rem", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Queued explanation banner */}
            {orderFilter === "queued" && queuedCount > 0 && (
              <div style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "14px 18px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px", fontSize: ".84rem", color: "#b45309" }}>
                <RiHistoryLine size={18} style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <strong>Queued pre-orders</strong> are food orders placed during reservation, before the guest checks in.
                  They will automatically move to <strong>Active Orders</strong> (and notify the restaurant) the moment the guest checks in.
                </div>
              </div>
            )}

            {displayOrders.length === 0 ? (
              <div className="empty">
                {orderFilter === "active" ? "No active orders right now 🎉"
                  : orderFilter === "queued" ? "No queued pre-orders."
                  : "No orders yet."}
              </div>
            ) : (
              <div className="orders-grid">
                {displayOrders.map(order => {
                  const sCfg    = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.pending;
                  const isNew   = newOrderIds.has(order.id);
                  const itms    = Array.isArray(order.items) ? order.items : [];

                  return (
                    <div key={order.id} className={`order-card ${order.status}${isNew ? " new-pulse" : ""}`}>
                      <div className="order-hdr">
                        <div>
                          <div className="order-guest">
                            {isNew && <span style={{ background: "#e53935", color: "#fff", fontSize: ".6rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", marginRight: "8px" }}>NEW!</span>}
                            {order.status === "queued" && <span style={{ background: "#f59e0b", color: "#fff", fontSize: ".6rem", fontWeight: "700", padding: "2px 8px", borderRadius: "20px", marginRight: "8px" }}>PRE-ORDER</span>}
                            {order.guest_name}
                          </div>
                          <div className="order-room">Room {order.room_number || "—"} · {order.status === "queued" ? "Waiting for check-in" : timeAgo(order.created_at)}</div>
                        </div>
                        <span className="order-status-pill" style={{ background: sCfg.bg, color: sCfg.color }}>
                          <sCfg.Icon size={13} /> {sCfg.label}
                        </span>
                      </div>

                      <div className="order-body">
                        <div className="order-items-list">
                          {itms.map((it, idx) => (
                            <div key={idx} className="order-item-row">
                              <div><span className="order-item-name">{it.name}</span><span className="order-item-sub"> ×{it.qty}</span></div>
                              <span style={{ fontWeight: "600", color: "#07713c" }}>₱{parseFloat(it.subtotal).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="order-total">
                          <span className="order-total-lbl">Total</span>
                          <span className="order-total-amt">₱{parseFloat(order.total_amount).toLocaleString()}</span>
                        </div>
                        {order.status !== "queued" && <div className="order-time">{timeAgo(order.created_at)}</div>}
                      </div>

                      {/* Action buttons — only for live orders, not queued */}
                      {order.status !== "done" && order.status !== "queued" && (
                        <div className="order-actions">
                          {order.status === "pending" && (
                            <button className="order-action-btn oab-prepare" onClick={() => updateOrderStatus(order.id, "preparing")}>
                              <RiTimeLine size={14} /> Start Preparing
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button className="order-action-btn oab-serve" onClick={() => updateOrderStatus(order.id, "serving")}>
                              <RiBikeLine size={14} /> Mark as Serving
                            </button>
                          )}
                          {order.status === "serving" && (
                            <button className="order-action-btn oab-done" onClick={() => updateOrderStatus(order.id, "done")}>
                              <RiCheckDoubleLine size={14} /> Mark as Done
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div className="mo" onClick={() => setShowModal(false)}>
          <div className="mb" onClick={e => e.stopPropagation()}>
            <div className="mh">
              <div><p className="mh-title">{editItem ? "Edit Menu Item" : "Add Menu Item"}</p><p className="mh-sub">{editItem ? "Update item details" : "Add a new item to the menu"}</p></div>
              <button className="mx" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="mbody">
              {error   && <div className="alert-err">✕ {error}</div>}
              {success && <div className="alert-ok">✓ {success}</div>}
              <div className="sc2">
                <div className="sc2-title">Item Image</div>
                <div className="img-upload" onClick={() => fileRef.current?.click()}>
                  <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handleImgChange} />
                  {imgPreview ? <img src={imgPreview} alt="preview" style={{ width:"100%",height:"100%",objectFit:"cover",borderRadius:"10px" }} />
                    : <><RiImageAddLine size={28} color="#7a9a7a" /><span className="img-upload-label">Click to upload image</span><span style={{ fontSize:".72rem",color:"#aaa" }}>PNG, JPG, WEBP</span></>}
                </div>
                {imgPreview && <button style={{ marginTop:"8px",fontSize:".78rem",color:"#dc2626",background:"none",border:"none",cursor:"pointer",fontFamily:"Arial,sans-serif" }}
                  onClick={() => { setImgFile(null); setImgPreview(""); setForm(f => ({...f,image_url:""})); }}>✕ Remove image</button>}
              </div>
              <div className="sc2">
                <div className="sc2-title">Item Details</div>
                <div style={{ display:"flex",flexDirection:"column",gap:"13px" }}>
                  <div><label className="flabel">Item Name</label><input className="fi" placeholder="e.g. Chicken Adobo" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div><label className="flabel">Price (₱)</label><input className="fi" type="number" min="0" placeholder="0.00" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} /></div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"13px" }}>
                    <div><label className="flabel">Category</label>
                      <select className="fi" style={{ cursor:"pointer" }} value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                        {CATEGORIES.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div><label className="flabel">Status</label>
                      <select className="fi" style={{ cursor:"pointer" }} value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                        <option value="ongoing">Ongoing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editItem ? "Save Changes" : "Add Item"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {delItem && (
        <div className="mo" onClick={() => setDelItem(null)}>
          <div className="mb del-modal" onClick={e => e.stopPropagation()}>
            <div className="mh" style={{ background:"linear-gradient(135deg,#c62828,#e53935)" }}>
              <div><p className="mh-title">Delete Item</p><p className="mh-sub">This action cannot be undone</p></div>
              <button className="mx" onClick={() => setDelItem(null)}>×</button>
            </div>
            <div className="mbody" style={{ padding:"24px 28px" }}>
              <p style={{ fontSize:".92rem",color:"#333",lineHeight:"1.6" }}>
                Are you sure you want to delete <strong>{delItem.name}</strong>?
              </p>
            </div>
            <div className="mfoot">
              <button className="btn-cancel" onClick={() => setDelItem(null)}>Cancel</button>
              <button className="btn-confirm" style={{ background:"#dc2626",boxShadow:"0 4px 14px rgba(220,38,38,.3)" }} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}