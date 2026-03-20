import supabase from "./supabaseClient";

/**
 * Log an activity to the activity_logs table.
 * @param {object} params
 * @param {string} params.action  - Short description, e.g. "Checked in guest Juan"
 * @param {string} params.category - check_in | check_out | reservation | charge | staff | delete | edit | auth | other
 * @param {string} [params.details] - Extra details string
 * @param {string} [params.entity_type] - e.g. "reservation", "room", "user"
 * @param {string} [params.entity_id]   - ID of the affected record
 */
export async function logActivity({ action, category, details = "", entity_type = "", entity_id = "" }) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    await supabase.from("activity_logs").insert({
      user_id:     user.id,
      user_name:   profile?.full_name || user.email,
      user_role:   profile?.role || "staff",
      action,
      category,
      details,
      entity_type,
      entity_id:   String(entity_id),
    });
  } catch (e) {
    // Silently fail — logging should never break main functionality
    console.warn("Logging failed:", e.message);
  }
}