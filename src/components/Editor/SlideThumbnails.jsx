import React from "react";
import { Plus, Copy, Trash2 } from "lucide-react";
import { getThemeById } from "../../utils/themeDefinitions.js";

export function SlideThumbnails({
  slides = [],
  currentSlideIndex,
  setCurrentSlideIndex,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  projectThemeId,
  projectCustomImage
}) {
  return (
    <aside className="slides-column">
      <div className="column-heading">
        <b>
          Slides <span>({slides.length})</span>
        </b>
        <button
          className="icon-btn mini"
          onClick={onAddSlide}
          title="Add empty slide"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="slide-list">
        {slides.map((slide, idx) => {
          const isActive = idx === currentSlideIndex;
          const theme = getThemeById(slide.themeId || projectThemeId || "sunrise-photo");

          const thumbBg = slide.customImage || projectCustomImage
            ? {
                backgroundImage: `url(${slide.customImage || projectCustomImage})`,
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
            <div
              key={slide.id || idx}
              className={`slide-thumb-wrap ${isActive ? "active" : ""}`}
              onClick={() => setCurrentSlideIndex(idx)}
            >
              <div className="slide-thumb" style={thumbBg}>
                <div className="thumb-label">{slide.text}</div>
                <small>{idx + 1}</small>
              </div>

              {/* Hover / Active Controls */}
              <div className="thumb-controls">
                <button
                  type="button"
                  title="Duplicate slide"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSlide(idx);
                  }}
                >
                  <Copy size={11} />
                </button>
                {slides.length > 1 && (
                  <button
                    type="button"
                    title="Delete slide"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSlide(idx);
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button className="add-slide" onClick={onAddSlide}>
          <Plus size={12} />
          <span>New Slide</span>
        </button>
      </div>

      <div className="left-tip">
        <span>Click any thumbnail to preview or edit text directly on canvas.</span>
      </div>
    </aside>
  );
}

