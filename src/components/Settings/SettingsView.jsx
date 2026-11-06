import React, { useState, useEffect } from "react";
import { Moon, Sun, CheckCircle2, AlertCircle, Sparkles, Type } from "lucide-react";

export function SettingsView({
  darkMode,
  setDarkMode,
  project,
  onUpdateProject,
  showToast
}) {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ status: "disconnected" }));
  }, []);

  return (
    <div className="page-wrap settings-page">
      <h1>Settings</h1>
      <p className="page-sub">
        Customize platform appearance, typography standards, and connection status.
      </p>

      {/* Appearance Setting */}
      <div className="settings-card">
        <div>
          <b>Appearance Theme</b>
          <small>Toggle between Obsidian Dark Mode and Editorial Light Mode</small>
        </div>
        <button
          className="outline-btn"
          onClick={() => {
            setDarkMode(!darkMode);
            showToast(`Switched to ${!darkMode ? "Dark" : "Light"} mode`);
          }}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </button>
      </div>

      {/* Typography Setting */}
      <div className="settings-card">
        <div>
          <b>Typography Standard</b>
          <small>
            Primary: <b>Cormorant Garamond</b> (Headings & Titles) · Secondary: <b>Inter</b> (Navigation & Forms)
          </small>
        </div>
        <div className="font-chip">
          <Type size={14} />
          <span>Serif + Sans Pairing Active</span>
        </div>
      </div>

      {/* Watermark Setting */}
      <div className="settings-card">
        <div>
          <b>PeaceAG Watermark Default</b>
          <small>Subtle church brand tag on exported slides and live presentations</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className={`switch ${project.watermarkVisible ?? true ? "on" : ""}`}
            onClick={() => {
              const next = !(project.watermarkVisible ?? true);
              onUpdateProject({ watermarkVisible: next });
              showToast(`Watermark ${next ? "enabled" : "disabled"}`);
            }}
          >
            <i />
          </button>
        </div>
      </div>

      {/* Backend & AI Connection Status */}
      <div className="settings-card">
        <div>
          <b>Worship Studio API & AI Status</b>
          <small>Local Express service & Google Gemini 2.5 Flash connectivity</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px" }}>
          {apiStatus?.status === "ok" ? (
            <span style={{ color: "#9cd1a6", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <CheckCircle2 size={14} /> Connected (Port 3001)
              {apiStatus.geminiConfigured && (
                <span style={{ color: "var(--gold)", marginLeft: "4px" }}>• Gemini AI Ready</span>
              )}
            </span>
          ) : (
            <span style={{ color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <AlertCircle size={14} /> Offline (Local-only mode)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

