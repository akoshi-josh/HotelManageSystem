import React, { useState, useEffect } from "react";
import {
  RiRestaurantLine, RiAddLine, RiSubtractLine,
  RiShoppingCartLine, RiImageAddLine, RiSearchLine,
  RiTimeLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
.rao-overlay {
  position: fixed; inset: 0; z-index: 1100;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.58); backdrop-filter: blur(3px); padding: 20px;
}
.rao-box {
  background: #f4f6f0; border-radius: 20px;
  width: 100%; max-width: 580px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 80px rgba(0,0,0,.28); overflow: hidden;
}
.rao-head {
  background: linear-gradient(135deg,#07713c,#0a9150);
  padding: 20px 24px; flex-shrink: 0;
  display: flex; justify-content: space-between; align-items: center;
}
.rao-title { color:#fff; font-size:1.05rem; font-weight:700; margin:0; display:flex; align-items:center; gap:8px; }
.rao-sub   { color:rgba(255,255,255,.65); font-size:.8rem; margin:3px 0 0; }
.rao-x { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.1rem; display:flex; align-items:center; justify-content:center; }
.rao-x:hover { background:rgba(255,255,255,.28); }
.rao-search { padding: 12px 16px; flex-shrink: 0; border-bottom: 1px solid #e4ebe4; background: #fff; display: flex; align-items: center; gap: 8px; }
.rao-search-input { flex:1; border:none; outline:none; font-size:.9rem; font-family:Arial,sans-serif; color:#333; }
.rao-search-input::placeholder { color:#b0c0b0; }
.rao-cats { display: flex; gap: 6px; padding: 10px 16px; flex-shrink: 0; border-bottom: 1px solid #e4ebe4; background:#fff; overflow-x: auto; }
.rao-cats::-webkit-scrollbar { height:0; }
.rao-cat { padding: 5px 14px; border-radius: 20px; border: 1.5px solid #ccdacc; font-size: .76rem; font-weight: 700; cursor: pointer; font-family: Arial,sans-serif; white-space: nowrap; background:#fff; color:#6b8a6b; transition: all .15s; }
.rao-cat.active { background:#07713c; border-color:#07713c; color:#fff; }
.rao-list { flex:1; overflow-y:auto; padding:12px 16px; display:flex; flex-direction:column; gap:8px; }
.rao-list::-webkit-scrollbar { width:4px; }
.rao-list::-webkit-scrollbar-thumb { background:#c8d8c8; border-radius:10px; }
.rao-item { background:#fff; border-radius:12px; border:1.5px solid #e4ebe4; display:flex; align-items:center; gap:12px; padding:10px 14px; transition: border-color .15s, box-shadow .15s; }
.rao-item.selected { border-color:#07713c; box-shadow:0 0 0 2px rgba(7,113,60,.12); }
.rao-item-img { width:58px; height:58px; border-radius:9px; flex-shrink:0; background:#f0f7f0; overflow:hidden; display:flex; align-items:center; justify-content:center; }
.rao-item-img img { width:100%; height:100%; object-fit:cover; }
.rao-item-info { flex:1; min-width:0; }
.rao-item-name  { font-size:.9rem; font-weight:700; color:#1a1a1a; }
.rao-item-cat   { font-size:.72rem; color:#8a9a8a; text-transform:capitalize; margin-top:2px; }
.rao-item-price { font-size:.95rem; font-weight:700; color:#07713c; }
.rao-qty { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.rao-qty-btn { width:28px; height:28px; border-radius:50%; border:1.5px solid #ccdacc; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:Arial,sans-serif; transition: all .15s; }
.rao-qty-btn.add { background:#07713c; border-color:#07713c; color:#fff; }
.rao-qty-btn.add:hover { background:#05592f; }
.rao-qty-btn.sub { color:#07713c; }
.rao-qty-btn.sub:hover { background:#f0fdf4; }
.rao-qty-num { font-size:.9rem; font-weight:700; color:#333; min-width:20px; text-align:center; }
.rao-empty { text-align:center; color:#aaa; font-size:.88rem; padding:40px 0; }
.rao-cart { flex-shrink:0; border-top:1px solid #e4ebe4; background:#fff; padding:14px 16px; }
.rao-cart-summary { background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:10px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
.rao-cart-items { font-size:.82rem; color:#07713c; font-weight:600; }
.rao-cart-total { font-size:1rem; font-weight:700; color:#07713c; }
.rao-foot { display:flex; gap:10px; }
.rao-cancel { flex:1; padding:11px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#4a6a4a; font-family:Arial,sans-serif; }
.rao-cancel:hover { background:#f4f6f0; }
.rao-confirm { flex:2; padding:11px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:7px; box-shadow:0 4px 14px rgba(7,113,60,.28); }
.rao-confirm:hover:not(:disabled) { background:#05592f; }
.rao-confirm:disabled { background:#aaa; cursor:not-allowed; box-shadow:none; }
.queued-banner { display:flex; align-items:flex-start; gap:8px; padding:10px 14px; background:#fffbeb; border-bottom:1px solid #fde68a; font-size:.8rem; color:#b45309; line-height:1.5; flex-shrink:0; }
`;

const CATEGORIES = ["all", "food", "beverage", "dessert", "snack", "special"];

export default function RestaurantAddOnsModal({
  onClose,
  onConfirm,
  reservationId  = null,
  guestName      = "Guest",
  roomNumber     = "",
  isCheckedIn    = true,   // true → pending order  |  false → queued (pre-order)
}) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart,    setCart]    = useState({});
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("all");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    supabase.from("restaurant_items").select("*").eq("status", "available").order("category")
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  const setQty = (id, delta) => setCart(prev => {
    const next = Math.max(0, (prev[id] || 0) + delta);
    if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
    return { ...prev, [id]: next };
  });

  const filtered  = items.filter(it =>
    it.name.toLowerCase().includes(search.toLowerCase()) &&
    (cat === "all" || it.category === cat)
  );
  const cartItems = items.filter(it => cart[it.id]);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = cartItems.reduce((s, it) => s + it.price * (cart[it.id] || 0), 0);

  const handleConfirm = async () => {
    if (cartCount === 0 || saving) return;
    setSaving(true);

    const orderItems = cartItems.map(it => ({
      id: it.id, name: it.name, price: it.price,
      qty: cart[it.id], subtotal: it.price * cart[it.id],
    }));

    // Save order — status depends on check-in state
    const orderStatus = isCheckedIn ? "pending" : "queued";

    await supabase.from("restaurant_orders").insert([{
      reservation_id: reservationId || null,
      guest_name:     guestName,
      room_number:    roomNumber,
      items:          orderItems,
      total_amount:   cartTotal,
      status:         orderStatus,
    }]);

    // Only notify restaurant when order is live (pending), NOT for queued pre-orders
    if (isCheckedIn) {
      const summary = orderItems.map(i => `${i.name} ×${i.qty}`).join(", ");
      await supabase.from("notifications").insert([{
        type:        "restaurant_order",   // used by NotificationBell to filter per-role
        title:       `🍽 New Order — Room ${roomNumber || "?"}`,
        message:     `${guestName}: ${summary} · ₱${cartTotal.toLocaleString()}`,
        nav_target:  "Restaurant",
        is_read:     false,
        target_role: "restaurant",         // custom field — NotificationBell reads this
      }]);
    }

    // Build charges for billing (added to additional_charges on the reservation)
    const charges = cartItems.map(it => ({
      id:              `rst-${it.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:            `[Restaurant] ${it.name} ×${cart[it.id]}`,
      amount:          it.price * cart[it.id],
      from_restaurant: true,
    }));

    setSaving(false);
    onConfirm(charges, cartTotal);
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rao-overlay" onClick={onClose}>
        <div className="rao-box" onClick={e => e.stopPropagation()}>

          <div className="rao-head">
            <div>
              <p className="rao-title">
                <RiRestaurantLine size={18} />
                {isCheckedIn ? "Restaurant Add-Ons" : "Restaurant Pre-Order"}
              </p>
              <p className="rao-sub">
                {isCheckedIn
                  ? "Guest is checked in — order sent to kitchen immediately"
                  : "Guest not checked in — order held until check-in"}
              </p>
            </div>
            <button className="rao-x" onClick={onClose}>×</button>
          </div>

          {/* Queued warning banner */}
          {!isCheckedIn && (
            <div className="queued-banner">
              <RiTimeLine size={15} color="#b45309" style={{ flexShrink: 0, marginTop: "1px" }} />
              <span>
                <strong>Pre-order:</strong> Order will be saved as <strong>queued</strong>.
                The restaurant will be notified automatically when the guest checks in.
              </span>
            </div>
          )}

          <div className="rao-search">
            <RiSearchLine size={16} color="#7a9a7a" />
            <input className="rao-search-input" placeholder="Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="rao-cats">
            {CATEGORIES.map(c => (
              <button key={c} className={`rao-cat${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <div className="rao-list">
            {loading ? <div className="rao-empty">Loading menu…</div>
              : filtered.length === 0 ? <div className="rao-empty">No available items found.</div>
              : filtered.map(it => {
                const qty = cart[it.id] || 0;
                return (
                  <div key={it.id} className={`rao-item${qty > 0 ? " selected" : ""}`}>
                    <div className="rao-item-img">
                      {it.image_url ? <img src={it.image_url} alt={it.name} /> : <RiImageAddLine size={22} color="#b0c8b0" />}
                    </div>
                    <div className="rao-item-info">
                      <div className="rao-item-name">{it.name}</div>
                      <div className="rao-item-cat">{it.category}</div>
                      <div className="rao-item-price">₱{parseFloat(it.price).toLocaleString()}</div>
                    </div>
                    <div className="rao-qty">
                      {qty > 0 && <button className="rao-qty-btn sub" onClick={() => setQty(it.id, -1)}><RiSubtractLine size={13} /></button>}
                      {qty > 0 && <span className="rao-qty-num">{qty}</span>}
                      <button className="rao-qty-btn add" onClick={() => setQty(it.id, 1)}><RiAddLine size={13} /></button>
                    </div>
                  </div>
                );
              })
            }
          </div>

          <div className="rao-cart">
            {cartCount > 0 && (
              <div className="rao-cart-summary">
                <span className="rao-cart-items">
                  <RiShoppingCartLine size={14} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                  {cartCount} item{cartCount !== 1 ? "s" : ""} selected
                </span>
                <span className="rao-cart-total">₱{cartTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="rao-foot">
              <button className="rao-cancel" onClick={onClose}>Cancel</button>
              <button className="rao-confirm" onClick={handleConfirm} disabled={cartCount === 0 || saving}>
                <RiShoppingCartLine size={15} />
                {saving ? "Saving…"
                  : cartCount === 0 ? "Select items"
                  : isCheckedIn
                    ? `Send to Kitchen — ₱${cartTotal.toLocaleString()}`
                    : `Pre-Order — ₱${cartTotal.toLocaleString()}`
                }
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}