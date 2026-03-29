/**
 * activateQueuedOrders.js
 * 
 * Call this function AFTER a successful check-in to:
 *  1. Find all 'queued' restaurant orders for this reservation
 *  2. Flip them to 'pending' so the restaurant sees them immediately
 *  3. Send a notification to the restaurant for each activated order
 * 
 * USAGE — in CheckIn.jsx inside your handleConfirm / onConfirm logic:
 * 
 *   import activateQueuedOrders from "../utils/activateQueuedOrders";
 *   
 *   // After updating reservation status to checked_in:
 *   await activateQueuedOrders(reservationId, guestName, roomNumber);
 */

import supabase from "../supabaseClient";

export default async function activateQueuedOrders(reservationId, guestName, roomNumber) {
  if (!reservationId) return;

  // Find all queued orders for this reservation
  const { data: queuedOrders } = await supabase
    .from("restaurant_orders")
    .select("*")
    .eq("reservation_id", reservationId)
    .eq("status", "queued");

  if (!queuedOrders || queuedOrders.length === 0) return;

  // Activate each order (queued → pending)
  for (const order of queuedOrders) {
    await supabase
      .from("restaurant_orders")
      .update({ status: "pending", updated_at: new Date().toISOString() })
      .eq("id", order.id);

    // Notify restaurant
    const items   = Array.isArray(order.items) ? order.items : [];
    const summary = items.map(i => `${i.name} ×${i.qty}`).join(", ");

    await supabase.from("notifications").insert([{
      type:        "restaurant_order",
      title:       `🍽 Pre-Order Activated — Room ${roomNumber || "?"}`,
      message:     `${guestName} checked in. Pre-order: ${summary} · ₱${parseFloat(order.total_amount).toLocaleString()}`,
      nav_target:  "Restaurant",
      is_read:     false,
      target_role: "restaurant",
    }]);
  }
}