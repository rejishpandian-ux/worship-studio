import React from "react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { getThemeById } from "../../utils/themeDefinitions.js";

export function CanvasStage({
  project,
  currentSlideIndex,
  setCurrentSlideIndex,
  onUpdateSlideText,
  onStartPresenting
}) {
  const slides = project.slides || [];
  const currentSlide = slides[currentSlideIndex] || slides[0] || { text: "" };
  const theme = getThemeById(currentSlide.themeId || project.themeId || "sunrise-photo");
  const accentColor = theme.accent || "#d5b578";

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const getBackgroundStyle = () => {
    if (currentSlide.customImage || project.customImage) {
      return {
        backgroundImage: `url(${currentSlide.customImage || project.customImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    if (theme.image) {
      return {
        backgroundImage: `url(${theme.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      };
    }
    return {
      background: theme.background
    };
  };

  const getTextStyle = () => {
    return {
      fontFamily: project.font || "Cormorant Garamond, Georgia, serif",
      fontSize: `${project.fontSize || 34}px`,
      color: project.textColor || "#fffaf0",
      fontWeight: project.bold ? 700 : 400,
      fontStyle: project.italic ? "italic" : "normal",
      textAlign: project.textAlign || "center",
      textShadow:
        project.glow > 0
          ? `0 0 ${project.glow * 0.4}px ${accentColor}80, 0 2px 10px rgba(0,0,0,0.8)`
          : "0 2px 10px rgba(0,0,0,0.8)"
    };
  };

  return (
    <div className="preview-column">
      <div className="preview-top">
        <div>
          <b>Live Presentation Stage</b>
          <small>16:9 Widescreen Church Projector Canvas</small>
        </div>
        <div className="preview-tools">
          <span className="live-save">
            <i /> Synced to slide deck
          </span>
          <button
            className="icon-btn"
            onClick={() => onStartPresenting(currentSlideIndex)}
            title="Present full screen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="canvas-stage">
        <div
          className={`slide-canvas ${!project.panel ? "no-panel" : ""}`}
          style={getBackgroundStyle()}
        >
          {/* Glass Text Backdrop Panel */}
          {project.panel && (
            <div
              className="canvas-text-panel"
              style={{
                backgroundColor: `rgba(16, 19, 29, ${(project.panelOpacity ?? 28) / 100})`
              }}
            >
              {currentSlide.sectionLabel && (
                <div className="canvas-kicker">{currentSlide.sectionLabel}</div>
              )}
              <div
                className="canvas-text"
                contentEditable
                suppressContentEditableWarning
                style={getTextStyle()}
                onBlur={(e) => onUpdateSlideText(currentSlideIndex, e.currentTarget.innerText)}
              >
                {currentSlide.text}
              </div>
              <div
                className="canvas-rule"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          )}

          {!project.panel && (
            <div
              className="canvas-text"
              contentEditable
              suppressContentEditableWarning
              style={{ ...getTextStyle(), padding: "0 10%" }}
              onBlur={(e) => onUpdateSlideText(currentSlideIndex, e.currentTarget.innerText)}
            >
              {currentSlide.text}
            </div>
          )}

          {/* Watermark */}
          {(project.watermarkVisible ?? true) && (
            <div
              className="presentation-watermark"
              style={{ opacity: (project.watermarkOpacity ?? 40) / 100 }}
            >
              PEACEAG PRESENTATION
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="preview-footer">
        <span>
          Slide {currentSlideIndex + 1} of {slides.length}
        </span>
        <div className="foot-nav">
          <button
            className="round-nav"
            onClick={handlePrev}
            disabled={currentSlideIndex <= 0}
            aria-label="Previous slide"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="slide-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentSlideIndex ? "active-dot" : ""}`}
                onClick={() => setCurrentSlideIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            className="round-nav"
            onClick={handleNext}
            disabled={currentSlideIndex >= slides.length - 1}
            aria-label="Next slide"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

