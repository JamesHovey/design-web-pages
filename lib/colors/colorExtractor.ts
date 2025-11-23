import sharp from "sharp";
import axios from "axios";

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
}

/**
 * Extract dominant colors from logo image
 * Returns 3-5 primary colors with their hex codes
 */
export async function extractLogoColors(logoUrl: string): Promise<ExtractedColor[]> {
  try {
    // Download image
    const response = await axios.get(logoUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const imageBuffer = Buffer.from(response.data);

    // Resize image for faster processing
    const resized = await sharp(imageBuffer)
      .resize(200, 200, { fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Extract colors using simple color quantization
    const colors = await quantizeColors(resized.data, resized.info.channels);

    // Filter out very light/dark colors (likely background)
    const filtered = colors.filter((color) => {
      const luminance =
        0.299 * color.rgb.r + 0.587 * color.rgb.g + 0.114 * color.rgb.b;
      return luminance > 30 && luminance < 225;
    });

    // Return top 3-5 colors
    return filtered.slice(0, 5);
  } catch (error) {
    console.error("Error extracting logo colors:", error);
    throw new Error("Failed to extract logo colors");
  }
}

/**
 * Simple color quantization algorithm
 * Groups similar colors and returns dominant ones
 */
async function quantizeColors(
  pixelData: Buffer,
  channels: number
): Promise<ExtractedColor[]> {
  const colorMap = new Map<string, { count: number; rgb: { r: number; g: number; b: number } }>();

  // Sample every 4th pixel for performance
  for (let i = 0; i < pixelData.length; i += channels * 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    const a = channels === 4 ? pixelData[i + 3] : 255;

    // Skip transparent pixels
    if (a < 128) continue;

    // Round to nearest 32 to group similar colors
    const rKey = Math.round(r / 32) * 32;
    const gKey = Math.round(g / 32) * 32;
    const bKey = Math.round(b / 32) * 32;
    const key = `${rKey},${gKey},${bKey}`;

    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { count: 1, rgb: { r: rKey, g: gKey, b: bKey } });
    }
  }

  // Sort by frequency
  const sorted = Array.from(colorMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const totalPixels = pixelData.length / channels;

  return sorted.map(([_, data]) => ({
    hex: rgbToHex(data.rgb.r, data.rgb.g, data.rgb.b),
    rgb: data.rgb,
    percentage: (data.count / totalPixels) * 100,
  }));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
