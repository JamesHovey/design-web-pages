import sharp from "sharp";
import axios from "axios";

/**
 * Download and convert image to .avif format, compressed to <100KB
 */
export async function processImage(imageUrl: string): Promise<Buffer> {
  try {
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000,
    });

    const imageBuffer = Buffer.from(response.data);

    // Convert to .avif with compression
    const processed = await sharp(imageBuffer)
      .resize(1920, null, { withoutEnlargement: true }) // Max width 1920px
      .avif({ quality: 80, effort: 4 }) // Adjust quality for file size
      .toBuffer();

    // If still too large, reduce quality
    if (processed.length > 100 * 1024) {
      return sharp(imageBuffer)
        .resize(1920, null, { withoutEnlargement: true })
        .avif({ quality: 60, effort: 4 })
        .toBuffer();
    }

    return processed;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

/**
 * Smart cropping for different viewports
 */
export async function cropForViewport(
  imageBuffer: Buffer,
  viewport: "desktop" | "laptop" | "tablet" | "mobile"
): Promise<Buffer> {
  const dimensions = {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 1024, height: 768 },
    mobile: { width: 767, height: 600 },
  };

  const { width, height } = dimensions[viewport];

  return sharp(imageBuffer)
    .resize(width, height, { fit: "cover", position: "center" })
    .avif({ quality: 80 })
    .toBuffer();
}
