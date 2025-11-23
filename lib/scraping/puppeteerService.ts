import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export interface ScrapedData {
  url: string;
  title: string;
  content: string;
  structure: {
    header?: string;
    navigation?: string[];
    sections?: string[];
    footer?: string;
  };
  images: Array<{ src: string; alt: string }>;
  forms: Array<{ action: string; fields: string[] }>;
  buttons: Array<{ text: string; href?: string }>;
  logo?: { src: string; alt: string };
}

/**
 * Scrape a website using Puppeteer with stealth plugin
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Extract page data
    const scrapedData = await page.evaluate(() => {
      // Get title
      const title = document.title || "";

      // Get main content
      const content = document.body.innerText || "";

      // Get structure
      const header = document.querySelector("header")?.innerText || "";
      const navigation = Array.from(
        document.querySelectorAll("nav a, header a")
      ).map((a) => (a as HTMLAnchorElement).textContent?.trim() || "");

      const sections = Array.from(document.querySelectorAll("section, main > div")).map(
        (section) => section.textContent?.trim() || ""
      );

      const footer = document.querySelector("footer")?.innerText || "";

      // Get images
      const images = Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.src,
        alt: img.alt || "",
      }));

      // Get forms
      const forms = Array.from(document.querySelectorAll("form")).map((form) => ({
        action: form.action || "",
        fields: Array.from(form.querySelectorAll("input, textarea, select")).map(
          (field) => (field as HTMLInputElement).name || (field as HTMLInputElement).type
        ),
      }));

      // Get buttons and CTAs
      const buttons = Array.from(
        document.querySelectorAll("button, a.button, a.btn, input[type='submit']")
      ).map((btn) => ({
        text: btn.textContent?.trim() || "",
        href: (btn as HTMLAnchorElement).href || "",
      }));

      // Try to find logo
      const logoSelectors = [
        "header img[alt*='logo' i]",
        "header img:first-of-type",
        ".logo img",
        "#logo img",
        "a[href='/'] img",
      ];
      let logo: { src: string; alt: string } | undefined;
      for (const selector of logoSelectors) {
        const logoEl = document.querySelector(selector) as HTMLImageElement;
        if (logoEl) {
          logo = { src: logoEl.src, alt: logoEl.alt || "" };
          break;
        }
      }

      return {
        title,
        content,
        structure: {
          header,
          navigation,
          sections,
          footer,
        },
        images,
        forms,
        buttons,
        logo,
      };
    });

    return {
      url,
      ...scrapedData,
    };
  } finally {
    await browser.close();
  }
}
