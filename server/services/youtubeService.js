// Worship Studio - YouTube Video Metadata & Transcript Service
// Strictly adheres to fair use and authorized public metadata / timedtext APIs

export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== "string") return null;

  const trimmed = input.trim();

  // Bare video ID: 11 characters
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Standard YouTube watch URL: https://www.youtube.com/watch?v=...
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  return null;
}

export async function fetchYouTubeMetadata(videoId) {
  if (!videoId) throw new Error("Video ID is required");

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;

  try {
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "WorshipStudio/2.0"
      }
    });

    if (!res.ok) {
      throw new Error(`YouTube oEmbed returned HTTP ${res.status}`);
    }

    const oembed = await res.json();

    return {
      videoId,
      title: oembed.title || "Worship Song",
      author: oembed.author_name || "YouTube Artist",
      authorUrl: oembed.author_url || "",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoUrl
    };
  } catch (err) {
    console.error("YouTube oEmbed error:", err);
    // Graceful fallback with standard thumbnail
    return {
      videoId,
      title: `YouTube Worship Video (${videoId})`,
      author: "Worship Leader",
      authorUrl: "",
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoUrl
    };
  }
}

export async function fetchYouTubeTranscript(videoId) {
  if (!videoId) throw new Error("Video ID is required");

  try {
    // Attempt to retrieve public timedtext captions from YouTube
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!pageRes.ok) {
      return {
        available: false,
        lyrics: "",
        message: "Unable to inspect video watch page."
      };
    }

    const html = await pageRes.text();

    // Look for captionTracks in ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch || !playerResponseMatch[1]) {
      return {
        available: false,
        lyrics: "",
        message: "No public transcript data found on this video. Please use the Manual Paste tab."
      };
    }

    let captionTracks = null;
    try {
      const parsed = JSON.parse(playerResponseMatch[1]);
      captionTracks = parsed?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    } catch {
      // JSON parse error
    }

    if (!captionTracks || !Array.isArray(captionTracks) || captionTracks.length === 0) {
      return {
        available: false,
        lyrics: "",
        message: "Captions are disabled or unavailable for this video. Please use the Manual Paste tab."
      };
    }

    // Pick first track (prefer English or default)
    const track = captionTracks.find((t) => t.languageCode === "en") || captionTracks[0];
    const timedTextUrl = track.baseUrl;

    const transcriptRes = await fetch(timedTextUrl);
    if (!transcriptRes.ok) {
      return {
        available: false,
        lyrics: "",
        message: "Could not load caption stream. Please use the Manual Paste tab."
      };
    }

    const xml = await transcriptRes.text();
    // Parse text tags: <text start="..." dur="...">Line content</text>
    const lines = [];
    const textRegex = /<text[^>]*>([^<]+)<\/text>/g;
    let match;
    while ((match = textRegex.exec(xml)) !== null) {
      const decoded = match[1]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, " ")
        .trim();
      if (decoded && !lines.includes(decoded)) {
        lines.push(decoded);
      }
    }

    const combinedLyrics = lines.join("\n");

    return {
      available: lines.length > 0,
      lyrics: combinedLyrics,
      language: track.name?.simpleText || track.languageCode || "en",
      message: lines.length > 0 ? "Transcript successfully loaded!" : "Transcript was empty."
    };
  } catch (err) {
    console.error("Transcript retrieval error:", err);
    return {
      available: false,
      lyrics: "",
      message: "Automated transcript extraction not available. Please paste lyrics manually."
    };
  }
}

