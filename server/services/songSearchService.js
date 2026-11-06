// Worship Studio - Song Discovery Service
// Uses official, authorized public metadata endpoints (iTunes Search API) to find worship songs, artist metadata, and high-res artwork

export async function searchSongs(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const encoded = encodeURIComponent(query.trim());
  const url = `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=16`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "WorshipStudio/2.0 (peaceag-slides)"
      }
    });

    if (!res.ok) {
      throw new Error(`iTunes API returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item) => ({
      id: String(item.trackId),
      title: item.trackName || "Untitled Song",
      artist: item.artistName || "Unknown Artist",
      album: item.collectionName || "",
      releaseYear: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
      artwork: item.artworkUrl100
        ? item.artworkUrl100.replace("100x100bb", "600x600bb")
        : "/backgrounds/sunrise-photo.jpeg",
      previewAudio: item.previewUrl || null,
      source: "itunes"
    }));
  } catch (err) {
    console.error("Song search service error:", err);
    throw err;
  }
}

