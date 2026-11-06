import React from "react";
import { ChevronUp, ChevronDown, Trash2, X, Plus, Sparkles } from "lucide-react";

export function StanzaDrawer({
  isOpen,
  onClose,
  sections = [],
  onUpdateSections,
  onSyncSlides
}) {
  if (!isOpen) return null;

  const handleLabelChange = (index, newLabel) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], label: newLabel };
    onUpdateSections(updated);
  };

  const handleTextChange = (index, newText) => {
    const lines = newText.split("\n").map((l) => l.trim()).filter(Boolean);
    const updated = [...sections];
    updated[index] = { ...updated[index], lines };
    onUpdateSections(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onUpdateSections(updated);
  };

  const handleMoveDown = (index) => {
    if (index === sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onUpdateSections(updated);
  };

  const handleDelete = (index) => {
    if (sections.length <= 1) return;
    const updated = sections.filter((_, i) => i !== index);
    onUpdateSections(updated);
  };

  const handleAddSection = () => {
    const newSection = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sec_${Date.now()}`,
      label: `Verse ${sections.length + 1}`,
      lines: ["Your new lyrics line here"]
    };
    onUpdateSections([...sections, newSection]);
  };

  return (
    <div className="lyrics-drawer">
      <div className="drawer-title">
        <div>
          <b>Stanza & Song Section Editor</b>
          <small>Reorganize verses, choruses, and custom lines</small>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            className="primary-btn compact"
            onClick={onSyncSlides}
          >
            <Sparkles size={12} /> Sync to Slides
          </button>
          <button className="icon-btn mini" onClick={onClose} aria-label="Close drawer">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="section-list">
        <div className="section-list-head">
          <span style={{ fontSize: "10px", color: "var(--muted)" }}>
            SECTIONS ({sections.length})
          </span>
          <button
            type="button"
            className="text-btn"
            style={{ fontSize: "10px" }}
            onClick={handleAddSection}
          >
            <Plus size={12} /> Add Stanza
          </button>
        </div>

        {sections.map((section, idx) => (
          <div key={section.id || idx} className="section-row">
            <input
              type="text"
              value={section.label || ""}
              onChange={(e) => handleLabelChange(idx, e.target.value)}
              placeholder="e.g. Verse 1"
            />
            <div className="section-move">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                title="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === sections.length - 1}
                title="Move down"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <button
              type="button"
              className="icon-btn mini"
              onClick={() => handleDelete(idx)}
              title="Delete section"
              style={{ color: "var(--muted)" }}
            >
              <Trash2 size={13} />
            </button>
            <textarea
              value={section.lines ? section.lines.join("\n") : ""}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              placeholder="Lines in this stanza (one per line)..."
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

