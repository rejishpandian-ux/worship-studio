import React, { useState } from "react";
import {
  Sparkles,
  Download,
  Play,
  FileText,
  Save,
  Check,
  ChevronRight
} from "lucide-react";
import { SlideThumbnails } from "./SlideThumbnails.jsx";
import { CanvasStage } from "./CanvasStage.jsx";
import { DesignInspector } from "./DesignInspector.jsx";
import { StanzaDrawer } from "./StanzaDrawer.jsx";
import { sectionsToSlides } from "../../utils/lyricsParser.js";
import { exportToPowerPoint } from "../../utils/pptxGenerator.js";
import { saveProject } from "../../db/indexedDb.js";

export function PresentationStudio({
  project,
  setProject,
  onStartPresenting,
  onOpenThemesView,
  showToast
}) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const slides = project.slides || [];

  const handleUpdateProject = (partial) => {
    const updated = {
      ...project,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    setProject(updated);
    saveProject(updated).catch(console.error);
  };

  const handleUpdateSlideText = (slideIdx, newText) => {
    const updatedSlides = [...slides];
    if (updatedSlides[slideIdx]) {
      updatedSlides[slideIdx] = {
        ...updatedSlides[slideIdx],
        text: newText
      };
      handleUpdateProject({ slides: updatedSlides });
    }
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: crypto.randomUUID ? crypto.randomUUID() : `slide_${Date.now()}`,
      text: "New slide text here",
      themeId: project.themeId || "sunrise-photo",
      transition: "fade"
    };
    const updatedSlides = [...slides, newSlide];
    handleUpdateProject({ slides: updatedSlides });
    setCurrentSlideIndex(updatedSlides.length - 1);
  };

  const handleDuplicateSlide = (idx) => {
    const target = slides[idx];
    if (!target) return;
    const duplicated = {
      ...target,
      id: crypto.randomUUID ? crypto.randomUUID() : `slide_${Date.now()}`
    };
    const updatedSlides = [...slides];
    updatedSlides.splice(idx + 1, 0, duplicated);
    handleUpdateProject({ slides: updatedSlides });
    setCurrentSlideIndex(idx + 1);
  };

  const handleDeleteSlide = (idx) => {
    if (slides.length <= 1) return;
    const updatedSlides = slides.filter((_, i) => i !== idx);
    handleUpdateProject({ slides: updatedSlides });
    setCurrentSlideIndex(Math.max(0, Math.min(idx, updatedSlides.length - 1)));
  };

  const handleSyncFromSections = () => {
    if (!project.sections || project.sections.length === 0) return;
    const newSlides = sectionsToSlides(project.sections, project.themeId || "sunrise-photo");
    handleUpdateProject({ slides: newSlides });
    setCurrentSlideIndex(0);
    setDrawerOpen(false);
    showToast("Slides regenerated from updated stanzas!");
  };

  const handleDownloadPptx = async () => {
    setIsExporting(true);
    try {
      await exportToPowerPoint(project);
      showToast("PowerPoint downloaded successfully!");
    } catch (err) {
      console.error("PPTX error:", err);
      showToast("Failed to generate PowerPoint file.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${(project.title || "worship-song").replace(/\s+/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.slides) {
          setProject(parsed);
          saveProject(parsed);
          showToast(`Imported "${parsed.title || "Worship Song"}"`);
        }
      } catch {
        showToast("Invalid JSON project backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="editor-page">
      {/* Top Header */}
      <div className="editor-head">
        <div>
          <div className="eyebrow">
            <span>WORSHIP STUDIO</span>
            <span className="slash">/</span>
            <span>PRESENTATION STUDIO</span>
          </div>
          <input
            className="project-title"
            value={project.title || "Sunday Worship"}
            onChange={(e) => handleUpdateProject({ title: e.target.value })}
            placeholder="Presentation Title"
          />
          <div className="subline">
            <span>
              <i /> {slides.length} slides
            </span>
            <span>·</span>
            <span>16:9 widescreen</span>
          </div>
        </div>

        <div className="editor-actions">
          <button
            type="button"
            className="outline-btn compact"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            <FileText size={13} />
            {drawerOpen ? "Hide Stanzas" : "Edit Stanzas"}
          </button>
          <button
            type="button"
            className="outline-btn compact"
            onClick={handleDownloadPptx}
            disabled={isExporting}
          >
            <Download size={13} />
            {isExporting ? "Exporting..." : "Download PPTX"}
          </button>
          <button
            type="button"
            className="primary-btn compact"
            onClick={() => onStartPresenting(currentSlideIndex)}
          >
            <Play size={13} /> Present Now
          </button>
        </div>
      </div>

      {/* Stanza Drawer */}
      <StanzaDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sections={project.sections || []}
        onUpdateSections={(sections) => handleUpdateProject({ sections })}
        onSyncSlides={handleSyncFromSections}
      />

      {/* 3-Column Layout */}
      <div className="editor-layout">
        <SlideThumbnails
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          projectThemeId={project.themeId}
          projectCustomImage={project.customImage}
        />

        <CanvasStage
          project={project}
          currentSlideIndex={currentSlideIndex}
          setCurrentSlideIndex={setCurrentSlideIndex}
          onUpdateSlideText={handleUpdateSlideText}
          onStartPresenting={onStartPresenting}
        />

        <DesignInspector
          project={project}
          onUpdateProject={handleUpdateProject}
          onOpenThemesView={onOpenThemesView}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />
      </div>
    </div>
  );
}

