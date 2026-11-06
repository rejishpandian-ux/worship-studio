// Worship Studio - Unified Lyrics Processing & Stanza Engine

/**
 * Detect language of the lyrics (Tamil, English, Tamil + English mixed, or Mixed)
 */
export function detectLyricsLanguage(text) {
  if (!text || !text.trim()) return "—";
  const hasTamil = /[\u0B80-\u0BFF]/u.test(text);
  const hasEnglish = /[A-Za-z]/u.test(text);
  if (hasTamil && hasEnglish) return "Tamil + English (mixed)";
  if (hasTamil) return "Tamil";
  if (hasEnglish) return "English";
  return "Mixed";
}

/**
 * Auto-generate a title from the first 4 words if none provided
 */
export function autoGenerateTitle(lyrics) {
  if (!lyrics || !lyrics.trim()) return "Sunday Worship";
  return lyrics
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

/**
 * Clean chords or timestamps (e.g. [00:12] or [G] [Am]) if present
 */
export function stripChordsAndTimestamps(rawText) {
  return rawText
    .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g, "") // Timestamps like [01:23]
    .replace(/\[[A-G][b#]?(?:m|maj|min|dim|aug|sus\d?|\d)?(?:\/[A-G][b#]?)?\]/g, "") // Chord brackets [Em]
    .trim();
}

/**
 * Parse raw lyrics into categorized stanzas/sections
 * Preserves the exact algorithm of the original Worship Studio while adding resilience
 */
export function parseLyricsToSections(rawLyrics) {
  const cleaned = stripChordsAndTimestamps(rawLyrics || "");
  const stanzas = cleaned
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const occurrenceMap = new Map();
  const normalize = (line) =>
    line
      .toLocaleLowerCase()
      .replace(/[.,!?;:'"“”‘’—–-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  stanzas.forEach((stanza) => {
    const key = stanza
      .split("\n")
      .map(normalize)
      .join("|");
    occurrenceMap.set(key, (occurrenceMap.get(key) || 0) + 1);
  });

  let verseCounter = 0;
  const seenMap = new Set();

  return stanzas.map((stanza, index) => {
    const lines = stanza
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Check if the first line is an explicit section heading like "Verse 1:", "Chorus:", etc.
    const explicitMatch = /^(verse\s*\d*|chorus\s*\d*|bridge|refrain|ending|intro|outro|tag|opening)\s*:?$/i.test(
      lines[0] || ""
    );
    const explicitLabel = explicitMatch ? lines.shift() : "";

    const key = lines.map(normalize).join("|");
    const count = occurrenceMap.get(key) || 0;

    let label = explicitLabel ? explicitLabel.replace(/:$/, "") : "";
    if (!label) {
      if (count > 1) {
        label = seenMap.has(key) ? "Chorus (repeat)" : "Chorus";
      } else if (index === 0) {
        label = "Opening";
      } else {
        label = `Verse ${++verseCounter}`;
      }
    } else if (/^chorus/i.test(label) && seenMap.has(key)) {
      label = "Chorus (repeat)";
    }

    seenMap.add(key);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `sec_${Date.now()}_${index}`,
      label: label || `Verse ${index + 1}`,
      lines
    };
  });
}

/**
 * Convert structured sections into presentation slides
 * Adheres to 16:9 projection constraints (max 2-3 lines per slide, max 120 chars)
 */
export function sectionsToSlides(sections, themeId = "sunrise-photo") {
  const slides = [];

  for (const section of sections) {
    let currentLines = [];

    const flushSlide = () => {
      if (currentLines.length) {
        slides.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `slide_${Date.now()}_${Math.random()}`,
          text: currentLines.join("\n"),
          themeId: themeId,
          sectionLabel: section.label,
          transition: "fade"
        });
        currentLines = [];
      }
    };

    for (const line of section.lines) {
      const maxLinesForThisSlide = line.length > 52 ? 2 : 3;
      const willExceedCharLimit = currentLines.join(" ").length + line.length > 120;

      if (currentLines.length >= maxLinesForThisSlide || willExceedCharLimit) {
        flushSlide();
      }
      currentLines.push(line);
    }

    flushSlide();
  }

  if (slides.length === 0) {
    slides.push({
      id: crypto.randomUUID ? crypto.randomUUID() : "slide_empty",
      text: "Your lyrics will appear here",
      themeId: themeId,
      sectionLabel: "Opening",
      transition: "fade"
    });
  }

  return slides;
}
