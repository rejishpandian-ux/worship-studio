import React from "react";
import {
  Sparkles,
  Presentation,
  Sliders,
  Palette,
  Folder,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export function Navigation({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  mobileOpen,
  setMobileOpen,
  projectCount = 0,
  themeCount = 28
}) {
  const navItems = [
    { id: "quick", label: "Quick Mode", icon: Sparkles, badge: "FAST" },
    { id: "home", label: "Overview", icon: Presentation },
    { id: "editor", label: "Presentation Studio", icon: Sliders },
    { id: "themes", label: "Theme Library", icon: Palette, badge: themeCount },
    { id: "library", label: "Your Projects", icon: Folder, badge: projectCount },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const handleNavClick = (viewId) => {
    setCurrentView(viewId);
    setMobileOpen(false);
  };

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case "quick":
        return "Quick Mode";
      case "home":
        return "Overview";
      case "editor":
        return "Presentation Studio";
      case "themes":
        return "Theme Library";
      case "library":
        return "Your Projects";
      case "settings":
        return "Settings";
      default:
        return "Workspace";
    }
  };

  return (
    <>
      {mobileOpen && (
        <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <b>Worship Studio</b>
            <small>PEACEAG PRESENTATION</small>
          </div>
          <button
            className="icon-btn mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-pill">
          <div className="avatar">W</div>
          <span>Worship Team</span>
          <ChevronRight size={14} className="nav-trail" />
        </div>

        <div className="nav-label">PLATFORM</div>
        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = currentView === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isSelected ? "selected" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && <em>{item.badge}</em>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-sep" />

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <HelpCircle size={16} />
            </div>
            <b>Need church projection help?</b>
            <p>16:9 widescreen PowerPoint templates optimized for high-lumen church projectors.</p>
            <button
              onClick={() => handleNavClick("quick")}
              title="Switch to quick workflow"
            >
              Start quick worship slide <ExternalLink size={10} />
            </button>
          </div>

          <div className="user-card">
            <div className="avatar user-avatar">A</div>
            <div>
              <b>Worship Team</b>
              <small>Local Workspace</small>
            </div>
            <Settings size={14} />
          </div>
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <button
          className="icon-btn menu-trigger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu size={19} />
        </button>

        <div className="crumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <b>{getBreadcrumbTitle()}</b>
        </div>

        <div className="top-actions">
          <span className="save-state">
            <i />
            {currentView === "editor" ? "All changes saved" : "Autosave on"}
          </span>

          <button
            className="icon-btn"
            title="Toggle appearance"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark/light appearance"
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="avatar top-avatar" aria-label="User profile">
            A
          </button>
        </div>
      </header>
    </>
  );
}

