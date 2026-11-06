import React, { useState } from "react";
import { Sparkles, Loader2, Wand2 } from "lucide-react";
import { detectLyricsLanguage } from "../../utils/lyricsParser.js";

export function ManualPasteTab({
  title,
  setTitle,
  lyrics,
  setLyrics,
  onAiFormatted
}) {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState(null);

  const wordCount = lyrics.trim()
    ? lyrics.trim().split(/\s+/u).filter(Boolean).length
    : 0;
  const language = detectLyricsLanguage(lyrics);

  const handleAiFormat = async () => {
    if (!lyrics.trim()) return;

    setLoadingAi(true);
    setAiMessage(null);

    try {
      const res = await fetch("/api/ai/format-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lyrics: lyrics,
          title: title
        })
      });

      if (!res.ok) throw new Error("AI formatting request failed");
      const data = await res.json();

      if (data.formattedLyrics) {
        setLyrics(data.formattedLyrics);
        setAiMessage(data.message || "Lyrics successfully organized!");
        if (onAiFormatted) {
          onAiFormatted(data.formattedLyrics);
        }
      }
    } catch (err) {
      console.error("AI format error:", err);
      setAiMessage("Failed to run AI organization. Standard parser will be used.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="manual-paste-container">
      <label className="control-label quick-title-label">
        <span>
          Song title <span className="optional">OPTIONAL</span>
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Leave blank to auto-title from the first lyrics"
        />
      </label>

      <label className="control-label quick-lyrics-label">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Paste full lyrics (English, Tamil, or bilingual)</span>
          <button
            type="button"
            className="ai-magic-btn"
            onClick={handleAiFormat}
            disabled={loadingAi || !lyrics.trim()}
            style={{ fontSize: "9px", height: "26px", padding: "0 8px" }}
          >
            {loadingAi ? (
              <>
                <Loader2 size={12} className="ai-spin" />
                Organizing...
              </>
            ) : (
              <>
                <Wand2 size={12} />
                AI Auto-Organize Stanzas
              </>
            )}
          </button>
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="Paste lyrics here. Blank lines separate slide stanzas.
Example:
Verse 1
You are here moving in our midst
I worship You I worship You

Chorus
Way Maker Miracle Worker
Promise Keeper Light in the darkness"
          rows={10}
        />
      </label>

      {aiMessage && (
        <div style={{ padding: "8px 12px", background: "rgba(213, 181, 120, 0.12)", border: "1px solid rgba(213, 181, 120, 0.25)", borderRadius: "6px", color: "var(--gold)", fontSize: "9px", marginTop: "8px" }}>
          {aiMessage}
        </div>
      )}

      <div className="quick-form-footer">
        <span>
          Detected language: <b>{language}</b> <span>·</span> {wordCount} words
        </span>
      </div>
    </div>
  );
}

