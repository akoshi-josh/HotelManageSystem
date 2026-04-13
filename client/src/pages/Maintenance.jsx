import React, { useState, useEffect } from "react";
import {
  RiToolsLine, RiTimeLine, RiCheckboxCircleLine, RiListCheck2,
  RiLoginBoxLine, RiLogoutBoxLine, RiUserLine, RiStickyNoteLine,
  RiPlayCircleLine, RiPauseLine, RiArrowGoBackLine, RiCheckDoubleLine,
  RiSearchLine, RiAlertLine, RiAddLine, RiDeleteBinLine, RiMoneyDollarCircleLine,
  RiHotelBedLine,
} from "react-icons/ri";
import supabase from "../supabaseClient";

const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.mn-root { padding: 24px 28px 48px; font-family: Arial, sans-serif; background: #f4f6f0; min-height: 100%; display: flex; flex-direction: column; gap: 20px; }
.mn-hdr-title { font-size: 1.1rem; font-weight: 700; color: #07713c; margin: 0 0 2px; }
.mn-hdr-sub   { font-size: .83rem; color: #8a9a8a; }
.mn-sc4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
.mn-sc  { border-radius: 14px; padding: 18px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.mn-sc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.mn-sc-lbl { font-size: .78rem; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; }
.mn-sc-val { font-size: 1.9rem; font-weight: 700; color: #1a1a1a; }
.mn-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
.mn-tab { display: flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 20px; border: none; cursor: pointer; font-weight: 700; font-size: .83rem; font-family: Arial, sans-serif; transition: background .15s, color .15s; }
.mn-tab.active { background: #07713c; color: #fff; }
.mn-tab.inactive { background: #fff; color: #555; box-shadow: 0 2px 6px rgba(0,0,0,0.07); }
.mn-tab.inactive:hover { background: #ecfdf5; color: #07713c; }
.mn-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px,1fr)); gap: 16px; }
.mn-card { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.07); border: 1.5px solid transparent; transition: all .25s; }
.mn-card.done { opacity: .72; border-color: #d1fae5; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.mn-card-strip { padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
.mn-strip-left { display: flex; align-items: center; gap: 7px; }
.mn-strip-label { font-size: .76rem; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }
.mn-status-pill { display: flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; font-size: .72rem; font-weight: 700; }
.mn-body { padding: 16px 18px; }
.mn-room-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.mn-room-num { font-size: 2rem; font-weight: 700; color: #07713c; line-height: 1; }
.mn-done-ico { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: #ecfdf5; }
.mn-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; }
.mn-info-cell { background: #f4f6f0; border-radius: 8px; padding: 9px 12px; }
.mn-info-lbl  { font-size: .68rem; color: #8a9a8a; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; display: flex; align-items: center; gap: 4px; }
.mn-info-val  { font-size: .86rem; font-weight: 600; color: #222; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mn-note { display: flex; align-items: flex-start; gap: 7px; background: #fffde7; border: 1px solid #fff176; border-radius: 8px; padding: 8px 12px; margin-bottom: 14px; font-size: .81rem; color: #555; line-height: 1.4; }
.mn-actions { display: flex; gap: 8px; }
.mn-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 12px; border: none; border-radius: 9px; cursor: pointer; font-weight: 700; font-size: .83rem; font-family: Arial, sans-serif; transition: opacity .15s; }
.mn-btn:disabled { cursor: not-allowed; opacity: .55; }
.mn-btn-start  { background: #e3f2fd; color: #1565c0; flex: 1; }
.mn-btn-pause  { background: #fff8e1; color: #f57f17; flex: 1; }
.mn-btn-clean  { background: #07713c; color: #fff; flex: 2; }
.mn-btn-undo   { background: #f4f6f0; color: #8a9a8a; width: 100%; border: 1px solid #e0e0e0; }
.mn-btn-ready  { background: #07713c; color: #fff; flex: 1; }
.mn-empty { background: #fff; border-radius: 14px; padding: 60px 20px; text-align: center; border: 1px solid #e4ebe4; }
.mn-empty-ico { display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; width: 60px; height: 60px; border-radius: 50%; background: #ecfdf5; }
.mn-empty-title { font-size: 1rem; font-weight: 700; color: #333; margin-bottom: 6px; }
.mn-empty-sub { font-size: .85rem; color: #aaa; }
.mn-success { display: flex; align-items: center; gap: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px 18px; border-radius: 10px; font-weight: 600; font-size: .88rem; }
.mn-btn-inspect { background: #fce4ec; color: #c62828; flex: 1; border: 1.5px solid #ef9a9a; }
.mn-btn-inspect:hover { background: #ffcdd2; }
.mn-btn-clear { background: #ecfdf5; color: #07713c; flex: 1; border: 1.5px solid #a7f3d0; }
.mn-btn-clear:hover { background: #d1fae5; }
/* inspection modal */
.insp-mo { position:fixed; inset:0; z-index:999; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); padding:20px; overflow-y:auto; }
.insp-mb { background:#f4f6f0; border-radius:20px; width:100%; max-width:720px; display:flex; flex-direction:column; box-shadow:0 24px 80px rgba(0,0,0,.28); max-height:90vh; overflow:hidden; }
.insp-mh { padding:20px 26px; background:linear-gradient(135deg,#c62828,#e53935); display:flex; justify-content:space-between; align-items:center; flex-shrink:0; }
.insp-mh-left { display:flex; align-items:center; gap:14px; }
.insp-mh-title { color:#fff; font-size:1rem; font-weight:700; margin:0; }
.insp-mh-sub   { color:rgba(255,255,255,.7); font-size:.8rem; margin:3px 0 0; }
.insp-mh-room  { background:rgba(255,255,255,.15); border-radius:12px; padding:8px 16px; text-align:center; flex-shrink:0; }
.insp-mh-room-num { font-size:1.8rem; font-weight:700; color:#fff; line-height:1; }
.insp-mh-room-lbl { font-size:.6rem; color:rgba(255,255,255,.65); text-transform:uppercase; }
.insp-mx { background:rgba(255,255,255,.15); border:none; width:32px; height:32px; border-radius:50%; cursor:pointer; color:#fff; font-size:1.2rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.insp-mx:hover { background:rgba(255,255,255,.28); }
.insp-body { padding:20px 26px; overflow-y:auto; flex:1; }
.insp-two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.insp-sec { background:#fff; border-radius:12px; padding:14px 16px; border:1px solid #e4ebe4; height:100%; }
.insp-sec-title { font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:12px; display:flex; align-items:center; gap:6px; }
.insp-fi { width:100%; padding:9px 12px; border:1.5px solid #ccdacc; border-radius:9px; font-size:.88rem; font-family:Arial,sans-serif; outline:none; background:#fff; color:#333; box-sizing:border-box; transition:border-color .2s; }
.insp-fi:focus { border-color:#c62828; box-shadow:0 0 0 3px rgba(198,40,40,.1); }
.insp-fi::placeholder { color:#a8b8a8; font-style:italic; }
.insp-charge-row { display:flex; justify-content:space-between; align-items:center; padding:7px 11px; background:#fff5f5; border:1px solid #ffcdd2; border-radius:7px; margin-bottom:5px; }
.insp-charges-list { max-height:160px; overflow-y:auto; margin-bottom:8px; }
.insp-add-row { display:flex; gap:7px; align-items:center; margin-top:8px; flex-wrap:wrap; }
.insp-add-fi { flex:1; min-width:100px; padding:8px 11px; border:1.5px dashed #ef9a9a; border-radius:8px; font-size:.84rem; outline:none; font-family:Arial,sans-serif; color:#333; }
.insp-add-fi:focus { border-color:#c62828; }
.insp-add-fi::placeholder { color:#a8b8a8; font-style:italic; }
.insp-add-btn { padding:8px 14px; background:#c62828; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:.82rem; font-family:Arial,sans-serif; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; flex-shrink:0; }
.insp-add-btn:disabled { background:#aaa; cursor:not-allowed; }
.insp-foot { padding:14px 26px; border-top:1px solid #e4ebe4; display:flex; gap:10px; flex-shrink:0; }
.insp-btn-cancel { flex:1; padding:11px; background:#fff; border:1.5px solid #ccdacc; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:600; color:#555; font-family:Arial,sans-serif; }
.insp-btn-damage { flex:2; padding:11px; background:#c62828; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.insp-btn-clear  { flex:2; padding:11px; background:#07713c; border:none; border-radius:10px; cursor:pointer; font-size:.88rem; font-weight:700; color:#fff; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:6px; }
.insp-btn-damage:disabled, .insp-btn-clear:disabled { background:#aaa; cursor:not-allowed; }
/* room status tab */
.rm-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:12px; }
.rm-card { background:#fff; border-radius:14px; padding:16px 18px; border:1.5px solid #e4ebe4; box-shadow:0 2px 8px rgba(0,0,0,.05); display:flex; flex-direction:column; gap:10px; }
.rm-card.is-maint { border-color:#ffcc80; background:#fffde7; }
.rm-room-num { font-size:1.6rem; font-weight:700; color:#07713c; line-height:1; }
.rm-room-num.maint { color:#e65100; }
.rm-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:.7rem; font-weight:700; }
.rm-btn { width:100%; padding:9px 6px; border:none; border-radius:9px; cursor:pointer; font-size:.78rem; font-weight:700; font-family:Arial,sans-serif; display:flex; align-items:center; justify-content:center; gap:5px; }
.rm-btn:disabled { opacity:.5; cursor:not-allowed; }
.rm-btn-maint { background:#fff3e0; color:#e65100; border:1.5px solid #ffcc80; }
.rm-btn-ready { background:#ecfdf5; color:#07713c; border:1.5px solid #a7f3d0; }
.rm-card.is-cleaning { border-color:#ef9a9a; background:#fff5f5; }
@media (max-width:600px) {
  .insp-two-col { grid-template-columns:1fr; }
  .insp-mb { max-width:100%; border-radius:16px; }
  .mn-sc4 { grid-template-columns:1fr 1fr; }
}
`;

const TASK_STATUS = {
  pending:     { bg: "#fff8e1", color: "#f57f17", label: "Pending",     Icon: RiTimeLine },
  in_progress: { bg: "#e3f2fd", color: "#1565c0", label: "In Progress", Icon: RiToolsLine },
  done:        { bg: "#ecfdf5", color: "#07713c", label: "Done",        Icon: RiCheckboxCircleLine },
};
const TASK_TYPE = {
  pre_checkin:   { label: "Pre Check-In Cleaning",  Icon: RiLoginBoxLine,  color: "#1565c0", bg: "#e3f2fd" },
  post_checkout: { label: "Post Check-Out Cleaning", Icon: RiLogoutBoxLine, color: "#6a1b9a", bg: "#f3e5f5" },
  inspection:    { label: "Room Inspection Request", Icon: RiSearchLine,    color: "#c62828", bg: "#fce4ec" },
  room_damage:   { label: "Room Under Maintenance",  Icon: RiToolsLine,     color: "#e65100", bg: "#fff3e0" },
};
const TABS = [
  { key: "all",                label: "All Tasks",      Icon: RiListCheck2 },
  { key: "pending_inprogress", label: "Needs Cleaning", Icon: RiToolsLine },
  { key: "inspection",         label: "Inspections",    Icon: RiSearchLine },
  { key: "pre_checkin",        label: "Pre Check-In",   Icon: RiLoginBoxLine },
  { key: "post_checkout",      label: "Post Check-Out", Icon: RiLogoutBoxLine },
  { key: "done",               label: "Done",           Icon: RiCheckDoubleLine },
  { key: "rooms",              label: "Room Status",    Icon: RiHotelBedLine },
];

const ROOM_STATUS_CFG = {
  available:      { bg: "#ecfdf5", color: "#07713c", label: "Available" },
  occupied:       { bg: "#e3f2fd", color: "#1565c0", label: "Occupied" },
  reserved:       { bg: "#fff8e1", color: "#f57f17", label: "Reserved" },
  maintenance:    { bg: "#fff3e0", color: "#e65100", label: "Maintenance" },
  needs_cleaning: { bg: "#fce4ec", color: "#c62828", label: "Needs Cleaning" },
};

export default function Maintenance({ user }) {
  const [tasks,       setTasks]       = useState([]);
  const [allRooms,    setAllRooms]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [updating,    setUpdating]    = useState(null);
  const [successMsg,  setSuccessMsg]  = useState("");
  const [inspModal,   setInspModal]   = useState(null);
  const [inspNotes,   setInspNotes]   = useState("");
  const [inspCharges, setInspCharges] = useState([]);
  const [inspChgName, setInspChgName] = useState("");
  const [inspChgAmt,  setInspChgAmt]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTasks();
    const poll = setInterval(() => fetchTasks(true), 5000);
    return () => clearInterval(poll);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const channel = supabase
      .channel("maintenance-live")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "reservations" },
        (payload) => {
          const n = payload.new, o = payload.old;
          if (n.inspection_status !== o.inspection_status || n.cleaning_status !== o.cleaning_status)
            fetchTasks(true);
        }
      )
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms" },
        () => fetchTasks(true)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    const [
      { data: preData },
      { data: postData },
      { data: maintRooms },
      { data: roomsData },
      { data: doneData },
    ] = await Promise.all([
      supabase.from("reservations").select("*").eq("check_in", today).in("status", ["confirmed", "pending"]).neq("cleaning_status", "done"),
      supabase.from("reservations").select("*").in("status", ["checked_in", "checked_out"]).lte("check_out", today).neq("cleaning_status", "done"),
      supabase.from("rooms").select("*").eq("status", "maintenance"),
      supabase.from("rooms").select("*").order("room_number"),
      // Fetch completed cleaning tasks for the Done tab
      supabase.from("reservations").select("*").eq("cleaning_status", "done")
        .or(`check_in.eq.${today},check_out.lte.${today}`),
    ]);

    // Also fetch early checkouts: status=checked_out but check_out > today (guest left early)
    // These are missed by postData's lte(check_out, today) filter
    const { data: earlyCheckoutData } = await supabase
      .from("reservations").select("*")
      .eq("status", "checked_out")
      .gt("check_out", today)
      .neq("cleaning_status", "done");

    setAllRooms(roomsData || []);

    const built = [];

    (preData || []).forEach(r => built.push({
      id: `pre_${r.id}`, res_id: r.id, room_number: r.room_number,
      type: "pre_checkin", guest_name: r.guest_name, time: "Check-in today",
      check_in: r.check_in, check_out: r.check_out,
      status: r.cleaning_status || "pending", notes: r.notes || "",
    }));

    const { data: inspData } = await supabase.from("reservations").select("*")
      .eq("inspection_status", "requested").eq("status", "checked_in");
    (inspData || []).forEach(r => built.push({
      id: `insp_${r.id}`, res_id: r.id, room_number: r.room_number,
      type: "inspection", guest_name: r.guest_name,
      time: "Inspection requested", check_in: r.check_in, check_out: r.check_out,
      status: "pending", notes: r.notes || "",
    }));

    (postData || []).forEach(r => built.push({
      id: `post_${r.id}`, res_id: r.id, room_number: r.room_number,
      type: "post_checkout", guest_name: r.guest_name,
      time: r.check_out === today ? "Checkout today" : "Overdue",
      check_in: r.check_in, check_out: r.check_out,
      status: r.cleaning_status || "pending", notes: r.notes || "",
    }));

    // Add early checkouts (checked out before scheduled date) — needs cleaning too
    (earlyCheckoutData || []).forEach(r => built.push({
      id: `post_${r.id}`, res_id: r.id, room_id: r.room_id, room_number: r.room_number,
      type: "post_checkout", guest_name: r.guest_name,
      time: "Early Checkout — Needs Cleaning",
      check_in: r.check_in, check_out: r.check_out,
      status: r.cleaning_status || "pending", notes: r.notes || "",
    }));

    // Add done tasks (cleaning completed today) for the Done tab
    (doneData || []).forEach(r => {
      // Determine which type of task was done
      const taskType = r.check_in === today ? "pre_checkin" : "post_checkout";
      built.push({
        id: `done_${r.id}_${taskType}`, res_id: r.id, room_number: r.room_number,
        type: taskType, guest_name: r.guest_name,
        time: taskType === "pre_checkin" ? "Check-in today" : "Checkout",
        check_in: r.check_in, check_out: r.check_out,
        status: "done", notes: r.notes || "",
      });
    });

    const seen = new Set();
    const deduped = built.filter(t => {
      const key = (t.res_id || t.room_id) + t.type;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
 
    // Rooms under maintenance → show as task card
    (maintRooms || []).forEach(r => {
      if (!deduped.find(t => t.room_id === r.id && t.type === "room_damage")) {
        deduped.push({
          id:           `maint_${r.id}`,
          room_id:      r.id,
          room_number:  r.room_number,
          type:         "room_damage",
          guest_name:   "—",
          time:         "Under Maintenance",
          status:       "in_progress",
          notes:        r.description || "",
          is_room_task: true,
        });
      }
    });
 
    // Rooms with needs_cleaning status → show as cleaning task in All Tasks
    const { data: cleaningRooms } = await supabase
      .from("rooms")
      .select("*")
      .eq("status", "needs_cleaning");
 
    (cleaningRooms || []).forEach(r => {
      // Skip if there's already a reservation-linked task for this room
      // (means postData/earlyCheckoutData already added it)
      const alreadyHasTask = deduped.find(
        t => t.room_number === r.room_number && t.res_id
      );
      if (alreadyHasTask) return;
 
      // Skip if already added as a room task
      if (deduped.find(t => t.room_id === r.id)) return;
 
      // Add a standalone cleaning task card
      deduped.push({
        id:           `clean_${r.id}`,
        room_id:      r.id,
        room_number:  r.room_number,
        type:         "post_checkout",   // appears in All Tasks + Post Check-Out tab
        guest_name:   "Checked Out",
        time:         "Needs Cleaning",
        status:       "pending",         // appears in Needs Cleaning tab
        notes:        "",
        is_room_task: true,
      });
    });
 
    setTasks(deduped);
    if (!silent) setLoading(false);
  };

  // ── Mark room as ready → status back to "available" ──
  const markRoomReady = async (roomId, roomNumber) => {
    setUpdating(roomId);
    await supabase.from("rooms").update({ status: "available" }).eq("id", roomId);
    setTasks(prev => prev.filter(t => t.room_id !== roomId));
    setAllRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: "available" } : r));
    setSuccessMsg(`Room ${roomNumber} is now Available and ready to rent!`);
    setTimeout(() => setSuccessMsg(""), 3500);
    setUpdating(null);
  };

  // ── Toggle room: available ↔ maintenance (only allowed for available rooms) ──
  const toggleRoomMaintenance = async (room) => {
    if (room.status === "occupied" || room.status === "reserved") return;
    const newStatus = room.status === "maintenance" ? "available" : "maintenance";
    setUpdating(room.id);
    await supabase.from("rooms").update({ status: newStatus }).eq("id", room.id);
    setAllRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r));
    if (newStatus === "maintenance") {
      setTasks(prev => prev.find(t => t.room_id === room.id) ? prev : [...prev, {
        id: `maint_${room.id}`, room_id: room.id, room_number: room.room_number,
        type: "room_damage", guest_name: "—", time: "Under Maintenance",
        status: "in_progress", notes: "", is_room_task: true,
      }]);
      setSuccessMsg(`Room ${room.room_number} set to Under Maintenance.`);
    } else {
      setTasks(prev => prev.filter(t => t.room_id !== room.id));
      setSuccessMsg(`Room ${room.room_number} is now Available.`);
    }
    setTimeout(() => setSuccessMsg(""), 3000);
    setUpdating(null);
  };

  const openInspModal = (task) => {
    setInspModal(task);
    setInspNotes(""); setInspCharges([]); setInspChgName(""); setInspChgAmt("");
  };

  const addInspCharge = () => {
    if (!inspChgName.trim()) return;
    setInspCharges(prev => [...prev, {
      name: inspChgName.trim(),
      amount: inspChgAmt ? parseFloat(inspChgAmt) : 0,
      tbd: !inspChgAmt,
    }]);
    setInspChgName(""); setInspChgAmt("");
  };

  // ── When damage reported → set room to "maintenance" automatically ──
  const submitInspection = async (outcome) => {
    if (!inspModal) return;
    setSubmitting(true);

    await supabase.from("reservations").update({
      inspection_status:  outcome,
      inspection_notes:   inspNotes,
      inspection_charges: JSON.stringify(outcome === "has_damage" ? inspCharges : []),
    }).eq("id", inspModal.res_id);

    if (outcome === "has_damage") {
      const { data: resData } = await supabase.from("reservations")
        .select("room_id, room_number").eq("id", inspModal.res_id).single();
      if (resData?.room_id) {
        await supabase.from("rooms").update({ status: "maintenance" }).eq("id", resData.room_id);
        setAllRooms(prev => prev.map(r => r.id === resData.room_id ? { ...r, status: "maintenance" } : r));
        // Add maintenance task card if not already there
        setTasks(prev => prev.find(t => t.room_id === resData.room_id && t.type === "room_damage") ? prev : [...prev, {
          id: `maint_${resData.room_id}`, room_id: resData.room_id,
          room_number: resData.room_number, type: "room_damage",
          guest_name: inspModal.guest_name, time: "Damage Reported",
          status: "in_progress", notes: inspNotes, is_room_task: true,
        }]);
      }
    }

    setTasks(prev => prev.filter(t => t.id !== inspModal.id));

    await supabase.from("notifications").insert({
      type:        outcome === "cleared" ? "inspection_cleared" : "inspection_damage",
      title:       outcome === "cleared"
        ? `Room ${inspModal.room_number} — Cleared, No Damage`
        : `Room ${inspModal.room_number} — Damage Found`,
      message:     outcome === "cleared"
        ? `Room ${inspModal.room_number} inspected. No damage found. Guest: ${inspModal.guest_name}. Ready for check-out.`
        : `Damage reported in Room ${inspModal.room_number}. Room set to Under Maintenance. Guest: ${inspModal.guest_name}. Charges: ₱${inspCharges.filter(c=>!c.tbd).reduce((s,c)=>s+parseFloat(c.amount),0).toLocaleString()}${inspCharges.some(c=>c.tbd)?" + TBD":""}.`,
      entity_type: "reservation",
      entity_id:   inspModal.res_id || "",
      room_number: inspModal.room_number,
      guest_name:  inspModal.guest_name,
      nav_target:  "Check-Out",
    });

    setSuccessMsg(outcome === "cleared"
      ? `Room ${inspModal.room_number} — cleared, no damage.`
      : `Room ${inspModal.room_number} — damage reported. Room is now Under Maintenance.`
    );
    setTimeout(() => setSuccessMsg(""), 4000);
    setSubmitting(false);
    setInspModal(null);
  };

  const updateStatus = async (task, newStatus) => {
    setUpdating(task.id);
    if (task.res_id && !task.is_room_task) {
      await supabase
        .from("reservations")
        .update({ cleaning_status: newStatus })
        .eq("id", task.res_id);
    }
 
    if (newStatus === "done") {
      let roomId = task.room_id || null;
      if (!roomId && task.res_id) {
        const { data: rd } = await supabase
          .from("reservations")
          .select("room_id")
          .eq("id", task.res_id)
          .single();
        roomId = rd?.room_id || null;
      }
      if (roomId) {
        await supabase
          .from("rooms")
          .update({ status: "available" })
          .eq("id", roomId);
 
        setAllRooms(prev =>
          prev.map(r => r.id === roomId ? { ...r, status: "available" } : r)
        );
        const { data: resForRoom } = await supabase
          .from("reservations")
          .select("id")
          .eq("room_id", roomId)
          .eq("status", "checked_out")
          .order("check_out", { ascending: false })
          .limit(1)
          .maybeSingle();
 
        if (resForRoom?.id) {
          await supabase
            .from("reservations")
            .update({ cleaning_status: "done" })
            .eq("id", resForRoom.id);
        }
      }
    }
 
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    setUpdating(null);
 
    if (newStatus === "done") {
      setSuccessMsg(`Room ${task.room_number} marked as clean and available!`);
      setTimeout(() => setSuccessMsg(""), 2500);
      supabase.from("notifications").insert({
        type:        "cleaning_done",
        title:       `Room ${task.room_number} — Cleaning Done`,
        message:     `${task.type === "pre_checkin" ? "Pre Check-In" : "Post Check-Out"} cleaning completed. Guest: ${task.guest_name}.`,
        entity_type: "reservation",
        entity_id:   task.res_id || "",
        room_number: task.room_number,
        guest_name:  task.guest_name,
        nav_target:  task.type === "post_checkout" ? "Check-Out" : "Check-In",
      });
    }
  };

  const countBy = s => tasks.filter(t => t.status === s).length;
  const filtered = filter === "all"
    ? tasks.filter(t => t.status !== "done")
    : filter === "done" 
    ? tasks.filter(t => t.status === "done")
    : filter === "pending_inprogress"
    ? tasks.filter(t => t.status !== "done" && t.type !== "inspection")
    : filter === "inspection"
    ? tasks.filter(t => t.type === "inspection")
    : filter === "rooms"
    ? []
    : tasks.filter(t => t.type === filter && t.status !== "done");

  const STAT_CARDS = [
    { lbl: "Total Tasks", val: tasks.length,          Icon: RiListCheck2,         bg: "#f3e5f5", color: "#6a1b9a" },
    { lbl: "Pending",     val: countBy("pending"),     Icon: RiTimeLine,           bg: "#fff8e1", color: "#f57f17" },
    { lbl: "In Progress", val: countBy("in_progress"), Icon: RiToolsLine,          bg: "#e3f2fd", color: "#1565c0" },
    { lbl: "Done",        val: countBy("done"),        Icon: RiCheckboxCircleLine, bg: "#ecfdf5", color: "#07713c" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="mn-root">
        <div>
          <h2 className="mn-hdr-title">Maintenance & Housekeeping</h2>
          <p className="mn-hdr-sub">Today — {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {successMsg && <div className="mn-success"><RiCheckboxCircleLine size={18} />{successMsg}</div>}

        <div className="mn-sc4">
          {STAT_CARDS.map(({ lbl, val, Icon, bg, color }) => (
            <div key={lbl} className="mn-sc" style={{ background: bg }}>
              <div className="mn-sc-row"><Icon size={18} color={color} /><span className="mn-sc-lbl" style={{ color }}>{lbl}</span></div>
              <div className="mn-sc-val">{val}</div>
            </div>
          ))}
        </div>

        <div className="mn-tabs">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} className={`mn-tab ${filter === key ? "active" : "inactive"}`} onClick={() => setFilter(key)}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════
            ROOM STATUS TAB
            ══════════════════════════ */}
        {filter === "rooms" ? (
          <div>

            {allRooms.length === 0 ? (
              <div className="mn-empty">
                <div className="mn-empty-ico"><RiHotelBedLine size={28} color="#07713c" /></div>
                <div className="mn-empty-title">No rooms found.</div>
              </div>
            ) : (
              <div className="rm-grid">
                {allRooms.map(room => {
                  const sc       = ROOM_STATUS_CFG[room.status] || ROOM_STATUS_CFG.available;
                  const isMaint  = room.status === "maintenance";
                  const isLocked = room.status === "occupied" || room.status === "reserved";
                  return (
                    <div key={room.id} className={`rm-card${isMaint ? " is-maint" : ""}${room.status === "needs_cleaning" ? " is-cleaning" : ""}`}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: ".6rem", color: "#8a9a8a", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>Room</div>
                          <div className={`rm-room-num${isMaint || room.status === "needs_cleaning" ? " maint" : ""}`}>{room.room_number}</div>
                        </div>
                        <span className="rm-badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <div style={{ fontSize: ".78rem", color: "#888" }}>{room.type} · Floor {room.floor}</div>
                      {isLocked ? (
                        <div style={{ fontSize: ".73rem", color: "#bbb", fontStyle: "italic", textAlign: "center", padding: "4px 0" }}>
                          Room is {room.status} — cannot change
                        </div>
                      ) : (isMaint || room.status === "needs_cleaning") ? (
                        <button className="rm-btn rm-btn-ready" onClick={() => markRoomReady(room.id, room.room_number)} disabled={updating === room.id}>
                          <RiCheckDoubleLine size={13} />{updating === room.id ? "Saving..." : "Mark as Ready to Rent"}
                        </button>
                      ) : (
                        <button className="rm-btn rm-btn-maint" onClick={() => toggleRoomMaintenance(room)} disabled={updating === room.id}>
                          <RiToolsLine size={13} />{updating === room.id ? "Saving..." : "Set to Maintenance"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        ) : loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#aaa" }}>Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="mn-empty">
            <div className="mn-empty-ico"><RiCheckDoubleLine size={28} color="#07713c" /></div>
            <div className="mn-empty-title">{filter === "done" ? "No completed tasks yet." : "No cleaning tasks!"}</div>
            <div className="mn-empty-sub">All rooms are clean and ready.</div>
          </div>
        ) : (
          <div className="mn-grid">
            {filtered.map(task => {
              const typeInfo   = TASK_TYPE[task.type]    || TASK_TYPE.pre_checkin;
              const statusInfo = TASK_STATUS[task.status] || TASK_STATUS.pending;
              const isDone     = task.status === "done";
              const TypeIcon   = typeInfo.Icon;
              const StatIcon   = statusInfo.Icon;
              return (
                <div key={task.id} className={`mn-card${isDone ? " done" : ""}`}>
                  <div className="mn-card-strip" style={{ background: typeInfo.bg, borderBottom: `2px solid ${typeInfo.color}22` }}>
                    <div className="mn-strip-left">
                      <TypeIcon size={15} color={typeInfo.color} />
                      <span className="mn-strip-label" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                    </div>
                    <div className="mn-status-pill" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                      <StatIcon size={12} />{statusInfo.label}
                    </div>
                  </div>
                  <div className="mn-body">
                    <div className="mn-room-row">
                      <div>
                        <div style={{ fontSize: ".68rem", color: "#8a9a8a", fontWeight: "700", textTransform: "uppercase", marginBottom: "2px" }}>Room</div>
                        <div className="mn-room-num">{task.room_number || "—"}</div>
                      </div>
                      {isDone && <div className="mn-done-ico"><RiCheckboxCircleLine size={24} color="#07713c" /></div>}
                    </div>
                    <div className="mn-info-grid">
                      <div className="mn-info-cell">
                        <div className="mn-info-lbl"><RiUserLine size={10} />Guest</div>
                        <div className="mn-info-val">{task.guest_name}</div>
                      </div>
                      <div className="mn-info-cell">
                        <div className="mn-info-lbl"><RiTimeLine size={10} />Schedule</div>
                        <div className="mn-info-val">{task.time}</div>
                      </div>
                      {task.check_in && (
                        <div className="mn-info-cell">
                          <div className="mn-info-lbl"><RiLoginBoxLine size={10} />Check-In</div>
                          <div className="mn-info-val">{task.check_in}</div>
                        </div>
                      )}
                      {task.check_out && (
                        <div className="mn-info-cell">
                          <div className="mn-info-lbl"><RiLogoutBoxLine size={10} />Check-Out</div>
                          <div className="mn-info-val">{task.check_out}</div>
                        </div>
                      )}
                    </div>
                    {task.notes && (
                      <div className="mn-note">
                        <RiStickyNoteLine size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: "1px" }} />
                        {task.notes}
                      </div>
                    )}

                    {/* ── Room damage task: only show Mark as Ready ── */}
                    {task.type === "room_damage" ? (
                      <button className="mn-btn mn-btn-ready" style={{ width: "100%" }}
                        onClick={() => markRoomReady(task.room_id, task.room_number)}
                        disabled={updating === task.room_id}>
                        <RiCheckDoubleLine size={14} />
                        {updating === task.room_id ? "Saving..." : "Room Fixed — Mark as Ready"}
                      </button>
                    ) : task.type === "inspection" ? (
                      <div className="mn-actions">
                        <button className="mn-btn mn-btn-clear" onClick={() => openInspModal(task)}>
                          <RiSearchLine size={14} />Start Inspection
                        </button>
                      </div>
                    ) : !isDone ? (
                      <div className="mn-actions">
                        {task.status === "pending" && (
                          <button className="mn-btn mn-btn-start" onClick={() => updateStatus(task, "in_progress")} disabled={updating === task.id}>
                            <RiPlayCircleLine size={14} />Start Cleaning
                          </button>
                        )}
                        {task.status === "in_progress" && (
                          <button className="mn-btn mn-btn-pause" onClick={() => updateStatus(task, "pending")} disabled={updating === task.id}>
                            <RiPauseLine size={14} />Pause
                          </button>
                        )}
                        <button className="mn-btn mn-btn-clean" onClick={() => updateStatus(task, "done")} disabled={updating === task.id}>
                          <RiCheckboxCircleLine size={14} />
                          {updating === task.id ? "Saving..." : "Mark as Clean"}
                        </button>
                      </div>
                    ) : (
                      <button className="mn-btn mn-btn-undo" style={{ width: "100%" }} onClick={() => updateStatus(task, "pending")}>
                        <RiArrowGoBackLine size={14} />Undo
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── INSPECTION MODAL ── */}
      {inspModal && (
        <div className="insp-mo" onClick={() => setInspModal(null)}>
          <div className="insp-mb" onClick={e => e.stopPropagation()}>
            <div className="insp-mh">
              <div className="insp-mh-left">
                <div className="insp-mh-room">
                  <div className="insp-mh-room-num">{inspModal.room_number}</div>
                  <div className="insp-mh-room-lbl">Room</div>
                </div>
                <div>
                  <p className="insp-mh-title">Room Inspection</p>
                  <p className="insp-mh-sub">Guest: {inspModal.guest_name}</p>
                  {inspModal.check_in && (
                    <p style={{ color: "rgba(255,255,255,.6)", fontSize: ".75rem", marginTop: "2px" }}>
                      {inspModal.check_in}{inspModal.check_out ? ` → ${inspModal.check_out}` : " (Open Stay)"}
                    </p>
                  )}
                </div>
              </div>
              <button className="insp-mx" onClick={() => setInspModal(null)}>×</button>
            </div>

            <div className="insp-body">
              <div className="insp-two-col">
                {/* LEFT — Notes */}
                <div className="insp-sec">
                  <div className="insp-sec-title" style={{ color: "#c62828" }}>
                    <RiStickyNoteLine size={13} />Inspection Notes
                  </div>
                  <div style={{ fontSize: ".78rem", color: "#8a9a8a", marginBottom: "10px" }}>
                    Describe the room condition. Required to report damage.
                  </div>
                  <textarea className="insp-fi" rows={8} style={{ resize: "vertical" }}
                    placeholder="Describe room condition, any issues found (e.g. broken furniture, stained linen, missing items)..."
                    value={inspNotes} onChange={e => setInspNotes(e.target.value)} />
                </div>

                {/* RIGHT — Damage Charges */}
                <div className="insp-sec">
                  <div className="insp-sec-title" style={{ color: "#c62828" }}>
                    <RiMoneyDollarCircleLine size={13} />Damage Charges
                    <span style={{ fontWeight: "400", color: "#aaa", fontSize: ".7rem", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                  </div>
                  <div style={{ fontSize: ".78rem", color: "#8a9a8a", marginBottom: "10px" }}>
                    Add items if damage was found. Leave empty if room is clean.
                  </div>
                  {inspCharges.length > 0 ? (
                    <div className="insp-charges-list">
                      {inspCharges.map((c, i) => (
                        <div key={i} className="insp-charge-row">
                          <span style={{ fontSize: ".83rem", color: "#333", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "8px" }}>
                            {c.tbd
                              ? <span style={{ fontSize: ".72rem", fontWeight: "700", color: "#f57f17", background: "#fff8e1", padding: "2px 7px", borderRadius: "8px", border: "1px solid #ffe082" }}>TBD</span>
                              : <span style={{ fontWeight: "700", color: "#c62828", fontSize: ".83rem" }}>₱{parseFloat(c.amount).toLocaleString()}</span>
                            }
                            <button onClick={() => setInspCharges(prev => prev.filter((_, j) => j !== i))}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", display: "flex", alignItems: "center", padding: "2px 3px" }}>
                              <RiDeleteBinLine size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 11px", fontWeight: "700", fontSize: ".85rem", background: "#fce4ec", borderRadius: "7px", marginTop: "6px", border: "1px solid #ffcdd2" }}>
                        <span style={{ color: "#555" }}>
                          Total{inspCharges.some(c => c.tbd) && <span style={{ fontWeight: "400", fontSize: ".72rem", color: "#f57f17", marginLeft: "6px" }}>(some TBD)</span>}
                        </span>
                        <span style={{ color: "#c62828" }}>
                          ₱{inspCharges.filter(c=>!c.tbd).reduce((s,c)=>s+parseFloat(c.amount),0).toLocaleString()}
                          {inspCharges.some(c=>c.tbd) && <span style={{ fontSize: ".75rem", color: "#f57f17" }}> + TBD</span>}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#aaa", fontSize: ".82rem", fontStyle: "italic", marginBottom: "10px" }}>No charges added yet.</div>
                  )}
                  <div className="insp-add-row">
                    <input className="insp-add-fi" value={inspChgName} onChange={e => setInspChgName(e.target.value)}
                      placeholder="e.g. Broken mirror..." onKeyDown={e => e.key === "Enter" && addInspCharge()} />
                    <input type="number" className="insp-add-fi" style={{ flex: "0 0 90px", minWidth: "80px" }} value={inspChgAmt}
                      onChange={e => setInspChgAmt(e.target.value)} placeholder="₱ (opt.)" onKeyDown={e => e.key === "Enter" && addInspCharge()} />
                    <button className="insp-add-btn" onClick={addInspCharge} disabled={!inspChgName.trim()}>
                      <RiAddLine size={13} />Add
                    </button>
                  </div>
                  <div style={{ fontSize: ".73rem", color: "#aaa", marginTop: "6px" }}>
                    💡 Price is optional — leave blank to mark as <strong style={{ color: "#f57f17" }}>TBD</strong>.
                  </div>
                  {/* Warning about room status change */}
                  <div style={{ marginTop: "12px", background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "8px", padding: "9px 12px", fontSize: ".75rem", color: "#e65100", lineHeight: 1.5 }}>
                    ⚠ Reporting damage will automatically set the room to <strong>Under Maintenance</strong> until you mark it as ready.
                  </div>
                </div>
              </div>
            </div>

            <div className="insp-foot">
              <button className="insp-btn-cancel" onClick={() => setInspModal(null)}>Cancel</button>
              <button className="insp-btn-clear" onClick={() => submitInspection("cleared")} disabled={submitting}>
                <RiCheckDoubleLine size={15} />{submitting ? "Saving..." : "No Damage — Clear"}
              </button>
              <button className="insp-btn-damage" onClick={() => submitInspection("has_damage")} disabled={submitting || !inspNotes.trim()}>
                <RiAlertLine size={15} />{submitting ? "Saving..." : "Report Damage"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}