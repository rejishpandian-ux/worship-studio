import React from "react";
import {
  Sparkles,
  ArrowRight,
  Music,
  BookOpen,
  Palette,
  Play,
  Download,
  Trash2,
  Copy
} from "lucide-react";
import { getThemeById } from "../../utils/themeDefinitions.js";
import { exportToPowerPoint } from "../../utils/pptxGenerator.js";

export function HomeOverview({
  projects = [],
  onOpenProject,
  onNewSong,
  onOpenThemes,
  onDeleteProject,
  onDuplicateProject,
  showToast
}) {
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
    <div className="page-wrap">
      {/* Editorial Sacred Hero */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={12} />
            PEACEAG PRESENTATION · WORSHIP STUDIO
          </div>
          <h1>
            Sacred slides.<br />
            <span>Effortless worship.</span>
          </h1>
          <p>
            Transform song lyrics into widescreen church presentations in seconds.
            Engineered with high-contrast typography and spiritual visual atmospheres.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={onNewSong}>
              <Sparkles size={15} /> New Presentation
            </button>
            <button className="text-btn" onClick={onOpenThemes}>
              Browse Themes <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Sacred Cross & Orbit Art */}
        <div className="hero-art">
          <div className="art-orbit" />
          <div className="art-orbit orbit-two" />
          <div className="art-cross">†</div>
          <div className="art-spark spark-one">✦</div>
          <div className="art-spark spark-two">✦</div>
          <div className="art-caption">
            <span>HOLY UNTO THE LORD</span>
            <b>Sunday Gathering</b>
            <i />
          </div>
        </div>

        <div className="hero-foot">
          <span>
            <i /> Connected to local IndexedDB workspace
          </span>
          <span>16:9 PROJECTOR OPTIMIZED</span>
        </div>
      </section>

      {/* Start Options */}
      <div className="section-heading">
        <div>
          <div className="eyebrow small-eye">CREATION TOOLS</div>
          <h2>Start a new presentation</h2>
        </div>
      </div>

      <div className="start-grid">
        <button
          type="button"
          className="start-card"
          onClick={onNewSong}
        >
          <div className="start-icon">
            <Music size={17} />
          </div>
          <ArrowRight size={14} className="card-arrow" />
          <b>Worship Song</b>
          <p>Search by title, paste YouTube link, or paste lyrics with AI formatting.</p>
          <small>
            INPUT HUB <span>· 3 METHODS</span>
          </small>
        </button>

        <button
          type="button"
          className="start-card verse-card"
          onClick={onNewSong}
        >
          <div className="start-icon">
            <BookOpen size={17} />
          </div>
          <ArrowRight size={14} className="card-arrow" />
          <b>Scripture Passage</b>
          <p>Format Bible verses and sermon notes into clean, high-legibility slides.</p>
          <small>
            BIBLE TEXT <span>· 16:9 PROJECTION</span>
          </small>
        </button>

        <button
          type="button"
          className="start-card theme-card"
          onClick={onOpenThemes}
        >
          <div className="start-icon">
            <Palette size={17} />
          </div>
          <ArrowRight size={14} className="card-arrow" />
          <b>Choose Theme</b>
          <p>Explore 28 liturgical backgrounds from Deep Worship to Christmas Glory.</p>
          <small>
            GALLERY <span>· 28 ATMOSPHERES</span>
          </small>
        </button>
      </div>

      {/* Recent Presentations */}
      <div className="recent-head">
        <div>
          <div className="eyebrow small-eye">PROJECT LIBRARY</div>
          <h2>Recent Presentations</h2>
        </div>
        <span style={{ fontSize: "10px", color: "var(--muted)" }}>
          {projects.length} Saved Projects
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="empty-projects">
          <div className="empty-icon">
            <Music size={22} />
          </div>
          <b>No presentations saved yet</b>
          <p>Click "New Presentation" above to create your first worship slide deck.</p>
          <button className="primary-btn" onClick={onNewSong}>
            Create First Slide
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.slice(0, 6).map((p) => {
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

