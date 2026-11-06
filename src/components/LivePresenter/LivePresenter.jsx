import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, EyeOff, Maximize, Minimize } from "lucide-react";
import { getThemeById } from "../../utils/themeDefinitions.js";

export function LivePresenter({
  project,
  initialSlideIndex = 0,
  onClose
}) {
  const [slideIndex, setSlideIndex] = useState(initialSlideIndex);
  const [isBlackout, setIsBlackout] = useState(false);
  const [isBlankWhite, setIsBlankWhite] = useState(false);

  const slides = project.slides || [];
  const currentSlide = slides[slideIndex] || { text: "" };
  const theme = getThemeById(currentSlide.themeId || project.themeId || "sunrise-photo");
  const accentColor = theme.accent || "#d5b578";

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          if (slideIndex < slides.length - 1) {
            setSlideIndex((prev) => prev + 1);
            setIsBlackout(false);
            setIsBlankWhite(false);
          }
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          if (slideIndex > 0) {
            setSlideIndex((prev) => prev - 1);
            setIsBlackout(false);
            setIsBlankWhite(false);
          }
          break;
        case "b":
        case "B":
          setIsBlackout((prev) => !prev);
          setIsBlankWhite(false);
          break;
        case "w":
        case "W":
          setIsBlankWhite((prev) => !prev);
          setIsBlackout(false);
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideIndex, slides.length, onClose]);

  const getBackgroundStyle = () => {
    if (isBlackout) {
      return { background: "#000000" };
    }
    if (isBlankWhite) {
      return { background: "#ffffff" };
    }
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
      fontSize: `clamp(28px, 4vw, 54px)`,
      color: project.textColor || "#fffaf0",
      fontWeight: project.bold ? 700 : 400,
      fontStyle: project.italic ? "italic" : "normal",
      textAlign: project.textAlign || "center",
      textShadow:
        project.glow > 0
          ? `0 0 ${project.glow * 0.5}px ${accentColor}90, 0 3px 18px rgba(0,0,0,0.9)`
          : "0 3px 18px rgba(0,0,0,0.9)"
    };
  };

  return (
    <div className={`live-view ${isBlackout ? "blackout" : ""}`}>
      <div className="live-slide live-fade" style={getBackgroundStyle()}>
        {!isBlackout && !isBlankWhite && (
          <>
            {project.panel ? (
              <div
                className="live-panel"
                style={{
                  backgroundColor: `rgba(16, 19, 29, ${(project.panelOpacity ?? 28) / 100})`
                }}
              >
                <div className="live-text" style={getTextStyle()}>
                  {currentSlide.text}
                </div>
              </div>
            ) : (
              <div className="live-text" style={{ ...getTextStyle(), padding: "0 10vw" }}>
                {currentSlide.text}
              </div>
            )}

            {(project.watermarkVisible ?? true) && (
              <div
                className="presentation-watermark"
                style={{ opacity: (project.watermarkOpacity ?? 40) / 100 }}
              >
                PEACEAG PRESENTATION
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating HUD Controls */}
      <div className="live-hud">
        <span>
          <i>{project.title}</i> — Slide {slideIndex + 1} of {slides.length}
        </span>
        <div>
          <button
            type="button"
            title="Blackout (Key: B)"
            onClick={() => {
              setIsBlackout(!isBlackout);
              setIsBlankWhite(false);
            }}
          >
            <EyeOff size={15} />
          </button>
          <button
            type="button"
            title="Previous (Key: Left Arrow)"
            disabled={slideIndex <= 0}
            onClick={() => setSlideIndex((p) => Math.max(0, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            title="Next (Key: Right Arrow / Space)"
            disabled={slideIndex >= slides.length - 1}
            onClick={() => setSlideIndex((p) => Math.min(slides.length - 1, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            title="Exit Fullscreen (Key: Esc)"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

