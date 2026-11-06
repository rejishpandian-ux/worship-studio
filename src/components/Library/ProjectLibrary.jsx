import React, { useState } from "react";
import { Search, Download, Trash2, Copy, Plus, Music, ArrowRight } from "lucide-react";
import { getThemeById } from "../../utils/themeDefinitions.js";
import { exportToPowerPoint } from "../../utils/pptxGenerator.js";

export function ProjectLibrary({
  projects = [],
  onOpenProject,
  onNewProject,
  onDeleteProject,
  onDuplicateProject,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = projects.filter((p) =>
    (p.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (project, e) => {
    e.stopPropagation();
    try {
      await exportToPowerPoint(project);
      showToast(`Exported "${project.title}" to PowerPoint`);
    } catch {
      showToast("Failed to export PowerPoint.");
    }
  };

  return (
    <div className="page-wrap library-page">
      <div className="page-title-row">
        <div>
          <h1>Your Projects</h1>
          <p>All worship presentations saved in your local workspace database.</p>
        </div>
        <button className="primary-btn" onClick={onNewProject}>
          <Plus size={15} /> New Presentation
        </button>
      </div>

      <div className="library-tools">
        <div className="search-box" style={{ flex: 1, maxWidth: "400px" }}>
          <Search size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved presentations..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-icon">
            <Music size={22} />
          </div>
          <b>No matching presentations</b>
          <p>
            {projects.length === 0
              ? "You haven't created any presentations yet."
              : `No projects match "${searchQuery}".`}
          </p>
          <button className="primary-btn" onClick={onNewProject}>
            Create New Presentation
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((p) => {
            const theme = getThemeById(p.themeId || "sunrise-photo");
            const bg = p.customImage
              ? {
                  backgroundImage: `url(${p.customImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              : theme.image
              ? {
                  backgroundImage: `url(${theme.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }
              : {
                  background: theme.background
                };

            return (
              <div key={p.id} className="project-card">
                <button
                  type="button"
                  className="project-art"
                  style={bg}
                  onClick={() => onOpenProject(p)}
                >
                  <span>†</span>
                  <b>{p.title}</b>
                  <i>{p.slides?.length || 0} SLIDES</i>
                </button>
                <div className="project-meta">
                  <div>
                    <b>{p.title}</b>
                    <small>
                      {new Date(p.updatedAt || Date.now()).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="icon-btn mini"
                    title="Export PPTX"
                    onClick={(e) => handleDownload(p, e)}
                  >
                    <Download size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn mini"
                    title="Duplicate project"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateProject(p);
                    }}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn mini"
                    title="Delete project"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(p.id);
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

