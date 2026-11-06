import React, { useState } from "react";
import { Youtube, Loader2, FileText, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export function YouTubeTab({ onApplyLyrics, onSetTitle }) {
  const [url, setUrl] = useState("");
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [transcriptStatus, setTranscriptStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleInspectUrl = async (inputUrl) => {
    const targetUrl = inputUrl !== undefined ? inputUrl : url;
    if (!targetUrl || !targetUrl.trim()) return;

    setLoadingMeta(true);
    setError(null);
    setTranscriptStatus(null);

    try {
      const res = await fetch(`/api/youtube/metadata?url=${encodeURIComponent(targetUrl.trim())}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Invalid YouTube link or video not found");
      }
      const data = await res.json();
      setVideoData(data);
      if (onSetTitle && data.title) {
        onSetTitle(data.title);
      }
    } catch (err) {
      console.error("YouTube inspect error:", err);
      setError(err.message || "Failed to load video information. Please verify the URL.");
      setVideoData(null);
    } finally {
      setLoadingMeta(false);
    }
  };

  const handleFetchTranscript = async () => {
    if (!videoData || !videoData.videoId) return;

    setLoadingTranscript(true);
    setTranscriptStatus(null);

    try {
      const res = await fetch(`/api/youtube/transcript?id=${encodeURIComponent(videoData.videoId)}`);
      const data = await res.json();

      if (data.available && data.lyrics) {
        setTranscriptStatus({
          success: true,
          message: data.message || "Transcript loaded successfully!"
        });
        if (onApplyLyrics) {
          onApplyLyrics(data.lyrics, videoData.title);
        }
      } else {
        setTranscriptStatus({
          success: false,
          message: data.message || "No public transcript found. Please use the Manual Paste tab."
        });
      }
    } catch (err) {
      console.error("Transcript fetch error:", err);
      setTranscriptStatus({
        success: false,
        message: "Failed to retrieve transcript. Please paste lyrics manually."
      });
    } finally {
      setLoadingTranscript(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.includes("youtu")) {
        setUrl(text);
        handleInspectUrl(text);
      }
    } catch {
      // Clipboard read permission might not be granted
    }
  };

  return (
    <div className="youtube-tab-container">
      <label className="control-label">
        Paste YouTube Song Link
        <div className="search-box" style={{ width: "100%", height: "42px", marginTop: "6px" }}>
          <Youtube size={17} style={{ color: "#ef4444" }} />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInspectUrl()}
            placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
            aria-label="YouTube URL input"
          />
          <button
            type="button"
            className="text-btn"
            style={{ fontSize: "11px", padding: "0 6px" }}
            onClick={handlePasteClipboard}
            title="Paste from clipboard"
          >
            Paste
          </button>
          <button
            type="button"
            className="primary-btn compact"
            onClick={() => handleInspectUrl()}
            disabled={loadingMeta || !url.trim()}
            style={{ height: "30px", marginLeft: "4px" }}
          >
            {loadingMeta ? <Loader2 size={13} className="ai-spin" /> : "Inspect"}
          </button>
        </div>
      </label>

      {error && (
        <div style={{ padding: "10px 14px", background: "rgba(220, 80, 80, 0.1)", border: "1px solid rgba(220, 80, 80, 0.25)", borderRadius: "6px", color: "#fca5a5", fontSize: "10px", margin: "12px 0" }}>
          {error}
        </div>
      )}

      {/* Video Details Card */}
      {videoData && (
        <div className="yt-preview-card">
          <img
            src={videoData.thumbnail}
            alt={videoData.title}
            className="yt-preview-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/backgrounds/deep-worship.jpeg";
            }}
          />
          <div className="yt-preview-details">
            <h4 className="yt-preview-title">{videoData.title}</h4>
            <div className="yt-preview-author">
              <span>{videoData.author}</span>
              {videoData.videoUrl && (
                <a
                  href={videoData.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-btn"
                  style={{ fontSize: "9px" }}
                >
                  Watch on YouTube <ExternalLink size={10} />
                </a>
              )}
            </div>

            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="ai-magic-btn"
                onClick={handleFetchTranscript}
                disabled={loadingTranscript}
              >
                {loadingTranscript ? (
                  <>
                    <Loader2 size={13} className="ai-spin" />
                    Extracting Transcript...
                  </>
                ) : (
                  <>
                    <FileText size={13} />
                    Extract Captions / Lyrics
                  </>
                )}
              </button>
            </div>

            {transcriptStatus && (
              <div
                className={`yt-status-badge ${
                  transcriptStatus.success ? "success" : "warning"
                }`}
              >
                {transcriptStatus.success ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                {transcriptStatus.message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

