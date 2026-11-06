// Worship Studio - Intelligent AI Lyrics Structuring Service
// Powered by Google Gemini 2.5 Flash with deterministic fallback

export async function formatLyricsWithAI(rawLyrics, songTitle = "") {
  if (!rawLyrics || !rawLyrics.trim()) {
    return {
      formattedLyrics: "",
      usedAI: false,
      message: "No lyrics provided."
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    // Graceful fallback to heuristic structuring
    return {
      formattedLyrics: formatLyricsHeuristic(rawLyrics),
      usedAI: false,
      message: "AI key not configured in .env. Using smart algorithmic formatter."
    };
  }

  try {
    const prompt = `You are a church worship presentation specialist.
Your task is to take raw worship song lyrics and format them into clean, projection-ready slide stanzas for church presentation.

Song Title: ${songTitle || "Worship Song"}

Input Lyrics:
"""
${rawLyrics.trim()}
"""

Strict Rules:
1. Organize into standard liturgical sections: [Verse 1], [Chorus], [Verse 2], [Bridge], [Chorus], [Tag], [Ending].
2. Format each section so it breaks naturally into slides of 2 to 4 lines maximum for projector visibility.
3. Separate each slide stanza with a double line break (blank line).
4. Preserve the exact original words, Tamil script, or English text. Do not invent new words.
5. Return ONLY the clean formatted lyrics with section headers. No intro, markdown quotes, or conversational explanations.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn("Gemini API error:", errText);
      return {
        formattedLyrics: formatLyricsHeuristic(rawLyrics),
        usedAI: false,
        message: "Gemini API request failed. Fell back to smart heuristic formatter."
      };
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (candidateText && candidateText.trim()) {
      return {
        formattedLyrics: candidateText.trim(),
        usedAI: true,
        message: "Successfully organized by Google Gemini AI."
      };
    }

    return {
      formattedLyrics: formatLyricsHeuristic(rawLyrics),
      usedAI: false,
      message: "Empty response from Gemini. Fell back to smart heuristic formatter."
    };
  } catch (err) {
    console.error("AI service failure:", err);
    return {
      formattedLyrics: formatLyricsHeuristic(rawLyrics),
      usedAI: false,
      message: "AI service error. Fell back to smart heuristic formatter."
    };
  }
}

/**
 * Robust deterministic fallback when Gemini API key is absent
 */
function formatLyricsHeuristic(rawText) {
  const lines = rawText
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const stanzas = [];
  let current = [];

  for (const line of lines) {
    // If line starts with a section marker like [Verse 1] or Chorus:
    const isHeader = /^(?:\[?[a-zA-Z\s\d]+\]?|verse\s*\d*|chorus|bridge|pre-chorus|tag|outro)\s*:?$/i.test(line);

    if (isHeader && current.length > 0) {
      stanzas.push(current.join("\n"));
      current = [line];
    } else if (current.length >= 4) {
      stanzas.push(current.join("\n"));
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) {
    stanzas.push(current.join("\n"));
  }

  return stanzas.join("\n\n");
}

