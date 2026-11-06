import React from "react";
import { Palette, Download, Upload, RefreshCw, ChevronRight } from "lucide-react";
import { THEMES, getThemeById } from "../../utils/themeDefinitions.js";

export function DesignInspector({
  project,
  onUpdateProject,
  onOpenThemesView,
  onExportJson,
  onImportJson
}) {
  const currentTheme = getThemeById(project.themeId || "sunrise-photo");
  const quickThemes = THEMES.slice(0, 7);

  const englishFonts = [
    "Cormorant Garamond",
    "Inter",
    "Playfair Display",
    "Poppins",
    "Montserrat",
    "Lato",
    "Cinzel",
    "Libre Baskerville"
  ];

  const tamilFonts = [
    "Noto Sans Tamil",
    "Catamaran",
    "Mukta Malar"
  ];

  const handleCustomImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateProject({ customImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="design-column">
      <div className="column-heading design-title">
        <b>Design & Layout</b>
        <button
          className="reset-link"
          onClick={() =>
            onUpdateProject({
              font: "Cormorant Garamond",
              fontSize: 34,
              bold: true,
              italic: false,
              textColor: "#fffaf0",
              textAlign: "center",
              glow: 35,
              panel: true,
              panelOpacity: 28,
              watermarkVisible: true,
              watermarkOpacity: 40
            })
          }
        >
          Reset
        </button>
      </div>

      <div className="design-scroll">
        {/* Theme Section */}
        <div className="setting-block">
          <div className="setting-head">
            <b>BACKGROUND THEME</b>
            <button className="text-link" onClick={onOpenThemesView}>
              Library <ChevronRight size={10} />
            </button>
          </div>

          <button
            className="selected-theme"
            onClick={onOpenThemesView}
            type="button"
          >
            <div
              className="theme-swatch"
              style={{
                backgroundImage: currentTheme.image
                  ? `url(${currentTheme.image})`
                  : undefined,
                background: !currentTheme.image ? currentTheme.background : undefined,
                backgroundSize: "cover"
              }}
            />
            <span>
              <b>{currentTheme.name}</b>
              <small>{currentTheme.category}</small>
            </span>
            <ChevronRight size={14} />
          </button>

          {/* Quick theme swatches */}
          <div className="quick-themes">
            {quickThemes.map((t) => (
              <button
                key={t.id}
                type="button"
                className={t.id === project.themeId ? "picked" : ""}
                style={{
                  backgroundImage: t.image ? `url(${t.image})` : undefined,
                  background: !t.image ? t.background : undefined,
                  backgroundSize: "cover"
                }}
                title={t.name}
                onClick={() => onUpdateProject({ themeId: t.id, customImage: null })}
              />
            ))}
            <label className="upload-tile" title="Upload custom background image">
              <Upload size={12} />
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCustomImageUpload}
              />
            </label>
          </div>

          {project.customImage && (
            <button
              className="text-btn remove-image"
              onClick={() => onUpdateProject({ customImage: null })}
            >
              Remove custom image
            </button>
          )}
        </div>

        {/* Typography Section */}
        <div className="setting-block">
          <div className="setting-head">
            <b>TYPOGRAPHY</b>
          </div>

          <label className="control-label">
            Font Family
            <select
              value={project.font || "Cormorant Garamond"}
              onChange={(e) => onUpdateProject({ font: e.target.value })}
            >
              <optgroup label="English Fonts">
                {englishFonts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tamil Fonts">
                {tamilFonts.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>

          <div className="range-label control-label">
            <span>Font Size</span>
            <b>{project.fontSize || 34} px</b>
          </div>
          <input
            type="range"
            min="24"
            max="52"
            value={project.fontSize || 34}
            className="range"
            onChange={(e) => onUpdateProject({ fontSize: Number(e.target.value) })}
          />

          <div className="style-row">
            <button
              type="button"
              className={`style-toggle ${project.bold ? "active" : ""}`}
              onClick={() => onUpdateProject({ bold: !project.bold })}
              aria-label="Toggle bold"
            >
              B
            </button>
            <button
              type="button"
              className={`style-toggle italic ${project.italic ? "active" : ""}`}
              onClick={() => onUpdateProject({ italic: !project.italic })}
              aria-label="Toggle italic"
            >
              I
            </button>
            <div className="style-spacer" />
            <span className="color-label">Text Color</span>
            <input
              type="color"
              value={project.textColor || "#fffaf0"}
              onChange={(e) => onUpdateProject({ textColor: e.target.value })}
              aria-label="Text color"
            />
          </div>

          <label className="control-label" style={{ marginTop: "12px" }}>
            Text Alignment
            <select
              value={project.textAlign || "center"}
              onChange={(e) => onUpdateProject({ textAlign: e.target.value })}
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </label>

          <div className="range-label control-label">
            <span>Ambient Text Glow</span>
            <b>{project.glow ?? 35}%</b>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={project.glow ?? 35}
            className="range"
            onChange={(e) => onUpdateProject({ glow: Number(e.target.value) })}
          />
        </div>

        {/* Panel & Watermark Section */}
        <div className="setting-block">
          <div className="setting-head">
            <b>BACKDROP & WATERMARK</b>
          </div>

          <div className="toggle-row">
            <div>
              <b>Glass Text Panel</b>
              <small>Rounded contrast backdrop for projection</small>
            </div>
            <button
              type="button"
              className={`switch ${project.panel ? "on" : ""}`}
              onClick={() => onUpdateProject({ panel: !project.panel })}
              aria-label="Toggle glass text panel"
            >
              <i />
            </button>
          </div>

          {project.panel && (
            <>
              <div className="range-label control-label">
                <span>Panel Opacity</span>
                <b>{project.panelOpacity ?? 28}%</b>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                value={project.panelOpacity ?? 28}
                className="range"
                onChange={(e) => onUpdateProject({ panelOpacity: Number(e.target.value) })}
              />
            </>
          )}

          <div className="toggle-row" style={{ marginTop: "16px" }}>
            <div>
              <b>PeaceAG Watermark</b>
              <small>Bottom-right subtle projection tag</small>
            </div>
            <button
              type="button"
              className={`switch ${project.watermarkVisible ?? true ? "on" : ""}`}
              onClick={() =>
                onUpdateProject({ watermarkVisible: !(project.watermarkVisible ?? true) })
              }
              aria-label="Toggle watermark"
            >
              <i />
            </button>
          </div>

          {(project.watermarkVisible ?? true) && (
            <>
              <div className="range-label control-label">
                <span>Watermark Opacity</span>
                <b>{project.watermarkOpacity ?? 40}%</b>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={project.watermarkOpacity ?? 40}
                className="range"
                onChange={(e) => onUpdateProject({ watermarkOpacity: Number(e.target.value) })}
              />
            </>
          )}
        </div>

        {/* File Tools */}
        <div className="setting-block" style={{ borderBottom: "none" }}>
          <button className="export-json" onClick={onExportJson}>
            <Download size={14} />
            <span>Export project JSON backup</span>
            <ChevronRight size={14} />
          </button>
          <label className="export-json" style={{ cursor: "pointer", marginTop: "4px" }}>
            <Upload size={14} />
            <span>Import project JSON</span>
            <ChevronRight size={14} />
            <input
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={onImportJson}
            />
          </label>
        </div>
      </div>
    </aside>
  );
}

