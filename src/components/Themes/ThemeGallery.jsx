import React, { useState } from "react";
import { Search, Heart, Check, Sparkles, ArrowLeft } from "lucide-react";
import { THEMES, THEME_CATEGORIES } from "../../utils/themeDefinitions.js";

export function ThemeGallery({
  project,
  onSelectTheme,
  onBack,
  showToast
}) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("worship-favorites") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = (themeId, e) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(themeId)) {
      updated = favorites.filter((id) => id !== themeId);
      showToast("Removed from favorites");
    } else {
      updated = [...favorites, themeId];
      showToast("Saved to favorites");
    }
    setFavorites(updated);
    try {
      localStorage.setItem("worship-favorites", JSON.stringify(updated));
    } catch { }
  };

  const filteredThemes = THEMES.filter((t) => {
    const matchesCategory =
      selectedCategory === "All"
        ? true
        : selectedCategory === "Favorites"
          ? favorites.includes(t.id)
          : t.category === selectedCategory;

    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-wrap theme-page">
      <div className="page-title-row">
        <div>
          <button
            type="button"
            className="text-btn"
            onClick={onBack}
            style={{ marginBottom: "8px" }}
          >
            <ArrowLeft size={13} /> Back to Studio
          </button>
          <h1>Worship Themes</h1>
          <p>
            28 curated theological atmospheres designed for 16:9 widescreen church projector screens.
          </p>
        </div>
      </div>

      <div className="theme-controls">
        <div className="search-box">
          <Search size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search themes by name or category..."
          />
        </div>

        <div className="category-scroll">
          {THEME_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? "chosen" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-count">
        SHOWING <span>{filteredThemes.length}</span> OF 28 THEMES
      </div>

      <div className="theme-grid">
        {filteredThemes.map((t) => {
          const isSelected = project.themeId === t.id && !project.customImage;
          const isFav = favorites.includes(t.id);

          const cardBg = t.image
            ? {
              backgroundImage: `url(${t.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }
            : {
              background: t.background
            };

          return (
            <div
              key={t.id}
              className={`theme-card ${isSelected ? "current-theme" : ""}`}
              onClick={() => onSelectTheme(t.id)}
            >
              <div className="theme-image" style={cardBg}>
                <span className="theme-style">{t.style}</span>
                <button
                  type="button"
                  className={`theme-heart ${isFav ? "is-favorite" : ""}`}
                  onClick={(e) => toggleFavorite(t.id, e)}
                  title={isFav ? "Remove favorite" : "Add favorite"}
                >
                  <Heart size={13} fill={isFav ? "currentColor" : "none"} />
                </button>
                <div className="theme-select" title="Selected theme">
                  <Check size={14} />
                </div>
                <div className="theme-preview-text">Holy, Holy, Holy</div>
              </div>

              <div className="theme-card-info">
                <div>
                  <b>{t.name}</b>
                  <small>{t.category}</small>
                </div>
                <i style={{ backgroundColor: t.accent || "var(--gold)" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

