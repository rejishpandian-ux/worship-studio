import React, { useState } from "react";
import {
  X,
  User,
  Church,
  Mail,
  Lock,
  Plus,
  Check,
  Building,
  Shield,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export function ProfileModal({ isOpen, onClose, showToast }) {
  if (!isOpen) return null;

  const { user, updateProfile, changePassword, addWorkspace, switchWorkspace } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [churchName, setChurchName] = useState(user?.churchName || "");
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [creatingWs, setCreatingWs] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await updateProfile({ name, churchName });
      setSuccessMsg("Profile updated successfully!");
      if (showToast) showToast("Profile updated!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setSavingPassword(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await changePassword(oldPassword, newPassword);
      setSuccessMsg("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      if (showToast) showToast("Password changed!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    setCreatingWs(true);
    try {
      await addWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      if (showToast) showToast(`Workspace "${newWorkspaceName.trim()}" created!`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create workspace.");
    } finally {
      setCreatingWs(false);
    }
  };

  return (
    <div className="auth-modal-scrim" onClick={onClose}>
      <div className="auth-modal-card profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Head */}
        <div className="auth-modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="avatar" style={{ width: "36px", height: "36px", fontSize: "14px" }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "W"}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text)" }}>Account & Workspace</h3>
              <small style={{ color: "var(--muted)", fontSize: "11px" }}>{user?.email}</small>
            </div>
          </div>
          <button className="icon-btn mini" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="auth-alert error" style={{ marginTop: "14px" }}>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success" style={{ marginTop: "14px" }}>
            <span>{successMsg}</span>
          </div>
        )}

        <div className="profile-modal-body">
          {/* Section 1: Workspaces */}
          <div className="setting-block" style={{ borderBottom: "1px solid var(--line)", paddingBottom: "16px" }}>
            <div className="setting-head">
              <b>YOUR WORKSPACES & CAMPUSES</b>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", margin: "10px 0" }}>
              {user?.workspaces?.map((ws) => {
                const isCurrent = user.currentWorkspaceId === ws.id;
                return (
                  <div
                    key={ws.id}
                    onClick={() => switchWorkspace(ws.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: isCurrent ? "var(--surface3)" : "var(--surface2)",
                      border: `1px solid ${isCurrent ? "var(--gold)" : "var(--line)"}`,
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Building size={16} style={{ color: isCurrent ? "var(--gold)" : "var(--muted)" }} />
                      <span style={{ fontSize: "13px", fontWeight: isCurrent ? 600 : 400, color: "var(--text)" }}>
                        {ws.name}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="song-badge" style={{ fontSize: "9px" }}>
                        ACTIVE
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="New campus or ministry name..."
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                style={{
                  flex: 1,
                  height: "38px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--line)",
                  background: "var(--bg)",
                  color: "var(--text)",
                  fontSize: "12px"
                }}
              />
              <button
                type="button"
                className="primary-btn compact"
                onClick={handleCreateWorkspace}
                disabled={creatingWs || !newWorkspaceName.trim()}
              >
                <Plus size={14} /> Add Workspace
              </button>
            </div>
          </div>

          {/* Section 2: Profile Details */}
          <form onSubmit={handleSaveProfile} style={{ marginTop: "16px" }}>
            <div className="setting-head">
              <b>PROFILE DETAILS</b>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="auth-field-label">
                <span>Full Name</span>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </label>

              <label className="auth-field-label">
                <span>Church / Ministry</span>
                <div className="auth-input-wrap">
                  <Church size={15} className="auth-input-icon" />
                  <input
                    type="text"
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                  />
                </div>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="submit" className="primary-btn compact" disabled={savingProfile}>
                {savingProfile ? <Loader2 size={13} className="ai-spin" /> : <Check size={14} />} Save Details
              </button>
            </div>
          </form>

          {/* Section 3: Password Update */}
          <form onSubmit={handleChangePassword} style={{ marginTop: "18px", borderTop: "1px solid var(--line)", paddingTop: "16px" }}>
            <div className="setting-head">
              <b>SECURITY & PASSWORD</b>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label className="auth-field-label">
                <span>Current Password</span>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </label>

              <label className="auth-field-label">
                <span>New Password</span>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button
                type="submit"
                className="outline-btn compact"
                disabled={savingPassword || !oldPassword || !newPassword}
              >
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

