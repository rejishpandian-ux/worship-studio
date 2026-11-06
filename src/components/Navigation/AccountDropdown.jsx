import React, { useState, useRef, useEffect } from "react";
import {
  User,
  ChevronDown,
  Building,
  Settings,
  CreditCard,
  LogOut,
  Sparkles,
  LogIn,
  Plus,
  Check,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export function AccountDropdown({
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  showToast
}) {
  const { user, isAuthenticated, signOut, switchWorkspace } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
    if (showToast) showToast("Signed out successfully.");
  };

  const currentWorkspace = user?.workspaces?.find(
    (w) => w.id === user.currentWorkspaceId
  ) || user?.workspaces?.[0] || { name: "Local Workspace" };

  // Guest view: Show Sign In CTA
  if (!isAuthenticated) {
    return (
      <div className="account-top-actions">
        <button
          type="button"
          className="text-btn auth-nav-btn"
          onClick={() => onOpenAuth("signin")}
        >
          <LogIn size={15} />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          className="primary-btn compact auth-join-btn"
          onClick={() => onOpenAuth("signup")}
        >
          <Sparkles size={14} />
          <span>Join Team</span>
        </button>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "W";

  return (
    <div className="account-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`account-profile-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Account and Workspace Menu"
        aria-expanded={isOpen}
      >
        <div className="avatar user-top-avatar">{initials}</div>
        <div className="account-trigger-info">
          <b className="account-trigger-name">{user.name}</b>
          <span className="account-trigger-workspace">
            <Building size={10} />
            <span>{currentWorkspace.name}</span>
          </span>
        </div>
        <ChevronDown size={14} className={`dropdown-arrow ${isOpen ? "rotate" : ""}`} />
      </button>

      {/* Polished Dropdown Menu */}
      {isOpen && (
        <div className="account-dropdown-menu">
          {/* Header Card */}
          <div className="account-menu-header">
            <div className="avatar large-avatar">{initials}</div>
            <div className="account-menu-user-details">
              <b>{user.name}</b>
              <small>{user.email}</small>
              <div className="account-plan-tag">
                <ShieldCheck size={11} />
                <span>{user.plan || "Church Pro Plan"}</span>
              </div>
            </div>
          </div>

          <div className="dropdown-divider" />

          {/* Workspace Switcher Section */}
          <div className="dropdown-section-label">TEAM WORKSPACE</div>
          <div className="workspace-switcher-list">
            {user.workspaces?.map((ws) => {
              const isSelected = ws.id === user.currentWorkspaceId;
              return (
                <button
                  key={ws.id}
                  type="button"
                  className={`workspace-switch-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    switchWorkspace(ws.id);
                    if (showToast) showToast(`Switched to ${ws.name}`);
                  }}
                >
                  <Building size={13} className="ws-icon" />
                  <span className="ws-name">{ws.name}</span>
                  {isSelected && <Check size={14} className="ws-check" />}
                </button>
              );
            })}
            <button
              type="button"
              className="workspace-add-item"
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
            >
              <Plus size={12} />
              <span>Add Campus or Ministry...</span>
            </button>
          </div>

          <div className="dropdown-divider" />

          {/* Navigation Actions */}
          <div className="dropdown-actions-list">
            <button
              type="button"
              className="dropdown-action-item"
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
            >
              <User size={15} />
              <span>My Profile & Team</span>
            </button>

            <button
              type="button"
              className="dropdown-action-item"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
            >
              <Settings size={15} />
              <span>Platform Settings</span>
            </button>
          </div>

          <div className="dropdown-divider" />

          {/* Sign Out */}
          <div className="account-menu-footer">
            <button
              type="button"
              className="dropdown-signout-btn"
              onClick={handleSignOut}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

