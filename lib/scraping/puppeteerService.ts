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
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Set a user agent to avoid blocking
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate to the page with error handling
    try {
      await page.goto(url, {
        waitUntil: "networkidle2",
        timeout: 30000
      });
    } catch (navError) {
      // Try with a more lenient wait condition if networkidle2 fails
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000
      });
    }

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
  } catch (error) {
    // Provide more detailed error messages
    if (error instanceof Error) {
      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        throw new Error(`Could not resolve domain: ${url}. Please check the URL is correct.`);
      } else if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        throw new Error(`Connection refused by ${url}. The website may be down.`);
      } else if (error.message.includes('net::ERR_CONNECTION_TIMED_OUT')) {
        throw new Error(`Connection timed out for ${url}. The website may be slow or blocking requests.`);
      } else if (error.message.includes('Timeout')) {
        throw new Error(`Request timed out for ${url}. The website took too long to respond.`);
      }
    }
    // Re-throw original error if no specific handling
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
