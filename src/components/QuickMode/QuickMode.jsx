import React, { useState } from "react";
import {
  Search,
  Youtube,
  FileText,
  Sparkles,
  Play,
  Download,
  Edit3,
  ArrowRight,
  Music,
  CheckCircle,
  Loader2
} from "lucide-react";
import { SongSearchTab } from "./SongSearchTab.jsx";
import { YouTubeTab } from "./YouTubeTab.jsx";
import { ManualPasteTab } from "./ManualPasteTab.jsx";
import { parseLyricsToSections, sectionsToSlides, autoGenerateTitle } from "../../utils/lyricsParser.js";
import { exportToPowerPoint } from "../../utils/pptxGenerator.js";
import { saveProject } from "../../db/indexedDb.js";

export function QuickMode({
  project,
  setProject,
  setCurrentView,
  onStartPresenting,
  recentProjects = [],
  onOpenProject,
  showToast
}) {
  const [activeTab, setActiveTab] = useState("manual"); // 'search' | 'youtube' | 'manual'
  const [songTitle, setSongTitle] = useState("");
  const [lyricsText, setLyricsText] = useState("");
  const [selectedSongMeta, setSelectedSongMeta] = useState(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Callback when a song is picked from Search
  const handleSelectSong = (song) => {
    setSelectedSongMeta(song);
    setSongTitle(song.title);
    showToast(`Selected "${song.title}" by ${song.artist}`);
  };

  // Callback when YouTube transcript is extracted
  const handleApplyYouTubeLyrics = (extractedLyrics, videoTitle) => {
    setLyricsText(extractedLyrics);
    if (!songTitle && videoTitle) {
      setSongTitle(videoTitle);
    }
    setActiveTab("manual");
    showToast("YouTube transcript loaded into lyrics editor!");
  };

  // Main generation handler
  const handleGeneratePresentation = async () => {
    if (!lyricsText.trim()) {
      showToast("Please enter or import song lyrics first.");
      return;
    }

    const finalTitle = songTitle.trim() || autoGenerateTitle(lyricsText);
    const sections = parseLyricsToSections(lyricsText);
    const slides = sectionsToSlides(sections, project.themeId || "sunrise-photo");

    const updatedProject = {
      ...project,
      title: finalTitle,
      lyrics: lyricsText,
      sections,
      slides,
      customImage: selectedSongMeta?.artwork || project.customImage || null,
      updatedAt: new Date().toISOString()
    };

    setProject(updatedProject);
    setIsGenerated(true);

    try {
      await saveProject(updatedProject);
      showToast(`Presentation "${finalTitle}" created and saved!`);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const handleDownloadPptx = async () => {
    setIsExporting(true);
    try {
      await exportToPowerPoint(project);
      showToast("PowerPoint file generated successfully!");
    } catch (err) {
      console.error("PPTX error:", err);
      showToast("Failed to generate PowerPoint file.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-wrap quick-page">
      {/* Hero Section */}
      <section className="quick-hero">
        <div className="eyebrow">
          <Sparkles size={13} />
          PEACEAG PRESENTATION · INTELLIGENT WORSHIP PLATFORM
        </div>
        <h1>
          Paste lyrics or search songs.<br />
          <span>Present in moments.</span>
        </h1>
        <p>
          Worship songs automatically formatted into 16:9 widescreen slides for church projectors.
          Search by song, import from YouTube, or paste lyrics with Google Gemini AI.
        </p>
        <button
          className="text-btn studio-link"
          onClick={() => setCurrentView("editor")}
        >
          Open Presentation Studio <ArrowRight size={14} />
        </button>
      </section>

      {/* 3-Way Input Hub */}
      <section className="quick-form">
        <div className="quick-form-head">
          <div>
            <div className="eyebrow small-eye">INPUT HUB</div>
            <h2>Choose how to load your song</h2>
          </div>
          <span className="quick-step">
            <i /> 3 SMART INPUT METHODS
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="input-tabs-nav">
          <button
            type="button"
            className={`input-tab-btn ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <Search size={14} />
            Search Song or Artist
          </button>
          <button
            type="button"
            className={`input-tab-btn ${activeTab === "youtube" ? "active" : ""}`}
            onClick={() => setActiveTab("youtube")}
          >
            <Youtube size={14} />
            Paste YouTube URL
          </button>
          <button
            type="button"
            className={`input-tab-btn ${activeTab === "manual" ? "active" : ""}`}
            onClick={() => setActiveTab("manual")}
          >
            <FileText size={14} />
            Paste Lyrics Manually
          </button>
        </div>

        {/* Tab 1: Song Search */}
        {activeTab === "search" && (
          <div style={{ marginBottom: "18px" }}>
            <SongSearchTab
              onSelectSong={handleSelectSong}
              selectedSong={selectedSongMeta}
            />
            {selectedSongMeta && (
              <div style={{ marginTop: "14px", padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "9px", color: "var(--gold)", letterSpacing: "1px" }}>SELECTED SONG:</span>
                  <b style={{ display: "block", fontSize: "12px", marginTop: "2px" }}>{selectedSongMeta.title} — {selectedSongMeta.artist}</b>
                </div>
                <button
                  type="button"
                  className="primary-btn compact"
                  onClick={() => setActiveTab("manual")}
                >
                  Proceed to Lyrics <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: YouTube URL */}
        {activeTab === "youtube" && (
          <div style={{ marginBottom: "18px" }}>
            <YouTubeTab
              onApplyLyrics={handleApplyYouTubeLyrics}
              onSetTitle={(t) => setSongTitle(t)}
            />
          </div>
        )}

        {/* Tab 3: Manual Paste */}
        <ManualPasteTab
          title={songTitle}
          setTitle={setSongTitle}
          lyrics={lyricsText}
          setLyrics={setLyricsText}
        />

        <div style={{ marginTop: "18px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="primary-btn"
            onClick={handleGeneratePresentation}
            disabled={!lyricsText.trim()}
            style={{ minWidth: "220px", height: "40px" }}
          >
            <Sparkles size={16} />
            Generate & Save Presentation
          </button>
        </div>
      </section>

      {/* Generated Ready-to-Present Result Card */}
      {isGenerated && (
        <section className="quick-result">
          <div>
            <div className="eyebrow small-eye">READY TO PRESENT</div>
            <h2>{project.title}</h2>
            <p>
              {project.slides?.length || 0} slides · 16:9 widescreen layout · saved locally
            </p>
          </div>
          <div className="quick-actions">
            <button
              className="primary-btn"
              onClick={() => onStartPresenting(0)}
            >
              <Play size={16} /> Present Now
            </button>
            <button
              className="outline-btn"
              onClick={handleDownloadPptx}
              disabled={isExporting}
            >
              <Download size={15} />
              {isExporting ? "Exporting..." : "Download PPTX"}
            </button>
            <button
              className="outline-btn"
              onClick={() => setCurrentView("editor")}
            >
              <Edit3 size={15} /> Edit in Studio
            </button>
          </div>
        </section>
      )}

      {/* Recent Presentations List */}
      <section className="quick-recent">
        <div className="section-heading">
          <div>
            <div className="eyebrow small-eye">YOUR WORKSPACE</div>
            <h2>Recent Presentations</h2>
          </div>
          {recentProjects.length > 0 && (
            <button
              className="text-btn"
              onClick={() => setCurrentView("library")}
            >
              View all ({recentProjects.length}) <ArrowRight size={12} />
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="quick-empty">
            No worship presentations created yet. Use the input hub above to start.
          </div>
        ) : (
          <div className="quick-song-list">
            {recentProjects.slice(0, 5).map((p) => (
              <div key={p.id} className="quick-song">
                <button
                  className="quick-song-open"
                  onClick={() => onOpenProject(p)}
                >
                  <div className="quick-song-icon">
                    <Music size={15} />
                  </div>
                  <div>
                    <b>{p.title}</b>
                    <small>
                      {p.slides?.length || 0} slides · Updated{" "}
                      {new Date(p.updatedAt || Date.now()).toLocaleDateString()}
                    </small>
                  </div>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

