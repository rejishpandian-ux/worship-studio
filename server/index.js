// Worship Studio - Express API & Production Static Server
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { searchSongs } from "./services/songSearchService.js";
import {
  extractYouTubeVideoId,
  fetchYouTubeMetadata,
  fetchYouTubeTranscript
} from "./services/youtubeService.js";
import { formatLyricsWithAI } from "./services/aiLyricsService.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static background assets
app.use("/backgrounds", express.static(path.join(__dirname, "../public/backgrounds")));

// Serve production built frontend if dist exists
app.use(express.static(path.join(__dirname, "../dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Worship Studio API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"),
    time: new Date().toISOString()
  });
});

// 1. Song Discovery: Search by song title or artist
app.get("/api/songs/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Search query 'q' is required" });
  }

  try {
    const results = await searchSongs(String(query));
    res.json({ results });
  } catch (err) {
    console.error("API /api/songs/search error:", err);
    res.status(500).json({ error: "Failed to search songs", message: err.message });
  }
});

// 2. YouTube Video Metadata
app.get("/api/youtube/metadata", async (req, res) => {
  const input = req.query.url || req.query.id;
  if (!input) {
    return res.status(400).json({ error: "Query parameter 'url' or 'id' is required" });
  }

  const videoId = extractYouTubeVideoId(String(input));
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL or Video ID" });
  }

  try {
    const metadata = await fetchYouTubeMetadata(videoId);
    res.json(metadata);
  } catch (err) {
    console.error("API /api/youtube/metadata error:", err);
    res.status(500).json({ error: "Failed to fetch YouTube metadata", message: err.message });
  }
});

// 3. YouTube Caption / Transcript Retrieval
app.get("/api/youtube/transcript", async (req, res) => {
  const input = req.query.url || req.query.id;
  if (!input) {
    return res.status(400).json({ error: "Query parameter 'url' or 'id' is required" });
  }

  const videoId = extractYouTubeVideoId(String(input));
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube URL or Video ID" });
  }

  try {
    const transcriptData = await fetchYouTubeTranscript(videoId);
    res.json(transcriptData);
  } catch (err) {
    console.error("API /api/youtube/transcript error:", err);
    res.status(500).json({ error: "Failed to retrieve transcript", message: err.message });
  }
});

// 4. Intelligent AI Lyrics Structuring
app.post("/api/ai/format-lyrics", async (req, res) => {
  const { lyrics, title } = req.body || {};
  if (!lyrics) {
    return res.status(400).json({ error: "Lyrics body is required" });
  }

  try {
    const result = await formatLyricsWithAI(lyrics, title);
    res.json(result);
  } catch (err) {
    console.error("API /api/ai/format-lyrics error:", err);
    res.status(500).json({ error: "Failed to format lyrics", message: err.message });
  }
});

// SPA fallback for HTML5 routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`[Worship Studio Server] Running on http://localhost:${PORT}`);
});
