import React, { useState, useEffect } from "react";
import { Search, Music, Disc, Loader2, Check } from "lucide-react";

export function SongSearchTab({ onSelectSong, selectedSong }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleSuggestions = [
    "Way Maker",
    "Goodness of God",
    "10,000 Reasons",
    "Nandri Yesu Raja",
    "What a Beautiful Name"
  ];

  const handleSearch = async (searchTerm) => {
    const term = searchTerm !== undefined ? searchTerm : query;
    if (!term || !term.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(term.trim())}`);
      if (!res.ok) throw new Error("Search request failed");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Unable to search songs right now. You can also paste lyrics manually.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggested) => {
    setQuery(suggested);
    handleSearch(suggested);
  };

  return (
    <div className="song-search-container">
      <div className="search-box" style={{ width: "100%", height: "42px" }}>
        <Search size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by song name or artist (e.g. Way Maker, Hillsong, Chris Tomlin)..."
          aria-label="Search worship songs"
        />
        {query && (
          <button
            className="text-btn"
            style={{ fontSize: "11px", padding: "0 6px" }}
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
          >
            Clear
          </button>
        )}
        <button
          className="primary-btn compact"
          onClick={() => handleSearch()}
          disabled={loading || !query.trim()}
          style={{ height: "30px", marginLeft: "4px" }}
        >
          {loading ? <Loader2 size={13} className="ai-spin" /> : "Search"}
        </button>
      </div>

      {/* Suggested Search Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "10px 0 14px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "9px", color: "var(--muted)", letterSpacing: "1px" }}>QUICK PICKS:</span>
        {sampleSuggestions.map((item) => (
          <button
            key={item}
            type="button"
            className="category-chip"
            style={{ padding: "4px 9px", fontSize: "9px" }}
            onClick={() => handleSuggestionClick(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(220, 80, 80, 0.1)", border: "1px solid rgba(220, 80, 80, 0.25)", borderRadius: "6px", color: "#fca5a5", fontSize: "10px", margin: "10px 0" }}>
          {error}
        </div>
      )}

      {/* Results List */}
      {results.length > 0 && (
        <div>
          <div style={{ fontSize: "9px", color: "var(--muted)", letterSpacing: "1px", margin: "14px 0 8px" }}>
            SEARCH RESULTS ({results.length}) — CLICK A SONG TO SELECT
          </div>
          <div className="search-results-grid">
            {results.map((song) => {
              const isSelected = selectedSong && selectedSong.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`song-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectSong(song)}
                >
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="song-card-art"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/backgrounds/sunrise-photo.jpeg";
                    }}
                  />
                  <div className="song-card-info">
                    <b className="song-card-title">{song.title}</b>
                    <small className="song-card-artist">{song.artist}</small>
                    <div className="song-card-meta">
                      {song.releaseYear && <span>{song.releaseYear}</span>}
                      {song.album && <span>• {song.album}</span>}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ color: "var(--gold)" }}>
                      <Check size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

