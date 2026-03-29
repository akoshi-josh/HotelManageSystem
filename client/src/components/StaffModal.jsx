import React from "react";

export default function StaffModal({
  showModal,
  onClose,
  editUser,
  form,
  setForm,
  error,
  success,
  saving,
  onSave,
}) {
  if (!showModal) return null;

  return (
    <div className="mo" onClick={onClose}>
      <div className="mb" style={{ maxWidth: "460px" }} onClick={e => e.stopPropagation()}>
        <div className="mh">
          <div>
            <p className="mh-title">{editUser ? "Edit Staff Account" : "Add New Staff"}</p>
            <p className="mh-sub">{editUser ? "Update staff details" : "Create a new staff account"}</p>
          </div>
          <button className="mx" onClick={onClose}>×</button>
        </div>
        <div className="mbody">
          {error   && <div className="alert-err">✕ {error}</div>}
          {success && <div className="alert-ok">✓ {success}</div>}
          <div className="sc2">
            <div className="sc2-title">Account Details</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="flabel">Full Name</label>
                <input
                  className="fi"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div>
                <label className="flabel">Email Address</label>
                <input
                  type="email"
                  className="fi"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. juan@hotel.com"
                  disabled={!!editUser}
                  style={editUser ? { background: "#f5f8f5", color: "#9aaa9a" } : {}}
                />
              </div>
              {!editUser && (
                <div>
                  <label className="flabel">Password</label>
                  <input
                    type="password"
                    className="fi"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="sc2">
            <div className="sc2-title">Role & Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label className="flabel">Role</label>
                <select
                  className="fi"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  style={{ cursor: "pointer" }}
                >
                  <option value="staff">Staff</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="flabel">Status</label>
                <select
                  className="fi"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ cursor: "pointer" }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="mfoot">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-confirm" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : editUser ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}