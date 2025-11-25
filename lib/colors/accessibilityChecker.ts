import chroma from "chroma-js";

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: "AAA" | "AA" | "Fail";
}

export interface AccessibilityScore {
  score: number; // 0-100
  issues: string[];
  passes: string[];
}

/**
 * Check WCAG contrast ratio between two colors
 * WCAG AA: 4.5:1 for normal text, 3:1 for large text
 * WCAG AAA: 7:1 for normal text, 4.5:1 for large text
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult {
  const ratio = chroma.contrast(foreground, background);

  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  const passesAA = ratio >= aaThreshold;
  const passesAAA = ratio >= aaaThreshold;

  let level: "AAA" | "AA" | "Fail";
  if (passesAAA) {
    level = "AAA";
  } else if (passesAA) {
    level = "AA";
  } else {
    level = "Fail";
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    level,
  };
}

/**
 * Evaluate color palette for accessibility issues
 * Returns warnings for poor contrast combinations
 */
export function evaluateColorPalette(
  colors: string[],
  textColor: string = "#333333",
  backgroundColor: string = "#FFFFFF"
): AccessibilityScore {
  const issues: string[] = [];
  const passes: string[] = [];

  // Check text on background
  const textContrast = checkContrast(textColor, backgroundColor);
  if (!textContrast.passesAA) {
    issues.push(
      `Text color ${textColor} on ${backgroundColor} fails WCAG AA (ratio: ${textContrast.ratio}:1)`
    );
  } else {
    passes.push(
      `Text contrast ${textContrast.level} compliant (${textContrast.ratio}:1)`
    );
  }

  // Check primary colors on white background
  for (const color of colors) {
    if (color === "#FFFFFF" || color === "#F5F5F5") continue;

    const contrast = checkContrast(color, backgroundColor);
    if (!contrast.passesAA) {
      issues.push(
        `Color ${color} may be difficult to read on white background (ratio: ${contrast.ratio}:1)`
      );
    }
  }

  // Calculate score (0-100)
  const totalChecks = 1 + colors.length;
  const passedChecks = passes.length + (colors.length - issues.length + 1);
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    score: Math.min(score, 100),
    issues,
    passes,
  };
}

/**
 * Suggest accessible color alternatives if contrast is insufficient
 */
export function suggestAccessibleColor(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string {
  const fg = chroma(foreground);
  let adjusted = fg;

  // Try darkening first
  let attempts = 0;
  while (chroma.contrast(adjusted.hex(), background) < targetRatio && attempts < 20) {
    adjusted = adjusted.darken(0.2);
    attempts++;
  }

  // If darkening didn't work, try lightening
  if (chroma.contrast(adjusted.hex(), background) < targetRatio) {
    adjusted = fg;
    attempts = 0;
    while (chroma.contrast(adjusted.hex(), background) < targetRatio && attempts < 20) {
      adjusted = adjusted.brighten(0.2);
      attempts++;
    }
  }

  return adjusted.hex();
}

/**
 * Determine if a color is light or dark
 * Returns true if the color is light (luminance > 0.5)
 */
export function isLightColor(color: string): boolean {
  try {
    const luminance = chroma(color).luminance();
    return luminance > 0.5;
  } catch (error) {
    console.error(`Error checking if color is light: ${color}`, error);
    return true; // Default to light if error
  }
}

/**
 * Get a contrast-safe text color for a given background
 * Returns white for dark backgrounds, dark gray for light backgrounds
 * Ensures WCAG AA compliance (4.5:1 ratio minimum)
 */
export function getContrastSafeTextColor(
  backgroundColor: string,
  targetRatio: number = 4.5
): string {
  try {
    const isLight = isLightColor(backgroundColor);

    // Start with standard text colors
    let textColor = isLight ? "#1a1a1a" : "#ffffff";

    // Verify contrast and adjust if needed
    const contrast = chroma.contrast(textColor, backgroundColor);

    if (contrast < targetRatio) {
      // If contrast is insufficient, use suggestAccessibleColor
      textColor = suggestAccessibleColor(textColor, backgroundColor, targetRatio);
    }

    return textColor;
  } catch (error) {
    console.error(`Error getting contrast-safe text color for ${backgroundColor}:`, error);
    return "#1a1a1a"; // Safe fallback
  }
}

/**
 * Get professional header text color based on background
 * Optimized for navigation menus and header elements
 */
export function getHeaderTextColor(backgroundColor: string): string {
  const isLight = isLightColor(backgroundColor);

  // For light backgrounds: use dark gray for professional look
  // For dark backgrounds: use white for maximum readability
  if (isLight) {
    const darkText = "#2d3748"; // Professional dark gray
    const contrast = chroma.contrast(darkText, backgroundColor);

    // Ensure at least 4.5:1 contrast
    if (contrast >= 4.5) {
      return darkText;
    } else {
      return suggestAccessibleColor(darkText, backgroundColor, 4.5);
    }
  } else {
    const lightText = "#ffffff";
    const contrast = chroma.contrast(lightText, backgroundColor);

    // Ensure at least 4.5:1 contrast
    if (contrast >= 4.5) {
      return lightText;
    } else {
      return suggestAccessibleColor(lightText, backgroundColor, 4.5);
    }
  }
}

/**
 * Get professional button colors with proper contrast
 * Returns { background, text } ensuring WCAG AA compliance
 */
export function getButtonColors(
  brandColor: string,
  forDarkBackground: boolean = false
): { background: string; text: string } {
  let bgColor = brandColor;

  // Ensure button background is vibrant enough
  const buttonBg = chroma(bgColor);

  // Determine optimal text color for button
  const textColor = getContrastSafeTextColor(bgColor, 4.5);

  return {
    background: bgColor,
    text: textColor
  };
}
