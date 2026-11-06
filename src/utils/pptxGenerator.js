// Worship Studio - High Fidelity PowerPoint (.pptx) Presentation Generator
import pptxgen from "pptxgenjs";
import { getThemeById, renderThemeSvg } from "./themeDefinitions.js";

/**
 * Cache for loaded background data
 */
const backgroundCache = new Map();

async function resolveBackgroundImageData(themeId, customImage = null) {
  if (customImage) {
    return customImage;
  }

  const theme = getThemeById(themeId);
  if (!theme.image) {
    // Generate high resolution SVG data-uri for gradient themes
    const svgString = renderThemeSvg(themeId);
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  }

  if (backgroundCache.has(theme.image)) {
    return backgroundCache.get(theme.image);
  }

  try {
    const res = await fetch(theme.image);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        backgroundCache.set(theme.image, reader.result);
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn(`Could not load background image "${theme.image}", falling back to gradient SVG.`, err);
    const svgString = renderThemeSvg(themeId);
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
  }
}

/**
 * Export project slides to a .pptx PowerPoint file
 */
export async function exportToPowerPoint(project) {
  const pptx = new pptxgen();

  // Standard widescreen layout: 13.333" x 7.5"
  pptx.defineLayout({ name: "WIDESCREEN_16_9", width: 13.333, height: 7.5 });
  pptx.layout = "WIDESCREEN_16_9";

  const slides = project.slides && project.slides.length > 0
    ? project.slides
    : [{ text: "Your lyrics will appear here", themeId: project.themeId || "sunrise-photo" }];

  for (const slideData of slides) {
    const slide = pptx.addSlide();
    const activeThemeId = slideData.themeId || project.themeId || "sunrise-photo";
    const theme = getThemeById(activeThemeId);
    const accentHex = (theme.accent || "#d5b578").replace("#", "");

    // 1. Add background
    try {
      const bgData = await resolveBackgroundImageData(activeThemeId, slideData.customImage || project.customImage);
      slide.addImage({
        data: bgData,
        x: 0,
        y: 0,
        w: 13.333,
        h: 7.5
      });
    } catch (e) {
      console.error("Failed to render background on slide:", e);
    }

    // 2. Add glass backdrop panel
    if (project.panel) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 1.05,
        y: 1.48,
        w: 11.23,
        h: 4.54,
        rectRadius: 0.12,
        fill: {
          color: "10131D",
          transparency: Math.max(0, Math.min(100, 100 - (project.panelOpacity ?? 28)))
        },
        line: {
          color: "FFFFFF",
          transparency: 84,
          width: 0.7
        }
      });
    }

    // 3. Add slide text
    const textOptions = {
      x: 1.1,
      y: 1.45,
      w: 11.13,
      h: 4.6,
      fontFace: project.font || "Poppins",
      fontSize: project.fontSize || 34,
      color: (project.textColor || "#fffaf0").replace("#", ""),
      bold: project.bold ?? true,
      italic: project.italic ?? false,
      align: project.textAlign || "center",
      valign: "middle",
      fit: "shrink",
      margin: 0.12,
      breakLine: false
    };

    if (project.glow > 0) {
      textOptions.shadow = {
        type: "outer",
        color: accentHex,
        blur: 4,
        angle: 45,
        offset: 1,
        opacity: Math.min(project.glow / 100, 0.55)
      };
    }

    slide.addText(slideData.text || "", textOptions);

    // 4. Add watermark overlay if enabled
    if (project.watermarkVisible ?? true) {
      slide.addText("PEACEAG PRESENTATION", {
        x: 10.05,
        y: 7.08,
        w: 2.85,
        h: 0.18,
        fontFace: "Aptos",
        fontSize: 8,
        color: "FFFFFF",
        transparency: Math.max(0, Math.min(100, 100 - (project.watermarkOpacity ?? 40))),
        charSpacing: 2,
        align: "right",
        valign: "middle",
        margin: 0,
        breakLine: false,
        fit: "shrink"
      });
    }
  }

  const sanitizedTitle = (project.title || "Worship")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim() || "Worship";

  await pptx.writeFile({ fileName: `${sanitizedTitle}.pptx` });
}

