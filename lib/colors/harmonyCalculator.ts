import chroma from "chroma-js";

export type HarmonyType =
  | "complementary"
  | "split-complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "monochromatic";

export interface ColorPalette {
  colors: string[];
  harmony: HarmonyType;
  baseColor: string;
}

/**
 * Generate color palette using Chroma.js based on harmony strategy
 * @param baseColor - Hex color from logo
 * @param harmony - Harmony strategy type
 * @returns Array of 3-5 hex colors
 */
export function generateColorHarmony(
  baseColor: string,
  harmony: HarmonyType = "complementary"
): ColorPalette {
  const base = chroma(baseColor);

  let colors: string[] = [];

  switch (harmony) {
    case "complementary":
      colors = [
        baseColor,
        base.set("hsl.h", "+180").hex(),
      ];
      break;

    case "split-complementary":
      colors = [
        baseColor,
        base.set("hsl.h", "+150").hex(),
        base.set("hsl.h", "-150").hex(),
      ];
      break;

    case "analogous":
      colors = [
        base.set("hsl.h", "-30").hex(),
        baseColor,
        base.set("hsl.h", "+30").hex(),
      ];
      break;

    case "triadic":
      colors = [
        baseColor,
        base.set("hsl.h", "+120").hex(),
        base.set("hsl.h", "-120").hex(),
      ];
      break;

    case "tetradic":
      colors = [
        baseColor,
        base.set("hsl.h", "+90").hex(),
        base.set("hsl.h", "+180").hex(),
        base.set("hsl.h", "-90").hex(),
      ];
      break;

    case "monochromatic":
      colors = [
        base.brighten(1).hex(),
        baseColor,
        base.darken(1).hex(),
        base.darken(2).hex(),
      ];
      break;
  }

  // Add neutral colors (shades of gray) for balance
  colors.push("#FFFFFF", "#F5F5F5", "#333333");

  return {
    colors,
    harmony,
    baseColor,
  };
}

/**
 * Calculate color variations (tints and shades) for a base color
 */
export function generateColorVariations(baseColor: string): {
  lighter: string[];
  darker: string[];
} {
  const base = chroma(baseColor);

  return {
    lighter: [
      base.brighten(0.5).hex(),
      base.brighten(1).hex(),
      base.brighten(1.5).hex(),
    ],
    darker: [
      base.darken(0.5).hex(),
      base.darken(1).hex(),
      base.darken(1.5).hex(),
    ],
  };
}
