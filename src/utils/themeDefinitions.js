// Worship Studio - 28 Preserved Curated Themes & Categories

export const THEME_CATEGORIES = [
  "All",
  "Favorites",
  "Heavenly Sunrise",
  "Deep Worship",
  "Creation of God",
  "The Cross",
  "Royal Glory",
  "Still Waters",
  "Heavenly Clouds",
  "Christmas Glory"
];

const makeTheme = (id, name, category, background, accent, text = "#fffaf0", style = "Cinematic") => ({
  id,
  name,
  category,
  background,
  accent,
  text,
  style
});

export const THEMES = [
  // Heavenly Sunrise
  {
    ...makeTheme(
      "sunrise-photo",
      "Heavenly Sunrise",
      "Heavenly Sunrise",
      "url(/backgrounds/heavenly-sunrise.jpeg) center / cover no-repeat",
      "#f3c474"
    ),
    image: "/backgrounds/heavenly-sunrise.jpeg"
  },
  makeTheme(
    "sunrise",
    "First Light",
    "Heavenly Sunrise",
    "radial-gradient(ellipse at 50% 58%, #ffe4a4 0%, #eb9f65 23%, #87556b 57%, #222b47 100%)",
    "#f3c474"
  ),
  makeTheme(
    "sunrise-cloud",
    "Clouds of Promise",
    "Heavenly Sunrise",
    "radial-gradient(ellipse at 50% 80%, #f7dcb1 0%, #dd9d81 30%, #a07588 58%, #39415c 100%)",
    "#f4d7a1",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "sunrise-min",
    "Quiet Dawn",
    "Heavenly Sunrise",
    "linear-gradient(145deg, #372e50 0%, #ae7484 48%, #f4c990 100%)",
    "#ffe1a8",
    "#fffaf0",
    "Minimal"
  ),

  // Deep Worship
  {
    ...makeTheme(
      "deep-photo",
      "Deep Worship",
      "Deep Worship",
      "url(/backgrounds/deep-worship.jpeg) center / cover no-repeat",
      "#9cc8ff"
    ),
    image: "/backgrounds/deep-worship.jpeg"
  },
  makeTheme(
    "deep",
    "Celestial",
    "Deep Worship",
    "radial-gradient(ellipse at 70% 28%, #3b5988 0%, #19284c 38%, #0a1126 100%)",
    "#9cc8ff"
  ),
  makeTheme(
    "deep-nebula",
    "The Firmament",
    "Deep Worship",
    "radial-gradient(ellipse at 60% 60%, #7d4d83 0%, #29385e 35%, #10152b 75%)",
    "#c9b2ff",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "deep-min",
    "Midnight Blue",
    "Deep Worship",
    "linear-gradient(135deg, #101629, #182b4b 52%, #324a72)",
    "#9fcefa",
    "#fffaf0",
    "Minimal"
  ),

  // Creation of God
  {
    ...makeTheme(
      "creation-photo",
      "Creation of God",
      "Creation of God",
      "url(/backgrounds/creation-of-god.jpeg) center / cover no-repeat",
      "#b8d6ad"
    ),
    image: "/backgrounds/creation-of-god.jpeg"
  },
  makeTheme(
    "creation",
    "Living Waters",
    "Creation of God",
    "radial-gradient(ellipse at 50% 72%, #7ba887 0%, #365f57 34%, #122f32 72%, #10232b 100%)",
    "#b8d6ad"
  ),
  makeTheme(
    "creation-forest",
    "Still Forest",
    "Creation of God",
    "linear-gradient(160deg, #7c9a74, #345b4c 48%, #183737 90%)",
    "#d1dfbb",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "creation-min",
    "Eden",
    "Creation of God",
    "linear-gradient(135deg, #18372e, #315a43 48%, #91a777)",
    "#c8deaf",
    "#fffaf0",
    "Minimal"
  ),

  // The Cross
  {
    ...makeTheme(
      "cross-photo",
      "The Cross",
      "The Cross",
      "url(/backgrounds/the-cross.jpeg) center / cover no-repeat",
      "#f2d2a0"
    ),
    image: "/backgrounds/the-cross.jpeg"
  },
  makeTheme(
    "cross",
    "At Calvary",
    "The Cross",
    "radial-gradient(ellipse at 50% 70%, #e0aa78 0%, #a75f62 33%, #48334d 70%, #191c30 100%)",
    "#f2d2a0"
  ),
  makeTheme(
    "cross-cloud",
    "Grace",
    "The Cross",
    "linear-gradient(170deg, #302f4b, #785568 50%, #df9f78)",
    "#f4d9b2",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "cross-min",
    "Sacred Hour",
    "The Cross",
    "linear-gradient(135deg, #402e43, #805a62 52%, #d39c7b)",
    "#f1cf9e",
    "#fffaf0",
    "Minimal"
  ),

  // Royal Glory
  {
    ...makeTheme(
      "royal-photo",
      "Royal Glory",
      "Royal Glory",
      "url(/backgrounds/royal-glory.jpeg) center / cover no-repeat",
      "#e7c581"
    ),
    image: "/backgrounds/royal-glory.jpeg"
  },
  makeTheme(
    "royal",
    "Crown of Glory",
    "Royal Glory",
    "radial-gradient(ellipse at 50% 45%, #634c39 0%, #29251f 35%, #101217 75%)",
    "#e7c581"
  ),
  makeTheme(
    "royal-light",
    "Golden Praise",
    "Royal Glory",
    "linear-gradient(145deg, #171817, #40351f 55%, #816541)",
    "#f0d28b",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "royal-min",
    "Majesty",
    "Royal Glory",
    "linear-gradient(135deg, #131416, #28241e 55%, #55472f)",
    "#e4c17b",
    "#fffaf0",
    "Minimal"
  ),

  // Still Waters
  {
    ...makeTheme(
      "water-photo",
      "Still Waters",
      "Still Waters",
      "url(/backgrounds/still-waters.jpeg) center / cover no-repeat",
      "#c7edf3"
    ),
    image: "/backgrounds/still-waters.jpeg"
  },
  makeTheme(
    "water",
    "Be Still",
    "Still Waters",
    "radial-gradient(ellipse at 50% 55%, #9dc7d4 0%, #4e8297 32%, #24485e 68%, #142d43 100%)",
    "#c7edf3"
  ),
  makeTheme(
    "water-dawn",
    "Quiet Shore",
    "Still Waters",
    "linear-gradient(165deg, #b2cbd1, #5e8fa1 46%, #264d65)",
    "#e4f4ef",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "water-min",
    "Selah",
    "Still Waters",
    "linear-gradient(135deg, #193e55, #447c8c 55%, #a1c5c8)",
    "#d5eff2",
    "#fffaf0",
    "Minimal"
  ),

  // Heavenly Clouds
  {
    ...makeTheme(
      "cloud-photo",
      "Heavenly Clouds",
      "Heavenly Clouds",
      "url(/backgrounds/heavenly-clouds.jpeg) center / cover no-repeat",
      "#ffe3f2"
    ),
    image: "/backgrounds/heavenly-clouds.jpeg"
  },
  makeTheme(
    "cloud",
    "Heavenward",
    "Heavenly Clouds",
    "radial-gradient(ellipse at 45% 38%, #f2bfd3 0%, #a78ebd 38%, #655f91 72%, #393d68 100%)",
    "#ffe3f2"
  ),
  makeTheme(
    "cloud-dream",
    "Promise of Heaven",
    "Heavenly Clouds",
    "linear-gradient(155deg, #716d9b, #c49fc0 48%, #f0c8cb)",
    "#f9e1fb",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "cloud-min",
    "Lavender Sky",
    "Heavenly Clouds",
    "linear-gradient(135deg, #4d4c79, #8c82aa 55%, #d6b4cf)",
    "#f6e8fc",
    "#fffaf0",
    "Minimal"
  ),

  // Christmas Glory
  makeTheme(
    "christmas",
    "Holy Night",
    "Christmas Glory",
    "radial-gradient(ellipse at 52% 40%, #a8734c 0%, #354b5c 38%, #142c3d 72%, #101b2c 100%)",
    "#f3d28a"
  ),
  makeTheme(
    "christmas-star",
    "Star of Bethlehem",
    "Christmas Glory",
    "linear-gradient(145deg, #142438, #455768 52%, #9a6556)",
    "#ffdf9a",
    "#fffaf0",
    "Illustrated"
  ),
  makeTheme(
    "christmas-min",
    "Noel",
    "Christmas Glory",
    "linear-gradient(135deg, #182738, #263c48 55%, #79534a)",
    "#f1d29b",
    "#fffaf0",
    "Minimal"
  )
];

export const getThemeById = (id) => THEMES.find((t) => t.id === id) || THEMES[0];

export function renderThemeSvg(themeId) {
  const theme = getThemeById(themeId);
  const colors = theme.background.match(/#[0-9a-f]{6}/gi) ?? ["#17263b", "#202c44", "#927ca1"];
  const [c1 = "#17263b", c2 = "#202c44", c3 = "#927ca1"] = colors;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="45%" stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#g)"/>
  </svg>`;
}

