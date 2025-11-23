import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

interface ViewportSize {
  name: string;
  width: number;
  height: number;
}

const VIEWPORT_SIZES: ViewportSize[] = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "tablet-portrait", width: 1024, height: 1366 },
  { name: "mobile-portrait", width: 375, height: 667 },
];

/**
 * Wait utility function to replace deprecated waitForTimeout
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate screenshots of HTML preview at different viewport sizes
 * Returns base64 encoded images
 */
export async function generateScreenshots(
  htmlContent: string,
  viewports: string[]
): Promise<Record<string, string>> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  const screenshots: Record<string, string> = {};

  try {
    const page = await browser.newPage();

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Generate screenshot for each viewport
    for (const viewportName of viewports) {
      const viewportConfig = VIEWPORT_SIZES.find((v) => v.name === viewportName);
      if (!viewportConfig) continue;

      // Set viewport size
      await page.setViewport({
        width: viewportConfig.width,
        height: viewportConfig.height,
      });

      // Wait a bit for any animations or layout shifts
      await wait(500);

      // Take screenshot as base64
      const screenshot = await page.screenshot({
        type: "png",
        fullPage: true,
        encoding: "base64",
      });

      screenshots[viewportName] = screenshot as string;
    }
  } finally {
    await browser.close();
  }

  return screenshots;
}

/**
 * Generate a single screenshot at desktop size
 * Used for quick previews
 */
export async function generatePreviewScreenshot(htmlContent: string): Promise<string> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await wait(500);

    const screenshot = await page.screenshot({
      type: "png",
      encoding: "base64",
    });

    return screenshot as string;
  } finally {
    await browser.close();
  }
}
